import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, Phone, Mail, X, Loader2, KeyRound, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';

import logo from '../assets/logo.png';
import wpLogo from '../assets/wp logo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount } = useCart();
    const { profile, isLoggedIn, login } = useProfile();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Search state
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    // Sync search input with URL when navigating
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const currentParams = new URLSearchParams(window.location.search);
            if (searchQuery.trim()) {
                currentParams.set('search', searchQuery.trim());
            } else {
                currentParams.delete('search');
            }
            navigate(`/products?${currentParams.toString()}`);
            setIsMenuOpen(false);
        }
    };

    // Login modal state
    const [showLogin, setShowLogin] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loginStep, setLoginStep] = useState('phone'); // phone → otp → done
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
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

    const handleSendOtp = async () => {
        if (!phone.trim() || phone.length < 10) return;
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${phone}` })
            });
            const data = await res.json();
            if (res.ok) { setLoginStep('otp'); startResendCooldown(); }
            else setLoginError(data.message);
        } catch { setLoginError('Failed to send OTP.'); }
        finally { setLoginLoading(false); }
    };

    const handleVerifyAndLogin = async () => {
        if (!otp.trim() || otp.length < 4) return;
        setLoginLoading(true);
        setLoginError('');
        try {
            // Step 1: Verify OTP
            const verifyRes = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `91${phone}`, otp })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                setLoginError(verifyData.message);
                return;
            }
            // Step 2: Create/find profile
            await login(`91${phone}`);
            setLoginStep('done');
            setTimeout(() => {
                closeLogin();
                navigate('/profile');
            }, 1000);
        } catch (err) {
            setLoginError(err.message || 'Login failed.');
        } finally { setLoginLoading(false); }
    };

    const closeLogin = () => {
        setShowLogin(false);
        setPhone('');
        setOtp('');
        setLoginStep('phone');
        setLoginError('');
        setResendCooldown(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleUserClick = () => {
        if (isLoggedIn) {
            navigate('/profile');
        } else {
            setShowLogin(true);
        }
    };

    return (
        <>
            {/* 1. Top Contact Bar */}
            <div className="bg-gray-100 py-1 text-center text-sm md:text-base border-b">
                <div className="container mx-auto px-4 flex justify-center md:justify-end gap-6 text-gray-800 font-medium overflow-x-auto scrollbar-hide">
                    <a href="tel:+919477432899" className="flex items-center gap-2 hover:text-primary transition whitespace-nowrap">
                        <Phone size={18} className="text-secondary" />
                        <span>+91 9477432899</span>
                    </a>
                    <a href="https://wa.me/919051430698" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 transition whitespace-nowrap">
                        <img src={wpLogo} alt="WhatsApp" className="h-6 w-6 object-contain" />
                        <span>+91 9051430698</span>
                    </a>
                    <a href="mailto:prasenjitshaw68@gmail.com" className="hidden md:flex items-center gap-2 hover:text-primary transition whitespace-nowrap">
                        <Mail size={18} className="text-secondary" />
                        <span>prasenjitshaw68@gmail.com</span>
                    </a>
                </div>
            </div>

            {/* 2. Main Header */}
            <header className="bg-primary text-black sticky top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <Menu className="h-6 w-6" />
                            </button>
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logo} alt="Anandamoyee India Logo" className="h-10 md:h-12 w-auto object-contain" />
                                <span className="text-lg md:text-2xl font-bold tracking-tighter uppercase">Anandamoyee India</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex flex-1 max-w-xl mx-auto relative">
                            <input
                                type="text"
                                placeholder="Search Products.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full px-4 py-2 rounded-sm text-gray-800 focus:outline-none"
                            />
                            <Search
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer hover:text-secondary transition-colors"
                                onClick={handleSearch}
                            />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <Link to="/about" className="hidden md:block font-bold hover:text-secondary transition-colors uppercase text-sm">About Us</Link>
                            <Link to="/contact" className="hidden md:block font-bold hover:text-secondary transition-colors uppercase text-sm">Contact Us</Link>
                            <Link to="/cart" className="relative cursor-pointer">
                                <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            <button onClick={handleUserClick} className="relative cursor-pointer">
                                <User className="h-6 w-6 md:h-7 md:w-7" />
                                {isLoggedIn && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 md:hidden relative">
                        <input
                            type="text"
                            placeholder="Search Products.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full px-4 py-2 rounded-sm text-gray-800 focus:outline-none"
                        />
                        <Search
                            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                            onClick={handleSearch}
                        />
                    </div>
                </div>

                {/* Mobile Menu - Left Drawer */}
                <div
                    className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div
                        className={`absolute inset-y-0 left-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary">
                            <div className="flex items-center gap-2">
                                <img src={logo} alt="Logo" className="h-8 w-auto" />
                                <span className="text-lg font-bold tracking-tight">Anandamoyee</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={24} className="text-black" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="p-4 flex flex-col gap-2">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-xl text-gray-800 font-bold hover:bg-primary/10 hover:text-primary transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <CheckCircle2 size={20} className="text-primary" />
                                </div>
                                <span className="text-lg">Home</span>
                            </Link>

                            <Link
                                to="/about"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-xl text-gray-800 font-bold hover:bg-primary/10 hover:text-primary transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Award size={20} className="text-primary" />
                                </div>
                                <span className="text-lg">About Us</span>
                            </Link>

                            <Link
                                to="/contact"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-xl text-gray-800 font-bold hover:bg-primary/10 hover:text-primary transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Mail size={20} className="text-primary" />
                                </div>
                                <span className="text-lg">Contact Us</span>
                            </Link>
                        </nav>

                        {/* Footer Info */}
                        <div className="mt-auto p-6 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-400 text-center uppercase tracking-widest font-semibold">
                                Trusted by 1M+ Farmers
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeLogin} />
                    <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {loginStep === 'phone' && 'Login / Register'}
                                {loginStep === 'otp' && 'Enter OTP'}
                                {loginStep === 'done' && 'Welcome!'}
                            </h2>
                            <button onClick={closeLogin} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        {loginStep !== 'done' && (
                            <div className="flex items-center px-6 pt-4 gap-1">
                                {['phone', 'otp'].map((s, i) => (
                                    <div key={s} className="flex-1">
                                        <div className={`h-1 rounded-full transition-all ${['phone', 'otp'].indexOf(loginStep) >= i ? 'bg-[#0400fe]' : 'bg-gray-200'}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-6">
                            {loginError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{loginError}</p>
                                </div>
                            )}

                            {loginStep === 'phone' && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-4">Enter your WhatsApp number to login or create an account.</p>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number <span className="text-red-500">*</span></label>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all mb-2">
                                        <span className="px-3 py-2.5 bg-gray-50 text-gray-500 font-medium text-sm border-r border-gray-300">+91</span>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 10-digit number" maxLength={10} autoFocus
                                            className="flex-1 px-3 py-2.5 outline-none text-gray-800" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-5">We'll send a verification code to this WhatsApp number.</p>
                                    <button onClick={handleSendOtp} disabled={loginLoading || phone.length < 10}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {loginLoading ? (<><Loader2 className="animate-spin" size={20} /> Sending OTP...</>) : (<><KeyRound size={18} /> Send OTP</>)}
                                    </button>
                                </div>
                            )}

                            {loginStep === 'otp' && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">OTP sent to <span className="font-bold text-gray-800">+91 {phone}</span></p>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 4-digit OTP <span className="text-red-500">*</span></label>
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="1234" maxLength={4} autoFocus
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3" />
                                    <div className="flex items-center justify-between mb-5">
                                        <button onClick={() => { setLoginStep('phone'); setOtp(''); setLoginError(''); }} className="text-sm text-gray-500 hover:text-gray-700">← Change number</button>
                                        <button onClick={handleSendOtp} disabled={resendCooldown > 0 || loginLoading} className="text-sm font-medium text-[#0400fe] hover:text-blue-800 disabled:text-gray-400">
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                    <button onClick={handleVerifyAndLogin} disabled={loginLoading || otp.length < 4}
                                        className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {loginLoading ? (<><Loader2 className="animate-spin" size={20} /> Verifying...</>) : 'Verify & Login'}
                                    </button>
                                </div>
                            )}

                            {loginStep === 'done' && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={36} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">You're logged in!</h3>
                                    <p className="text-gray-500 text-sm">Redirecting to your profile...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
