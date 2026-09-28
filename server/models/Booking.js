const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    venue: { type: String, required: true },
    building: { type: String, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    faculty: { type: String, required: true },
    email: { type: String, required: true },
    notes: { type: String, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
