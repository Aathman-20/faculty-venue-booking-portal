/* =================================================================
   FACULTY VENUE BOOKING PORTAL — NODE.JS DEBUG BACKEND
   server/services/bookingService.js
   =================================================================

   PURPOSE
   -------
   Service layer that holds the sample booking data and provides
   an async function that wraps it in a Promise-based delay.

   This demonstrates:
     • Separation of concerns (route vs. service layer)
     • async / await with Promise-based delays
     • Node.js debugging of asynchronous operations

   DATA SOURCE
   -----------
   The sample bookings mirror the exact schema seeded by
   js/app.js into localStorage on the frontend.  Fields:
     id, venue, building, date, slot, faculty, email,
     notes, status, category, createdAt, techReq { … }

   ISOLATION
   ---------
   This service is completely independent of the AngularJS frontend.
   It does NOT read from or write to any browser localStorage.
   ================================================================= */

'use strict';

/* -----------------------------------------------------------------
   SAMPLE BOOKING DATA
   Mirrors the three demo bookings seeded by js/app.js exactly —
   same field names, same techReq sub-structure.
----------------------------------------------------------------- */
const SAMPLE_BOOKINGS = [
    {
        id:        'BK-1001',
        venue:     'KS Auditorium',
        building:  'Main Building',
        date:      'Mon, 20 Apr',
        slot:      '10:00 AM - 12:00 PM',
        faculty:   'Dr. Vignesh Kumar',
        email:     'faculty1@tce.edu',
        notes:     'Guest Lecture on AI and Machine Learning',
        status:    'pending',
        category:  'Auditorium',
        createdAt: '2026-04-20T04:30:00.000Z',
        techReq: {
            projector:         'Yes',
            microphoneQty:     2,
            speakersQty:       2,
            lcdDisplay:        'No',
            desktopSystemsQty: 1,
            laptopConnection:  'HDMI',
            internetRequired:  'Yes',
            extensionBoardQty: 1,
            whiteboard:        'No',
            techStaffRequired: 'Yes',
            otherRequirements: 'Guest Lecture on AI and Machine Learning'
        }
    },
    {
        id:        'BK-1002',
        venue:     'IT Seminar Hall',
        building:  'IT Department',
        date:      'Tue, 21 Apr',
        slot:      '02:00 PM - 04:00 PM',
        faculty:   'Dr. Ramesh Babu',
        email:     'faculty2@tce.edu',
        notes:     'Department Workshop on Cloud Computing',
        status:    'approved',
        category:  'Seminar Hall',
        createdAt: '2026-04-21T08:45:00.000Z',
        techReq: {
            projector:         'Yes',
            microphoneQty:     1,
            speakersQty:       0,
            lcdDisplay:        'Yes',
            desktopSystemsQty: 0,
            laptopConnection:  'HDMI',
            internetRequired:  'No',
            extensionBoardQty: 0,
            whiteboard:        'Yes',
            techStaffRequired: 'No',
            otherRequirements: 'Department Workshop on Cloud Computing'
        }
    },
    {
        id:        'BK-1003',
        venue:     'Alan Turing Auditorium',
        building:  'CSE dept',
        date:      'Thu, 24 Apr',
        slot:      '9:00 AM - 10:30 AM',
        faculty:   'Dr. Anita Priya',
        email:     'faculty3@tce.edu',
        notes:     'Annual Technical Symposium',
        status:    'rejected',
        category:  'Auditorium',
        createdAt: '2026-04-24T03:30:00.000Z',
        techReq: {
            projector:         'Yes',
            microphoneQty:     4,
            speakersQty:       4,
            lcdDisplay:        'Yes',
            desktopSystemsQty: 2,
            laptopConnection:  'HDMI',
            internetRequired:  'Yes',
            extensionBoardQty: 2,
            whiteboard:        'No',
            techStaffRequired: 'Yes',
            otherRequirements: 'Annual Technical Symposium'
        }
    }
];

/* =================================================================
   getBookingsAsync()
   =================================================================
   ASYNC FUNCTION DEMONSTRATION
   -------
   Simulates a real database or file-system read by wrapping the
   sample data in a Promise that resolves after a short artificial
   delay (150 ms).

   Demonstrates the Node.js async / await debugging flow:

     Route handler
       ↓  await
     getBookingsAsync()
       ↓  await
     new Promise( resolve after delay )
       ↓
     returns bookings array

   Callers use:
     const bookings = await bookingService.getBookingsAsync();
   ================================================================= */
