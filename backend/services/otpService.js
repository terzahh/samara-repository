const { supabaseAdmin } = require('../config/database');
const { generateSecureToken } = require('../utils/crypto');

const OTP_EXPIRY_MS = parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000;

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in database
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} type - OTP type ('password_reset')
 */
async function storeOTP(email, otp, type = 'password_reset') {
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    
    // Invalidate any existing OTPs for this email and type
    await supabaseAdmin
        .from('otps')
        .update({ used: true })
        .eq('email', email.toLowerCase())
        .eq('type', type)
        .eq('used', false);

    // Store new OTP
    const { data, error } = await supabaseAdmin
        .from('otps')
        .insert({
            email: email.toLowerCase(),
            otp_hash: require('crypto').createHash('sha256').update(otp).digest('hex'),
            type,
            expires_at: expiresAt,
            created_at: new Date()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Verify OTP without consuming it
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} type - OTP type
 * @param {boolean} consume - Whether to mark OTP as used (default: true)
 */
async function verifyOTP(email, otp, type = 'password_reset', consume = true) {
    const otpHash = require('crypto').createHash('sha256').update(otp).digest('hex');
    
    const { data, error } = await supabaseAdmin
        .from('otps')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('otp_hash', otpHash)
        .eq('type', type)
        .eq('used', false)
        .single();

    if (error || !data) {
        return { valid: false, reason: 'invalid_otp' };
    }

    // Check expiry
    if (new Date() > new Date(data.expires_at)) {
        return { valid: false, reason: 'expired' };
    }

    // Mark as used only if consume is true
    if (consume) {
        await supabaseAdmin
            .from('otps')
            .update({ used: true, used_at: new Date() })
            .eq('id', data.id);
    }

    return { valid: true, otpRecord: data };
}

/**
 * Cleanup expired OTPs (run as cron job)
 */
async function cleanupExpiredOTPs() {
    const { error } = await supabaseAdmin
        .from('otps')
        .delete()
        .lt('expires_at', new Date().toISOString());

    if (error) {
        console.error('Error cleaning up expired OTPs:', error);
    }
}

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    cleanupExpiredOTPs
};