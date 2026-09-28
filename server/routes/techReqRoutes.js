const express = require('express');
const router = express.Router();
const TechnicalRequirement = require('../models/TechnicalRequirement');

router.get('/:bookingId', async (req, res, next) => {
    try {
        const reqs = await TechnicalRequirement.findOne({ bookingId: req.params.bookingId });
        if (!reqs) {
            return res.status(404).json({ error: 'Technical requirements not found' });
        }
        res.status(200).json({ success: true, data: reqs });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { bookingId, ...requirements } = req.body;

        if (!bookingId) {
            return res.status(400).json({ error: 'bookingId is required' });
        }

        const existing = await TechnicalRequirement.findOne({ bookingId });
        if (existing) {
            return res.status(409).json({ error: 'Requirements already exist for this booking' });
        }

        const newReq = new TechnicalRequirement({ bookingId, ...requirements });
        await newReq.save();

        res.status(201).json({ success: true, message: 'Technical requirements saved successfully', data: newReq });
    } catch (err) {
        next(err);
    }
});

router.put('/:bookingId', async (req, res, next) => {
    try {
        const updatedReq = await TechnicalRequirement.findOneAndUpdate(
            { bookingId: req.params.bookingId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedReq) {
            return res.status(404).json({ error: 'Technical requirements not found' });
        }

        res.status(200).json({ success: true, message: 'Technical requirements updated successfully', data: updatedReq });
    } catch (err) {
        next(err);
    }
});

router.delete('/:bookingId', async (req, res, next) => {
    try {
        const deletedReq = await TechnicalRequirement.findOneAndDelete({ bookingId: req.params.bookingId });
        
        if (!deletedReq) {
            return res.status(404).json({ error: 'Technical requirements not found' });
        }
        
        res.status(200).json({ success: true, message: 'Technical requirements deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
