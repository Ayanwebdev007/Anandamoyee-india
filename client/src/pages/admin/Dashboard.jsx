import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tags, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        totalValue: 0,
        recentProducts: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);
                const prods = await prodRes.json();
                const cats = await catRes.json();

                // Calculate Total Inventory Value
                const totalValue = prods.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

                // Get Recent Products (sorted by creation date if available, otherwise just take top 3)
                // Assuming the API returns sorted or we sort here. Server sends sorted by createdAt -1.
                const recent = prods.slice(0, 5);

                setStats({
                    products: prods.length,
                    categories: cats.length,
                    totalValue,
                    recentProducts: recent
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Products',
            value: stats.products,
            icon: Package,
            color: 'text-brand-blue',
            bgColor: 'bg-blue-50',
            borderColor: 'border-t-brand-blue',
            trend: 'In Stock'
        },
        {
            title: 'Total Categories',
            value: stats.categories,
            icon: Tags,
            color: 'text-primary',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-t-primary',
            trend: 'Organized'
        },
        {
            title: 'Inventory Value',
            value: `₹${stats.totalValue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-t-emerald-500',
            trend: 'Total MRP'
        },
        {
            title: 'Recent Activity',
            value: stats.recentProducts.length,
            icon: ArrowUpRight,
            color: 'text-brand-red',
            bgColor: 'bg-red-50',
            borderColor: 'border-t-brand-red',
            trend: 'Last Added'
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`bg-white p-6 rounded-2xl border-t-4 ${stat.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <Icon size={24} />
                                </div>
                                <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{stat.title}</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions or Recent Activity Placeholder */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {stats.recentProducts.length > 0 ? (
                            stats.recentProducts.map((product) => (
                                <div key={product._id} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">New product added "{product.name}"</p>
                                        <p className="text-xs text-brand-blue font-medium">₹{Number(product.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No recent activity found.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/products" className="p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-500 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 hover:shadow-inner transition-all group flex flex-col items-center gap-3">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <Package size={24} />
                            </div>
                            <span className="font-bold text-sm tracking-tight">Add New Product</span>
                        </Link>
                        <Link to="/admin/categories" className="p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-yellow-50/50 hover:shadow-inner transition-all group flex flex-col items-center gap-3">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <Tags size={24} />
                            </div>
                            <span className="font-bold text-sm tracking-tight">Add New Category</span>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
