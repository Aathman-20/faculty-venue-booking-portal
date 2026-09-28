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
        const { name, email, password, role, department, employeeId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'faculty',
            department: department || '',
            employeeId: employeeId || '',
            phone: ''
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
