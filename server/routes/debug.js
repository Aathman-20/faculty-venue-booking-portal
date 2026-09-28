// ============================================================
// Faculty Venue Booking Portal
// server/routes/debug.js  —  Controlled Error Demonstrations
// ============================================================
//
// PURPOSE:
//   Laboratory-only router that demonstrates Express error handling
//   and HTTP status codes.  Mounted at /debug in app.js.
//   Safe to include — no production data is modified.
//
// STATUS CODE REFERENCE (shown to evaluator):
//   200 OK          — Request succeeded. Resource returned.
//   201 Created     — POST succeeded. New resource created.
//   400 Bad Request — Client sent invalid/incomplete data.
//   404 Not Found   — Resource does not exist on the server.
//   500 Internal    — Unexpected server-side error (unhandled throw).
// ============================================================

const express = require("express");
const router  = express.Router();

// ── Shared in-memory store (separate from /bookings) ─────────
// Keeps error demos isolated so they cannot corrupt the main
// booking list used by the AngularJS frontend integration.
let debugBookings = [
    {
        id: "DBG-001",
        venue: "KS Auditorium",
        building: "Main Building",
        date: "Mon, 20 Apr",
        slot: "10:00 AM - 12:00 PM",
        faculty: "Dr. Demo",
        email: "demo@tce.edu",
        status: "pending"
    }
];

function nextDebugId() {
    const nums = debugBookings.map((b) => parseInt(b.id.replace("DBG-", ""), 10));
    const max  = nums.length ? Math.max(...nums) : 0;
    return "DBG-" + String(max + 1).padStart(3, "0");
}

// ============================================================
// GET /debug/error
//
// Intentionally throws an unhandled Error so that the
// centralized errorHandler middleware is triggered.
//
// WHY 500?
//   The server encountered an unexpected condition that prevented
//   it from fulfilling the request.  Express catches the thrown
//   Error via next(err) and our errorHandler responds with 500.
// ============================================================
router.get("/error", (req, res, next) => {
    // Intentional throw — this is the demo payload for errorHandler
    // In a real app this would be an accidental runtime error.
    // Express will call next(err) with this error object, which
    // routes it straight to the four-parameter errorHandler in app.js.
    try {
        throw new Error("Intentional demo error — errorHandler demonstration");
    } catch (err) {
        // REQ 7 — pass the error to the centralized error handler
        next(err);
    }
});

// ============================================================
// GET /debug/bookings
//
// Returns all debug bookings.
//
// WHY 200?
//   The request succeeded and we are returning the resource
//   that was asked for.  200 OK is the standard success status
//   for GET operations that return data.
// ============================================================
router.get("/bookings", (req, res) => {
    // 200 OK — request succeeded, returning array of bookings
    res.status(200).json(debugBookings);
});

// ============================================================
// GET /debug/bookings/:id
//
// Fetches one debug booking by ID.
//
// WHY 404?
//   The client asked for a specific resource that does not
//   exist on the server (e.g. /debug/bookings/999999).
//   404 Not Found communicates "we understood your request but
//   there is nothing here".
//
// WHY 200?
//   When the booking IS found, the request succeeded.
// ============================================================
router.get("/bookings/:id", (req, res) => {
    // req.params.id — route parameter capturing the :id segment
    const booking = debugBookings.find((b) => b.id === req.params.id);

    if (!booking) {
        // 404 Not Found — the resource does not exist
        // Example: GET /debug/bookings/999999
        return res.status(404).json({
            error: "Booking not found",
            // Explain what the client should fix
            hint: `No booking with id "${req.params.id}" exists. Try DBG-001.`
        });
    }

    // 200 OK — booking found and returned
    res.status(200).json(booking);
});

