import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { generateCaseId, generateTrackingSecret, hashTrackingSecret, verifyTrackingSecret } from '../utils/crypto.js';
import { reportSubmissionLimiter, trackLookupLimiter } from '../middleware/rateLimiter.js';
import { uploadEvidence } from '../middleware/upload.js';
const router = Router();
const reportSchema = z.object({
    category: z.enum([
        'FAKE_PROFILE',
        'CYBERBULLYING',
        'IMPERSONATION',
        'ONLINE_HARASSMENT',
        'THREATS',
        'CYBERSTALKING',
        'OTHER',
    ]),
    platform: z.string().min(1, 'Social media platform is required').max(100),
    description: z.string().min(15, 'Incident description must be at least 15 characters').max(5000),
    incidentDate: z.string().min(1, 'Approximate incident date is required'),
    profileUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
    isImmediateDanger: z.boolean().default(false),
    reportingMode: z.enum(['ANONYMOUS', 'IDENTIFIED']).default('ANONYMOUS'),
    reporterName: z.string().max(100).optional().or(z.literal('')),
    reporterEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    reporterPhone: z.string().max(25).optional().or(z.literal('')),
    privacyNoticeAck: z.boolean().refine(val => val === true, {
        message: 'You must acknowledge the privacy notice to submit a report',
    }),
});
/**
 * Step 1 & 2 & 3: Submit an anonymous/identified report
 */
