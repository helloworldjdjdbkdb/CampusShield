import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { hashPassword } from '../utils/crypto.js';

const router = Router();

// Restricted to authenticated SYSTEM_ADMIN only
router.use(requireAuth);
router.use(requireRole('SYSTEM_ADMIN'));

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SAFETY_OFFICER', 'SYSTEM_ADMIN']),
  department: z.string().optional().default('Campus Safety & Student Affairs'),
});

router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.staffUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { assignedCases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching staff users:', error);
    res.status(500).json({ error: 'Failed to retrieve staff users.' });
  }
});

router.post('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.staffUser.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      res.status(400).json({ error: 'A staff member with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.staffUser.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        passwordHash,
        role: data.role,
        department: data.department,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'STAFF_USER_CREATED',
        details: `Administrator ${req.user!.name} created staff user ${user.name} (${user.role})`,
        staffUserId: req.user!.id,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({ success: true, user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error creating staff user:', error);
    res.status(500).json({ error: 'Failed to create staff user.' });
  }
});

router.patch('/users/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user!.id && isActive === false) {
      res.status(400).json({ error: 'You cannot deactivate your own administrator account.' });
      return;
    }

    const updated = await prisma.staffUser.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, email: true, name: true, isActive: true },
    });

    await prisma.auditEvent.create({
      data: {
        action: 'STAFF_STATUS_MODIFIED',
        details: `Administrator ${req.user!.name} changed active status of ${updated.name} to ${updated.isActive}`,
        staffUserId: req.user!.id,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error toggling staff status:', error);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

router.get('/audit-logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.auditEvent.findMany({
        include: {
          staffUser: { select: { id: true, name: true, email: true } },
          case: { select: { id: true, category: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditEvent.count(),
    ]);

    res.json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit trail.' });
  }
});

export default router;
