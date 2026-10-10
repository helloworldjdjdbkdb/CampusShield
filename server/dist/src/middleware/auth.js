import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
const JWT_SECRET = process.env.JWT_SECRET || 'campusshield-dev-fallback-secret-2026';
export function signToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
    }, JWT_SECRET, { expiresIn: '8h' });
}
export async function requireAuth(req, res, next) {
    try {
        let token = req.cookies?.token;
        const authHeader = req.headers.authorization;
        if (!token && authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ error: 'Authentication required. Please log in.' });
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        // Verify user is still active in database
        const dbUser = await prisma.staffUser.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true, department: true, isActive: true },
        });
        if (!dbUser || !dbUser.isActive) {
            res.status(401).json({ error: 'User account is inactive or no longer exists.' });
            return;
        }
        req.user = dbUser;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
}
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient privileges for this action.' });
            return;
        }
        next();
    };
}
