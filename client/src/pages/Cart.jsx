import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Loader2, CheckCircle2, AlertCircle, X, KeyRound, ShoppingBag, Edit3 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';

const Cart = () => {
    const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { profile, isLoggedIn, login } = useProfile();
    const navigate = useNavigate();

    // Checkout modal state
    const [showCheckout, setShowCheckout] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    // 'confirm' (logged in) | 'phone' → 'otp' → 'login' → 'order' → 'success'
    const [step, setStep] = useState('phone');
    const [otpLoading, setOtpLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [orderResult, setOrderResult] = useState(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [wantsChangeNumber, setWantsChangeNumber] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

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

    const openCheckout = () => {
        if (isLoggedIn) {
            setStep('confirm');
            setWantsChangeNumber(false);
        } else {
            setStep('phone');
        }
        setShowCheckout(true);
    };

    const handleSendOtp = async () => {
        if (!phone.trim() || phone.length < 10) return;
        setOtpLoading(true);
        setOtpError('');
        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${phone}` })
            });
            const data = await res.json();
            if (res.ok) { setStep('otp'); startResendCooldown(); }
            else setOtpError(data.message);
        } catch { setOtpError('Failed to send OTP.'); }
        finally { setOtpLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim() || otp.length < 4) return;
        setOtpLoading(true);
        setOtpError('');
        try {
            const res = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${phone}`, otp })
            });
            const data = await res.json();
            if (res.ok) {
                // Login/create profile, then go straight to order
                try {
                    await login(`91${phone}`);
                } catch { /* profile creation might fail but OTP is verified */ }
                setStep('order');
            } else {
                setOtpError(data.message);
            }
        } catch { setOtpError('Verification failed.'); }
        finally { setOtpLoading(false); }
    };

    const handlePlaceOrder = async () => {
        setOrderLoading(true);
        setOrderResult(null);
        try {
            const customerPhone = isLoggedIn ? profile.phone : `91${phone}`;
            const res = await fetch('/api/orders/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems.map(item => ({ productId: item.product._id, quantity: item.quantity })),
                    customerPhone,
                    customerId: isLoggedIn ? profile._id : undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                setOrderResult({ success: true, message: data.message });
                setStep('success');
                clearCart();
            } else {
                setOrderResult({ success: false, message: data.message });
            }
        } catch {
            setOrderResult({ success: false, message: 'Something went wrong.' });
        } finally { setOrderLoading(false); }
    };

    const closeCheckout = () => {
        setShowCheckout(false);
        setPhone('');
        setOtp('');
        setStep('phone');
        setOtpError('');
        setOrderResult(null);
        setResendCooldown(0);
        setWantsChangeNumber(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // Format phone for display
    const displayPhone = profile?.phone?.startsWith('91') ? profile.phone.slice(2) : profile?.phone;

    // Empty cart
    if (cartItems.length === 0 && step !== 'success') {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Browse our products and add items to your cart.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-[#0400fe] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
                    >
                        <ShoppingCart size={18} />
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Shopping Cart <span className="text-gray-400 text-lg font-normal">({cartCount} items)</span>
                    </h1>
                </div>
                {cartItems.length > 0 && (
                    <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3">
                    {cartItems.map(({ product, quantity }) => (
                        <div key={product._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                            <Link to={`/product/${product._id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={product.image || "https://placehold.co/100x100/png?text=P"} alt={product.name} className="w-full h-full object-cover" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link to={`/product/${product._id}`}>
                                    <h3 className="font-semibold text-gray-800 text-sm truncate hover:text-blue-600 transition-colors">{product.name}</h3>
                                </Link>
                                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                                <p className="text-[#0400fe] font-bold mt-1">₹{product.price.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <button onClick={() => removeFromCart(product._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <Trash2 size={16} />
                                </button>
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button onClick={() => updateQuantity(product._id, quantity - 1)} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-3 py-1.5 text-sm font-bold text-gray-800 min-w-[36px] text-center">{quantity}</span>
                                    <button onClick={() => updateQuantity(product._id, quantity + 1)} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4 text-sm">
                            {cartItems.map(({ product, quantity }) => (
                                <div key={product._id} className="flex justify-between text-gray-600">
                                    <span className="truncate mr-2">{product.name} × {quantity}</span>
                                    <span className="font-medium whitespace-nowrap">₹{(product.price * quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-semibold">Total</span>
                                <span className="text-2xl font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={openCheckout}
                            className="w-full bg-[#0400fe] hover:bg-blue-800 text-white py-3.5 rounded-xl transition shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 text-lg font-bold active:scale-[0.98]"
                        >
                            <ShoppingCart size={20} />
                            Proceed to Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCheckout} />
                    <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {step === 'confirm' && 'Confirm Order'}
                                {step === 'phone' && 'Verify Your Number'}
                                {step === 'otp' && 'Enter OTP'}
                                {step === 'order' && 'Confirm Order'}
                                {step === 'success' && 'Order Placed!'}
                            </h2>
                            <button onClick={closeCheckout} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <div className="p-6">
                            {/* Cart summary */}
                            {step !== 'success' && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">{cartCount} items</p>
                                    <p className="text-lg font-bold text-[#0400fe]">₹{cartTotal.toLocaleString()}</p>
                                </div>
                            )}

                            {(otpError || orderResult?.success === false) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{otpError || orderResult?.message}</p>
                                </div>
                            )}

                            {/* LOGGED IN — Direct confirm */}
                            {step === 'confirm' && (
                                <div>
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
                                        <div>
                                            <p className="text-xs text-green-600 font-medium">Ordering as</p>
                                            <p className="text-lg font-bold text-green-800">+91 {displayPhone}</p>
                                        </div>
                                        <button
                                            onClick={() => { setWantsChangeNumber(true); setStep('phone'); }}
                                            className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
                                        >
                                            <Edit3 size={12} /> Change
                                        </button>
                                    </div>
                                    <button onClick={handlePlaceOrder} disabled={orderLoading}
                                        className="w-full bg-[#0400fe] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {orderLoading ? (<><Loader2 className="animate-spin" size={20} /> Placing Order...</>) : (<><ShoppingCart size={18} /> Place Order — ₹{cartTotal.toLocaleString()}</>)}
                                    </button>
                                </div>
                            )}

                            {/* STEP: Phone */}
                            {step === 'phone' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        WhatsApp Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all mb-2">
                                        <span className="px-3 py-2.5 bg-gray-50 text-gray-500 font-medium text-sm border-r border-gray-300">+91</span>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 10-digit number" maxLength={10} autoFocus
                                            className="flex-1 px-3 py-2.5 outline-none text-gray-800" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-5">We'll send a verification code to this WhatsApp number.</p>
                                    <button onClick={handleSendOtp} disabled={otpLoading || phone.length < 10}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {otpLoading ? (<><Loader2 className="animate-spin" size={20} /> Sending OTP...</>) : (<><KeyRound size={18} /> Send OTP</>)}
                                    </button>
                                    {wantsChangeNumber && isLoggedIn && (
                                        <button onClick={() => { setStep('confirm'); setWantsChangeNumber(false); }} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-3">← Back to confirm</button>
                                    )}
                                </div>
                            )}

                            {/* STEP: OTP */}
                            {step === 'otp' && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">OTP sent to <span className="font-bold text-gray-800">+91 {phone}</span></p>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 4-digit OTP <span className="text-red-500">*</span></label>
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="1234" maxLength={4} autoFocus
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3" />
                                    <div className="flex items-center justify-between mb-5">
                                        <button onClick={() => { setStep('phone'); setOtp(''); setOtpError(''); }} className="text-sm text-gray-500 hover:text-gray-700">← Change number</button>
                                        <button onClick={handleSendOtp} disabled={resendCooldown > 0 || otpLoading} className="text-sm font-medium text-[#0400fe] hover:text-blue-800 disabled:text-gray-400">
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                    <button onClick={handleVerifyOtp} disabled={otpLoading || otp.length < 4}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {otpLoading ? (<><Loader2 className="animate-spin" size={20} /> Verifying...</>) : 'Verify OTP'}
                                    </button>
                                </div>
                            )}

                            {/* STEP: Order (after OTP verified for guest) */}
                            {step === 'order' && (
                                <div>
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-5">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span className="text-sm font-medium text-green-700">+91 {phone} verified</span>
                                    </div>
                                    <button onClick={handlePlaceOrder} disabled={orderLoading}
                                        className="w-full bg-[#0400fe] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {orderLoading ? (<><Loader2 className="animate-spin" size={20} /> Placing Order...</>) : (<><ShoppingCart size={18} /> Place Order — ₹{cartTotal.toLocaleString()}</>)}
                                    </button>
                                </div>
                            )}

                            {/* SUCCESS */}
                            {step === 'success' && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={36} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
                                    <p className="text-gray-600 text-sm mb-6">{orderResult?.message}</p>
                                    <Link to="/products" onClick={closeCheckout}
                                        className="bg-[#0400fe] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors inline-block">
                                        Continue Shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
