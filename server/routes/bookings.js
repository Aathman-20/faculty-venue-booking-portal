const express = require("express");
const router = express.Router();
const Booking = require('../models/Booking');
const TechnicalRequirement = require("../models/TechnicalRequirement");

// ── Helper: generate next booking ID ─────────────────────────
async function generateId() {
    const lastBooking = await Booking.findOne().sort({ id: -1 });
    if (!lastBooking) return "BK-1001";
    const lastId = lastBooking.id;
    const num = parseInt(lastId.replace("BK-", ""), 10);
    return "BK-" + String(num + 1).padStart(4, "0");
}

router.get("/", async (req, res, next) => {
    try {
        const { status, building, faculty } = req.query;
        let query = {};

        if (status) query.status = status;
        if (building) query.building = building;
        if (faculty) query.faculty = faculty;

        const bookings = await Booking.find(query);
        res.status(200).json(bookings);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        // Find by the custom string id BK-XXXX, not MongoDB _id
        const booking = await Booking.findOne({ id: req.params.id });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json(booking);
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { venue, building, date, slot, startTime, endTime, faculty, email, department, notes, status } = req.body;

        if (!venue || !building || !date || !slot || !faculty || !email || !department) {
            return res.status(400).json({ error: "Missing required fields: venue, building, date, slot, faculty, email, department" });
        }

        // Conflict checking
        const existingBookings = await Booking.find({
            venue,
            date,
            status: { $ne: "rejected" }
        });

        let conflict = false;
        if (startTime && endTime) {
            const newStart = new Date(startTime).getTime();
            const newEnd = new Date(endTime).getTime();
            
            for (let b of existingBookings) {
                if (b.startTime && b.endTime) {
                    const existingStart = new Date(b.startTime).getTime();
                    const existingEnd = new Date(b.endTime).getTime();
                    if (newStart < existingEnd && newEnd > existingStart) {
                        conflict = true;
                        break;
                    }
                } else if (b.slot === slot) {
                    // Fallback to exact slot match for legacy bookings without startTime/endTime
                    conflict = true;
                    break;
                }
            }
        } else {
            // Fallback if the incoming booking doesn't have startTime/endTime
            conflict = existingBookings.some(b => b.slot === slot);
        }

        if (conflict) {
            return res.status(409).json({ error: "Venue is already booked for the selected time range" });
        }

        const id = await generateId();
        const initialStatus = status || "pending";
        const bookingNotes = notes || "";

        const newBooking = new Booking({
            id,
            venue,
            building,
            date,
            slot,
            startTime,
            endTime,
            faculty,
            email,
            department,
            notes: bookingNotes,
            status: initialStatus
        });

        await newBooking.save();

        if (req.body.techReq) {
            const newReq = new TechnicalRequirement({
                bookingId: id,
                ...req.body.techReq
            });
            await newReq.save();
        }

        res.status(201).json({ id, venue, building, date, slot, startTime, endTime, faculty, email, notes: bookingNotes, status: initialStatus, techReq: req.body.techReq });
    } catch (err) {
        next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const { venue, building, date, slot, startTime, endTime, faculty, email, notes, status, techReq } = req.body;
        const result = await Booking.findOneAndUpdate(
            { id: req.params.id },
            { venue, building, date, slot, startTime, endTime, faculty, email, notes, status },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (techReq) {
            await TechnicalRequirement.findOneAndUpdate(
                { bookingId: req.params.id },
                techReq,
                { new: true, upsert: true, runValidators: true }
            );
        }

        res.status(200).json({ message: "Booking updated successfully" });
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const result = await Booking.findOneAndDelete({ id: bookingId });

        if (!result) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Also delete technical requirements from MongoDB Atlas
        await TechnicalRequirement.findOneAndDelete({ bookingId });

        res.status(200).json({ message: "Booking and associated technical requirements deleted successfully" });
    } catch (err) {
        next(err);
    }
});

router.patch("/:id/status", async (req, res, next) => {
    try {
        const { status, user } = req.body;
        
        if (!user || !user.role) {
            return res.status(401).json({ error: "Unauthorized: Missing user information" });
        }

        const validStatuses = ['pending', 'HOD_APPROVED', 'APPROVED', 'HOD_REJECTED', 'ADMIN_REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const booking = await Booking.findOne({ id: req.params.id });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Authorization checks
        const role = user.role.toUpperCase();
        
        if (status === 'HOD_APPROVED' || status === 'HOD_REJECTED') {
            if (role !== 'HOD') {
                return res.status(403).json({ error: "Forbidden: Only HOD can perform this action" });
            }
            if (booking.department !== user.department) {
                return res.status(403).json({ error: "Forbidden: HOD can only approve bookings for their own department" });
            }
        } else if (status === 'APPROVED' || status === 'ADMIN_REJECTED') {
            if (role !== 'ADMIN') {
                return res.status(403).json({ error: "Forbidden: Only Admin can perform this action" });
            }
            if (booking.status !== 'HOD_APPROVED') {
                return res.status(403).json({ error: "Forbidden: Booking must be HOD_APPROVED before Admin final approval" });
            }
        } else {
            return res.status(400).json({ error: "Invalid status update requested" });
        }

        // Update fields based on who approved
        const updateData = { status: status };
        if (role === 'HOD') {
            updateData.hodApprovedBy = user.name || user.email;
            updateData.hodApprovedAt = new Date();
        } else if (role === 'ADMIN') {
            updateData.adminApprovedBy = user.name || user.email;
            updateData.adminApprovedAt = new Date();
        }

        const result = await Booking.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true }
        );

        res.status(200).json({ message: "Booking status updated successfully", booking: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
