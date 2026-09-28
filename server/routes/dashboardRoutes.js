const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.get('/stats', async (req, res, next) => {
    try {
        const email = req.query.email;
        let query = {};
        if (email) {
            query.email = email;
        }
        
        const totalBookings = await Booking.countDocuments(query);
        res.status(200).json({ totalBookings });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
