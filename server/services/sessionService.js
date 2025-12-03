const { supabaseAdmin } = require('../config/database');
const { hashToken, generateSecureToken, generateSessionId, generateCsrfToken } = require('../utils/crypto');
const { logActivity } = require('./auditService');
const { SESSION_DURATION_MS, INACTIVITY_TIMEOUT_MS } = require('../config/security');

/**
 * Create new session
 * @param {string} userId - User ID
 * @param {string} deviceSignature - Device signature hash
 * @param {string} userAgent - User-Agent header
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} { session, refreshToken, csrfToken }
 */
async function createSession(userId, deviceSignature, userAgent, ipAddress) {
    const sessionId = generateSessionId();
    const refreshToken = generateSecureToken();
    const refreshHash = hashToken(refreshToken);
    const csrfToken = generateCsrfToken();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    const { data, error } = await supabaseAdmin
        .from('sessions')
        .insert({
            id: sessionId,
            user_id: userId,
            refresh_token_hash: refreshHash,
            device_signature: deviceSignature,
            ip_address: ipAddress,
            csrf_token: csrfToken,
            last_activity: now,
            created_at: now,
            expires_at: expiresAt
        })
        .select()
        .single();

    if (error) throw error;

    await logActivity(
        userId,
        sessionId,
        'session_created',
        'info',
        ipAddress,
        userAgent,
        deviceSignature,
        {
            session_duration_hours: SESSION_DURATION_MS / (1000 * 60 * 60)
        }
    );

    return {
        session: data,
        refreshToken, // Return raw token (only time we have it)
        csrfToken
    };
}

/**
 * Validate session (check expiry, revoked, inactivity)
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} { valid, reason, session }
 */
async function validateSession(sessionId) {
    const { data: session, error } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error || !session) {
        return { valid: false, reason: 'not_found' };
    }

    if (session.revoked) {
        return { valid: false, reason: 'revoked', session };
    }

    const now = new Date();

    if (new Date(session.expires_at) < now) {
        return { valid: false, reason: 'expired', session };
    }

    const lastActivity = new Date(session.last_activity);
    if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
        return { valid: false, reason: 'inactive', session };
    }

    return { valid: true, session };
}

/**
 * Refresh session with atomic rotation and replay detection
 * @param {string} refreshToken - Current refresh token
 * @param {string} deviceSignature - Device signature hash
 * @param {string} userAgent - User-Agent header
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} { session, refreshToken }
 */
async function refreshSession(refreshToken, deviceSignature, userAgent, ipAddress) {
    const refreshHash = hashToken(refreshToken);

    // Find session by refresh token hash
    const { data: session, error: findError } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('refresh_token_hash', refreshHash)
        .eq('revoked', false)
        .single();

    if (findError || !session) {
        // Check if this was a previously rotated token (REPLAY ATTACK)
        const { data: oldSession } = await supabaseAdmin
            .from('sessions')
            .select('*')
            .eq('previous_refresh_hash', refreshHash)
            .single();

        if (oldSession) {
            // REPLAY DETECTED - revoke session immediately
            await revokeSession(oldSession.id, 'replay_detected');

            await logActivity(
                oldSession.user_id,
                oldSession.id,
                'replay_detected',
                'critical',
                ipAddress,
                userAgent,
                deviceSignature,
                {
                    attempted_token_hash: refreshHash.substring(0, 16) + '...',
                    message: 'Attempted to use previously rotated refresh token'
                }
            );

            throw new Error('Replay attack detected. Session revoked for security.');
        }

        throw new Error('Invalid refresh token');
    }

    // Validate session
    const validation = await validateSession(session.id);
    if (!validation.valid) {
        throw new Error(`Session ${validation.reason}`);
    }

    // Generate new refresh token
    const newRefreshToken = generateSecureToken();
    const newRefreshHash = hashToken(newRefreshToken);
    const now = new Date();

    // ATOMIC UPDATE: set new hash, store old hash for replay detection
    const { error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({
            refresh_token_hash: newRefreshHash,
            previous_refresh_hash: refreshHash, // Store for replay detection
            last_rotated_at: now,
            last_activity: now
        })
        .eq('id', session.id)
        .eq('refresh_token_hash', refreshHash); // Ensure no race condition

    if (updateError) {
        throw new Error('Failed to rotate refresh token');
    }

    await logActivity(
        session.user_id,
        session.id,
        'token_rotated',
        'info',
        ipAddress,
        userAgent,
        deviceSignature,
        null
    );

    return {
        session,
        refreshToken: newRefreshToken
    };
}

/**
 * Update last activity timestamp
 * @param {string} sessionId - Session ID
 */
async function updateActivity(sessionId) {
    const { error } = await supabaseAdmin
        .from('sessions')
        .update({ last_activity: new Date() })
        .eq('id', sessionId);

    if (error) throw error;
}

/**
 * Revoke session
 * @param {string} sessionId - Session ID
 * @param {string} reason - Revocation reason
 * @returns {Promise<Object>} Revoked session
 */
async function revokeSession(sessionId, reason = 'logout') {
    const { data: session, error } = await supabaseAdmin
        .from('sessions')
        .update({
            revoked: true,
            revoke_reason: reason
        })
        .eq('id', sessionId)
        .select()
        .single();

    if (error) throw error;

    await logActivity(
        session.user_id,
        sessionId,
        'session_revoked',
        reason === 'suspicious' || reason === 'replay_detected' ? 'warning' : 'info',
        null,
        null,
        null,
        { reason }
    );

    return session;
}

/**
 * Revoke all sessions for a user
 * @param {string} userId - User ID
 * @param {string} reason - Revocation reason
 * @returns {Promise<Array>} Revoked sessions
 */
async function revokeAllUserSessions(userId, reason = 'logout_all') {
    const { data, error } = await supabaseAdmin
        .from('sessions')
        .update({
            revoked: true,
            revoke_reason: reason
        })
        .eq('user_id', userId)
        .eq('revoked', false)
        .select();

    if (error) throw error;

    await logActivity(
        userId,
        null,
        'all_sessions_revoked',
        'warning',
        null,
        null,
        null,
        {
            reason,
            count: data.length
        }
    );

    return data;
}

/**
 * Get active sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active sessions
 */
async function getUserSessions(userId) {
    const { data, error } = await supabaseAdmin
        .from('sessions')
        .select('id, device_signature, ip_address, last_activity, created_at, expires_at')
        .eq('user_id', userId)
        .eq('revoked', false)
        .order('last_activity', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Cleanup expired sessions (run as cron job)
 * Keeps revoked sessions for 90 days for forensics
 */
async function cleanupExpiredSessions() {
    const now = new Date();
    const retentionDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Delete old revoked sessions
    const { error: deleteError } = await supabaseAdmin
        .from('sessions')
        .delete()
        .eq('revoked', true)
        .lt('created_at', retentionDate.toISOString());

    if (deleteError) {
        console.error('Error cleaning up old sessions:', deleteError);
    }

    // Mark expired sessions as revoked
    const { error: expireError } = await supabaseAdmin
        .from('sessions')
        .update({
            revoked: true,
            revoke_reason: 'expired'
        })
        .eq('revoked', false)
        .lt('expires_at', now.toISOString());

    if (expireError) {
        console.error('Error marking expired sessions:', expireError);
    }
}

module.exports = {
    createSession,
    validateSession,
    refreshSession,
    updateActivity,
    revokeSession,
    revokeAllUserSessions,
    getUserSessions,
    cleanupExpiredSessions
};
