import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/ai logo new.png';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        const success = login(username.trim(), password);
        if (success) {
            navigate('/admin');
        } else {
            setError('Invalid username or password. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-brand-blue px-12 py-10 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute top-1/3 -right-16 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white/5" />

                {/* Logo */}
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1.5">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tighter uppercase leading-tight">
                            Anandamoyee India
                        </h1>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative space-y-6">
                    <div className="w-12 h-1 bg-primary rounded-full" />
                    <h2 className="text-white text-3xl font-black leading-tight tracking-tight">
                        Admin<br />Control Panel
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed">
                        Manage your products, orders, enquiries, and more from one secure place.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {['Products', 'Orders', 'Analytics', 'WhatsApp'].map(f => (
                            <span key={f} className="text-xs text-white/60 border border-white/10 rounded-full px-3 py-1">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative">
                    <p className="text-white/30 text-xs">© 2025–2026 Anandamoyee India. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
                {/* Mobile logo */}
                <div className="lg:hidden flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center p-2 mb-3">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tighter uppercase text-brand-blue">Anandamoyee India</h1>
                </div>

                <div className="w-full max-w-sm">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={16} className="text-brand-blue/40" />
                            <span className="text-xs text-brand-blue/40 font-bold tracking-widest uppercase">Secure Access</span>
                        </div>
                        <h2 className="text-2xl font-black text-brand-blue tracking-tight">Sign in to Dashboard</h2>
                        <p className="text-sm text-gray-400 mt-1.5">Enter your credentials to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    required
                                    autoComplete="username"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 active:scale-[0.99] disabled:opacity-60 text-white font-bold rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg shadow-brand-blue/20 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Gold accent divider */}
                    <div className="flex items-center gap-3 mt-8">
                        <div className="flex-1 h-px bg-gray-100" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <p className="text-center text-xs text-gray-300 mt-5">
                        Authorized personnel only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
