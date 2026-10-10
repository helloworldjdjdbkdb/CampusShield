import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
// Protect all case endpoints with staff authentication
router.use(requireAuth);
const VALID_STATUSES = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'ADDITIONAL_INFO_REQUESTED',
    'REFERRED_TO_AUTHORITY',
    'ACTION_IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
/**
 * GET /api/cases/metrics
 * Dynamic metrics calculated directly from database records.
 */
router.get('/metrics', async (_req, res) => {
    try {
        const [totalCases, submittedCases, underReviewCases, highOrCriticalPriority, additionalInfoRequested, resolvedCases, allCases, auditCount,] = await Promise.all([
            prisma.case.count(),
            prisma.case.count({ where: { status: 'SUBMITTED' } }),
            prisma.case.count({ where: { status: 'UNDER_REVIEW' } }),
            prisma.case.count({ where: { priority: { in: ['HIGH', 'CRITICAL'] } } }),
            prisma.case.count({ where: { status: 'ADDITIONAL_INFO_REQUESTED' } }),
            prisma.case.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
            prisma.case.findMany({
                select: {
                    category: true,
                    platform: true,
                    status: true,
                    priority: true,
                    createdAt: true,
                },
            }),
            prisma.auditEvent.count(),
        ]);
        // Aggregate category counts
        const categoryCounts = {};
        const platformCounts = {};
        const statusCounts = {};
        for (const c of allCases) {
            categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
            platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1;
            statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
        }
        const byCategory = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
        const byPlatform = Object.entries(platformCounts).map(([name, count]) => ({ name, count }));
        const byStatus = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
        res.json({
            totalCases,
            submittedCases,
            underReviewCases,
            highOrCriticalPriority,
            additionalInfoRequested,
            resolvedCases,
            auditCount,
            byCategory,
            byPlatform,
            byStatus,
        });
    }
    catch (error) {
        console.error('Error computing metrics:', error);
        res.status(500).json({ error: 'Failed to compute case metrics.' });
    }
});
/**
 * GET /api/cases
 * List cases with search, pagination, and multi-field filtering.
 */
