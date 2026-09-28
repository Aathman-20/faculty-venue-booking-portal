const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

router.get('/', async (req, res, next) => {
    try {
        const venues = await Venue.find({});
        res.status(200).json(venues);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        // Find by Mongoose _id
        const venue = await Venue.findById(req.params.id);
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json(venue);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
