const { constantTimeCompare } = require('../utils/crypto');

/**
 * CSRF protection middleware
 * Validates CSRF token for state-changing operations
 */
function csrfProtection(req, res, next) {
    // Only check CSRF for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Get CSRF token from header
    const headerToken = req.headers['x-csrf-token'];

    // Get CSRF token from session
    const sessionToken = req.session?.csrf_token;

    if (!headerToken) {
        return res.status(403).json({
            error: 'CSRF token required',
            message: 'Include X-CSRF-Token header for state-changing requests'
        });
    }

    if (!sessionToken) {
        return res.status(403).json({
            error: 'No session CSRF token',
            message: 'Session may have expired'
        });
    }

    // Constant-time comparison to prevent timing attacks
    if (!constantTimeCompare(headerToken, sessionToken)) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'CSRF token mismatch'
        });
    }

    next();
}

module.exports = {
    csrfProtection
};
