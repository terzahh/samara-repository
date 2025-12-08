const rateLimit = require('express-rate-limit');
const {
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_LOGIN,
    RATE_LIMIT_MAX_REGISTER,
    RATE_LIMIT_MAX_REFRESH
} = require('../config/security');

/**
 * Rate limiter for login endpoint
 * 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_LOGIN,
    message: {
        error: 'Too many login attempts',
        message: `Please try again after ${RATE_LIMIT_WINDOW_MS / 60000} minutes`
    },
    // Use standard headers
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for registration endpoint
 * 3 attempts per hour per IP
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: RATE_LIMIT_MAX_REGISTER,
    message: {
        error: 'Too many registration attempts',
        message: 'Please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for refresh endpoint
 * 10 attempts per minute per session
 */
const refreshLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: RATE_LIMIT_MAX_REFRESH,
    message: {
        error: 'Too many refresh attempts',
        message: 'Please try again after 1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests',
        message: 'Please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    apiLimiter
};