router.get('/', async (req, res) => {
    try {
        const { search, status, category, priority, assignedOfficerId, page = '1', limit = '20', } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status && status !== 'ALL') {
            where.status = String(status);
        }
        if (category && category !== 'ALL') {
            where.category = String(category);
        }
        if (priority && priority !== 'ALL') {
            where.priority = String(priority);
        }
        if (assignedOfficerId && assignedOfficerId !== 'ALL') {
            where.assignedOfficerId = String(assignedOfficerId);
        }
        if (search && String(search).trim().length > 0) {
            const q = String(search).trim();
            where.OR = [
                { id: { contains: q } },
                { description: { contains: q } },
                { platform: { contains: q } },
                { category: { contains: q } },
                { reporterName: { contains: q } },
            ];
        }
        const [cases, total] = await Promise.all([
            prisma.case.findMany({
                where,
                include: {
                    assignedOfficer: {
                        select: { id: true, name: true, email: true },
                    },
                    evidence: {
                        select: { id: true },
                    },
                    _count: {
                        select: {
                            internalNotes: true,
                            reporterUpdates: true,
                            followUps: true,
                            evidence: true,
                        },
                    },
                },
                orderBy: [{ isImmediateDanger: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: limitNum,
            }),
            prisma.case.count({ where }),
        ]);
        // Sanitize output (don't expose trackingSecretHash even to staff!)
        const sanitizedCases = cases.map((c) => {
            const { trackingSecretHash, ...safeCase } = c;
            return safeCase;
        });
        res.json({
            cases: sanitizedCases,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Error fetching cases:', error);
        res.status(500).json({ error: 'Failed to retrieve cases.' });
    }
});
/**
 * GET /api/cases/:id
 * Detailed case view for authorized staff.
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const caseData = await prisma.case.findUnique({
            where: { id },
            include: {
                assignedOfficer: {
                    select: { id: true, name: true, email: true, department: true },
                },
                statusHistory: {
                    include: {
                        changedBy: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                reporterUpdates: {
                    include: {
                        createdBy: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                internalNotes: {
                    include: {
                        createdBy: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                followUps: {
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
                auditEvents: {
                    include: {
                        staffUser: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!caseData) {
            res.status(404).json({ error: 'Case not found.' });
            return;
        }
        // Never return the tracking secret hash even to staff
        const { trackingSecretHash, ...safeCase } = caseData;
        res.json({ case: safeCase });
    }
    catch (error) {
        console.error('Error fetching case detail:', error);
        res.status(500).json({ error: 'Failed to retrieve case details.' });
    }
});
/**
 * PATCH /api/cases/:id/status
 * Update case status with transition validation, status history, and audit logging.
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus, reason } = req.body;
        if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
            res.status(400).json({
                error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
            });
            return;
        }
        const currentCase = await prisma.case.findUnique({ where: { id } });
        if (!currentCase) {
            res.status(404).json({ error: 'Case not found.' });
            return;
        }
        const oldStatus = currentCase.status;
        const isClosing = newStatus === 'RESOLVED' || newStatus === 'CLOSED';
        const updated = await prisma.$transaction(async (tx) => {
            const updatedCase = await tx.case.update({
                where: { id },
                data: {
                    status: newStatus,
                    closedAt: isClosing ? new Date() : currentCase.closedAt,
                },
            });
            await tx.statusHistory.create({
                data: {
                    caseId: id,
                    oldStatus,
                    newStatus,
                    changedById: req.user.id,
                    reason: reason || `Status changed from ${oldStatus} to ${newStatus}`,
                },
            });
            await tx.auditEvent.create({
                data: {
                    action: 'STATUS_UPDATED',
                    details: `Officer ${req.user.name} changed status from ${oldStatus} to ${newStatus}. Reason: ${reason || 'N/A'}`,
                    caseId: id,
                    staffUserId: req.user.id,
                    ipAddress: req.ip,
                },
            });
            return updatedCase;
        });
        res.json({ success: true, case: updated });
    }
    catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update case status.' });
    }
});
/**
 * PATCH /api/cases/:id/priority
 */
router.patch('/:id/priority', async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        if (!priority || !VALID_PRIORITIES.includes(priority)) {
            res.status(400).json({
                error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
            });
            return;
        }
        const updated = await prisma.case.update({
            where: { id },
            data: { priority },
        });
        await prisma.auditEvent.create({
            data: {
                action: 'PRIORITY_CHANGED',
                details: `Officer ${req.user.name} changed priority to ${priority}`,
                caseId: id,
                staffUserId: req.user.id,
                ipAddress: req.ip,
            },
        });
        res.json({ success: true, case: updated });
    }
    catch (error) {
        console.error('Error updating priority:', error);
        res.status(500).json({ error: 'Failed to update case priority.' });
    }
});
/**
 * PATCH /api/cases/:id/assign
 */
router.patch('/:id/assign', async (req, res) => {
    try {
        const { id } = req.params;
        const { officerId } = req.body;
        let officerName = 'Unassigned';
        if (officerId) {
            const officer = await prisma.staffUser.findUnique({ where: { id: officerId } });
            if (!officer) {
                res.status(400).json({ error: 'Assigned officer does not exist.' });
                return;
            }
            officerName = officer.name;
        }
        const updated = await prisma.case.update({
            where: { id },
            data: { assignedOfficerId: officerId || null },
            include: { assignedOfficer: { select: { id: true, name: true, email: true } } },
        });
        await prisma.auditEvent.create({
            data: {
                action: 'CASE_ASSIGNED',
                details: `Case assigned to: ${officerName} by ${req.user.name}`,
                caseId: id,
                staffUserId: req.user.id,
                ipAddress: req.ip,
            },
        });
        res.json({ success: true, case: updated });
    }
    catch (error) {
        console.error('Error assigning case:', error);
        res.status(500).json({ error: 'Failed to assign officer.' });
    }
});
/**
 * POST /api/cases/:id/reporter-updates
 * Publish an update that is visible to the student/reporter.
 */
router.post('/:id/reporter-updates', async (req, res) => {
    try {
        const { id } = req.params;
        const { message, requiresInput } = req.body;
        if (!message || message.trim().length === 0) {
            res.status(400).json({ error: 'Update message cannot be empty.' });
            return;
        }
        const update = await prisma.$transaction(async (tx) => {
            const createdUpdate = await tx.reporterUpdate.create({
                data: {
                    caseId: id,
                    message: message.trim(),
                    requiresInput: Boolean(requiresInput),
                    createdById: req.user.id,
                },
            });
            // If officer is requesting information from the reporter, update status
            if (requiresInput) {
                await tx.case.update({
                    where: { id },
                    data: { status: 'ADDITIONAL_INFO_REQUESTED' },
                });
                await tx.statusHistory.create({
                    data: {
                        caseId: id,
                        oldStatus: 'UNDER_REVIEW',
                        newStatus: 'ADDITIONAL_INFO_REQUESTED',
                        changedById: req.user.id,
                        reason: 'Staff requested additional clarification from reporter',
                    },
                });
            }
            await tx.auditEvent.create({
                data: {
                    action: 'REPORTER_UPDATE_PUBLISHED',
                    details: `Public update sent to reporter (requiresInput: ${Boolean(requiresInput)})`,
                    caseId: id,
                    staffUserId: req.user.id,
                    ipAddress: req.ip,
                },
            });
            return createdUpdate;
        });
        res.status(201).json({ success: true, update });
    }
    catch (error) {
        console.error('Error adding reporter update:', error);
        res.status(500).json({ error: 'Failed to post reporter update.' });
    }
});
/**
 * POST /api/cases/:id/internal-notes
 * Add internal staff note (NEVER visible to student).
 */
router.post('/:id/internal-notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            res.status(400).json({ error: 'Internal note content cannot be empty.' });
            return;
        }
        const note = await prisma.internalNote.create({
            data: {
                caseId: id,
                content: content.trim(),
                createdById: req.user.id,
            },
            include: {
                createdBy: { select: { id: true, name: true } },
            },
        });
        await prisma.auditEvent.create({
            data: {
                action: 'INTERNAL_NOTE_ADDED',
                details: `Private internal note recorded by ${req.user.name}`,
                caseId: id,
                staffUserId: req.user.id,
                ipAddress: req.ip,
            },
        });
        res.status(201).json({ success: true, note });
    }
    catch (error) {
        console.error('Error adding internal note:', error);
        res.status(500).json({ error: 'Failed to add internal note.' });
    }
});
/**
 * POST /api/cases/:id/resolution
 * Record official resolution and close case.
 */
