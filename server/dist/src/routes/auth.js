import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { comparePassword } from '../utils/crypto.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
const router = Router();
const loginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password is required'),
});
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma.staffUser.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const token = signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
        });
        // Set HTTP-only secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
        });
        // Audit log
        await prisma.auditEvent.create({
            data: {
                action: 'STAFF_LOGIN',
                details: `Staff member ${user.name} logged in from IP ${req.ip}`,
                staffUserId: user.id,
                ipAddress: req.ip,
            },
        });
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
            },
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error processing login.' });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });
    res.json({ success: true, message: 'Logged out successfully.' });
});
router.get('/me', requireAuth, (req, res) => {
    res.json({
        user: req.user,
    });
});
export default router;
