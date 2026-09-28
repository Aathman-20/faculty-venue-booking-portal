/* =================================================================
   FACULTY VENUE BOOKING PORTAL — NODE.JS DEBUG BACKEND
   server/routes/debugStatusRoute.js
   =================================================================

   PURPOSE
   -------
   Development-only Express router demonstrating the common Node.js
   bug of returning an incorrect HTTP status code.

   ROUTE
   -----
     GET /api/debug/status?id=<bookingId>

   SECTION A — THE BUG
   --------------------
   The buggy implementation always returns HTTP 200 regardless of
   whether the booking exists.  This looks fine in the browser but
   misleads any API client (frontend, test runner, monitoring tool)
   into thinking every lookup succeeded.

   // BUG: Incorrect status code
   res.status(200).json({ ... });   ← returned even when not found

   SECTION B — THE FIX
   --------------------
   The correct implementation maps each outcome to the right code:

     Existing booking  → HTTP 200  OK
     Booking not found → HTTP 404  Not Found
     Missing id param  → HTTP 400  Bad Request
     Unexpected error  → HTTP 500  Internal Server Error  (error mw)

   // FIX: Return 404 when booking is not found

   ISOLATION
   ---------
   This file is mounted ONLY in server.js at /api/debug/status.
   The AngularJS frontend, LocalStorage, and all production routes
   are completely unaffected.
   ================================================================= */

'use strict';

const express        = require('express');
const router         = express.Router();
const bookingService = require('../services/bookingService');

/* =================================================================
   GET /api/debug/status
   =================================================================

   Query parameter:
     ?id=<bookingId>     e.g. ?id=BK-1001

   ── SECTION A: THE BUG (MODE = "bug") ─────────────────────────
   Activated by:  ?id=BK-1001&mode=bug
                  ?id=INVALID&mode=bug
                  ?mode=bug          (no id)

   Always responds with HTTP 200 — even when:
     • the booking ID does not exist
     • no id parameter is provided at all

   // BUG: Incorrect status code

   ── SECTION B: THE FIX (default — no mode param, or mode=fix) ─
   Activated by:  ?id=BK-1001
                  ?id=INVALID
                  (no id param)

   Maps every outcome to the correct HTTP status code.

   // FIX: Return 404 when booking is not found
   ================================================================= */
