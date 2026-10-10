import rateLimit from 'express-rate-limit';

export const reportSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many reports submitted from this IP. Please wait before submitting another report.',
  },
});

export const trackLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Allow max 15 lookups per 15m to thwart credential brute-forcing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many case tracking attempts. Please wait 15 minutes before trying again to protect privacy.',
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Account temporarily throttled for security.',
  },
});
