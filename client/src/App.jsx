import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StickyContact from './components/StickyContact';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import useAnalytics from './hooks/useAnalytics';

const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageBanners = lazy(() => import('./pages/admin/ManageBanners'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));
const WhatsAppSettings = lazy(() => import('./pages/admin/WhatsAppSettings'));
const ManageEnquiries = lazy(() => import('./pages/admin/ManageEnquiries'));
const ManageAnalytics = lazy(() => import('./pages/admin/ManageAnalytics'));

const AnalyticsTracker = () => {
    useAnalytics();
    return null;
};

const AppContent = () => {
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <AnalyticsTracker />
            <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                <Routes>
                    {/* Public Routes with Navbar */}
                    <Route path="/" element={<><Navbar /><Home /></>} />
                    <Route path="/products" element={<><Navbar /><ProductList /></>} />
                    <Route path="/product/:id" element={<><Navbar /><ProductDetails /></>} />
                    <Route path="/cart" element={<><Navbar /><Cart /></>} />
                    <Route path="/profile" element={<><Navbar /><Profile /></>} />
                    <Route path="/about" element={<><Navbar /><AboutUs /></>} />
                    <Route path="/contact" element={<><Navbar /><ContactUs /></>} />
                    
                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<><Navbar /><NotFound /></>} />

                    {/* Admin Login (public) */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="products" element={<ManageProducts />} />
                            <Route path="categories" element={<ManageCategories />} />
                            <Route path="banners" element={<ManageBanners />} />
                            <Route path="orders" element={<ManageOrders />} />
                            <Route path="whatsapp" element={<WhatsAppSettings />} />
                            <Route path="enquiries" element={<ManageEnquiries />} />
                            <Route path="analytics" element={<ManageAnalytics />} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>

            {!isAdminPath && (
                <>
                    <Footer />
                    <StickyContact />
                </>
            )}
        </div>
    );
};

function App() {
    return (
        <ProfileProvider>
            <CartProvider>
                <Router>
                    <AuthProvider>
                        <AppContent />
                    </AuthProvider>
                </Router>
            </CartProvider>
        </ProfileProvider>
    );
}

export default App;