// ============================================================
// POST /debug/bookings
//
// Creates a new debug booking from the JSON body.
//
// WHY 400?
//   If required fields are missing the request is malformed —
//   it is the client's fault, not the server's.  400 Bad Request
//   tells the client to fix its data before retrying.
//
// WHY 201?
//   When creation succeeds, 201 Created is more precise than
//   200 OK because a new resource was created as a result.
//   The Location header (optional) could point to the new resource.
// ============================================================
router.post("/bookings", (req, res) => {
    // req.body — parsed by app.use(express.json()) in app.js
    const { venue, building, date, slot, faculty, email } = req.body;

    // Validate required fields
    if (!venue || !building || !date || !slot || !faculty || !email) {
        // 400 Bad Request — client omitted required fields
        return res.status(400).json({
            error: "Missing required fields: venue, building, date, slot, faculty, email",
            received: req.body,  // Echo back what was received (dev-friendly, no sensitive data)
            hint: "Include all required fields in the JSON body."
        });
    }

    const newBooking = {
        id:       nextDebugId(),
        venue,
        building,
        date,
        slot,
        faculty,
        email,
        notes:    req.body.notes  || "",
        status:   req.body.status || "pending",
        techReq:  req.body.techReq || {}
    };

    debugBookings.push(newBooking);

    // 201 Created — new resource successfully created
    res.status(201).json(newBooking);
});

// ============================================================
// PUT /debug/bookings/:id
//
// Updates an existing debug booking.
//
// WHY 200?
//   The update was applied to an existing resource and we are
//   returning the updated state.  No new resource was created
//   so 200 OK is correct (not 201).
//
// WHY 404?
//   If the :id does not match any booking, there is nothing
//   to update — the target resource does not exist.
// ============================================================
router.put("/bookings/:id", (req, res) => {
    const index = debugBookings.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
        // 404 Not Found — nothing to update at this ID
        return res.status(404).json({
            error: "Booking not found",
            hint: `No booking with id "${req.params.id}" to update.`
        });
    }

    // Merge body fields into existing booking; preserve the id
    debugBookings[index] = {
        ...debugBookings[index],
        ...req.body,
        id: req.params.id          // prevent client from overwriting the id
    };

    // 200 OK — update applied, returning the new state
    res.status(200).json(debugBookings[index]);
});

// ============================================================
// DELETE /debug/bookings/:id
//
// Removes a debug booking by ID.
//
// WHY 200?
//   Deletion succeeded and we return a confirmation message.
//   Some APIs use 204 No Content (no body), but 200 is clearer
//   for lab demonstration because it returns a readable message.
//
// WHY 404?
//   If the booking doesn't exist, there is nothing to delete.
// ============================================================
router.delete("/bookings/:id", (req, res) => {
    const index = debugBookings.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
        // 404 Not Found — resource doesn't exist, cannot delete
        return res.status(404).json({
            error: "Booking not found",
            hint: `No booking with id "${req.params.id}" to delete.`
        });
    }

    const deleted = debugBookings.splice(index, 1)[0];

    // 200 OK — deletion succeeded, returning confirmation
    res.status(200).json({
        message: `Booking "${deleted.id}" deleted successfully`,
        deleted: deleted
    });
});

// ============================================================
// GET /debug/status-codes
//
// Reference route that returns a summary of all HTTP status
// codes demonstrated in this lab, so the evaluator can see
// them documented in a single JSON response.
// ============================================================
router.get("/status-codes", (req, res) => {
    // 200 OK — successful read of a reference resource
    res.status(200).json({
        description: "HTTP Status Codes demonstrated in Ex. No. 7",
        codes: [
            {
                code:    200,
                name:    "OK",
                when:    "GET or PUT succeeded; resource returned or updated.",
                example: "GET /bookings/BK-1001 → 200"
            },
            {
                code:    201,
                name:    "Created",
                when:    "POST succeeded; a new resource was created.",
                example: "POST /bookings → 201"
            },
            {
                code:    400,
                name:    "Bad Request",
                when:    "Client sent incomplete or invalid data (missing fields).",
                example: "POST /bookings with empty body → 400"
            },
            {
                code:    404,
                name:    "Not Found",
                when:    "The requested resource does not exist on the server.",
                example: "GET /bookings/999999 → 404"
            },
            {
                code:    500,
                name:    "Internal Server Error",
                when:    "Unhandled server-side error; centralized errorHandler triggered.",
                example: "GET /debug/error → 500"
            }
        ]
    });
});

// Export the router so app.js can mount it
module.exports = router;
