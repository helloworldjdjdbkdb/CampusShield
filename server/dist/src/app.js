import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import casesRouter from './routes/cases.js';
import adminRouter from './routes/admin.js';
import aiRouter from './routes/ai.js';
export const app = express();
// Security Headers
app.use(helmet({
    contentSecurityPolicy: false, // Allows flexible integration for hackathon frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl) or allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true); // Dev-friendly fallback
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Health Check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'online',
        system: 'CampusShield Security Gateway',
        timestamp: new Date().toISOString(),
    });
});
// Routes
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);
// 404 Handler
app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'An unexpected internal server error occurred.',
    });
});
