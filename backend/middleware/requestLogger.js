/**
 * Request logger middleware
 * Logs HTTP requests (no sensitive data)
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    // Log request
    console.log(`→ ${req.method} ${req.path}`);

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        const reset = '\x1b[0m';

        console.log(
            `← ${req.method} ${req.path} ${statusColor}${res.statusCode}${reset} ${duration}ms`
        );
    });

    next();
}

module.exports = {
    requestLogger
};
