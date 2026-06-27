const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Banner = require('./models/Banner');
const Order = require('./models/Order');
const Setting = require('./models/Setting');
const Customer = require('./models/Customer');
const Enquiry = require('./models/Enquiry');
const Visit = require('./models/Visit');
const whatsapp = require('./whatsapp');
const { s3Client, deleteFromS3 } = require('./config/s3Config');
const uploadRoutes = require('./routes/uploadRoutes');

const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// S3 Upload Route
app.use('/api/upload', uploadRoutes);

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
        const category = await Category.findById(req.params.id);
        if (category) {
            if (category.image) await deleteFromS3(category.image);
            if (category.banners && category.banners.length > 0) {
                await Promise.all(category.banners.map(banner => deleteFromS3(banner)));
            }
            await Category.findByIdAndDelete(req.params.id);
        }
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
        const product = await Product.findById(req.params.id);
        if (product) {
            // Delete main image
            if (product.image) await deleteFromS3(product.image);

            // Delete additional images if any
            if (product.images && product.images.length > 0) {
                await Promise.all(product.images.map(img => deleteFromS3(img)));
            }

            await Product.findByIdAndDelete(req.params.id);
        }
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
        const banner = await Banner.findById(req.params.id);
        if (banner && banner.imageUrl) {
            await deleteFromS3(banner.imageUrl);
        }
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
        let whatsappSent = true;

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
            whatsapp.sendMessage(ownerPhone, ownerMessage).catch(err => console.error('Owner WhatsApp Error:', err));
        }

        // Send confirmation to customer
        const customerMessage = `✅ *Order Confirmed - Anandamoyee India*\n\n` +
            `Thank you for your order!\n\n` +
            `📦 *Product:* ${product.name}\n` +
            `📊 *Quantity:* ${quantity}\n` +
            `💵 *Total:* ₹${product.price * quantity}\n\n` +
            `We will contact you shortly to confirm delivery details.`;
        whatsapp.sendMessage(customerPhone, customerMessage).catch(err => console.error('Customer WhatsApp Error:', err));

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
            whatsapp.sendMessage(ownerPhone, ownerMessage).catch(err => console.error('Owner Cart WhatsApp Error:', err));
        }

        // Customer confirmation
        const customerMessage = `✅ *Order Confirmed - Anandamoyee India*\n\n` +
            `Thank you for your order!\n\n` +
            `📦 *Items:*\n${itemsList}\n\n` +
            `💵 *Total:* ₹${totalAmount.toLocaleString()}\n\n` +
            `We will contact you shortly to confirm delivery details.`;
        whatsapp.sendMessage(customerPhone, customerMessage).catch(err => console.error('Customer Cart WhatsApp Error:', err));
        whatsappSent = true;

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


// --- ANALYTICS ROUTES ---

