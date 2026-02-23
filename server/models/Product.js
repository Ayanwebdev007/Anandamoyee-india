const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    // --- New fields ---
    description: {
        type: String,
        default: ''
    },
    modelNumber: {
        type: String,
        default: ''
    },
    warranty: {
        type: String,
        default: ''
    },
    specifications: [{
        label: { type: String, required: true },
        value: { type: String, required: true }
    }],
    features: [{
        type: String
    }],
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
