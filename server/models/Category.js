const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String,
        required: false // Icon image
    },
    banners: {
        type: [String],
        default: [] // Array of banner images
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
