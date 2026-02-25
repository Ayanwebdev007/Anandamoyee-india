import React from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Facebook, Instagram, Twitter,
    MessageCircle, ArrowRight, Award, Headset, ShieldCheck,
    BadgeCheck, Package, RotateCcw, Lock
} from 'lucide-react';
import logo from '../assets/logo.png';
import mii from '../assets/mii.png';

const Footer = () => {
    const trustBenefits = [
        {
            icon: Headset,
            title: "Helpline Number",
            desc: "+91 8069641033",
            sub: "(Mon-Sun: 9am- 8pm)"
        },
        {
            icon: ShieldCheck,
            title: "Buyer Protection",
            desc: "Dedicated and reliable",
            sub: "Prioritizing buyer interests"
        },
        {
            icon: BadgeCheck,
            title: "Genuine Products",
            desc: "100% Guarantee",
            sub: "Quality you can trust"
        },
        {
            icon: Package,
            title: "Complete Products",
            desc: "5000+ Products",
            sub: "Wide range of equipment"
        },
        {
            icon: RotateCcw,
            title: "Easy Return",
            desc: "Within 7 days",
            sub: "Hassle-free process"
        },
        {
            icon: Lock,
            title: "100% Secure Payments",
            desc: "Safe & Encrypted",
            sub: "Secure payment methods"
        }
    ];

    return (
        <footer className="relative mt-auto">
            {/* Trust Benefits Section - Premium Yellow */}
            <div className="bg-primary py-12 md:py-16 border-t-8 border-black/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
                        {trustBenefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-6 group">
                                <div className="w-16 h-16 bg-black/5 rounded-[20px] flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 border border-black/5">
                                    <benefit.icon size={32} className="text-black" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-black font-black uppercase tracking-tight text-xl leading-[1.1]">{benefit.title}</h4>
                                    <p className="text-black font-bold text-lg leading-tight opacity-90">{benefit.desc}</p>
                                    <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.2em]">{benefit.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer Content - Deep Blue */}
            <div className="bg-[#02008b] text-white pt-24 pb-12 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
                        {/* Brand Section */}
                        <div className="space-y-8">
                            <Link to="/" className="inline-block hover:scale-105 transition-transform">
                                <img src={logo} alt="Anandamoyee India" className="h-20 md:h-24 w-auto" />
                            </Link>
                            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
                                Leading the way in rice mill machinery innovation. We empower farmers and millers with state-of-the-art technology for a sustainable future.
                            </p>
                            <div className="flex items-center gap-5">
                                {[
                                    { icon: Facebook, color: 'hover:bg-[#1877F2]' },
                                    { icon: Instagram, color: 'hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
                                    { icon: Twitter, color: 'hover:bg-[#1DA1F2]' },
                                    { icon: MessageCircle, color: 'hover:bg-[#25D366]' }
                                ].map((social, i) => (
                                    <a key={i} href="#" className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 transition-all duration-300 ${social.color} hover:text-white hover:scale-110 shadow-lg`}>
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Navigation */}
                        <div className="lg:pl-8">
                            <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-primary"></span>
                                Explore
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'About Us', path: '/about' },
                                    { name: 'Contact Us', path: '/contact' },
                                ].map((link, i) => (
                                    <li key={i}>
                                        <Link
                                            to={link.path}
                                            className="text-white/60 hover:text-primary transition-all duration-300 flex items-center gap-2 group text-sm font-bold uppercase tracking-wider"
                                        >
                                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Make In India Section */}
                        <div className="flex flex-col items-start">
                            <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-primary"></span>
                                Pride
                            </h3>
                            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-primary/30 transition-all duration-500">
                                <img
                                    src={mii}
                                    alt="Make in India"
                                    className="w-full max-w-[180px] h-auto object-contain brightness-110 contrast-110 hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <p className="mt-4 text-white/40 text-[10px] uppercase font-black tracking-widest leading-loose">
                                Empowering India through<br />Indigenous Engineering
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-primary"></span>
                                Location
                            </h3>
                            <div className="space-y-8">
                                <div className="flex gap-5">
                                    <MapPin className="text-primary flex-shrink-0 mt-1" size={22} />
                                    <address className="text-white/70 text-sm font-medium leading-relaxed not-italic">
                                        172, V Rd, Kunjapara, Netajigarh,<br />
                                        Dasnagar, Howrah, West Bengal 711105
                                    </address>
                                </div>
                                <div className="flex gap-5">
                                    <Phone className="text-primary flex-shrink-0" size={22} />
                                    <div className="text-sm font-black">
                                        <a href="tel:+919477432899" className="hover:text-primary transition-colors tracking-tight">+91 9477432899</a>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <Mail className="text-primary flex-shrink-0" size={22} />
                                    <div className="text-sm font-black">
                                        <a href="mailto:prasenjitshaw68@gmail.com" className="hover:text-primary transition-colors tracking-tight">prasenjitshaw68@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="space-y-2">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">
                                &copy; {new Date().getFullYear()} <span className="text-white">Anandamoyee India</span>. All Rights Reserved.
                            </p>
                            <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.1em]">Engineered with Excellence in India</p>
                        </div>
                        <div className="flex gap-10">
                            <a href="#" className="text-white/30 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">Privacy Policy</a>
                            <a href="#" className="text-white/30 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">Terms of Service</a>
                        </div>
                    </div>
                </div>

                {/* Advanced Background Accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full filter blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/40 rounded-full filter blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none"></div>
            </div>
        </footer>
    );
};

export default Footer;
