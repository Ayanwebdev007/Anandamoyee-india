const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    // Support for multi-item orders (cart)
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        productPrice: {
            type: Number,
            required: true
        },
        productImage: {
            type: String,
            default: ''
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    // Legacy single-product fields (backward compat for old orders)
    productName: String,
    productPrice: Number,
    productImage: String,
    quantity: Number,
    // Shared fields
    totalAmount: {
        type: Number,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
