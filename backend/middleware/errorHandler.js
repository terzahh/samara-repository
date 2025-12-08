/**
 * Centralized error handler middleware
 * Catches all errors and returns consistent JSON responses
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error response
    const response = {
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    // Determine status code
    let statusCode = err.statusCode || 500;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        response.error = 'Validation error';
        response.details = err.details;
        console.error('Validation Error Details:', JSON.stringify(err.details, null, 2));
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        response.error = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        response.error = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        response.error = 'Not found';
    }

    res.status(statusCode).json(response);
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
