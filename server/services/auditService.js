const { supabaseAdmin } = require('../config/database');

/**
 * Log activity to activity_logs table
 * NEVER logs raw tokens - only masked metadata
 * @param {string} userId - User ID (UUID)
 * @param {string} sessionId - Session ID (UUID)
 * @param {string} eventType - Event type
 * @param {string} severity - Severity level ('info', 'warning', 'critical')
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User-Agent header
 * @param {string} deviceSignature - Device signature hash
 * @param {Object} details - Additional details (JSON)
 */
async function logActivity(userId, sessionId, eventType, severity, ipAddress, userAgent, deviceSignature, details) {
    try {
        // Try direct insert to activity_logs table
        const { error } = await supabaseAdmin
            .from('activity_logs')
            .insert({
                user_id: userId,
                session_id: sessionId,
                event_type: eventType,
                severity: severity || 'info',
                ip_address: ipAddress,
                user_agent: userAgent,
                device_signature: deviceSignature,
                details: details || null
            });

        if (error) {
            // Just log to console if database insert fails
            // Don't break the app for logging failures
            console.log(`[${severity || 'info'}] ${eventType} (DB Insert Failed):`, {
                userId,
                sessionId,
                error: error.message
            });
        }
    } catch (error) {
        // Silent fail - logging shouldn't break the app
        console.log(`[${severity || 'info'}] ${eventType} (Log Failed):`, {
            userId,
            sessionId,
            error: error.message
        });
    }
}

/**
 * Get recent activity for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} Activity logs
 */
async function getUserActivity(userId, limit = 50) {
    const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Get suspicious activity (warnings and critical events)
 * @param {number} hours - Hours to look back (default: 24)
 * @returns {Promise<Array>} Suspicious activity logs
 */
async function getSuspiciousActivity(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .select('*')
        .in('severity', ['warning', 'critical'])
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

module.exports = {
    logActivity,
    getUserActivity,
    getSuspiciousActivity
};
