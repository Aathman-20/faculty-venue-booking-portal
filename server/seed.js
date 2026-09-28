require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Venue = require('./models/Venue');
const Booking = require('./models/Booking');

// Load custom DNS configuration for Atlas (same as in config/mongo.js)
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function seed() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || 'venue_booking_db'
        });
        console.log('Connected.');
        
        console.log('Seeding data...');
        // Hash passwords
        const faculty1Password = await bcrypt.hash('faculty123', 10);
        const faculty2Password = await bcrypt.hash('faculty123', 10);
        const faculty3Password = await bcrypt.hash('faculty123', 10);
        const hodPassword = await bcrypt.hash('hod123', 10);

        // Seed Users
        const users = [
            { name: 'Dr. Faculty One', email: 'faculty1@tce.edu', password: faculty1Password, role: 'faculty', department: 'CSE' },
            { name: 'Dr. Faculty Two', email: 'faculty2@tce.edu', password: faculty2Password, role: 'faculty', department: 'IT' },
            { name: 'Dr. Faculty Three', email: 'faculty3@tce.edu', password: faculty3Password, role: 'faculty', department: 'ECE' },
            { name: 'Head of Department', email: 'hod@tce.edu', password: hodPassword, role: 'hod', department: 'CSE' }
        ];

        for (const user of users) {
            await User.findOneAndUpdate(
                { email: user.email },
                user,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        // Seed Venues
        const venues = [
            { name: 'KS Auditorium', category: 'Auditorium', building: 'Main Building', capacity: '660 People', image: 'images/ks-auditorium.jpg' },
            { name: 'KK Auditorium', category: 'Auditorium', building: 'Main Building', capacity: '450 People', image: 'images/kk-auditorium.png' },
            { name: 'ECE Seminar Hall', category: 'Seminar Hall', building: 'Main Building', capacity: '180 People', image: 'images/ece-seminar-hall.jpg' },
            { name: 'EEE Seminar Hall', category: 'Seminar Hall', building: 'Main Building', capacity: '150 People', image: 'images/eee-seminar-hall.jpg' },
            { name: 'Digital Lab', category: 'Lab', building: 'Main Building', capacity: '75 Computers', image: 'images/digital-lab.png' },
            { name: 'Robotics & Automation Lab', category: 'Lab', building: 'Mechatronics', capacity: '40 Workstations', image: 'images/robotics-automation-lab.jpg' },
            { name: 'AI & Data Science Lab', category: 'Lab', building: 'CSE dept', capacity: '80 Systems', image: 'images/ai-data-science-lab.png' },
            { name: 'Alan Turing Auditorium', category: 'Auditorium', building: 'CSE dept', capacity: '500 Seats', image: 'images/alan-turing-auditorium.png' },
            { name: 'IT Seminar Hall', category: 'Seminar Hall', building: 'IT Department', capacity: '100 People', image: 'images/it-seminar-hall.jpg' }
        ];

        for (const venue of venues) {
            await Venue.findOneAndUpdate(
                { name: venue.name },
                {
                    name: venue.name,
                    building: venue.building,
                    capacity: venue.capacity,
                    category: venue.category,
                    location: 'Location',
                    description: venue.category,
                    image: venue.image
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        // Seed Bookings
        const bookings = [
            {
                id: "BK-1001",
                venue: "KS Auditorium",
                building: "Main Building",
                date: "Mon, 20 Apr",
                slot: "10:00 AM - 12:00 PM",
                faculty: "faculty1@tce.edu",
                email: "faculty1@tce.edu",
                notes: "Guest Lecture on AI and Machine Learning",
                status: "pending"
            },
            {
                id: "BK-1002",
                venue: "IT Seminar Hall",
                building: "IT Department",
                date: "Tue, 21 Apr",
                slot: "02:00 PM - 04:00 PM",
                faculty: "faculty2@tce.edu",
                email: "faculty2@tce.edu",
                notes: "Department Workshop on Cloud Computing",
                status: "approved"
            },
            {
                id: "BK-1003",
                venue: "Alan Turing Auditorium",
                building: "CSE dept",
                date: "Thu, 24 Apr",
                slot: "09:00 AM - 10:30 AM",
                faculty: "faculty3@tce.edu",
                email: "faculty3@tce.edu",
                notes: "Annual Technical Symposium",
                status: "rejected"
            }
        ];

        for (const booking of bookings) {
            await Booking.findOneAndUpdate(
                { id: booking.id },
                booking,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        const venueCount = await Venue.countDocuments();
        console.log(`[SEED] Venues in Atlas: ${venueCount}`);
        console.log('Seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
