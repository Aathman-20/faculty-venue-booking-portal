/* =================================================================
   FACULTY VENUE BOOKING PORTAL — NODE.JS DEBUG BACKEND
   server/routes/asyncDebugRoute.js
   =================================================================

   PURPOSE
   -------
   Development-only Express router demonstrating async/await
   step-through debugging using the Chrome DevTools Node.js Inspector.

   ROUTE
   -----
     GET /api/debug/async/:id

   BREAKPOINT MAP
   --------------
   Students should set breakpoints at the four commented locations
   below before opening chrome://inspect.

     BREAKPOINT 1: Route received              — inspect req.params.id
     BREAKPOINT 2: Before await processBooking — inspect bookingId
     BREAKPOINT 3: After await processBooking  — inspect result
     BREAKPOINT 4: Before response             — inspect HTTP status + body

   The same breakpoints can be set inside bookingService.js:
     • processBooking()   — entry, before await, after await, return
     • findBookingById()  — the awaited lookup function

   HOW TO USE (full walkthrough in server/README.md)
   --------------------------------------------------
     1. cd server && npm run debug
     2. Open chrome://inspect in Chrome
     3. Click "inspect" under Remote Target
     4. Open asyncDebugRoute.js and bookingService.js in the Sources tab
     5. Set breakpoints at the BREAKPOINT comments below
     6. GET http://localhost:3000/api/debug/async/BK-1001
     7. Step through: F10 (step over), F11 (step into), F8 (resume)

   ISOLATION
   ---------
   This file is mounted ONLY in server.js at /api/debug/async.
   No production route, frontend page, or localStorage data is
   affected in any way.
   ================================================================= */

'use strict';

const express        = require('express');
const router         = express.Router();
const bookingService = require('../services/bookingService');

/* =================================================================
   GET /api/debug/async/:id
   =================================================================
   Demonstrates a full async/await execution chain that can be
   stepped through line-by-line in the Chrome DevTools debugger.

   Call chain:
     Route handler
       ↓  BREAKPOINT 2 — before await
     bookingService.processBooking(bookingId)
       ↓  await findBookingById(bookingId)
       ↓  await new Promise(100 ms delay)    ← resumes asynchronously
       ↓  returns { found, booking }
     Route handler continues
       ↓  BREAKPOINT 3 — after await
       ↓  BREAKPOINT 4 — before response
     res.status(...).json(...)

   HTTP responses:
     Booking found     → 200 OK
     Booking not found → 404 Not Found
     Unexpected error  → 500 Internal Server Error (error middleware)
   ================================================================= */
router.get('/:id', async (req, res, next) => {

    // BREAKPOINT 1: Route received
    // Inspect: req.params.id, req.method, req.url
    // This is the entry point of the request. The bookingId has just
    // been extracted from the URL parameter by Express.
    const bookingId = req.params.id;

    console.log('');
    console.log('[DEBUG] ════════════════════════════════════════');
    console.log('[DEBUG] GET /api/debug/async/:id — Route received');
    console.log('[DEBUG] Booking ID from URL param:', bookingId);
    console.log('[DEBUG] ════════════════════════════════════════');

    try {

        // BREAKPOINT 2: Before await
        // Inspect: bookingId
        // Execution is about to suspend here while processBooking()
        // runs asynchronously.  In Chrome DevTools, step INTO (F11)
        // to follow execution inside processBooking() in bookingService.js.
        console.log('[DEBUG] BREAKPOINT 2 — Before await processBooking("' + bookingId + '")');

        const result = await bookingService.processBooking(bookingId);

        // BREAKPOINT 3: After await
        // Inspect: result.found, result.booking
        // processBooking() has resolved.  result holds { found, booking }.
        // Hover over result in DevTools to inspect the full object.
        console.log('[DEBUG] BREAKPOINT 3 — After await, result.found:', result.found);

        if (!result.found) {
            // BREAKPOINT 4: Before response — 404 branch
            // Inspect: bookingId, result
            console.log('[DEBUG] BREAKPOINT 4 — Before response: 404 Not Found');
            console.log('[DEBUG] Response status: 404 — no booking matched "' + bookingId + '"');

            return res.status(404).json({
                status:    'error',
                code:      404,
                message:   'Booking not found for id: ' + bookingId,
                validIds:  ['BK-1001', 'BK-1002', 'BK-1003']
            });
        }

        // BREAKPOINT 4: Before response — 200 branch
        // Inspect: result.booking (full booking object)
        // All fields: id, venue, building, date, slot, faculty, email,
        //             status, category, createdAt, techReq { … }
        console.log('[DEBUG] BREAKPOINT 4 — Before response: 200 OK');
        console.log('[DEBUG] Response status: 200 — returning booking:', result.booking.venue);

        return res.status(200).json({
            status:  'ok',
            code:    200,
            message: 'Booking retrieved successfully',
            data:    result.booking
        });

    } catch (err) {
        // Unexpected errors are forwarded to the central error middleware
        // in server.js, which returns HTTP 500.
        console.error('[ERROR] /api/debug/async/:id — unexpected error:', err.message);
        next(err);
    }
});

module.exports = router;
