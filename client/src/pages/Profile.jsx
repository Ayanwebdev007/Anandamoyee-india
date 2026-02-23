import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, LogOut, Package, ShoppingCart, ArrowLeft, Loader2, AlertCircle, KeyRound, X, CheckCircle2, Edit3 } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const Profile = () => {
    const { profile, isLoggedIn, logout, updatePhone } = useProfile();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Change phone states
    const [showChangePhone, setShowChangePhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [changeStep, setChangeStep] = useState('phone'); // phone → otp → done
    const [changeLoading, setChangeLoading] = useState(false);
    const [changeError, setChangeError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) return;
        fetchOrders();
    }, [isLoggedIn]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/profile/${profile._id}/orders`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(30);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async () => {
        if (!newPhone.trim() || newPhone.length < 10) return;
        setChangeLoading(true);
        setChangeError('');
        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${newPhone}` })
            });
            const data = await res.json();
            if (res.ok) { setChangeStep('otp'); startResendCooldown(); }
            else setChangeError(data.message);
        } catch { setChangeError('Failed to send OTP.'); }
        finally { setChangeLoading(false); }
    };

    const handleVerifyAndUpdate = async () => {
        if (!otp.trim() || otp.length < 4) return;
        setChangeLoading(true);
        setChangeError('');
        try {
            // Verify OTP first
            const verifyRes = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${newPhone}`, otp })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                setChangeError(verifyData.message);
                return;
            }
            // Update phone in profile
            await updatePhone(`91${newPhone}`);
            setChangeStep('done');
            setTimeout(() => {
                setShowChangePhone(false);
                setChangeStep('phone');
                setNewPhone('');
                setOtp('');
            }, 1500);
        } catch (err) {
            setChangeError(err.message || 'Failed to update phone.');
        } finally { setChangeLoading(false); }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                    <User size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">You're not logged in</h2>
                    <p className="text-gray-500 mb-6">Log in with your WhatsApp number to view your profile and orders.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#0400fe] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Format phone for display
    const displayPhone = profile.phone.startsWith('91') ? profile.phone.slice(2) : profile.phone;

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                            <User size={28} className="text-[#0400fe]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-lg font-bold text-gray-900">+91 {displayPhone}</span>
                            </div>
                            <button
                                onClick={() => setShowChangePhone(true)}
                                className="text-xs text-[#0400fe] hover:text-blue-800 font-medium mt-1 flex items-center gap-1"
                            >
                                <Edit3 size={12} /> Change Number
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Package size={20} /> My Orders
                    </h2>
                </div>

                {ordersLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin inline-block text-blue-600 mb-2" size={28} />
                        <p className="text-gray-500 text-sm">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-800 mb-1">No orders yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Your order history will appear here.</p>
                        <Link to="/products" className="text-[#0400fe] hover:text-blue-800 font-medium text-sm">
                            Browse Products →
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <div key={order._id} className="p-4 md:p-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-gray-400">#{order._id.slice(-6)}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Show items */}
                                {order.items && order.items.length > 0 ? (
                                    <div className="space-y-1 mb-2">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                                                <span className="text-gray-500">₹{item.subtotal.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-700">{order.productName} × {order.quantity}</span>
                                        <span className="text-gray-500">₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </span>
                                    <span className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Change Phone Modal */}
            {showChangePhone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowChangePhone(false); setChangeStep('phone'); setNewPhone(''); setOtp(''); setChangeError(''); }} />
                    <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Change Phone Number</h2>
                            <button onClick={() => { setShowChangePhone(false); setChangeStep('phone'); setNewPhone(''); setOtp(''); setChangeError(''); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <div className="p-6">
                            {changeError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{changeError}</p>
                                </div>
                            )}

                            {changeStep === 'phone' && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Current: <span className="font-bold text-gray-800">+91 {displayPhone}</span></p>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New WhatsApp Number</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all mb-4">
                                        <span className="px-3 py-2.5 bg-gray-50 text-gray-500 font-medium text-sm border-r border-gray-300">+91</span>
                                        <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 10-digit number" maxLength={10} autoFocus
                                            className="flex-1 px-3 py-2.5 outline-none text-gray-800" />
                                    </div>
                                    <button onClick={handleSendOtp} disabled={changeLoading || newPhone.length < 10}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {changeLoading ? (<><Loader2 className="animate-spin" size={20} /> Sending OTP...</>) : (<><KeyRound size={18} /> Send OTP</>)}
                                    </button>
                                </div>
                            )}

                            {changeStep === 'otp' && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">OTP sent to <span className="font-bold text-gray-800">+91 {newPhone}</span></p>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 4-digit OTP</label>
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="1234" maxLength={4} autoFocus
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3" />
                                    <div className="flex items-center justify-between mb-5">
                                        <button onClick={() => { setChangeStep('phone'); setOtp(''); setChangeError(''); }} className="text-sm text-gray-500 hover:text-gray-700">← Change number</button>
                                        <button onClick={handleSendOtp} disabled={resendCooldown > 0 || changeLoading} className="text-sm font-medium text-[#0400fe] hover:text-blue-800 disabled:text-gray-400">
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                    <button onClick={handleVerifyAndUpdate} disabled={changeLoading || otp.length < 4}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {changeLoading ? (<><Loader2 className="animate-spin" size={20} /> Updating...</>) : 'Verify & Update'}
                                    </button>
                                </div>
                            )}

                            {changeStep === 'done' && (
                                <div className="text-center py-4">
                                    <CheckCircle2 size={48} className="text-green-600 mx-auto mb-3" />
                                    <p className="text-lg font-bold text-gray-900">Number Updated!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
