const crypto = require('crypto');

/**
 * Generate device signature from user-agent
 * Returns hash for storage
 * @param {string} userAgent - User-Agent header
 * @returns {string} SHA-256 hash of user-agent
 */
function generateDeviceSignature(userAgent) {
    if (!userAgent) return 'unknown';

    return crypto
        .createHash('sha256')
        .update(userAgent.toLowerCase())
        .digest('hex');
}

/**
 * Calculate similarity between two user-agent strings
 * Uses Jaccard similarity on tokenized strings
 * @param {string} ua1 - First user-agent
 * @param {string} ua2 - Second user-agent
 * @returns {number} Similarity percentage (0-100)
 */
function calculateSimilarity(ua1, ua2) {
    if (!ua1 || !ua2) return 0;

    // Tokenize user-agents (split on spaces, slashes, parentheses)
    const tokens1 = ua1.toLowerCase().split(/[\s\/\(\)]+/).filter(Boolean);
    const tokens2 = ua2.toLowerCase().split(/[\s\/\(\)]+/).filter(Boolean);

    // Calculate Jaccard similarity
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;

    return (intersection.size / union.size) * 100;
}

/**
 * Validate device fingerprint with tolerance
 * Returns validation result with recommended action
 * @param {string} currentUA - Current user-agent
 * @param {string} storedSignature - Stored device signature hash
 * @param {string} storedUA - Original user-agent (for similarity calculation)
 * @param {number} threshold - Similarity threshold percentage (default: 80)
 * @returns {Object} { valid, similarity, action }
 */
function validateFingerprint(currentUA, storedSignature, storedUA, threshold = 80) {
    const currentSignature = generateDeviceSignature(currentUA);

    // Exact match - all good
    if (currentSignature === storedSignature) {
        return {
            valid: true,
            similarity: 100,
            action: 'allow'
        };
    }

    // Calculate similarity if we have original UA
    if (storedUA) {
        const similarity = calculateSimilarity(currentUA, storedUA);

        if (similarity >= threshold) {
            // Close enough - likely browser update
            return {
                valid: true,
                similarity,
                action: 'allow_with_warning'
            };
        } else if (similarity >= 50) {
            // Moderate similarity - challenge user
            return {
                valid: false,
                similarity,
                action: 'challenge_reauth'
            };
        } else {
            // Very different - suspicious
            return {
                valid: false,
                similarity,
                action: 'revoke_suspicious'
            };
        }
    }

    // No stored UA, can't calculate similarity - be cautious
    return {
        valid: false,
        similarity: 0,
        action: 'challenge_reauth'
    };
}

/**
 * Extract key browser info from user-agent for logging
 * @param {string} userAgent - User-Agent header
 * @returns {Object} { browser, os, device }
 */
function parseUserAgent(userAgent) {
    if (!userAgent) {
        return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
    }

    const ua = userAgent.toLowerCase();

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    // Detect device type
    let device = 'Desktop';
    if (ua.includes('mobile')) device = 'Mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';

    return { browser, os, device };
}

module.exports = {
    generateDeviceSignature,
    calculateSimilarity,
    validateFingerprint,
    parseUserAgent
};
