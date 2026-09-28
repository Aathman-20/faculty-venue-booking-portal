// ============================================================
// Faculty Venue Booking Portal
// server/app.js  —  Ex. No. 7: Practice with ExpressJS
// ============================================================

require('dotenv').config();
const express = require("express");
const cors = require("cors");

// Connect to database
const connectMongoDB = require("./config/mongo");

// Middlewares
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Routers
const bookingsRouter = require("./routes/bookings");
const debugRouter = require("./routes/debug");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const venueRoutes = require("./routes/venueRoutes");
const techReqRoutes = require("./routes/techReqRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware stack ─────────────────────────────────────────
app.use(express.json());
app.use(cors()); // Allow cross-origin requests from AngularJS frontend
app.use(logger);

// ── Routes ───────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.send("Faculty Venue Booking Portal Express Server is running!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/technical-requirements", techReqRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Booking routes - preserving both /bookings for backward compatibility and /api/bookings for consistency
app.use("/bookings", bookingsRouter);
app.use("/api/bookings", bookingsRouter);

// Debug routes
app.use("/debug", debugRouter);

// Centralized error handler
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
const startServer = async () => {
    try {
        await connectMongoDB();

        app.listen(PORT, () => {
            console.log(`[HTTP] Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Startup Error:', err.message);
        // Do not fabricate a successful connection. Exit if DBs are not ready.
        process.exit(1);
    }
};

startServer();

module.exports = app;
