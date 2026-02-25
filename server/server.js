const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Banner = require('./models/Banner');
const Order = require('./models/Order');
const Setting = require('./models/Setting');
const Customer = require('./models/Customer');
const Enquiry = require('./models/Enquiry');
const whatsapp = require('./whatsapp');

const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Upload endpoint (Handles both file uploads and base64 strings)
app.post('/api/upload', upload.single('image'), (req, res) => {
    // If it's a traditional file upload (via Multer)
    if (req.file) {
        return res.json({ imageUrl: `/uploads/${req.file.filename}` });
    }

    // If it's a base64 string in the body
    if (req.body.image && req.body.image.startsWith('data:image/')) {
        return res.json({ imageUrl: req.body.image });
    }

    res.status(400).json({ message: 'No file or valid base64 provided' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- CATEGORY ROUTES ---

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a category
app.post('/api/categories', async (req, res) => {
    const category = new Category(req.body);
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- PRODUCT ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a product
app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- BANNER ROUTES ---

// Get all banners
app.get('/api/banners', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a banner
app.post('/api/banners', async (req, res) => {
    const banner = new Banner(req.body);
    try {
        const newBanner = await banner.save();
        res.status(201).json(newBanner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a banner
app.put('/api/banners/:id', async (req, res) => {
    try {
        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedBanner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a banner
app.delete('/api/banners/:id', async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- ORDER ROUTES ---

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- OTP VERIFICATION ---
// In-memory OTP store: { phone: { otp, expiresAt, attempts } }
const otpStore = new Map();

// Cleanup expired OTPs every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [phone, data] of otpStore) {
        if (now > data.expiresAt) otpStore.delete(phone);
    }
}, 10 * 60 * 1000);

// Send OTP
app.post('/api/otp/send', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || phone.replace(/[^\d]/g, '').length < 10) {
            return res.status(400).json({ message: 'Valid phone number is required' });
        }

        // Rate limit: don't allow resend within 30 seconds
        const existing = otpStore.get(phone);
        if (existing && (Date.now() - (existing.createdAt || 0)) < 30000) {
            return res.status(429).json({ message: 'Please wait 30 seconds before requesting a new OTP' });
        }

        // Generate 4-digit OTP
        const otp = String(Math.floor(1000 + Math.random() * 9000));

        // Store with 5 min expiry
        otpStore.set(phone, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            createdAt: Date.now(),
            attempts: 0
        });

        // Send via WhatsApp
        const message = `🔐 *Anandamoyee India - OTP Verification*\n\nYour OTP is: *${otp}*\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.`;
        const result = await whatsapp.sendMessage(phone, message);

        if (result.success) {
            res.json({ message: 'OTP sent to your WhatsApp!' });
        } else {
            otpStore.delete(phone);
            res.status(500).json({ message: result.error || 'Failed to send OTP. Please try again.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify OTP
app.post('/api/otp/verify', (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const stored = otpStore.get(phone);
    if (!stored) {
        return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    stored.attempts += 1;
    if (stored.attempts > 3) {
        otpStore.delete(phone);
        return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    if (stored.otp !== otp) {
        return res.status(400).json({ message: `Incorrect OTP. ${3 - stored.attempts} attempts remaining.` });
    }

    // Mark as verified (keep in store so order route can check)
    stored.verified = true;
    res.json({ message: 'OTP verified successfully!' });
});

// ===== PROFILE ROUTES =====

// Login / Register with OTP (find or create profile)
app.post('/api/profile/login', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone is required' });

        // Check OTP was verified
        const otpData = otpStore.get(phone);
        if (!otpData || !otpData.verified) {
            return res.status(403).json({ message: 'Phone not verified. Please verify OTP first.' });
        }
        otpStore.delete(phone);

        // Find existing customer or create new
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = await Customer.create({ phone });
        }

        res.json({ profile: { _id: customer._id, phone: customer.phone } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get profile by ID
app.get('/api/profile/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Profile not found' });
        res.json({ profile: { _id: customer._id, phone: customer.phone } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update phone number (requires OTP verified for new number)
app.put('/api/profile/:id/phone', async (req, res) => {
    try {
        const { newPhone } = req.body;
        if (!newPhone) return res.status(400).json({ message: 'New phone is required' });

        // Check OTP verified for new phone
        const otpData = otpStore.get(newPhone);
        if (!otpData || !otpData.verified) {
            return res.status(403).json({ message: 'New phone not verified.' });
        }
        otpStore.delete(newPhone);

        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Profile not found' });

        // Check if new phone is taken by another profile
        const existing = await Customer.findOne({ phone: newPhone });
        if (existing && existing._id.toString() !== customer._id.toString()) {
            // Merge: delete the other profile, keep current one
            await Customer.findByIdAndDelete(existing._id);
            // Point old orders to current profile
            await Order.updateMany({ customerId: existing._id }, { customerId: customer._id });
        }

        customer.phone = newPhone;
        await customer.save();

        res.json({ profile: { _id: customer._id, phone: customer.phone } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get orders for a customer
app.get('/api/profile/:id/orders', async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create an order (with WhatsApp notification via NextSMS)
app.post('/api/orders', async (req, res) => {
    try {
        const { productId, quantity, customerPhone, customerId } = req.body;

        if (!productId || !quantity || !customerPhone) {
            return res.status(400).json({ message: 'Product, quantity, and phone number are required' });
        }

        // If customerId provided (logged-in user), skip OTP check
        if (!customerId) {
            const otpData = otpStore.get(customerPhone);
            if (!otpData || !otpData.verified) {
                return res.status(403).json({ message: 'Phone number not verified. Please verify OTP first.' });
            }
            otpStore.delete(customerPhone);
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create order
        const order = new Order({
            customerId: customerId || undefined,
            productName: product.name,
            productPrice: product.price,
            productImage: product.image || '',
            quantity,
            totalAmount: product.price * quantity,
            customerPhone
        });
        const savedOrder = await order.save();

        // Send WhatsApp messages via NextSMS API
        let whatsappSent = false;

        // Notify owner
        const ownerPhone = await Setting.get('owner_phone') || '';
        if (ownerPhone) {
            const ownerMessage = `🛒 *New Order Received!*\n\n` +
                `📦 *Product:* ${product.name}\n` +
                `💰 *Price:* ₹${product.price}\n` +
                `📊 *Quantity:* ${quantity}\n` +
                `💵 *Total:* ₹${product.price * quantity}\n` +
                `📱 *Customer Phone:* ${customerPhone}\n` +
                `📅 *Date:* ${new Date().toLocaleString('en-IN')}\n\n` +
                `Order ID: ${savedOrder._id}`;
            await whatsapp.sendMessage(ownerPhone, ownerMessage);
        }

        // Send confirmation to customer
        const customerMessage = `✅ *Order Confirmed - Anandamoyee India*\n\n` +
            `Thank you for your order!\n\n` +
            `📦 *Product:* ${product.name}\n` +
            `📊 *Quantity:* ${quantity}\n` +
            `💵 *Total:* ₹${product.price * quantity}\n\n` +
            `We will contact you shortly to confirm delivery details.`;
        const result = await whatsapp.sendMessage(customerPhone, customerMessage);
        whatsappSent = result.success;

        res.status(201).json({
            order: savedOrder,
            whatsappSent,
            message: whatsappSent
                ? 'Order placed successfully! Check your WhatsApp for confirmation.'
                : 'Order placed successfully! WhatsApp confirmation will be sent shortly.'
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a cart order (multiple items)
app.post('/api/orders/cart', async (req, res) => {
    try {
        const { items, customerPhone, customerId } = req.body;

        if (!items || !items.length || !customerPhone) {
            return res.status(400).json({ message: 'Cart items and phone number are required' });
        }

        // If customerId provided (logged-in user), skip OTP check
        if (!customerId) {
            const otpData = otpStore.get(customerPhone);
            if (!otpData || !otpData.verified) {
                return res.status(403).json({ message: 'Phone number not verified. Please verify OTP first.' });
            }
            otpStore.delete(customerPhone);
        }

        // Look up all products and build order items
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            const subtotal = product.price * item.quantity;
            orderItems.push({
                productId: product._id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.image || '',
                quantity: item.quantity,
                subtotal
            });
            totalAmount += subtotal;
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ message: 'No valid products found in cart' });
        }

        const order = new Order({
            customerId: customerId || undefined,
            items: orderItems,
            totalAmount,
            customerPhone
        });
        const savedOrder = await order.save();

        // WhatsApp notifications
        let whatsappSent = false;

        // Build item list for messages
        const itemsList = orderItems.map((item, i) =>
            `${i + 1}. ${item.productName} × ${item.quantity} = ₹${item.subtotal.toLocaleString()}`
        ).join('\n');

        // Notify owner
        const ownerPhone = await Setting.get('owner_phone') || '';
        if (ownerPhone) {
            const ownerMessage = `🛒 *New Cart Order Received!*\n\n` +
                `📦 *Items (${orderItems.length}):*\n${itemsList}\n\n` +
                `💵 *Total:* ₹${totalAmount.toLocaleString()}\n` +
                `📱 *Customer:* ${customerPhone}\n` +
                `📅 *Date:* ${new Date().toLocaleString('en-IN')}\n\n` +
                `Order ID: ${savedOrder._id}`;
            await whatsapp.sendMessage(ownerPhone, ownerMessage);
        }

        // Customer confirmation
        const customerMessage = `✅ *Order Confirmed - Anandamoyee India*\n\n` +
            `Thank you for your order!\n\n` +
            `📦 *Items:*\n${itemsList}\n\n` +
            `💵 *Total:* ₹${totalAmount.toLocaleString()}\n\n` +
            `We will contact you shortly to confirm delivery details.`;
        const result = await whatsapp.sendMessage(customerPhone, customerMessage);
        whatsappSent = result.success;

        res.status(201).json({
            order: savedOrder,
            whatsappSent,
            message: whatsappSent
                ? 'Order placed successfully! Check your WhatsApp for confirmation.'
                : 'Order placed successfully! WhatsApp confirmation will be sent shortly.'
        });
    } catch (error) {
        console.error('Cart order error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- ENQUIRY ROUTES ---

// Create a new enquiry (Public)
app.post('/api/enquiries', async (req, res) => {
    try {
        const enquiry = new Enquiry(req.body);
        const savedEnquiry = await enquiry.save();

        // Notify owner via WhatsApp
        const ownerPhone = await Setting.get('owner_phone') || '';
        if (ownerPhone) {
            const ownerMessage = `📞 *New Enquiry Received!*\n\n` +
                `👤 *Name:* ${req.body.name}\n` +
                `📱 *Phone:* ${req.body.phone}\n` +
                `💬 *Message:* ${req.body.message || 'No message'}\n` +
                `📅 *Date:* ${new Date().toLocaleString('en-IN')}`;
            await whatsapp.sendMessage(ownerPhone, ownerMessage);
        }

        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: savedEnquiry });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all enquiries (Admin)
app.get('/api/enquiries', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update enquiry status (Admin)
app.put('/api/enquiries/:id', async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(enquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an enquiry (Admin)
app.delete('/api/enquiries/:id', async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- SETTINGS ROUTES ---

// Get WhatsApp settings
app.get('/api/settings/whatsapp', async (req, res) => {
    try {
        const token = await Setting.get('nextsms_token') || '';
        const ownerPhone = await Setting.get('owner_phone') || '';
        res.json({ token, ownerPhone });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update WhatsApp settings
app.put('/api/settings/whatsapp', async (req, res) => {
    try {
        const { token, ownerPhone } = req.body;
        if (token !== undefined) await Setting.set('nextsms_token', token);
        if (ownerPhone !== undefined) await Setting.set('owner_phone', ownerPhone);
        res.json({ message: 'WhatsApp settings updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Test WhatsApp message
app.post('/api/settings/whatsapp/test', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });
        const result = await whatsapp.sendMessage(phone, '✅ Test message from Anandamoyee India! WhatsApp API is working.');
        if (result.success) {
            res.json({ message: 'Test message sent successfully!' });
        } else {
            res.status(400).json({ message: result.error || 'Failed to send test message' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// For initial testing/seeding
app.post('/api/products/seed', async (req, res) => {
    try {
        const mockCategories = [
            { name: 'Rice Mill Machines' },
            { name: 'Flour Mill Machines' },
            { name: 'Pulverizer Machines' },
            { name: 'Paddy Thresher' },
            { name: 'Spare Parts' }
        ];

        const mockProducts = [
            { name: "Rice Mill Screen 1mm", price: 1200, originalPrice: 1500, category: "Spare Parts", image: "Screen 1" },
            { name: "6N40 Rice Polisher", price: 45000, originalPrice: 52000, category: "Rice Mill Machines", image: "Polisher" },
            { name: "Heavy Duty Pulverizer", price: 28000, originalPrice: 32000, category: "Pulverizer Machines", image: "Pulverizer" },
            { name: "Chaff Cutter Blade set", price: 850, originalPrice: 1200, category: "Spare Parts", image: "Blade" },
            { name: "Digital Paddy Thresher", price: 62000, originalPrice: 68000, category: "Paddy Thresher", image: "Thresher" },
            { name: "Rubber Roll 10 inch", price: 4200, originalPrice: 5000, category: "Spare Parts", image: "Rubber Roll" },
        ];

        await Category.deleteMany({});
        await Category.insertMany(mockCategories);

        await Product.deleteMany({});
        const products = await Product.insertMany(mockProducts);

        res.json({ message: 'Database Seeded Successfully', productCount: products.length, categoryCount: mockCategories.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
