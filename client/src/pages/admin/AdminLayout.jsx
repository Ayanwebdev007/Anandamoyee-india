import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ArrowLeft, LogOut, Image as ImageIcon, ShoppingCart, Settings, MessageSquare } from 'lucide-react';
import logo from '../../assets/logo.png';

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/categories', label: 'Categories', icon: Tags },
        { path: '/admin/banners', label: 'Banners', icon: ImageIcon },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/whatsapp', label: 'WhatsApp', icon: Settings },
        { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col shadow-sm z-20">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-none">Anandamoyee</h2>
                            <span className="text-xs text-brand-blue font-semibold tracking-wide uppercase">Admin Panel</span>
                        </div>
                    </div>
                </div>

                <nav className="mt-6 flex-1 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-brand-blue/10 text-brand-blue font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-brand-blue' : 'text-gray-400 group-hover:text-gray-600'} />
                                <span className="text-sm">{item.label}</span>
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
                    {/* Placeholder for Logout if auth is implemented later */}
                    {/* 
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                    */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 relative">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
