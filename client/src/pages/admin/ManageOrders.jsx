import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Package } from 'lucide-react';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this order?')) return;
        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            setOrders(prev => prev.filter(o => o._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500 text-sm">{orders.length} total orders</p>
                </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin inline-block text-brand-blue mb-2" size={32} />
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No orders yet</h3>
                        <p className="text-gray-500">Orders will appear here when customers place them.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Products</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Qty</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Customer Phone</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div>
                                                <span className="text-[10px] sm:text-xs font-mono text-gray-400">#{order._id.slice(-6)}</span>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className="font-medium text-gray-800 text-xs sm:text-sm block max-w-[150px] sm:max-w-none truncate">
                                                {order.items && order.items.length > 0
                                                    ? order.items.map(i => i.productName).join(', ')
                                                    : order.productName}
                                            </span>
                                            {order.items && order.items.length > 1 && (
                                                <span className="text-[10px] text-gray-400">({order.items.length} items)</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-gray-700 font-medium text-sm">
                                            {order.items && order.items.length > 0
                                                ? order.items.reduce((sum, i) => sum + i.quantity, 0)
                                                : order.quantity}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 font-bold text-gray-900 text-sm">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="px-4 sm:px-6 py-4 text-gray-600 text-xs sm:text-sm">{order.customerPhone}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                )}
            </div>
        </div>
    );
};

export default ManageOrders;
