import React, { useState, useEffect } from 'react';
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
            color: 'bg-blue-500',
            textColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
            trend: 'In catalog'
        },
        {
            title: 'Total Categories',
            value: stats.categories,
            icon: Tags,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
            trend: 'Active categories'
        },
        {
            title: 'Monthly Visitors',
            value: '2.4k', // Placeholder as we don't have analytics yet
            icon: Users,
            color: 'bg-purple-500',
            textColor: 'text-purple-500',
            bgColor: 'bg-purple-50',
            trend: 'Estimated'
        },
        {
            title: 'Inventory Value', // Changed from Total Sales
            value: `₹${stats.totalValue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-orange-500',
            textColor: 'text-orange-500',
            bgColor: 'bg-orange-50',
            trend: 'Total asset value'
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
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.textColor}`}>
                                    <Icon size={22} />
                                </div>
                                <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
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
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50 transition-all text-sm font-medium flex flex-col items-center gap-2">
                            <Package size={20} />
                            Add New Product
                        </button>
                        <button className="p-4 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50 transition-all text-sm font-medium flex flex-col items-center gap-2">
                            <Tags size={20} />
                            Add New Category
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
