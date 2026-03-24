import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ArrowLeft, LogOut, Image as ImageIcon, ShoppingCart, Settings, MessageSquare, Menu, X, Activity } from 'lucide-react';
import logo from '../../assets/ai logo new.png';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useAuth();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/analytics', label: 'Analytics', icon: Activity },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/categories', label: 'Categories', icon: Tags },
        { path: '/admin/banners', label: 'Banners', icon: ImageIcon },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/whatsapp', label: 'WhatsApp', icon: Settings },
        { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex flex-col shadow-sm z-50 transition-transform duration-300 transform
                w-64 lg:static lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center p-1.5">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tighter uppercase text-brand-blue leading-tight">Anandamoyee India</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-brand-blue font-bold tracking-widest uppercase">Admin Panel</span>
                            </div>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                        onClick={closeSidebar}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="mt-6 flex-1 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 translate-x-1'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-blue'
                                    }`}
                            >
                                <Icon size={20} className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-brand-blue'}`} />
                                <span className={`${isActive ? 'font-bold' : 'font-medium'} text-sm`}>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,215,0,0.8)]" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={18} className="text-gray-400 group-hover:text-gray-600" />
                        Back to Website
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
                    >
                        <LogOut size={18} className="text-red-400 group-hover:text-red-500" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navbar for Mobile */}
                <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 flex-shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold tracking-tighter uppercase text-brand-blue">Anandamoyee India</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-gray-50 relative p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