// Track a page visit
app.post('/api/analytics/track', async (req, res) => {
    try {
        const { sessionId, path, deviceType, os } = req.body;

        // Basic validation
        if (!sessionId || !path) {
            return res.status(400).json({ message: 'Missing required tracking data' });
        }

        // Create visit record (auto-expires after 7 days via TTL index)
        const visit = new Visit({
            sessionId,
            path,
            deviceType: deviceType || 'unknown',
            os: os || 'unknown'
        });

        await visit.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get analytics stats for the dashboard
app.get('/api/analytics/stats', async (req, res) => {
    try {
        // Calculate date 7 days ago (to ensure clean queries even if TTL is slightly delayed)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Common match for last 7 days
        const dateMatch = { createdAt: { $gte: sevenDaysAgo } };

        // 1. Total Pageviews
        const totalPageviews = await Visit.countDocuments(dateMatch);

        // 2. Unique Visitors (distinct sessionIds)
        const uniqueVisitors = (await Visit.distinct('sessionId', dateMatch)).length;

        // 3. Top Pages
        const topPages = await Visit.aggregate([
            { $match: dateMatch },
            { $group: { _id: '$path', views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            { $project: { path: '$_id', views: 1, _id: 0 } }
        ]);

        // 4. Device Breakdown
        const deviceStats = await Visit.aggregate([
            { $match: dateMatch },
            { $group: { _id: '$deviceType', count: { $sum: 1 } } },
            { $project: { device: '$_id', count: 1, _id: 0 } }
        ]);

        // 5. Views over the last 7 days (for line chart)
        const viewsOverTime = await Visit.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    views: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', views: 1, _id: 0 } }
        ]);

        res.json({
            summary: {
                totalPageviews,
                uniqueVisitors
            },
            topPages,
            deviceStats,
            viewsOverTime
        });

    } catch (error) {
        console.error('Analytics stats error:', error);
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

// --- GOD LEVEL DYNAMIC SEO PRERENDERING ---
let cachedIndexHtml = null;
let lastCacheTime = 0;

async function getBaseIndexHtml() {
    const now = Date.now();
    if (cachedIndexHtml && (now - lastCacheTime < 5 * 60 * 1000)) {
        return cachedIndexHtml;
    }
    const distPath = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(distPath)) {
        cachedIndexHtml = fs.readFileSync(distPath, 'utf8');
        lastCacheTime = now;
        return cachedIndexHtml;
    }
    const devPath = path.join(__dirname, '../client/index.html');
    if (fs.existsSync(devPath)) {
        cachedIndexHtml = fs.readFileSync(devPath, 'utf8');
        lastCacheTime = now;
        return cachedIndexHtml;
    }
    try {
        const response = await fetch('https://www.anandamoyeeindia.com/index.html');
        if (response.ok) {
            cachedIndexHtml = await response.text();
            lastCacheTime = now;
            return cachedIndexHtml;
        }
    } catch (err) {
        console.error('Error fetching base index.html:', err);
    }
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Anandamoyee India</title></head><body><div id="root"></div></body></html>`;
}

function injectSeoIntoHtml(html, { title, description, keywords, image, url, schema, semanticHtml }) {
    let modified = html;
    const siteTitle = 'Anandamoyee India';
    const fullTitle = title ? (title.includes(siteTitle) ? title : `${title} | ${siteTitle}`) : siteTitle;
    const desc = description || 'Leading the way in rice mill machinery innovation. We empower farmers and millers with state-of-the-art technology for a sustainable future.';
    const img = image || 'https://www.anandamoyeeindia.com/logo.png';
    const fullUrl = url ? `https://www.anandamoyeeindia.com${url}` : 'https://www.anandamoyeeindia.com';

    if (modified.includes('<title>')) {
        modified = modified.replace(/<title>.*?<\/title>/s, `<title>${fullTitle}</title>`);
    } else {
        modified = modified.replace('</head>', `<title>${fullTitle}</title>\n</head>`);
    }

    if (modified.includes('name="description"')) {
        modified = modified.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i, `<meta name="description" content="${desc}" />`);
    } else {
        modified = modified.replace('</head>', `<meta name="description" content="${desc}" />\n</head>`);
    }

    const kwString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const kwMeta = kwString ? `<meta name="keywords" content="${kwString}" />` : '';

    const ogTags = `
    ${kwMeta}
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${img}" />
    <link rel="canonical" href="${fullUrl}" />
    ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
    `;
    modified = modified.replace('</head>', `${ogTags}\n</head>`);

    if (semanticHtml) {
        const hiddenContainer = `<div id="seo-prerender" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">${semanticHtml}</div>`;
        modified = modified.replace(/<body[^>]*>/i, `$&${hiddenContainer}`);
    }

    return modified;
}

app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const baseHtml = await getBaseIndexHtml();
        if (!product) {
            return res.send(baseHtml);
        }
        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [product.image, ...(product.images || [])].filter(Boolean),
            "description": product.description || `${product.name} available at Anandamoyee India.`,
            "sku": product.modelNumber || product._id,
            "brand": { "@type": "Brand", "name": "Anandamoyee India" },
            "offers": {
                "@type": "Offer",
                "url": `https://www.anandamoyeeindia.com/product/${product._id}`,
                "priceCurrency": "INR",
                "price": product.price,
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
            }
        };
        const semanticHtml = `
            <h1>${product.name}</h1>
            <p>Category: ${product.category}</p>
            <p>Model Number: ${product.modelNumber || 'N/A'}</p>
            <p>Price: ₹${product.price} (Original Price: ₹${product.originalPrice || product.price})</p>
            <p>Description: ${product.description}</p>
            <p>Keywords: ${(product.keywords || []).join(', ')}</p>
        `;
        const html = injectSeoIntoHtml(baseHtml, {
            title: product.name,
            description: product.description?.substring(0, 160) || `${product.name} - high quality rice mill machinery by Anandamoyee India.`,
            keywords: product.keywords,
            image: product.image,
            url: `/product/${product._id}`,
            schema,
            semanticHtml
        });
        res.header('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        console.error('SEO prerender error for product:', err);
        const baseHtml = await getBaseIndexHtml();
        res.send(baseHtml);
    }
});

app.get(['/products', '/about', '/contact'], async (req, res) => {
    try {
        const baseHtml = await getBaseIndexHtml();
        let title = 'Products | Anandamoyee India';
        let description = 'Explore our complete range of rice mill machines, polishers, pulverizers, paddy threshers, and spare parts.';
        if (req.path.includes('/about')) {
            title = 'About Us | Anandamoyee India';
            description = 'Learn about Anandamoyee India, leading pioneer in manufacturing state-of-the-art agricultural and rice milling machinery.';
        } else if (req.path.includes('/contact')) {
            title = 'Contact Us | Anandamoyee India';
            description = 'Get in touch with Anandamoyee India for sales inquiries, spare parts, dealership, or customer support.';
        }
        const html = injectSeoIntoHtml(baseHtml, {
            title,
            description,
            url: req.path
        });
        res.header('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        const baseHtml = await getBaseIndexHtml();
        res.send(baseHtml);
    }
});

// Dynamic God Level XML Sitemap Route
app.get('/api/sitemap.xml', async (req, res) => {
    try {
        const products = await Product.find().select('_id name image updatedAt');
        const baseUrl = 'https://www.anandamoyeeindia.com';
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
        
        // Add home page
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // Add static pages
        const staticPages = ['products', 'about', 'contact'];
        for (const page of staticPages) {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/${page}</loc>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.9</priority>\n';
            xml += '  </url>\n';
        }

        // Add individual products with image tags
        for (const product of products) {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/product/${product._id}</loc>\n`;
            if (product.updatedAt) {
                xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            if (product.image) {
                xml += '    <image:image>\n';
                xml += `      <image:loc>${product.image}</image:loc>\n`;
                if (product.name) {
                    const cleanName = product.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    xml += `      <image:title>${cleanName}</image:title>\n`;
                }
                xml += '    </image:image>\n';
            }
            xml += '  </url>\n';
        }

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
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
            { 
                name: "6B70 Rice Mill Jali (Screen Mesh 1mm)", 
                price: 1200, 
                originalPrice: 1500, 
                category: "Spare Parts", 
                image: "https://placehold.co/600x600/png?text=6B70+Jali",
                modelNumber: "6B70-JALI-1MM",
                description: "Premium stainless steel heat-treated 6B70 Rice Mill Jali screen mesh (1mm). Precision punched holes for maximum polishing efficiency and minimal rice breakage. Compatible with standard 6B70 huller and polisher machines across India.",
                keywords: ["6b70", "jali", "6b70 jali", "rice mill screen", "mesh", "sieve", "huller screen", "6n40 jali", "spare parts"]
            },
            { 
                name: "6N40 Mini Rice Mill Polisher Machine with Jali", 
                price: 45000, 
                originalPrice: 52000, 
                category: "Rice Mill Machines", 
                image: "https://placehold.co/600x600/png?text=6N40+Polisher",
                modelNumber: "6N40-POLISHER",
                description: "High performance 6N40 combined rice milling and polishing machine equipped with heavy duty iron huller and hardened screen jali. Ideal for commercial agricultural use.",
                keywords: ["6n40", "6n40 polisher", "mini rice mill", "rice polisher machine", "6n40 jali", "huller machine"]
            },
            { 
                name: "Heavy Duty Commercial Pulverizer Machine 3HP", 
                price: 28000, 
                originalPrice: 32000, 
                category: "Pulverizer Machines", 
                image: "https://placehold.co/600x600/png?text=Pulverizer+3HP",
                modelNumber: "PULV-3HP-COMM",
                description: "Commercial grade 3HP masala and wheat pulverizer grinding machine with stainless steel rotor and heavy duty jali screens for ultrafine flour milling.",
                keywords: ["pulverizer", "flour mill", "masala grinding machine", "3hp pulverizer", "pulverizer jali"]
            },
            { 
                name: "Chaff Cutter High Carbon Steel Blade Set", 
                price: 850, 
                originalPrice: 1200, 
                category: "Spare Parts", 
                image: "https://placehold.co/600x600/png?text=Chaff+Cutter+Blade",
                modelNumber: "CC-BLADE-SET",
                description: "Heat-treated high carbon tempered alloy steel blade set for chaff cutter machines. Ensures clean cutting of animal fodder and long-lasting sharpness.",
                keywords: ["chaff cutter blade", "fodder cutter spare parts", "agricultural blades", "chaff cutter"]
            },
            { 
                name: "Digital Automatic Paddy Thresher Machine", 
                price: 62000, 
                originalPrice: 68000, 
                category: "Paddy Thresher", 
                image: "https://placehold.co/600x600/png?text=Paddy+Thresher",
                modelNumber: "PT-DIGI-500",
                description: "High output tractor and motor operated automatic digital paddy thresher machine with multi-crop screening and grain cleaning blower system.",
                keywords: ["paddy thresher", "multicrop thresher", "rice thresher machine", "agricultural machinery"]
            },
            { 
                name: "Rubber Roll 10 Inch for Rice Dehusker", 
                price: 4200, 
                originalPrice: 5000, 
                category: "Spare Parts", 
                image: "https://placehold.co/600x600/png?text=Rubber+Roll+10in",
                modelNumber: "RR-10INCH",
                description: "Premium wear-resistant synthetic rubber rolls (10 inch x 10 inch) for rice huller and dehusker machines. High shelling efficiency with optimum heat dissipation.",
                keywords: ["rubber roll", "10 inch rubber roll", "rice dehusker roll", "rice mill rubber roller", "spare parts"]
            }
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

// --- HOSTINGER VPS / MONOLITHIC STATIC SERVING & SPA FALLBACK ---
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Catch-all SPA routing fallback (runs AFTER all API and SEO routes)
app.use(async (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    if (req.method !== 'GET') {
        return res.status(404).send('Not Found');
    }
    try {
        const baseHtml = await getBaseIndexHtml();
        res.header('Content-Type', 'text/html; charset=utf-8');
        res.send(baseHtml);
    } catch (err) {
        res.status(404).send('Page Not Found');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
