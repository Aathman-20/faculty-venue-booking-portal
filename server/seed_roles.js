const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect(process.env.MONGO_URI, { dbName: 'venue_booking_db' }).then(async () => {
    const User = require('./models/User');
    
    // Update existing hod@tce.edu to Admin
    let admin = await User.findOne({ email: 'hod@tce.edu' });
    const hashedPassword = await bcrypt.hash('Hod@12345', 10);
    if (admin) {
        admin.role = 'ADMIN';
        admin.name = 'Admin';
        admin.password = hashedPassword;
        await admin.save();
        console.log('Updated hod@tce.edu to ADMIN');
    } else {
        admin = new User({
            name: 'Admin',
            email: 'hod@tce.edu', // Keeping the old email for test compatibility if any
            password: hashedPassword,
            role: 'ADMIN',
            department: 'Administration'
        });
        await admin.save();
        console.log('Created new admin hod@tce.edu');
    }

    // Create new HOD (Information Technology)
    let newHod = await User.findOne({ email: 'hod_it@tce.edu' });
    if (!newHod) {
        const hashedPassword = await bcrypt.hash('Hod@12345', 10);
        newHod = new User({
            name: 'HOD - IT',
            email: 'hod_it@tce.edu',
            password: hashedPassword,
            role: 'HOD',
            department: 'Information Technology'
        });
        await newHod.save();
        console.log('Created hod_it@tce.edu');
    } else {
        newHod.role = 'HOD';
        newHod.department = 'Information Technology';
        await newHod.save();
        console.log('Updated hod_it@tce.edu to HOD role');
    }
    
    // Create new HOD (Computer Science)
    let csHod = await User.findOne({ email: 'hod_cs@tce.edu' });
    if (!csHod) {
        const hashedPassword = await bcrypt.hash('Hod@12345', 10);
        csHod = new User({
            name: 'HOD - CS',
            email: 'hod_cs@tce.edu',
            password: hashedPassword,
            role: 'HOD',
            department: 'Computer Science'
        });
        await csHod.save();
        console.log('Created hod_cs@tce.edu');
    }

    // Create Faculty
    let faculty = await User.findOne({ email: 'faculty@tce.edu' });
    if (!faculty) {
        const hashedPassword = await bcrypt.hash('Faculty@12345', 10);
        faculty = new User({
            name: 'Dr. Faculty',
            email: 'faculty@tce.edu',
            password: hashedPassword,
            role: 'FACULTY',
            department: 'Information Technology'
        });
        await faculty.save();
        console.log('Created faculty@tce.edu');
    }

    console.log('Done seeding roles');
    process.exit();
}).catch(console.error);