router.get('/status', async (req, res, next) => {
    const { id, mode } = req.query;
    const showBug = (mode === 'bug');   // ?mode=bug enables the buggy path

    // ----------------------------------------------------------------
    // [DEBUG] Log the requested booking ID
    // ----------------------------------------------------------------
    console.log('');
    console.log('[DEBUG] ─────────────────────────────────────');
    console.log('[DEBUG] GET /api/debug/status hit');
    console.log('[DEBUG] Requested booking ID:', id !== undefined ? id : '(not provided)');
    console.log('[DEBUG] Demonstration mode  :', showBug ? 'BUG (always 200)' : 'FIX (correct codes)');
    console.log('[DEBUG] ─────────────────────────────────────');

    try {
        /* ============================================================
           SECTION A — THE BUG
           ============================================================
           This block demonstrates what happens when a developer
           forgets to handle the "not found" and "missing param" cases
           and blindly returns 200.

           // BUG: Incorrect status code — returns 200 for every case.

           Expected: GET /api/debug/status?id=INVALID → 404
           Actual:   GET /api/debug/status?id=INVALID → 200  ← BUG

           Expected: GET /api/debug/status            → 400
           Actual:   GET /api/debug/status            → 200  ← BUG
           ============================================================ */
        if (showBug) {
            console.log('[DEBUG] ⚠️  BUG path — calling findBookingById regardless of input validity');

            // BUG: No input validation — missing id is passed straight to the service
            const { found, booking } = await bookingService.findBookingById(id);

            // [DEBUG] Booking found/not found
            console.log('[DEBUG] Booking found:', found);

            // BUG: Incorrect status code
            // Always 200 — does not matter if booking exists or not
            const responseStatus = 200;

            console.log('[DEBUG] Response status:', responseStatus, '← BUG: should vary by outcome');

            return res.status(responseStatus).json({
                _demo:          'SECTION A — BUG: Incorrect HTTP Status Code',
                _explanation:   'This always returns 200 even when the booking does not exist.',
                // BUG: Incorrect status code
                _bug:           'res.status(200) used for ALL cases — missing id, not found, found',
                requestedId:    id,
                bookingFound:   found,
                httpStatusSent: responseStatus,
                booking:        booking || null
            });
        }

        /* ============================================================
           SECTION B — THE FIX
           ============================================================
           This block uses the correct HTTP status codes for every
           possible outcome.

           // FIX: Return 404 when booking is not found

           Missing id  → 400 Bad Request
           Not found   → 404 Not Found
           Found       → 200 OK
           Server err  → 500 Internal Server Error (error middleware)
           ============================================================ */

        // ── STEP 1: Input validation ─────────────────────────────────
        // FIX: Return 400 when the id query parameter is absent
        if (!id || id.trim() === '') {
            const responseStatus = 400;
            console.log('[DEBUG] Booking found: false (id not provided)');
            console.log('[DEBUG] Response status:', responseStatus, '— 400 Bad Request (missing id param)');

            return res.status(responseStatus).json({
                _demo:          'SECTION B — FIX: Correct HTTP Status Codes',
                _explanation:   'No ?id= parameter provided.',
                // FIX: Return 400 when the id query parameter is absent
                _fix:           'res.status(400) — Bad Request: id param is required',
                requestedId:    null,
                bookingFound:   false,
                httpStatusSent: responseStatus,
                booking:        null,
                example:        'Try: GET /api/debug/status?id=BK-1001'
            });
        }

        // ── STEP 2: Async service call ────────────────────────────────
        // Call findBookingById and await the result
        console.log('[DEBUG] Fetching booking — calling bookingService.findBookingById("' + id + '")');
        const { found, booking } = await bookingService.findBookingById(id);

        // [DEBUG] Booking found/not found
        console.log('[DEBUG] Booking found:', found);

        // ── STEP 3: Map outcome → correct HTTP status ────────────────
        if (found) {
            // FIX: Return 200 when the booking exists
            const responseStatus = 200;
            console.log('[DEBUG] Response status:', responseStatus, '— 200 OK');

            return res.status(responseStatus).json({
                _demo:          'SECTION B — FIX: Correct HTTP Status Codes',
                _explanation:   'Booking exists — 200 OK is correct.',
                // FIX: Return 200 only when the booking actually exists
                _fix:           'res.status(200) — OK: booking found',
                requestedId:    id,
                bookingFound:   true,
                httpStatusSent: responseStatus,
                booking:        booking
            });
        } else {
            // FIX: Return 404 when booking is not found
            const responseStatus = 404;
            console.log('[DEBUG] Response status:', responseStatus, '— 404 Not Found');

            return res.status(responseStatus).json({
                _demo:          'SECTION B — FIX: Correct HTTP Status Codes',
                _explanation:   'No booking matched the requested ID.',
                // FIX: Return 404 when booking is not found
                _fix:           'res.status(404) — Not Found: no booking for id "' + id + '"',
                requestedId:    id,
                bookingFound:   false,
                httpStatusSent: responseStatus,
                booking:        null,
                validIds:       ['BK-1001', 'BK-1002', 'BK-1003']
            });
        }

    } catch (err) {
        // ── STEP 4: Unexpected server error ─────────────────────────
        // FIX: Forward to error middleware → HTTP 500
        console.error('[ERROR] /api/debug/status — unexpected error:', err.message);
        next(err);   // FIX: error middleware sends HTTP 500
    }
});

module.exports = router;
