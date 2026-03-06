import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Wifi, WifiOff, QrCode, RefreshCw, LogOut } from 'lucide-react';
import QRCode from 'react-qr-code';

const WhatsAppConnect = () => {
    const [status, setStatus] = useState('disconnected');
    const [qrData, setQrData] = useState(null);
    const [polling, setPolling] = useState(false);
    const intervalRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/whatsapp/qr');
            const data = await res.json();
            setStatus(data.status);
            setQrData(data.qr);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll every 3 seconds for QR/status updates
        intervalRef.current = setInterval(fetchStatus, 3000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const handleConnect = async () => {
        setPolling(true);
        try {
            await fetch('/api/whatsapp/connect', { method: 'POST' });
            // Wait a moment then start polling
            setTimeout(fetchStatus, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setPolling(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await fetch('/api/whatsapp/disconnect', { method: 'POST' });
            setStatus('disconnected');
            setQrData(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">WhatsApp <span className="text-brand-blue">Connection</span></h1>
                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Notification Bridge Status</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Status Bar */}
                <div className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b gap-4 ${status === 'connected' ? 'bg-yellow-50 border-yellow-100' :
                    status === 'connecting' ? 'bg-yellow-50 border-yellow-100' :
                        'bg-gray-50 border-gray-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        {status === 'connected' ? (
                            <Wifi size={20} className="text-yellow-600" />
                        ) : status === 'connecting' ? (
                            <Loader2 size={20} className="text-yellow-600 animate-spin" />
                        ) : (
                            <WifiOff size={20} className="text-gray-400" />
                        )}
                        <div>
                            <span className={`text-sm font-bold ${status === 'connected' ? 'text-yellow-700' :
                                status === 'connecting' ? 'text-yellow-700' :
                                    'text-gray-600'
                                }`}>
                                {status === 'connected' ? 'Connected' :
                                    status === 'connecting' ? 'Waiting for QR scan...' :
                                        'Disconnected'}
                            </span>
                        </div>
                    </div>

                    {status === 'connected' && (
                        <button
                            onClick={handleDisconnect}
                            className="w-full sm:w-auto text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1.5 border border-red-100 sm:border-none"
                        >
                            <LogOut size={14} />
                            Disconnect
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-8">
                    {status === 'connected' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wifi size={32} className="text-yellow-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">WhatsApp is Connected!</h3>
                            <p className="text-gray-500 text-sm">You will receive order notifications on your linked WhatsApp number.</p>
                        </div>
                    ) : qrData ? (
                        <div className="text-center">
                            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-2xl mb-6 max-w-full">
                                <QRCode value={qrData} size={200} className="max-w-full h-auto mx-auto" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Scan QR Code</h3>
                            <p className="text-gray-500 text-sm mb-1">Open WhatsApp on your phone</p>
                            <p className="text-gray-500 text-sm">Go to <strong>Settings → Linked Devices</strong></p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <QrCode size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Connect WhatsApp</h3>
                            <p className="text-gray-500 text-sm mb-6">Link your WhatsApp to start receiving order notifications.</p>
                            <button
                                onClick={handleConnect}
                                disabled={polling}
                                className="w-full sm:w-auto bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1da64e] transition-colors shadow-lg shadow-yellow-200/50 flex items-center justify-center gap-2 mx-auto disabled:opacity-60"
                            >
                                {polling ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <QrCode size={18} />
                                        Generate QR Code
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>


            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-800 mb-1">💡 How it works</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• When a customer places an order, you'll receive a WhatsApp message with full order details.</li>
                    <li>• The customer also receives an order confirmation message on their WhatsApp.</li>
                    <li>• Make sure to set <code className="bg-blue-100 px-1 rounded">OWNER_WHATSAPP</code> in your server <code className="bg-blue-100 px-1 rounded">.env</code> file.</li>
                </ul>
            </div>
        </div>
    );
};

export default WhatsAppConnect;
