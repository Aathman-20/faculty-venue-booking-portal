// Centralized error-handling middleware
// Must be registered after all routes

function errorHandler(err, req, res, next) {

    console.error(err.stack);

    res.status(500).json({
        error: "Something went wrong",
        // Provide a development-friendly message without exposing sensitive info
        message: err.message || "Internal Server Error" 
    });
}

module.exports = errorHandler;
