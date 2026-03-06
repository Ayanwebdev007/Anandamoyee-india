const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    path: {
        type: String,
        required: true,
        index: true
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        default: 'desktop'
    },
    os: {
        type: String,
        default: 'unknown'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // Automatically delete documents after 7 days (60 * 60 * 24 * 7 = 604800 seconds)
        expires: 604800
    }
});

module.exports = mongoose.model('Visit', visitSchema);
