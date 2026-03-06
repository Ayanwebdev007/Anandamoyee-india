import React, { useState, useEffect } from 'react';
import { Activity, Users, Monitor, MousePointerClick, RefreshCw, AlertCircle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const ManageAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/analytics/stats');
            if (!res.ok) throw new Error('Failed to fetch analytics data');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load analytics</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-brand-blue transition-colors"
                >
                    <RefreshCw size={20} /> Try Again
                </button>
            </div>
        );
    }

    if (loading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <RefreshCw className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading analytics data...</p>
            </div>
        );
    }

    const { summary, topPages, deviceStats, viewsOverTime } = stats;

    // Colors for charts matching brand theme
    const COLORS = ['#0400fe', '#FFD700', '#25D366', '#f70302'];

    return (
        <div className="mb-20 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">Traffic <span className="text-brand-blue">Analytics</span></h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Website performance over the last 7 days</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 hover:border-brand-blue hover:text-brand-blue transition-colors rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border-t-4 border-t-brand-blue shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-brand-blue">
                            <Activity size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Last 7d</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Total Pageviews</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">{summary.totalPageviews.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border-t-4 border-t-primary shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-yellow-50 text-primary">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Last 7d</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Unique Visitors</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">{summary.uniqueVisitors.toLocaleString()}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Over Time Line Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-brand-blue" /> Traffic Trends
                    </h2>
                    <div className="h-72 w-full">
                        {viewsOverTime && viewsOverTime.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={viewsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="views" name="Pageviews" stroke="#0400fe" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No traffic data available.</div>
                        )}
                    </div>
                </div>

                {/* Device Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Monitor size={20} className="text-brand-blue" /> Devices
                    </h2>
                    <div className="flex-1 min-h-[250px] relative">
                        {deviceStats && deviceStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="device"
                                    >
                                        {deviceStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No device data available.</div>
                        )}
                    </div>
                    {/* Custom Legend */}
                    {deviceStats && deviceStats.length > 0 && (
                        <div className="flex justify-center gap-4 mt-4 flex-wrap">
                            {deviceStats.map((stat, index) => (
                                <div key={stat.device} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="text-xs font-bold text-gray-600 capitalize">{stat.device}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Pages List */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MousePointerClick size={20} className="text-brand-blue" /> Most Visited Pages
                    </h2>

                    {topPages && topPages.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest rounded-tl-xl">Page Path</th>
                                        <th className="px-6 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest text-right rounded-tr-xl">Total Views</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {topPages.map((page, index) => (
                                        <tr key={page.path} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 border-l-4 border-transparent hover:border-brand-blue group">
                                                <span className="text-gray-400 mr-2 text-xs">#{index + 1}</span>
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-xs hidden sm:inline-block">
                                                    {page.path}
                                                </span>
                                                <span className="sm:hidden font-mono text-xs">{page.path.length > 25 ? page.path.substring(0, 25) + "..." : page.path}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-brand-blue text-right">
                                                {page.views.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">No page visit data available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAnalytics;
