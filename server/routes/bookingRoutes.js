/* =================================================================
   FACULTY VENUE BOOKING PORTAL — NODE.JS DEBUG BACKEND
   server/routes/bookingRoutes.js
   =================================================================

   PURPOSE
   -------
   Express Router that groups all /api/* route handlers.
   Mounted in server.js at /api.

   ROUTES
   ------
     GET  /api/health           → server health check
     GET  /api/bookings         → all bookings (async service call)
     GET  /api/bookings/:id     → single booking by ID
     GET  /api/debug            → debugging endpoint (timestamp + status)
     GET  /api/bookings/error   → demonstrates rejected async error handling

   DEBUGGING DEMONSTRATIONS
   ------------------------
   Every handler logs:
     [DEBUG] Request: <METHOD> <URL>
     [DEBUG] Fetching bookings
     [DEBUG] Sending response

   Errors are forwarded to the central error middleware in server.js
   using  next(error)  — never swallowed silently.
   ================================================================= */

'use strict';

const express       = require('express');
const router        = express.Router();
const bookingService = require('../services/bookingService');

/* =================================================================
   REQUEST LOGGER MIDDLEWARE (router-level)
   =================================================================
   Applied to every route registered on this router.
   Logs the HTTP method and URL before the handler runs.
   ================================================================= */
router.use((req, _res, next) => {
    // [DEBUG] Log every incoming request to this router
    console.log('[DEBUG] Request:', req.method, req.originalUrl);
    next();
});

/* =================================================================
   GET /api/health
   =================================================================
   Simple liveness check — always returns 200.
   Used to verify the server started correctly.

   Response:
     { status: "ok", message: "Venue Booking API is running" }
   ================================================================= */
router.get('/health', (_req, res) => {
    console.log('[DEBUG] Health check requested');

    const payload = {
        status:  'ok',
        message: 'Venue Booking API is running'
    };

    console.log('[DEBUG] Sending response — /api/health', payload);
    res.status(200).json(payload);
});

/* =================================================================
   GET /api/bookings
   =================================================================
   ASYNC / AWAIT DEMONSTRATION
   -------
   Calls bookingService.getBookingsAsync() and awaits the Promise.

   Flow:
     Route handler
       ↓  await
     bookingService.getBookingsAsync()
       ↓  await new Promise( 150 ms delay )
       ↓
     returns bookings array
       ↓
     res.json(bookings)

   Any rejection inside getBookingsAsync() is caught and forwarded
   to the Express error middleware via next(err).
   ================================================================= */
router.get('/bookings', async (req, res, next) => {
    try {
        // [DEBUG] Log before the async operation
        console.log('[DEBUG] Fetching bookings — calling bookingService.getBookingsAsync()');

        const bookings = await bookingService.getBookingsAsync();

        // [DEBUG] Log after the async operation resolves
        console.log('[DEBUG] Sending response — /api/bookings, count:', bookings.length);

        res.status(200).json({
            status:  'ok',
            count:   bookings.length,
            data:    bookings
        });

    } catch (err) {
        // Forward any async error to the central error middleware
        console.error('[ERROR] /api/bookings — async operation failed:', err.message);
        next(err);
    }
});

/* =================================================================
   GET /api/bookings/error   ← must be declared BEFORE /bookings/:id
   =================================================================
   REJECTED ASYNC OPERATION DEMONSTRATION
   -------
   Intentionally triggers a rejected Promise inside the service layer
   to demonstrate:
     1. async function throws after an await
     2. try/catch catches the rejection in the route handler
     3. next(err) forwards to the Express error middleware
     4. The error middleware sends a clean 500 response

   NOTE: The route is defined before /bookings/:id so that the
   literal string "error" is not matched as a booking ID.
   ================================================================= */
router.get('/bookings/error', async (_req, _res, next) => {
    try {
        console.log('[DEBUG] /api/bookings/error — triggering intentional async rejection');
        await bookingService.simulateAsyncError();
    } catch (err) {
        console.error('[ERROR] /api/bookings/error — caught rejected Promise:', err.message);
        next(err);  // forward to error middleware
    }
});

/* =================================================================
   GET /api/bookings/:id
   =================================================================
   Single booking lookup by ID (e.g., /api/bookings/BK-1001).
   Returns 404 if the ID is not found in the sample data.
   ================================================================= */
router.get('/bookings/:id', async (req, res, next) => {
    const { id } = req.params;

    // Basic input validation — booking IDs must be non-empty strings
    if (!id || id.trim() === '') {
        return res.status(400).json({
            status:  'error',
            message: 'Booking ID is required'
        });
    }

    try {
        console.log('[DEBUG] Fetching single booking — id:', id);

        const booking = await bookingService.getBookingByIdAsync(id);

        if (!booking) {
            console.log('[DEBUG] Booking not found — id:', id);
            return res.status(404).json({
                status:  'error',
                message: 'Booking not found for id: ' + id
            });
        }

        console.log('[DEBUG] Sending response — /api/bookings/' + id);
        res.status(200).json({
            status: 'ok',
            data:   booking
        });

    } catch (err) {
        console.error('[ERROR] /api/bookings/:id — error:', err.message);
        next(err);
    }
});

/* =================================================================
   GET /api/debug
   =================================================================
   DEBUGGING ENDPOINT DEMONSTRATION
   -------
   Returns a timestamp and status object so students can verify
   the server is responding and inspect Node.js timing.

   Response:
     {
       message:   "Node.js debugging endpoint",
       timestamp: "2026-09-01T10:00:00.000Z",
       status:    "ok",
       node:      "v20.x.x",
       uptime:    "12.34 seconds"
     }
   ================================================================= */
router.get('/debug', (_req, res) => {
    console.log('[DEBUG] /api/debug endpoint hit');

    const payload = {
        message:   'Node.js debugging endpoint',
        timestamp: new Date().toISOString(),
        status:    'ok',
        node:      process.version,
        uptime:    process.uptime().toFixed(2) + ' seconds'
    };

    console.log('[DEBUG] Sending response — /api/debug', payload);
    res.status(200).json(payload);
});

module.exports = router;
