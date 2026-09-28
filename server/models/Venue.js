const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    building: { type: String, required: true },
    capacity: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
