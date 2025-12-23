require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config/security');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false
}));

// Trust proxy (required for rate limiting behind proxies)
app.set('trust proxy', 1);

// CORS configuration
// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            CLIENT_URL,
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Global rate limiting
app.use('/api', apiLimiter);

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Research routes
const researchRoutes = require('./routes/research');
app.use('/api/research', researchRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Express Backend Server Started');
    console.log('=====================================');
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Client URL: ${CLIENT_URL}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/logout');
    console.log('  POST /api/auth/refresh');
    console.log('  GET  /api/auth/me');
    console.log('  POST /api/auth/ping');
    console.log('=====================================');
    console.log('');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;
