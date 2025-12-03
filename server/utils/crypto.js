const crypto = require('crypto');

// Load secrets from environment
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-production';
const CSRF_SECRET = process.env.CSRF_SECRET || 'dev-csrf-secret-change-in-production';

// Warn if using default secrets in production
if (process.env.NODE_ENV === 'production' && (COOKIE_SECRET.includes('dev-') || CSRF_SECRET.includes('dev-'))) {
    console.error('⚠️  CRITICAL: Using default secrets in production! Set COOKIE_SECRET and CSRF_SECRET environment variables.');
    process.exit(1);
}

/**
 * Hash token using HMAC-SHA256 (keyed hash)
 * Prevents preimage attacks compared to plain SHA-256
 * @param {string} token - Token to hash
 * @returns {string} HMAC-SHA256 hash (hex)
 */
function hashToken(token) {
    return crypto
        .createHmac('sha256', COOKIE_SECRET)
        .update(token)
        .digest('hex');
}

/**
 * Generate cryptographically secure random token
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} Hex-encoded random token
 */
function generateSecureToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate session ID (UUID v4)
 * @returns {string} UUID
 */
function generateSessionId() {
    return crypto.randomUUID();
}

/**
 * Generate CSRF token for session
 * Uses HMAC with CSRF_SECRET for additional security
 * @returns {string} CSRF token (hex)
 */
function generateCsrfToken() {
    return crypto
        .createHmac('sha256', CSRF_SECRET)
        .update(generateSecureToken())
        .digest('hex');
}

/**
 * Constant-time comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
function constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

module.exports = {
    hashToken,
    generateSecureToken,
    generateSessionId,
    generateCsrfToken,
    constantTimeCompare
};
