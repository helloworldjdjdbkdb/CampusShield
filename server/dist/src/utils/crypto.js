import crypto from 'crypto';
import bcrypt from 'bcryptjs';
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
/**
 * Generate a unique, non-sequential, cryptographically secure Case ID.
 * Format: CS-2026-X8K9M2
 */
export function generateCaseId() {
    const year = new Date().getFullYear();
    let randomPart = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        randomPart += CHARS[bytes[i] % CHARS.length];
    }
    return `CS-${year}-${randomPart}`;
}
/**
 * Generate a separate, cryptographically secure tracking secret.
 * Example: cs_sec_9f4e2... (64 hex characters)
 */
export function generateTrackingSecret() {
    const randomHex = crypto.randomBytes(24).toString('hex');
    return `cs_sec_${randomHex}`;
}
/**
 * Hash the tracking secret before storing in the database.
 * We use bcryptjs with 10 salt rounds for secure hashing.
 */
export async function hashTrackingSecret(secret) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(secret, salt);
}
/**
 * Securely verify the submitted tracking secret against stored hash.
 */
export async function verifyTrackingSecret(secret, hash) {
    if (!secret || !hash)
        return false;
    return bcrypt.compare(secret, hash);
}
/**
 * Password hashing for staff accounts.
 */
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
