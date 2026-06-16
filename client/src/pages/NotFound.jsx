import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
            <SEO 
                title="Page Not Found" 
                noindex={true}
                description="The page you are looking for does not exist."
            />
            
            <div className="max-w-md w-full text-center">
                {/* Error Illustration / Number */}
                <div className="relative mb-8">
                    <h1 className="text-9xl font-black text-gray-200 select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-16 h-16 text-[#0400fe]" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>
                
                <p className="text-gray-500 mb-8 text-lg">
                    Oops! The page you're looking for seems to have gone missing or was moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0400fe] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Home size={20} />
                        Back to Home
                    </Link>
                    
                    <Link 
                        to="/products"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        View Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