async function getBookingsAsync() {
    // [DEBUG] Log the start of the async operation
    console.log('[DEBUG] getBookingsAsync() called — simulating async data fetch');

    // Simulate an async delay (e.g., database round-trip)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // [DEBUG] Confirm data is ready
    console.log('[DEBUG] getBookingsAsync() resolved — returning', SAMPLE_BOOKINGS.length, 'bookings');

    // Return a deep copy so callers cannot mutate the source array
    return JSON.parse(JSON.stringify(SAMPLE_BOOKINGS));
}

/* =================================================================
   getBookingByIdAsync(id)
   =================================================================
   Async lookup by booking ID.
   Returns the matching booking object, or null if not found.

   Demonstrates:
     • async/await with conditional resolution
     • Rejected promise handling in the route layer
   ================================================================= */
async function getBookingByIdAsync(id) {
    console.log('[DEBUG] getBookingByIdAsync() called — looking up id:', id);

    await new Promise((resolve) => setTimeout(resolve, 80));

    const booking = SAMPLE_BOOKINGS.find((b) => b.id === id) || null;

    if (!booking) {
        console.log('[DEBUG] getBookingByIdAsync() — booking not found for id:', id);
    } else {
        console.log('[DEBUG] getBookingByIdAsync() — found:', booking.venue);
    }

    return booking;
}

/* =================================================================
   findBookingById(id)
   =================================================================
   NODE.JS DEBUGGING DEMONSTRATION — Status Code Bug & Fix
   -------
   Named function used by GET /api/debug/status to demonstrate
   the difference between returning the wrong HTTP status code
   (200 for a missing booking — the BUG) versus the correct
   status codes (200 / 404 / 400 / 500 — the FIX).

   Returns:
     { found: true,  booking: <object> }  when the ID matches
     { found: false, booking: null }      when no match

   Async/await flow:
     Route handler
       ↓  await
     findBookingById(id)
       ↓  await new Promise( 100 ms delay )
       ↓
     returns { found, booking }
   ================================================================= */
async function findBookingById(id) {
    // [DEBUG] Log the requested booking ID at service level
    console.log('[DEBUG] findBookingById() — requested booking ID:', id);

    // Simulate a database lookup latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    const booking = SAMPLE_BOOKINGS.find((b) => b.id === id) || null;

    if (booking) {
        // [DEBUG] Booking found
        console.log('[DEBUG] findBookingById() — booking FOUND:', booking.venue, '(' + booking.status + ')');
    } else {
        // [DEBUG] Booking not found
        console.log('[DEBUG] findBookingById() — booking NOT FOUND for id:', id);
    }

    return { found: !!booking, booking };
}

/* =================================================================
   processBooking(bookingId)
   =================================================================
   NODE.JS INSPECTOR DEBUGGING DEMONSTRATION
   -------
   The primary function used by GET /api/debug/async/:id to
   demonstrate step-through debugging in Chrome DevTools / Node
   Inspector.  It is intentionally written in a linear style so
   that every line is a natural breakpoint location.

   Recommended breakpoints inside this function:
     Line: console.log('[DEBUG] Start processing ...')  — entry point
     Line: const result = await findBookingById(...)    — before await
     Line: console.log('[DEBUG] Booking retrieved ...')  — after await
     Line: return result                                — before return

   Async/await call chain:
     processBooking(bookingId)
       ↓  await
     findBookingById(bookingId)          ← also set breakpoints here
       ↓  await new Promise(100 ms delay)
       ↓
     returns { found, booking }
       ↓
     processBooking returns { found, booking }
   ================================================================= */
async function processBooking(bookingId) {
    console.log('[DEBUG] Start processing:', bookingId);

    // Await the service layer — execution suspends here when stepping
    // through in Chrome DevTools.  Set a breakpoint on the next line
    // to inspect bookingId before the async lookup begins.
    const result = await findBookingById(bookingId);

    console.log('[DEBUG] Booking retrieved:', result.booking);

    // Return the full result object so the route handler can decide
    // the correct HTTP status code based on result.found.
    return result;
}

/* =================================================================
   simulateAsyncError()
   =================================================================
   REJECTED ASYNC OPERATION DEMONSTRATION
   -------
   Always rejects after a short delay.
   Used by GET /api/bookings/error to demonstrate how the Express
   error-handling middleware catches rejected async Promises.

   Demonstrates:
     • async function that throws
     • try/catch in the route handler
     • Express error middleware catching the forwarded error
   ================================================================= */
async function simulateAsyncError() {
    console.log('[DEBUG] simulateAsyncError() — intentional rejection after delay');

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Throw intentionally to demonstrate error propagation
    throw new Error('Simulated async booking service failure (demonstration only)');
}

module.exports = {
    getBookingsAsync,
    getBookingByIdAsync,
    findBookingById,
    processBooking,
    simulateAsyncError
};
