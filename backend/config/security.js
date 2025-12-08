// Session configuration
const SESSION_DURATION_MS = parseInt(
    process.env.SESSION_DURATION_MS || '86400000', // 24 hours
    10
);

const INACTIVITY_TIMEOUT_MS = parseInt(
    process.env.INACTIVITY_TIMEOUT_MS || '1800000', // 30 minutes
    10
);

const REFRESH_TOKEN_EXPIRY_MS = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY_MS || '1209600000', // 14 days
    10
);

// Device fingerprint configuration
const FINGERPRINT_TOLERANCE = parseInt(
    process.env.FINGERPRINT_TOLERANCE || '80', // 80% similarity threshold
    10
);

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '900000', // 15 minutes
    10
);

const RATE_LIMIT_MAX_LOGIN = parseInt(
    process.env.RATE_LIMIT_MAX_LOGIN || '5', // 5 attempts per window
    10
);

const RATE_LIMIT_MAX_REGISTER = parseInt(
    process.env.RATE_LIMIT_MAX_REGISTER || '3', // 3 attempts per hour
    10
);

const RATE_LIMIT_MAX_REFRESH = parseInt(
    process.env.RATE_LIMIT_MAX_REFRESH || '10', // 10 attempts per minute
    10
);

// CORS configuration
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Server configuration
const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    SESSION_DURATION_MS,
    INACTIVITY_TIMEOUT_MS,
    REFRESH_TOKEN_EXPIRY_MS,
    FINGERPRINT_TOLERANCE,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_LOGIN,
    RATE_LIMIT_MAX_REGISTER,
    RATE_LIMIT_MAX_REFRESH,
    CLIENT_URL,
    PORT,
    NODE_ENV
};
