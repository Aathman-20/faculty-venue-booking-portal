const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find({}, 'id name email role department phone');
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        // Find by _id or email if needed, but the original used id? Wait, MySQL used an auto-incremented ID. Let's just use Mongoose _id.
        // Wait, does the frontend pass MongoDB _id? The old ID was an integer. 
        // We will just findById.
        const user = await User.findById(req.params.id, 'id name email role department phone');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { name, email, department, phone } = req.body;
        const result = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, department, phone },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
