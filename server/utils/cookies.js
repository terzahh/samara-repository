/**
 * Set authentication cookies (HttpOnly, Secure, SameSite)
 * @param {Response} res - Express response object
 * @param {Object} options - Cookie options
 * @param {string} options.sessionId - Session ID
 * @param {string} options.refreshToken - Refresh token
 * @param {string} options.csrfToken - CSRF token
 */
function setAuthCookies(res, { sessionId, refreshToken, csrfToken }) {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = process.env.COOKIE_DOMAIN; // Optional

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: 'strict',
        path: '/',
        domain: domain || undefined
    };

    // Session cookie (short-lived, tied to session)
    res.cookie('session_id', sessionId, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Refresh token cookie (longer-lived)
    res.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    });

    // CSRF token cookie (NOT HttpOnly - client needs to read it)
    res.cookie('csrf_token', csrfToken, {
        httpOnly: false, // Client must read this
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
        domain: domain || undefined
    });
}

/**
 * Clear all authentication cookies
 * @param {Response} res - Express response object
 */
function clearAuthCookies(res) {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/'
    };

    res.clearCookie('session_id', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    res.clearCookie('csrf_token', { ...cookieOptions, httpOnly: false });
}

/**
 * Extract session data from cookies
 * @param {Request} req - Express request object
 * @returns {Object} Session data from cookies
 */
function getSessionFromCookies(req) {
    return {
        sessionId: req.cookies.session_id,
        refreshToken: req.cookies.refresh_token,
        csrfToken: req.cookies.csrf_token
    };
}

module.exports = {
    setAuthCookies,
    clearAuthCookies,
    getSessionFromCookies
};
