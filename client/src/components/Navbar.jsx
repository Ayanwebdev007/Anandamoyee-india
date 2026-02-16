import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';
import wpLogo from '../assets/wp logo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* 1. Top Contact Bar */}
            <div className="bg-gray-100 py-1 text-center text-sm md:text-base border-b">
                <div className="container mx-auto px-4 flex justify-center md:justify-end gap-6 text-gray-800 font-medium overflow-x-auto scrollbar-hide">
                    <a href="tel:+917003305661" className="flex items-center gap-2 hover:text-primary transition whitespace-nowrap">
                        <Phone size={18} className="text-secondary" />
                        <span>+91 7003305661</span>
                    </a>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 transition whitespace-nowrap">
                        <img src={wpLogo} alt="WhatsApp" className="h-6 w-6 object-contain" />
                        <span>+91 9876543210</span>
                    </a>
                    <a href="mailto:contact@millexindia.com" className="hidden md:flex items-center gap-2 hover:text-primary transition whitespace-nowrap">
                        <Mail size={18} className="text-secondary" />
                        <span>contact@millexindia.com</span>
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

                        {/* Search Bar - Hidden on mobile, shown on desktop */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-auto relative">
                            <input
                                type="text"
                                placeholder="Search Products.."
                                className="w-full px-4 py-2 rounded-sm text-gray-800 focus:outline-none"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <Link to="/cart" className="relative cursor-pointer">
                                <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
                                <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
                            </Link>
                            <div className="cursor-pointer">
                                <User className="h-6 w-6 md:h-7 md:w-7" />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="mt-3 md:hidden relative">
                        <input
                            type="text"
                            placeholder="Search Products.."
                            className="w-full px-4 py-2 rounded-sm text-gray-800 focus:outline-none"
                        />
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;