router.post('/', reportSubmissionLimiter, uploadEvidence.array('evidenceFiles', 5), async (req, res) => {
    try {
        // Parse JSON body or form-data fields
        const isImmediateDanger = req.body.isImmediateDanger === 'true' || req.body.isImmediateDanger === true;
        const privacyNoticeAck = req.body.privacyNoticeAck === 'true' || req.body.privacyNoticeAck === true;
        const validatedData = reportSchema.parse({
            category: req.body.category,
            platform: req.body.platform,
            description: req.body.description,
            incidentDate: req.body.incidentDate,
            profileUrl: req.body.profileUrl || undefined,
            isImmediateDanger,
            reportingMode: req.body.reportingMode || 'ANONYMOUS',
            reporterName: req.body.reporterName || undefined,
            reporterEmail: req.body.reporterEmail || undefined,
            reporterPhone: req.body.reporterPhone || undefined,
            privacyNoticeAck,
        });
        // Generate credentials
        const caseId = generateCaseId();
        const trackingSecret = generateTrackingSecret();
        const trackingSecretHash = await hashTrackingSecret(trackingSecret);
        // Determine initial priority based on immediate danger or category
        let priority = 'MEDIUM';
        if (validatedData.isImmediateDanger || validatedData.category === 'THREATS') {
            priority = 'CRITICAL';
        }
        else if (validatedData.category === 'CYBERSTALKING' || validatedData.category === 'ONLINE_HARASSMENT') {
            priority = 'HIGH';
        }
        // Persist to database in a transaction
        const newCase = await prisma.$transaction(async (tx) => {
            const createdCase = await tx.case.create({
                data: {
                    id: caseId,
                    trackingSecretHash,
                    category: validatedData.category,
                    platform: validatedData.platform,
                    description: validatedData.description,
                    incidentDate: validatedData.incidentDate,
                    profileUrl: validatedData.profileUrl || null,
                    isImmediateDanger: validatedData.isImmediateDanger,
                    reportingMode: validatedData.reportingMode,
                    reporterName: validatedData.reportingMode === 'IDENTIFIED' ? validatedData.reporterName : null,
                    reporterEmail: validatedData.reportingMode === 'IDENTIFIED' ? validatedData.reporterEmail : null,
                    reporterPhone: validatedData.reportingMode === 'IDENTIFIED' ? validatedData.reporterPhone : null,
                    privacyNoticeAck: validatedData.privacyNoticeAck,
                    status: 'SUBMITTED',
                    priority,
                },
            });
            // Create initial status history entry
            await tx.statusHistory.create({
                data: {
                    caseId: createdCase.id,
                    oldStatus: 'NONE',
                    newStatus: 'SUBMITTED',
                    reason: 'Report successfully submitted by user',
                },
            });
            // Create initial reporter visible update
            await tx.reporterUpdate.create({
                data: {
                    caseId: createdCase.id,
                    message: 'Your report has been securely received by Campus Safety. An officer will review the allegations promptly.',
                    createdById: null,
                },
            });
            // Store evidence metadata if files were uploaded
            const files = req.files || [];
            for (const file of files) {
                await tx.evidence.create({
                    data: {
                        caseId: createdCase.id,
                        originalName: file.originalname,
                        storedName: file.filename,
                        mimeType: file.mimetype,
                        fileSize: file.size,
                        filePath: file.path,
                    },
                });
            }
            // Audit event
            await tx.auditEvent.create({
                data: {
                    action: 'REPORT_SUBMITTED',
                    details: `New case submitted with category: ${validatedData.category}, platform: ${validatedData.platform}, immediateDanger: ${validatedData.isImmediateDanger}`,
                    caseId: createdCase.id,
                    ipAddress: req.ip,
                },
            });
            return createdCase;
        });
        // Return credentials (only time tracking secret is ever displayed)
        res.status(201).json({
            success: true,
            caseId: newCase.id,
            trackingSecret, // Plaintext returned ONCE to the user
            category: newCase.category,
            platform: newCase.platform,
            createdAt: newCase.createdAt,
            message: 'Report received securely. Save your Case ID and Tracking Secret now.',
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
            return;
        }
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Internal server error processing report submission.' });
    }
});
/**
 * Step 4: Track My Case
 * Generic authentication failure to prevent case ID enumeration.
 * Never returns internal notes or staff credentials.
 */
router.post('/track', trackLookupLimiter, async (req, res) => {
    try {
        const { caseId, trackingSecret } = req.body;
        if (!caseId || !trackingSecret) {
            res.status(400).json({ error: 'Both Case ID and Tracking Secret are required.' });
            return;
        }
        const reportCase = await prisma.case.findUnique({
            where: { id: String(caseId).trim() },
            include: {
                statusHistory: {
                    select: {
                        id: true,
                        oldStatus: true,
                        newStatus: true,
                        reason: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                reporterUpdates: {
                    select: {
                        id: true,
                        message: true,
                        requiresInput: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                followUps: {
                    select: {
                        id: true,
                        message: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                evidence: {
                    select: {
                        id: true,
                        originalName: true,
                        mimeType: true,
                        fileSize: true,
                        createdAt: true,
                    },
                },
            },
        });
        // Constant-time/secure verification. Generic error on mismatch to prevent enumeration.
        if (!reportCase) {
            res.status(401).json({ error: 'Invalid Case ID or Tracking Secret combination.' });
            return;
        }
        const isValid = await verifyTrackingSecret(String(trackingSecret).trim(), reportCase.trackingSecretHash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid Case ID or Tracking Secret combination.' });
            return;
        }
        // Return strictly sanitized case information
        res.json({
            caseId: reportCase.id,
            category: reportCase.category,
            platform: reportCase.platform,
            description: reportCase.description,
            incidentDate: reportCase.incidentDate,
            profileUrl: reportCase.profileUrl,
            status: reportCase.status,
            priority: reportCase.priority,
            isImmediateDanger: reportCase.isImmediateDanger,
            createdAt: reportCase.createdAt,
            updatedAt: reportCase.updatedAt,
            statusHistory: reportCase.statusHistory,
            reporterUpdates: reportCase.reporterUpdates,
            followUps: reportCase.followUps,
            evidenceCount: reportCase.evidence.length,
            evidence: reportCase.evidence,
        });
    }
    catch (error) {
        console.error('Error tracking case:', error);
        res.status(500).json({ error: 'Internal server error while retrieving case details.' });
    }
});
/**
 * Step 4b: Submit anonymous follow-up information
 */
router.post('/follow-up', trackLookupLimiter, async (req, res) => {
    try {
        const { caseId, trackingSecret, message } = req.body;
        if (!caseId || !trackingSecret || !message || message.trim().length === 0) {
            res.status(400).json({ error: 'Case ID, Tracking Secret, and message are required.' });
            return;
        }
        const reportCase = await prisma.case.findUnique({
            where: { id: String(caseId).trim() },
        });
        if (!reportCase) {
            res.status(401).json({ error: 'Invalid Case ID or Tracking Secret combination.' });
            return;
        }
        const isValid = await verifyTrackingSecret(String(trackingSecret).trim(), reportCase.trackingSecretHash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid Case ID or Tracking Secret combination.' });
            return;
        }
        const followUp = await prisma.reporterFollowUp.create({
            data: {
                caseId: reportCase.id,
                message: message.trim(),
            },
        });
        await prisma.auditEvent.create({
            data: {
                action: 'REPORTER_FOLLOW_UP',
                details: 'Reporter provided additional follow-up information',
                caseId: reportCase.id,
                ipAddress: req.ip,
            },
        });
        res.json({
            success: true,
            followUp: {
                id: followUp.id,
                message: followUp.message,
                createdAt: followUp.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error submitting follow-up:', error);
        res.status(500).json({ error: 'Internal server error submitting follow-up.' });
    }
});
export default router;
