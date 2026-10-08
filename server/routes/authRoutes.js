const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: 'Login successful',
            user: userObj
        });
    } catch (err) {
        next(err);
    }
});

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role, department, employeeId, recoveryPin } = req.body;

        if (!name || !email || !password || !recoveryPin) {
            return res.status(400).json({ error: 'Name, email, password, and recovery pin are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = await bcrypt.hash(recoveryPin.toString(), 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'faculty',
            department: department || '',
            employeeId: employeeId || '',
            phone: '',
            recoveryPin: hashedPin
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
});

router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, recoveryPin, newPassword } = req.body;

        if (!email || !recoveryPin || !newPassword) {
            return res.status(400).json({ error: 'Email, recovery PIN, and new password are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.recoveryPin) {
            return res.status(404).json({ error: 'User not found or recovery PIN not set' });
        }

        const isMatch = await bcrypt.compare(recoveryPin.toString(), user.recoveryPin);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid recovery PIN' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
