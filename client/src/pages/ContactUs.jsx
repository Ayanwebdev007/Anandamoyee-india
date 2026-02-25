import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter, MessageCircle, Clock, Globe } from 'lucide-react';
import contactHero from '../assets/istockphoto-1309084016-612x612.jpg';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Thank you! Your enquiry has been submitted. We will contact you shortly.' });
                setFormData({ name: '', phone: '', message: '' });
            } else {
                setStatus({ type: 'error', message: data.message || 'Something went wrong. Please try again.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to connect to the server.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-[50vh] md:h-[70vh] flex items-end overflow-hidden">
                <img
                    src={contactHero}
                    alt="Contact Hero"
                    className="absolute inset-0 w-full h-full object-cover object-center md:object-[center_15%]"
                />
                {/* Gradient overlay for text readability while keeping image visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10 pb-12 md:pb-20">
                    <div className="max-w-2xl text-left">
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white leading-[0.8]">
                            Contact <br />
                            <span className="text-primary">Us</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* Main Content: Map & Form */}
            <section className="py-20 lg:py-24 bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                        {/* Map Container - 2nd on Mobile */}
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            <div className="bg-white p-3 md:p-4 rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden h-[400px] md:h-[500px] lg:h-[650px] relative group">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3683.966023!2d88.31473597116428!3d22.60120816006892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjLCsDM2JzA0LjMiTiA4OMKwMTgnNTMuMSJF!5e0!3m2!1sen!2sin!4v1709214455642!5m2!1sen!2sin"
                                    className="w-full h-full rounded-[24px] md:rounded-[32px] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Factory Location"
                                ></iframe>

                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <div className="pointer-events-auto">
                                        <a
                                            href="https://www.google.com/maps/search/?api=1&query=22.60120816006892,88.31473597116428"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary hover:bg-yellow-400 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                                        >
                                            <MapPin size={18} />
                                            Open in Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form - 1st on Mobile */}
                        <div className="w-full lg:w-1/2 order-1 lg:order-2">
                            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-gray-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-8">
                                        Send an <span className="text-primary">Enquiry</span>
                                    </h2>

                                    {status.message && (
                                        <div className={`p-4 rounded-2xl mb-8 flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            <MessageCircle size={20} className="mt-0.5 flex-shrink-0" />
                                            <p className="text-sm font-medium">{status.message}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Your Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Giri Dhar"
                                                    required
                                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+91 9477432899"
                                                    required
                                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Your Message (Optional)</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Brief requirements..."
                                                rows="3"
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none text-sm"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-brand-blue hover:bg-black text-white py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group text-center"
                                        >
                                            {loading ? 'Submitting...' : (
                                                <>
                                                    Submit Enquiry
                                                    <Send className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" size={24} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Info Grid - Horizontal on Mobile */}
            <section className="py-20 bg-white relative z-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-6 md:grid md:grid-cols-3 md:pb-0 md:mx-0 md:px-0 md:overflow-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide">
                        {/* Address Card */}
                        <div className="flex-shrink-0 w-[85%] md:w-full bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 flex flex-col items-center text-center snap-center transform transition-transform md:hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="text-primary w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Our Factory</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Anandamoyee India<br />
                                172, V Rd, Kunjapara, Netajigarh,<br />
                                Dasnagar, Howrah, West Bengal 711105
                            </p>
                        </div>

                        {/* Contact Card */}
                        <div className="flex-shrink-0 w-[85%] md:w-full bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 flex flex-col items-center text-center snap-center transform transition-transform md:hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6">
                                <Phone className="text-brand-blue w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Direct Support</h3>
                            <p className="text-gray-500 text-sm font-bold mb-1">+91 9477432899</p>
                            <p className="text-gray-500 text-sm font-medium">prasenjitshaw68@gmail.com</p>
                        </div>

                        {/* Hours Card */}
                        <div className="flex-shrink-0 w-[85%] md:w-full bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 flex flex-col items-center text-center snap-center transform transition-transform md:hover:scale-[1.02]">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                                <Clock className="text-green-600 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Operational Hours</h3>
                            <p className="text-gray-500 text-sm font-medium mb-1">Mon - Sat: 9:00 AM - 7:00 PM</p>
                            <p className="text-gray-500 text-sm font-medium">Sunday: Closed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Connect */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-12">Connect With Us</h2>
                    <div className="flex justify-center gap-4 md:gap-8">
                        {[
                            { icon: Facebook, color: 'bg-[#1877F2]', label: 'Facebook' },
                            { icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', label: 'Instagram' },
                            { icon: Twitter, color: 'bg-[#1DA1F2]', label: 'Twitter' },
                            { icon: MessageCircle, color: 'bg-[#25D366]', label: 'WhatsApp' }
                        ].map((social, i) => (
                            <a
                                key={i}
                                href="#"
                                className={`w-14 h-14 md:w-20 md:h-20 ${social.color} text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
                                aria-label={social.label}
                            >
                                <social.icon size={24} />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
