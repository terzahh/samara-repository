const express = require('express');
const router = express.Router();
const { loginUser, registerUser, adminResetPassword, changePassword } = require('../services/authService');
const { refreshSession, revokeSession, updateActivity } = require('../services/sessionService');
const { setAuthCookies, clearAuthCookies, getSessionFromCookies } = require('../utils/cookies');
const { generateDeviceSignature, validateFingerprint } = require('../utils/fingerprint');
const { logActivity } = require('../services/auditService');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { loginLimiter, registerLimiter, refreshLimiter } = require('../middleware/rateLimit');

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Authenticate user
        const { user, session, refreshToken, csrfToken } = await loginUser(
            email,
            password,
            userAgent,
            ipAddress
        );

        // Set HttpOnly cookies
        setAuthCookies(res, {
            sessionId: session.id,
            refreshToken,
            csrfToken
        });

        res.json({ user });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', registerLimiter, async (req, res, next) => {
    try {
        const { email, password, displayName, role, departmentId, pendingApproval } = req.body;

        if (!email || !password || !displayName) {
            return res.status(400).json({
                error: 'Email, password, and display name required'
            });
        }

        const { user } = await registerUser(
            email,
            password,
            displayName,
            role,
            departmentId,
            pendingApproval
        );

        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/logout
 * Logout and revoke session
 */
router.post('/logout', requireAuth, csrfProtection, async (req, res, next) => {
    try {
        const { sessionId } = getSessionFromCookies(req);

        if (sessionId) {
            await revokeSession(sessionId, 'logout');

            await logActivity(
                req.user.id,
                sessionId,
                'logout',
                'info',
                req.ip,
                req.headers['user-agent'],
                null,
                null
            );
        }

        clearAuthCookies(res);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token with rotation
 */
router.post('/refresh', refreshLimiter, async (req, res, next) => {
    try {
        const { refreshToken } = getSessionFromCookies(req);
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!refreshToken) {
            return res.status(401).json({ error: 'No refresh token' });
        }

        // Generate device signature
        const deviceSignature = generateDeviceSignature(userAgent);

        // Refresh session (atomic rotation + replay detection)
        const { session, refreshToken: newRefreshToken } = await refreshSession(
            refreshToken,
            deviceSignature,
            userAgent,
            ipAddress
        );

        // Validate device fingerprint
        const fingerprintValidation = validateFingerprint(
            userAgent,
            session.device_signature,
            null, // We don't store original UA, only hash
            80 // 80% tolerance
        );

        if (!fingerprintValidation.valid) {
            // Log suspicious activity
            await logActivity(
                session.user_id,
                session.id,
                'device_mismatch',
                fingerprintValidation.action === 'revoke_suspicious' ? 'critical' : 'warning',
                ipAddress,
                userAgent,
                deviceSignature,
                {
                    action: fingerprintValidation.action,
                    similarity: fingerprintValidation.similarity
                }
            );

            if (fingerprintValidation.action === 'revoke_suspicious') {
                await revokeSession(session.id, 'suspicious');
                clearAuthCookies(res);
                return res.status(401).json({
                    error: 'Device mismatch detected',
                    message: 'Session revoked for security'
                });
            }
        }

        // Set new cookies
        setAuthCookies(res, {
            sessionId: session.id,
            refreshToken: newRefreshToken,
            csrfToken: session.csrf_token
        });

        res.json({ message: 'Token refreshed' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user from session
 */
router.get('/me', requireAuth, async (req, res) => {
    res.json({ user: req.user });
});

/**
 * POST /api/auth/ping
 * Update last activity timestamp
 */
router.post('/ping', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = getSessionFromCookies(req);

        if (sessionId) {
            await updateActivity(sessionId);
        }

        res.json({ message: 'Activity updated' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/admin/reset-password
 * Admin reset user password
 */
router.post('/admin/reset-password', requireAuth, requireAdmin, csrfProtection, async (req, res, next) => {
    try {
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({ error: 'User ID and new password required' });
        }

        await adminResetPassword(userId, newPassword);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/change-password
 * Change own password
 */
router.post('/change-password', requireAuth, csrfProtection, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        await changePassword(req.user.id, currentPassword, newPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

