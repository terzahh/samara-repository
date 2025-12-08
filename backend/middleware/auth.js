const { validateSession } = require('../services/sessionService');
const { getSessionFromCookies } = require('../utils/cookies');
const { supabaseAdmin } = require('../config/database');

/**
 * Require authentication middleware
 * Validates session from cookies and attaches user to req.user
 */
async function requireAuth(req, res, next) {
    try {
        const { sessionId } = getSessionFromCookies(req);

        if (!sessionId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Validate session
        const validation = await validateSession(sessionId);

        if (!validation.valid) {
            return res.status(401).json({
                error: 'Session invalid',
                reason: validation.reason
            });
        }

        // Get user data
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select(`
        id,
        email,
        display_name,
        role_id,
        department_id,
        roles(name),
        departments(name)
      `)
            .eq('id', validation.session.user_id)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user and session to request
        req.user = {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.roles?.name || 'user',
            departmentId: user.department_id,
            departmentName: user.departments?.name
        };
        req.session = validation.session;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
}

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't require it
 */
async function optionalAuth(req, res, next) {
    try {
        const { sessionId } = getSessionFromCookies(req);

        if (!sessionId) {
            return next();
        }

        const validation = await validateSession(sessionId);

        if (!validation.valid) {
            return next();
        }

        const { data: user } = await supabaseAdmin
            .from('users')
            .select(`
        id,
        email,
        display_name,
        role_id,
        department_id,
        roles(name),
        departments(name)
      `)
            .eq('id', validation.session.user_id)
            .single();

        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                role: user.roles?.name || 'user',
                departmentId: user.department_id,
                departmentName: user.departments?.name
            };
            req.session = validation.session;
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
}

/**
 * Require specific role middleware
 * @param {string} requiredRole - Required role name
 */
function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

/**
 * Require admin role middleware
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
}

module.exports = {
    requireAuth,
    optionalAuth,
    requireRole,
    requireAdmin
};
