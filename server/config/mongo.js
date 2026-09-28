const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dns = require('dns');

const connectDB = async () => {
    // Force Node.js to use reliable external DNS servers instead of local 127.0.0.1
    // This fixes querySrv ECONNREFUSED for mongodb+srv URIs on this specific Windows environment.
    dns.setServers(['8.8.8.8', '1.1.1.1']);

    const uri = process.env.MONGO_URI;
    if (!uri || uri.includes('<username>')) {
        throw new Error('MONGO_URI is not configured in .env');
    }

    await mongoose.connect(uri, {
        dbName: process.env.MONGO_DB_NAME || 'venue_booking_db'
    });
    console.log('[MONGODB] Connected to MongoDB Atlas');
};

module.exports = connectDB;
