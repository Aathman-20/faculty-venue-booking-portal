/* =================================================================
   FACULTY VENUE BOOKING PORTAL — NODE.JS DEBUG BACKEND
   server/server.js
   =================================================================

   PURPOSE
   -------
   Entry point for the Express development server.
   Demonstrates Node.js server setup and error handling patterns
   for laboratory viva.

   This server is an ADDITIONAL, INDEPENDENT backend demonstration.
   It does NOT replace the existing AngularJS frontend:
     • The frontend still works completely via its own HTML files.
     • LocalStorage functionality is completely unaffected.
     • No frontend file has been modified.

   USAGE
   -----
     # Normal start
     node server.js
       OR
     npm start

     # Debug mode (Chrome DevTools → chrome://inspect)
     node --inspect server.js
       OR
     npm run debug

   BASE URL
   --------
     http://localhost:3000

   ROUTES (all prefixed /api via bookingRoutes.js)
   -------
     GET /api/health           → liveness check
     GET /api/bookings         → all sample bookings (async)
     GET /api/bookings/:id     → single booking by ID
     GET /api/bookings/error   → demonstrates async rejection handling
     GET /api/debug            → timestamp + server info

   ERROR HANDLING LAYERS
   ----------------------
     1. Input validation     — checked in individual route handlers
     2. 404 unknown route    — catch-all middleware before error handler
     3. Synchronous errors   — caught by Express automatically
     4. Async rejections     — caught with try/catch + next(err) in routes
     5. Central error mw     — formats and sends the final error response
     6. Uncaught exceptions  — process.on('uncaughtException') safety net
     7. Unhandled rejections — process.on('unhandledRejection') safety net
   ================================================================= */

'use strict';

const express          = require('express');
const bookingRoutes    = require('./routes/bookingRoutes');
const debugStatusRoute = require('./routes/debugStatusRoute');
const asyncDebugRoute  = require('./routes/asyncDebugRoute');

const app  = express();
const PORT = process.env.PORT || 3000;

/* =================================================================
   GLOBAL MIDDLEWARE
   ================================================================= */

// Parse incoming JSON bodies (needed for any future POST/PUT routes)
app.use(express.json());

// Parse URL-encoded form bodies
app.use(express.urlencoded({ extended: false }));

/* -----------------------------------------------------------------
   CORS headers — allow the frontend (served from the same machine
   but potentially a different port) to call the API directly.
   In production you would restrict the origin.
----------------------------------------------------------------- */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

/* -----------------------------------------------------------------
   APPLICATION-LEVEL REQUEST LOGGER
   Logs every request that reaches the server BEFORE routing.
----------------------------------------------------------------- */
app.use((req, _res, next) => {
    console.log('[DEBUG] Request:', req.method, req.url);
    next();
});

/* =================================================================
   ROUTES
   ================================================================= */

// Mount all /api/* routes from the bookingRoutes router
app.use('/api', bookingRoutes);

// Mount development-only debug routes at /api/debug/*
// ├─ asyncDebugRoute  — async/await step-through breakpoint demo
// └─ debugStatusRoute — incorrect vs. correct HTTP status code demo
// NOTE: /api/debug/async must be mounted before /api/debug so that
//       Express matches the more-specific path first.
app.use('/api/debug/async', asyncDebugRoute);
app.use('/api/debug', debugStatusRoute);

/* -----------------------------------------------------------------
   ROOT ROUTE — friendly message for browser navigation
----------------------------------------------------------------- */
app.get('/', (_req, res) => {
    res.status(200).json({
        name:    'Faculty Venue Booking — Debug API',
        version: '1.0.0',
        routes: {
            health:          'GET /api/health',
            bookings:        'GET /api/bookings',
            booking:         'GET /api/bookings/:id',
            debug:            'GET /api/debug',
            error:            'GET /api/bookings/error  (async error demo)',
            debugAsync:       'GET /api/debug/async/BK-1001  (Inspector breakpoint demo)',
            debugAsync_404:   'GET /api/debug/async/INVALID  (→ 404)',
            debugStatus_fix:  'GET /api/debug/status?id=BK-1001         (correct status codes)',
            debugStatus_404:  'GET /api/debug/status?id=INVALID          (→ 404)',
            debugStatus_400:  'GET /api/debug/status                     (→ 400)',
            debugStatus_bug:  'GET /api/debug/status?id=INVALID&mode=bug (→ 200 BUG demo)'
        }
    });
});

