import React, { useState, useEffect } from 'react';
import { Loader2, Save, CheckCircle2, AlertCircle, Send, Eye, EyeOff, Settings } from 'lucide-react';

const WhatsAppSettings = () => {
    const [token, setToken] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [result, setResult] = useState(null); // { type: 'success'|'error', message }

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/whatsapp');
            const data = await res.json();
            setToken(data.token || '');
            setOwnerPhone(data.ownerPhone || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setResult(null);

        try {
            const res = await fetch('/api/settings/whatsapp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, ownerPhone })
            });
            const data = await res.json();
            if (res.ok) {
                setResult({ type: 'success', message: data.message });
            } else {
                setResult({ type: 'error', message: data.message });
            }
        } catch (err) {
            setResult({ type: 'error', message: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!testPhone.trim()) return;
        setTesting(true);
        setResult(null);

        try {
            const res = await fetch('/api/settings/whatsapp/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: testPhone })
            });
            const data = await res.json();
            if (res.ok) {
                setResult({ type: 'success', message: data.message });
            } else {
                setResult({ type: 'error', message: data.message });
            }
        } catch (err) {
            setResult({ type: 'error', message: 'Failed to send test message' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                <p className="text-gray-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">WhatsApp Settings</h1>
                <p className="text-gray-500 text-sm">Configure your NextSMS WhatsApp API for order notifications.</p>
            </div>

            {/* Result Message */}
            {result && (
                <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 border ${result.type === 'success'
                    ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                    }`}>
                    {result.type === 'success' ? (
                        <CheckCircle2 size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p className={`text-sm font-medium ${result.type === 'success' ? 'text-yellow-800' : 'text-red-800'}`}>
                        {result.message}
                    </p>
                </div>
            )}

            {/* Settings Form */}
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Settings size={18} className="text-gray-500" />
                        <h2 className="font-semibold text-gray-800">API Configuration</h2>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-5">
                    {/* API Token */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            NextSMS API Token <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste your NextSMS API token here"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12 font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
                            Get this from <a href="https://nextsms.co.in" target="_blank" rel="noopener" className="text-blue-600 hover:underline">nextsms.co.in</a> → Dashboard
                        </p>
                    </div>

                    {/* Owner Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Owner WhatsApp Number
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <span className="px-3 sm:px-4 py-3 bg-gray-50 text-gray-500 font-medium text-sm border-r border-gray-300">+91</span>
                            <input
                                type="tel"
                                value={ownerPhone.replace(/^91/, '')}
                                onChange={(e) => setOwnerPhone('91' + e.target.value.replace(/[^\d]/g, ''))}
                                placeholder="Enter 10-digit number"
                                maxLength={10}
                                className="flex-1 px-4 py-3 outline-none text-gray-800"
                            />
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">You'll receive new order notifications here.</p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary hover:text-brand-blue transition-all duration-300 shadow-xl shadow-blue-900/10 active:scale-[0.98]"
                    >
                        {saving ? (
                            <><Loader2 className="animate-spin" size={18} /> Saving...</>
                        ) : (
                            <><Save size={18} /> Save Config</>
                        )}
                    </button>
                </div>
            </form>

            {/* Test Message Section */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Send size={18} className="text-gray-500" />
                        <h2 className="font-semibold text-gray-800">Test Message</h2>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <p className="text-sm text-gray-600 mb-4">Send a test message to verify your API connection.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <span className="px-3 py-2.5 bg-gray-50 text-gray-500 font-medium text-sm border-r border-gray-300">+91</span>
                            <input
                                type="tel"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value.replace(/[^\d]/g, ''))}
                                placeholder="Enter number"
                                maxLength={10}
                                className="flex-1 px-3 py-2.5 outline-none text-gray-800 text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={testing || !testPhone.trim()}
                            className="w-full sm:w-auto px-5 py-2.5 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                        >
                            {testing ? (
                                <><Loader2 className="animate-spin" size={16} /> Sending...</>
                            ) : (
                                <><Send size={16} /> Send Test</>
                            )}
                        </button>
                    </div>
                </div>
            </div>


            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-800 mb-1">💡 How it works</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• When a customer places an order, they get a WhatsApp confirmation from your business number.</li>
                    <li>• You also receive order details on your owner WhatsApp number.</li>
                    <li>• Messages are sent via NextSMS API — no QR scanning needed.</li>
                    <li>• If your WhatsApp number changes, just update the API token here.</li>
                </ul>
            </div>
        </div>
    );
};

export default WhatsAppSettings;
