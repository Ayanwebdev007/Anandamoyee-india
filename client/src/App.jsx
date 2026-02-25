import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import StickyContact from './components/StickyContact';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import ManageBanners from './pages/admin/ManageBanners';
import ManageOrders from './pages/admin/ManageOrders';
import WhatsAppSettings from './pages/admin/WhatsAppSettings';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ManageEnquiries from './pages/admin/ManageEnquiries';
import Footer from './components/Footer';

function App() {
    return (
        <ProfileProvider>
            <CartProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50 font-sans">
                        <Routes>
                            {/* Public Routes with Navbar */}
                            <Route path="/" element={<><Navbar /><Home /></>} />
                            <Route path="/products" element={<><Navbar /><ProductList /></>} />
                            <Route path="/product/:id" element={<><Navbar /><ProductDetails /></>} />
                            <Route path="/cart" element={<><Navbar /><Cart /></>} />
                            <Route path="/profile" element={<><Navbar /><Profile /></>} />
                            <Route path="/about" element={<><Navbar /><AboutUs /></>} />
                            <Route path="/contact" element={<><Navbar /><ContactUs /></>} />

                            {/* Admin Routes without main Navbar */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="products" element={<ManageProducts />} />
                                <Route path="categories" element={<ManageCategories />} />
                                <Route path="banners" element={<ManageBanners />} />
                                <Route path="orders" element={<ManageOrders />} />
                                <Route path="whatsapp" element={<WhatsAppSettings />} />
                                <Route path="enquiries" element={<ManageEnquiries />} />
                            </Route>
                        </Routes>

                        <Footer />

                        <StickyContact />
                    </div>
                </Router>
            </CartProvider>
        </ProfileProvider>
    );
}

export default App;
