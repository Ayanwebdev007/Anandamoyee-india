import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ArrowUpDown, X } from 'lucide-react';

const Home = () => {
    const [activeDropdown, setActiveDropdown] = useState(null); // 'filter', 'sort', or null
    const [visibleCount, setVisibleCount] = useState(8); // Start with 8 products

    // Expanded dummy data (24 items to simulate more products)
    const allProducts = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        name: `Heavy Duty Rice Mill Machine Model ${i + 1}00X`,
        category: i % 3 === 0 ? "Rice Mill" : i % 3 === 1 ? "Flour Mill" : "Spares",
        price: 15000 + (i * 500),
        originalPrice: 18000 + (i * 500),
        image: null
    }));

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 4);
    };

    return (
        <div className="container mx-auto px-4 py-6" onClick={() => setActiveDropdown(null)}>
            {/* 1. Categories (Mobile: Top Slider, Desktop: Below Banners) */}

            {/* Mobile Categories Slider */}
            <div className="md:hidden mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-primary pl-2">Categories</h2>
                <swiper-container
                    slides-per-view="4"
                    space-between="10"
                    free-mode="true"
                >
                    {['Rice Mill', 'Flour Mill', 'Pulverizer', 'Chaff Cutter', 'Thresher', 'Spare Parts'].map((item, index) => (
                        <swiper-slide key={index}>
                            <Link to="/products" className="flex flex-col items-center">
                                <div className="h-16 w-16 bg-white rounded-full border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                                    <span className="text-[10px] text-gray-500">Image</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-800 text-center leading-tight">{item}</span>
                            </Link>
                        </swiper-slide>
                    ))}
                </swiper-container>
            </div>

            {/* 2. Banners */}
            <section className="mb-10">
                {/* Mobile View: Carousel */}
                <div className="md:hidden">
                    <swiper-container
                        slides-per-view="1"
                        speed="500"
                        loop="true"
                        css-mode="true"
                        autoplay-delay="2000"
                        autoplay-disable-on-interaction="false"
                    >
                        <swiper-slide>
                            <div className="rounded-lg shadow-md overflow-hidden h-48 relative bg-gray-200">
                                <img
                                    src="https://placehold.co/600x400/BF1E2E/FFFFFF?text=Delivery+Banner+(Admin+Panel)"
                                    alt="Delivery Banner"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </swiper-slide>
                        <swiper-slide>
                            <div className="rounded-lg shadow-md overflow-hidden h-48 relative bg-gray-200">
                                <img
                                    src="https://placehold.co/600x400/800080/FFFFFF?text=Product+Banner+(Admin+Panel)"
                                    alt="Product Banner"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </swiper-slide>
                    </swiper-container>
                </div>

                {/* Desktop View: Grid */}
                <div className="hidden md:grid grid-cols-2 gap-4">
                    <div className="rounded-lg shadow-md overflow-hidden h-64 relative bg-gray-200">
                        <img
                            src="https://placehold.co/600x400/BF1E2E/FFFFFF?text=Delivery+Banner+(Admin+Panel)"
                            alt="Delivery Banner"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="rounded-lg shadow-md overflow-hidden h-64 relative bg-gray-200">
                        <img
                            src="https://placehold.co/600x400/800080/FFFFFF?text=Product+Banner+(Admin+Panel)"
                            alt="Product Banner"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Product Categories (Desktop Only) */}
            <section className="hidden md:block">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">Our Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {['Rice Mill Machines', 'Flour Mill Machines', 'Pulverizer Machines', 'Chaff Cutter Machines', 'Paddy Thresher', 'Spare Parts'].map((item, index) => (
                        <Link to="/products" key={index} className="bg-gray-200 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition group">
                            <div className="h-24 w-full bg-white rounded mb-3 flex items-center justify-center group-hover:scale-105 transition">
                                <span className="text-xs text-gray-500">Image</span>
                            </div>
                            <h4 className="font-bold text-gray-800 text-center text-sm leading-tight">{item}</h4>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 5. Product Listing Section */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l-4 border-primary pl-3">Featured Products</h2>

                    {/* Filters & Sorting Icons */}
                    <div className="flex gap-4 relative">
                        {/* Filter Button */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => toggleDropdown('filter')}
                                className="flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition"
                            >
                                <Filter size={16} />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                            {/* Filter Dropdown */}
                            {activeDropdown === 'filter' && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-2">
                                    <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b">
                                        <span className="font-bold text-xs uppercase text-gray-500">Categories</span>
                                        <X size={14} className="cursor-pointer" onClick={() => setActiveDropdown(null)} />
                                    </div>
                                    <ul className="space-y-1">
                                        {['All Categories', 'Rice Mill', 'Flour Mill', 'Spares', 'Motors'].map((cat) => (
                                            <li key={cat} className="px-2 py-1.5 hover:bg-yellow-50 rounded cursor-pointer text-sm text-gray-700">
                                                {cat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sort Button */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => toggleDropdown('sort')}
                                className="flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition"
                            >
                                <ArrowUpDown size={16} />
                                <span className="hidden sm:inline">Sort</span>
                            </button>
                            {/* Sort Dropdown */}
                            {activeDropdown === 'sort' && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-2">
                                    <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b">
                                        <span className="font-bold text-xs uppercase text-gray-500">Sort By</span>
                                        <X size={14} className="cursor-pointer" onClick={() => setActiveDropdown(null)} />
                                    </div>
                                    <ul className="space-y-1">
                                        {['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest First'].map((opt) => (
                                            <li key={opt} className="px-2 py-1.5 hover:bg-yellow-50 rounded cursor-pointer text-sm text-gray-700">
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {/* Display products based on visibleCount */}
                    {allProducts.slice(0, visibleCount).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {visibleCount < allProducts.length && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={loadMore}
                            className="inline-block border-2 border-primary bg-primary text-black font-bold py-2 px-10 rounded-full hover:bg-yellow-400 hover:scale-105 transition uppercase text-sm tracking-wider shadow-sm"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
