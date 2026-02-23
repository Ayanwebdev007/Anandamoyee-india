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

                            {/* Admin Routes without main Navbar */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="products" element={<ManageProducts />} />
                                <Route path="categories" element={<ManageCategories />} />
                                <Route path="banners" element={<ManageBanners />} />
                                <Route path="orders" element={<ManageOrders />} />
                                <Route path="whatsapp" element={<WhatsAppSettings />} />
                            </Route>
                        </Routes>

                        {/* Simple Footer Placeholder */}
                        <footer className="bg-gray-900 text-white py-8 mt-12">
                            <div className="container mx-auto px-4 text-center">
                                <p>&copy; 2024 Anandamoyee India. All rights reserved.</p>
                            </div>
                        </footer>

                        <StickyContact />
                    </div>
                </Router>
            </CartProvider>
        </ProfileProvider>
    );
}

export default App;
