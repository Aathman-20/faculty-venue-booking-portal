// Custom middleware
// Logs HTTP method and URL
// next() passes control to the next middleware/route

function logger(req, res, next) {

    console.log(
        new Date().toISOString(),
        req.method,
        req.url
    );

    next();
}

module.exports = logger;
