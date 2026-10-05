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
    department: { type: String, required: true, default: 'General' },
    notes: { type: String, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'HOD_APPROVED', 'APPROVED', 'HOD_REJECTED', 'ADMIN_REJECTED'] },
    hodApprovedBy: { type: String },
    hodApprovedAt: { type: Date },
    adminApprovedBy: { type: String },
    adminApprovedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
