import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Minus, Plus, ShoppingCart, ArrowLeft, CheckCircle2, AlertCircle, X, Shield, Tag, Check, KeyRound, Edit3 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { profile, isLoggedIn, login } = useProfile();
    const [cartAdded, setCartAdded] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    // OTP flow: 'confirm' (logged in) | 'phone' → 'otp' → 'order' → 'success'
    const [step, setStep] = useState('phone');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [wantsChangeNumber, setWantsChangeNumber] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                setProduct(data);
                if (data.description) setActiveTab('description');
                else if (data.specifications?.length) setActiveTab('specs');
                else if (data.features?.length) setActiveTab('features');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Cleanup timer on unmount
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
            if (res.ok) {
                setStep('otp');
                startResendCooldown();
            } else {
                setOtpError(data.message);
            }
        } catch (err) {
            setOtpError('Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
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
                setPhoneVerified(true);
                // Create/find profile
                try { await login(`91${phone}`); } catch { }
                setStep('order');
            } else {
                setOtpError(data.message);
            }
        } catch (err) {
            setOtpError('Verification failed. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleOrder = async () => {
        setOrderLoading(true);
        setOrderResult(null);

        try {
            const customerPhone = isLoggedIn ? profile.phone : `91${phone}`;
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: id,
                    quantity,
                    customerPhone,
                    customerId: isLoggedIn ? profile._id : undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                setOrderResult({ success: true, message: data.message });
                setStep('success');
            } else {
                setOrderResult({ success: false, message: data.message });
            }
        } catch (err) {
            setOrderResult({ success: false, message: 'Something went wrong. Please try again.' });
        } finally {
            setOrderLoading(false);
        }
    };

    const closeModal = () => {
        setShowOrderModal(false);
        setPhone('');
        setOtp('');
        setOrderResult(null);
        setStep('phone');
        setPhoneVerified(false);
        setOtpError('');
        setResendCooldown(0);
        setWantsChangeNumber(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const openOrderModal = () => {
        if (isLoggedIn) {
            setStep('confirm');
            setWantsChangeNumber(false);
        } else {
            setStep('phone');
        }
        setShowOrderModal(true);
    };

    // Format phone for display
    const displayPhone = profile?.phone?.startsWith('91') ? profile.phone.slice(2) : profile?.phone;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
                <Link to="/" className="text-blue-600 hover:underline">← Go back to Home</Link>
            </div>
        );
    }

    const totalPrice = product.price * quantity;
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);

    const hasDescription = !!product.description;
    const hasSpecs = product.specifications && product.specifications.length > 0;
    const hasFeatures = product.features && product.features.length > 0;
    const hasTabs = hasDescription || hasFeatures;

    const tabs = [
        hasDescription && { id: 'description', label: 'Description' },
        hasFeatures && { id: 'features', label: 'Features' },
    ].filter(Boolean);

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Breadcrumb */}
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to Products
            </Link>

            {/* === SINGLE COHESIVE PRODUCT CARD === */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Top Section: Image + Info */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Image Gallery */}
                    <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                            <img
                                src={allImages[selectedImage] || "https://placehold.co/600x600/png?text=Product"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i
                                            ? 'border-[#0400fe] ring-2 ring-blue-100'
                                            : 'border-gray-200 hover:border-gray-400'}`}
                                    >
                                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="p-5 md:p-8 flex flex-col">
                        <span className="text-xs uppercase font-bold text-[#0400fe] tracking-wider mb-1">{product.category}</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>

                        {/* Model Number */}
                        {product.modelNumber && (
                            <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
                                <Tag size={13} />
                                Model: <span className="font-medium text-gray-500">{product.modelNumber}</span>
                            </p>
                        )}

                        {/* Pricing */}
                        <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-3xl font-bold text-[#0400fe]">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{discount}% OFF</span>
                                </>
                            )}
                        </div>

                        {/* Warranty Badge */}
                        {product.warranty && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4 w-fit">
                                <Shield size={15} className="text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">{product.warranty}</span>
                            </div>
                        )}

                        {/* Specifications - inline */}
                        {hasSpecs && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h3>
                                <div className="rounded-lg overflow-hidden border border-gray-100">
                                    <table className="w-full">
                                        <tbody>
                                            {product.specifications.map((spec, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}>
                                                    <td className="px-3 py-2 text-xs font-semibold text-gray-600 w-2/5 border-r border-gray-100">
                                                        {spec.label}
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-gray-500">
                                                        {spec.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto">
                            {/* Quantity Selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                                <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700">
                                        <Minus size={18} />
                                    </button>
                                    <span className="px-6 py-2.5 text-lg font-bold text-gray-900 min-w-[60px] text-center bg-white">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700">
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        addToCart(product, quantity);
                                        setCartAdded(true);
                                        setTimeout(() => setCartAdded(false), 1500);
                                    }}
                                    className={`flex-1 py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg font-bold active:scale-[0.98] border-2 ${cartAdded
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-[#0400fe] text-[#0400fe] hover:bg-blue-50'
                                        }`}
                                >
                                    {cartAdded ? (<><Check size={20} /> Added!</>) : (<><ShoppingCart size={20} /> Add to Cart</>)}
                                </button>
                                <button
                                    onClick={openOrderModal}
                                    className="flex-1 bg-[#0400fe] hover:bg-blue-800 text-white py-4 rounded-xl transition shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 text-lg font-bold active:scale-[0.98]"
                                >
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Tabs for Description / Specs / Features */}
                {hasTabs && (
                    <div className="border-t border-gray-100">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3.5 text-sm font-semibold transition-all relative ${activeTab === tab.id
                                        ? 'text-[#0400fe]'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0400fe] rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 md:p-8">
                            {/* Description */}
                            {activeTab === 'description' && hasDescription && (
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                            )}

                            {/* Specifications */}
                            {activeTab === 'specs' && hasSpecs && (
                                <div className="rounded-xl overflow-hidden border border-gray-100">
                                    <table className="w-full">
                                        <tbody>
                                            {product.specifications.map((spec, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}>
                                                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 w-2/5 border-r border-gray-100">
                                                        {spec.label}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-600">
                                                        {spec.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Features */}
                            {activeTab === 'features' && hasFeatures && (
                                <ul className="space-y-3">
                                    {product.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check size={12} className="text-green-600" />
                                            </div>
                                            <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Modal with OTP Verification */}
            {showOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {step === 'confirm' && 'Confirm Order'}
                                {step === 'phone' && 'Verify Your Number'}
                                {step === 'otp' && 'Enter OTP'}
                                {step === 'order' && 'Confirm Order'}
                                {step === 'success' && 'Order Placed!'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Step Indicators */}
                        {step !== 'success' && step !== 'confirm' && (
                            <div className="flex items-center px-6 pt-4 gap-1">
                                {['phone', 'otp', 'order'].map((s, i) => (
                                    <div key={s} className="flex items-center flex-1">
                                        <div className={`h-1 rounded-full w-full transition-all ${['phone', 'otp', 'order'].indexOf(step) >= i
                                            ? 'bg-[#0400fe]'
                                            : 'bg-gray-200'
                                            }`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-6">
                            {/* Product Summary - always visible except success */}
                            {step !== 'success' && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                                    <div className="flex gap-3">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img src={product.image || "https://placehold.co/100x100/png?text=P"} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h4>
                                            <p className="text-xs text-gray-500">Qty: {quantity}</p>
                                            <p className="text-sm font-bold text-[#0400fe] mt-0.5">₹{totalPrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
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
                                    <button onClick={handleOrder} disabled={orderLoading}
                                        className="w-full bg-[#0400fe] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {orderLoading ? (<><Loader2 className="animate-spin" size={20} /> Placing Order...</>) : (<><ShoppingCart size={18} /> Confirm Order — ₹{totalPrice.toLocaleString()}</>)}
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
                                        <input
                                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 10-digit number" maxLength={10} autoFocus
                                            className="flex-1 px-3 py-2.5 outline-none text-gray-800"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-5">We'll send a verification code to this WhatsApp number.</p>
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={otpLoading || phone.length < 10}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {otpLoading ? (<><Loader2 className="animate-spin" size={20} /> Sending OTP...</>) : (<><KeyRound size={18} /> Send OTP</>)}
                                    </button>
                                    {wantsChangeNumber && isLoggedIn && (
                                        <button onClick={() => { setStep('confirm'); setWantsChangeNumber(false); }} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-3">← Back to confirm</button>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: Enter OTP */}
                            {step === 'otp' && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        OTP sent to <span className="font-bold text-gray-800">+91 {phone}</span>
                                    </p>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Enter 4-digit OTP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="1234" maxLength={4} autoFocus
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-3"
                                    />
                                    <div className="flex items-center justify-between mb-5">
                                        <button
                                            onClick={() => { setStep('phone'); setOtp(''); setOtpError(''); }}
                                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            ← Change number
                                        </button>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={resendCooldown > 0 || otpLoading}
                                            className="text-sm font-medium text-[#0400fe] hover:text-blue-800 disabled:text-gray-400 transition-colors"
                                        >
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={otpLoading || otp.length < 4}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {otpLoading ? (<><Loader2 className="animate-spin" size={20} /> Verifying...</>) : 'Verify OTP'}
                                    </button>
                                </div>
                            )}

                            {/* STEP 3: Confirm Order */}
                            {step === 'order' && (
                                <div>
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-5">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span className="text-sm font-medium text-green-700">+91 {phone} verified</span>
                                    </div>
                                    <button
                                        onClick={handleOrder}
                                        disabled={orderLoading}
                                        className="w-full bg-[#0400fe] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200/50 active:scale-[0.99] transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {orderLoading ? (<><Loader2 className="animate-spin" size={20} /> Placing Order...</>) : (<><ShoppingCart size={18} /> Confirm Order — ₹{totalPrice.toLocaleString()}</>)}
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
                                    <button onClick={closeModal} className="bg-[#0400fe] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
