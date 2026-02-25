import React from 'react';
import { Phone } from 'lucide-react';
import wpLogoWhite from '../assets/wp logo white.png';

const StickyContact = () => {
    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
            {/* WhatsApp Button */}
            <a
                href="https://wa.me/919051430698"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center h-12 w-12 md:h-14 md:w-14"
                aria-label="Chat on WhatsApp"
            >
                <img src={wpLogoWhite} alt="WhatsApp" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            </a>

            {/* Call Button */}
            <a
                href="tel:+919477432899"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center h-12 w-12 md:h-14 md:w-14"
                aria-label="Call Now"
            >
                <Phone className="h-6 w-6 md:h-8 md:w-8" />
            </a>
        </div>
    );
};

export default StickyContact;
