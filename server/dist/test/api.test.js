import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';
describe('CampusShield Comprehensive API Test Suite', () => {
    let createdCaseId;
    let createdTrackingSecret;
    let adminToken;
    let officerToken;
    before(async () => {
        // Log in as Admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@campusshield.edu', password: 'AdminPass123!' });
        assert.equal(adminRes.status, 200);
        adminToken = adminRes.body.token;
        // Log in as Officer
        const officerRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'officer.sarah@campusshield.edu', password: 'OfficerPass123!' });
        assert.equal(officerRes.status, 200);
        officerToken = officerRes.body.token;
    });
    after(async () => {
        await prisma.$disconnect();
    });
    // Scenario 1, 3, 4: Valid anonymous report is accepted, credentials generated, persists in DB
    it('Scenario 1, 3, 4: Accepts valid anonymous report and generates non-sequential ID and tracking secret', async () => {
        const res = await request(app)
            .post('/api/reports')
            .field('category', 'CYBERBULLYING')
            .field('platform', 'Instagram')
            .field('description', 'Someone is posting hurtful rumors about me in the university library chat.')
            .field('incidentDate', '2026-04-05')
            .field('privacyNoticeAck', 'true')
            .field('reportingMode', 'ANONYMOUS');
        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.match(res.body.caseId, /^CS-\d{4}-[A-Z0-9]+$/);
        assert.match(res.body.trackingSecret, /^cs_sec_[a-f0-9]+$/);
        createdCaseId = res.body.caseId;
        createdTrackingSecret = res.body.trackingSecret;
        // Verify database persistence
        const dbCase = await prisma.case.findUnique({ where: { id: createdCaseId } });
        assert.ok(dbCase);
        assert.equal(dbCase?.category, 'CYBERBULLYING');
        assert.notEqual(dbCase?.trackingSecretHash, createdTrackingSecret); // Must be securely hashed!
    });
    // Scenario 2: Invalid report is rejected
    it('Scenario 2: Rejects an invalid report with missing required fields', async () => {
        const res = await request(app)
            .post('/api/reports')
            .send({
            category: 'INVALID_CATEGORY',
            description: 'too short',
        });
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Validation failed');
    });
    // Scenario 5, 12: Correct tracking credentials retrieve permitted info; internal notes are NEVER returned
    it('Scenario 5 & 12: Correct tracking credentials return case data, but NEVER internal notes or staff hashes', async () => {
        // First, let officer add an internal note and a reporter update to this case
        await request(app)
            .post(`/api/cases/${createdCaseId}/internal-notes`)
            .set('Authorization', `Bearer ${officerToken}`)
            .send({ content: 'Confidential lead: Student suspect identified via dorm router.' });
        await request(app)
            .post(`/api/cases/${createdCaseId}/reporter-updates`)
            .set('Authorization', `Bearer ${officerToken}`)
            .send({ message: 'Campus safety has opened an active investigation.', requiresInput: false });
        // Now test anonymous reporter track endpoint
        const res = await request(app)
            .post('/api/reports/track')
            .send({
            caseId: createdCaseId,
            trackingSecret: createdTrackingSecret,
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.caseId, createdCaseId);
        assert.equal(res.body.category, 'CYBERBULLYING');
        assert.equal(res.body.reporterUpdates.length, 2); // Initial welcome + officer update
        // CRITICAL: Ensure internal notes, passwords, and secret hashes are absent
        assert.equal(res.body.internalNotes, undefined);
        assert.equal(res.body.trackingSecretHash, undefined);
        assert.equal(res.body.assignedOfficerId, undefined);
        assert.ok(!JSON.stringify(res.body).includes('Confidential lead'));
    });
    // Scenario 6: Incorrect credentials do not reveal case details
    it('Scenario 6: Incorrect tracking credentials return generic authentication failure', async () => {
        const res = await request(app)
            .post('/api/reports/track')
            .send({
            caseId: createdCaseId,
            trackingSecret: 'cs_sec_completely_wrong_secret_123',
        });
        assert.equal(res.status, 401);
        assert.equal(res.body.error, 'Invalid Case ID or Tracking Secret combination.');
    });
    // Scenario 8: Unauthenticated users cannot access staff APIs
    it('Scenario 8: Unauthenticated requests to staff APIs are rejected with 401', async () => {
        const res = await request(app).get('/api/cases');
        assert.equal(res.status, 401);
    });
    // Scenario 9: Unauthorized staff roles cannot perform administrative actions
    it('Scenario 9: Safety Officer cannot access Admin user-management endpoints (403 Forbidden)', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${officerToken}`);
        assert.equal(res.status, 403);
    });
    it('Scenario 9b: System Admin can access Admin user-management endpoints', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);
        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body.users));
    });
    // Scenario 10: Staff can change case status with validated transitions
    it('Scenario 10: Staff can change a case status and records status history', async () => {
        const res = await request(app)
            .patch(`/api/cases/${createdCaseId}/status`)
            .set('Authorization', `Bearer ${officerToken}`)
            .send({ newStatus: 'UNDER_REVIEW', reason: 'Beginning digital evidence audit' });
        assert.equal(res.status, 200);
        assert.equal(res.body.case.status, 'UNDER_REVIEW');
        // Verify history recorded in DB
        const history = await prisma.statusHistory.findMany({ where: { caseId: createdCaseId } });
        assert.ok(history.some((h) => h.newStatus === 'UNDER_REVIEW'));
    });
    // Scenario 11: Reporters can see permitted status updates
    it('Scenario 11: Reporters track endpoint sees updated status and updates timeline', async () => {
        const res = await request(app)
            .post('/api/reports/track')
            .send({
            caseId: createdCaseId,
            trackingSecret: createdTrackingSecret,
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'UNDER_REVIEW');
    });
    // Scenario 13: Evidence retrieval requires authorization
    it('Scenario 13: Evidence file retrieval requires staff authentication', async () => {
        const res = await request(app).get(`/api/cases/${createdCaseId}/evidence/dummy-id`);
        assert.equal(res.status, 401);
    });
    // Scenario 14: Dashboard metrics match stored database records
    it('Scenario 14: Dashboard metrics are calculated from real database records', async () => {
        const res = await request(app)
            .get('/api/cases/metrics')
            .set('Authorization', `Bearer ${officerToken}`);
        assert.equal(res.status, 200);
        assert.ok(res.body.totalCases >= 1);
        assert.ok(Array.isArray(res.body.byCategory));
        assert.equal(typeof res.body.underReviewCases, 'number');
    });
    // Scenario 15: Reporter follow-up submission
    it('Scenario 15: Reporter can submit anonymous follow-up with valid credentials', async () => {
        const res = await request(app)
            .post('/api/reports/follow-up')
            .send({
            caseId: createdCaseId,
            trackingSecret: createdTrackingSecret,
            message: 'The fake account just changed their username to @burner_v2.',
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        // Verify follow-up is visible to staff
        const staffDetail = await request(app)
            .get(`/api/cases/${createdCaseId}`)
            .set('Authorization', `Bearer ${officerToken}`);
        assert.equal(staffDetail.body.case.followUps.length, 1);
        assert.ok(staffDetail.body.case.followUps[0].message.includes('@burner_v2'));
    });
});