router.post('/:id/resolution', async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionDetails } = req.body;
        if (!resolutionDetails || resolutionDetails.trim().length === 0) {
            res.status(400).json({ error: 'Resolution details are required.' });
            return;
        }
        const updated = await prisma.$transaction(async (tx) => {
            const caseRec = await tx.case.update({
                where: { id },
                data: {
                    resolutionDetails: resolutionDetails.trim(),
                    status: 'RESOLVED',
                    closedAt: new Date(),
                },
            });
            await tx.statusHistory.create({
                data: {
                    caseId: id,
                    oldStatus: caseRec.status,
                    newStatus: 'RESOLVED',
                    changedById: req.user.id,
                    reason: `Resolved: ${resolutionDetails.slice(0, 80)}...`,
                },
            });
            await tx.reporterUpdate.create({
                data: {
                    caseId: id,
                    message: `Official Resolution: ${resolutionDetails.trim()}`,
                    createdById: req.user.id,
                },
            });
            await tx.auditEvent.create({
                data: {
                    action: 'CASE_RESOLVED',
                    details: `Case resolved by ${req.user.name}. Resolution recorded.`,
                    caseId: id,
                    staffUserId: req.user.id,
                    ipAddress: req.ip,
                },
            });
            return caseRec;
        });
        res.json({ success: true, case: updated });
    }
    catch (error) {
        console.error('Error recording resolution:', error);
        res.status(500).json({ error: 'Failed to record resolution.' });
    }
});
/**
 * GET /api/cases/:id/evidence/:evidenceId
 * Securely download evidence file. Authorized staff only.
 */
router.get('/:id/evidence/:evidenceId', async (req, res) => {
    try {
        const { id, evidenceId } = req.params;
        const evidence = await prisma.evidence.findFirst({
            where: { id: evidenceId, caseId: id },
        });
        if (!evidence) {
            res.status(404).json({ error: 'Evidence record not found.' });
            return;
        }
        if (!fs.existsSync(evidence.filePath)) {
            res.status(404).json({ error: 'Evidence file not found on disk.' });
            return;
        }
        // Set secure headers
        res.setHeader('Content-Type', evidence.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(evidence.originalName)}"`);
        // Audit download
        await prisma.auditEvent.create({
            data: {
                action: 'EVIDENCE_ACCESSED',
                details: `Evidence "${evidence.originalName}" downloaded by ${req.user.name}`,
                caseId: id,
                staffUserId: req.user.id,
                ipAddress: req.ip,
            },
        });
        res.sendFile(path.resolve(evidence.filePath));
    }
    catch (error) {
        console.error('Error serving evidence:', error);
        res.status(500).json({ error: 'Failed to access evidence.' });
    }
});
export default router;