/* =================================================================
   ERROR HANDLING MIDDLEWARE
   =================================================================
   Express recognises a middleware with FOUR parameters (err, req,
   res, next) as an error handler.  It must be registered AFTER all
   normal routes.

   This layer handles:
     • Errors forwarded via next(err) from route handlers
     • Synchronous throws inside route handlers (Express catches them)
     • Rejected async Promises forwarded via next(err) from try/catch
   ================================================================= */

/* -----------------------------------------------------------------
   404 — Unknown Route
   Catches any request that did not match a route above.
----------------------------------------------------------------- */
app.use((req, res) => {
    console.log('[DEBUG] 404 — route not found:', req.method, req.url);
    res.status(404).json({
        status:  'error',
        code:    404,
        message: 'Route not found: ' + req.method + ' ' + req.url
    });
});

/* -----------------------------------------------------------------
   CENTRAL ERROR MIDDLEWARE
   Handles all errors forwarded from route handlers.

   Demonstrates:
     • Handling malformed / invalid requests (400)
     • Catching synchronous errors thrown in route handlers
     • Catching rejected async Promises (forwarded via next(err))
     • Sending a clean error response without exposing internals
----------------------------------------------------------------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    // Log the full error on the server — safe for the terminal / DevTools
    console.error('[ERROR] Central error handler caught:', err.message);
    console.error('[ERROR] Stack trace:', err.stack);

    // Determine HTTP status — default to 500 for unclassified errors
    const statusCode = err.statusCode || err.status || 500;

    // Build a safe response — never expose the raw stack trace to clients
    const errorResponse = {
        status:  'error',
        code:    statusCode,
        message: err.message || 'An unexpected server error occurred'
        // NOTE: err.stack is intentionally NOT included in the response.
        //       It is only printed to the server console above.
    };

    console.log('[DEBUG] Sending error response — status:', statusCode);
    res.status(statusCode).json(errorResponse);
});

/* =================================================================
   PROCESS-LEVEL SAFETY NETS
   =================================================================
   These catch errors that escape all Express error handlers —
   e.g., errors thrown outside a request/response cycle.

   For a laboratory demo these keep the server alive so you can
   continue testing without restarting.
   ================================================================= */

/* -----------------------------------------------------------------
   Uncaught Synchronous Exception
   Demonstrates handling of errors thrown outside Express middleware.
----------------------------------------------------------------- */
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception — the server may be in an unstable state.');
    console.error('[FATAL] Error:', err.message);
    // In a real production server you would exit gracefully:
    //   process.exit(1);
    // For the lab demo we keep running so students can observe the log.
});

/* -----------------------------------------------------------------
   Unhandled Promise Rejection
   Demonstrates catching async operations that rejected without a
   corresponding .catch() or try/catch block.
----------------------------------------------------------------- */
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
    // Same as above — exit in production, keep alive for demo.
});

/* =================================================================
   START SERVER
   ================================================================= */
app.listen(PORT, () => {
    console.log('');
    console.log('==============================================');
    console.log('  Faculty Venue Booking — Debug API Server  ');
    console.log('==============================================');
    console.log('  Status  : RUNNING');
    console.log('  Port    : ' + PORT);
    console.log('  Base URL: http://localhost:' + PORT);
    console.log('');
    console.log('  Endpoints:');
    console.log('    GET http://localhost:' + PORT + '/api/health');
    console.log('    GET http://localhost:' + PORT + '/api/bookings');
    console.log('    GET http://localhost:' + PORT + '/api/bookings/BK-1001');
    console.log('    GET http://localhost:' + PORT + '/api/debug');
    console.log('    GET http://localhost:' + PORT + '/api/bookings/error');
    console.log('');
    console.log('  Debug mode:  npm run debug');
    console.log('              then open chrome://inspect in Chrome');
    console.log('==============================================');
    console.log('');
});
