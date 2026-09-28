const mongoose = require('mongoose');

const technicalRequirementSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    projector: { type: String, default: 'No' },
    microphoneQty: { type: Number, default: 0 },
    speakersQty: { type: Number, default: 0 },
    lcdDisplay: { type: String, default: 'No' },
    desktopSystemsQty: { type: Number, default: 0 },
    laptopConnection: { type: String, default: 'HDMI' },
    internetRequired: { type: String, default: 'No' },
    extensionBoardQty: { type: Number, default: 0 },
    whiteboard: { type: String, default: 'No' },
    techStaffRequired: { type: String, default: 'No' },
    otherRequirements: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('TechnicalRequirement', technicalRequirementSchema);
