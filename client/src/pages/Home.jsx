import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ArrowUpDown, X, Loader2 } from 'lucide-react';

const Home = () => {
    const [activeDropdown, setActiveDropdown] = useState(null); // 'filter', 'sort', or null
    const [visibleCount, setVisibleCount] = useState(8); // Start with 8 products
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Featured');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes, banRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories'),
                    fetch('/api/banners')
                ]);
                const prods = await prodRes.json();
                const cats = await catRes.json();
                const bans = await banRes.json();

                // Map _id to id for consistency
                const mappedProds = prods.map(p => ({ ...p, id: p._id }));

                setAllProducts(mappedProds);
                setCategories(cats);
                setBanners(bans);
            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 4);
    };

    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // Apply Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Apply Sorting
        if (sortBy === 'Price: Low to High') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Newest First') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [allProducts, selectedCategory, sortBy]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Loading your catalog...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6" onClick={() => setActiveDropdown(null)}>
            {/* 1. Categories (Mobile: Top Slider, Desktop: Below Banners) */}


            {/* 2. Banners */}
            <section className="mb-10">
                {banners.length > 0 ? (
                    <>
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
                                {banners.map((banner) => (
                                    <swiper-slide key={banner._id}>
                                        <div className="rounded-lg shadow-md overflow-hidden h-48 relative bg-gray-200">
                                            {banner.link ? (
                                                <Link to={banner.link}>
                                                    <img
                                                        src={banner.imageUrl}
                                                        alt={banner.altText || banner.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </Link>
                                            ) : (
                                                <img
                                                    src={banner.imageUrl}
                                                    alt={banner.altText || banner.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </swiper-slide>
                                ))}
                            </swiper-container>
                        </div>

                        {/* Desktop View: Grid (First 2 banners or more logic if needed) */}
                        <div className="hidden md:grid grid-cols-2 gap-4">
                            {banners.slice(0, 2).map((banner) => (
                                <div key={banner._id} className="rounded-lg shadow-md overflow-hidden h-64 relative bg-gray-200 group">
                                    {banner.link ? (
                                        <Link to={banner.link} className="block h-full w-full">
                                            <img
                                                src={banner.imageUrl}
                                                alt={banner.altText || banner.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </Link>
                                    ) : (
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.altText || banner.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                </div>
                            ))}
                            {/* If only 1 banner, maybe make it full width? For now keeping grid logic consistent with previous design which assumed 2 */}
                            {banners.length === 1 && (
                                <div className="rounded-lg shadow-md overflow-hidden h-64 relative bg-gray-100 flex items-center justify-center">
                                    <p className="text-gray-400 font-medium">Coming Soon</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Fallback/Placeholder if no banners exist
                    <>
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
                                            src="https://placehold.co/600x400/BF1E2E/FFFFFF?text=Delivery+Banner+(Default)"
                                            alt="Delivery Banner"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </swiper-slide>
                                <swiper-slide>
                                    <div className="rounded-lg shadow-md overflow-hidden h-48 relative bg-gray-200">
                                        <img
                                            src="https://placehold.co/600x400/800080/FFFFFF?text=Product+Banner+(Default)"
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
                                    src="https://placehold.co/600x400/BF1E2E/FFFFFF?text=Delivery+Banner+(Default)"
                                    alt="Delivery Banner"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="rounded-lg shadow-md overflow-hidden h-64 relative bg-gray-200">
                                <img
                                    src="https://placehold.co/600x400/800080/FFFFFF?text=Product+Banner+(Default)"
                                    alt="Product Banner"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* 3. Product Categories - Horizontal Scroll */}
            <section className="mb-10 overflow-hidden">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">Our Categories</h2>
                <div className="flex overflow-x-auto scrollbar-hide pb-4 gap-6 md:gap-10 snap-x snap-mandatory px-4 -mx-4">
                    {categories.map((cat, index) => (
                        <Link
                            to={`/products?category=${cat.name}`}
                            key={index}
                            className="flex flex-col items-center group cursor-pointer flex-shrink-0 snap-center min-w-[90px] md:min-w-[140px] transform transition-all duration-300 hover:scale-105"
                        >
                            <div className="h-20 w-20 md:h-32 md:w-32 bg-white rounded-full border border-gray-100 flex items-center justify-center mb-3 md:mb-4 shadow-sm overflow-hidden group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <span className="text-xl md:text-3xl font-bold text-primary">{cat.name.charAt(0)}</span>
                                )}
                            </div>
                            <span className="text-[10px] md:text-sm font-bold text-gray-800 text-center leading-tight group-hover:text-primary transition-colors max-w-[80px] md:max-w-none">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mb-10">
                <div className="sticky top-[100px] md:top-[82px] z-40 bg-gray-50 py-4 mb-4 flex items-center justify-between -mx-4 px-4 shadow-sm md:shadow-none">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l-4 border-primary pl-3">
                        {selectedCategory === 'All' ? 'Featured Products' : selectedCategory}
                    </h2>

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
                                        <li
                                            onClick={() => { setSelectedCategory('All'); setActiveDropdown(null); }}
                                            className={`px-2 py-1.5 rounded cursor-pointer text-sm font-medium transition ${selectedCategory === 'All' ? 'bg-yellow-100 text-black' : 'text-gray-700 hover:bg-yellow-50'}`}
                                        >
                                            All Categories
                                        </li>
                                        {categories.map((cat) => (
                                            <li
                                                key={cat._id}
                                                onClick={() => { setSelectedCategory(cat.name); setActiveDropdown(null); }}
                                                className={`px-2 py-1.5 rounded cursor-pointer text-sm font-medium transition ${selectedCategory === cat.name ? 'bg-yellow-100 text-black' : 'text-gray-700 hover:bg-yellow-50'}`}
                                            >
                                                {cat.name}
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
                                            <li
                                                key={opt}
                                                onClick={() => { setSortBy(opt); setActiveDropdown(null); }}
                                                className={`px-2 py-1.5 rounded cursor-pointer text-sm font-medium transition ${sortBy === opt ? 'bg-yellow-100 text-black' : 'text-gray-700 hover:bg-yellow-50'}`}
                                            >
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
                    {filteredProducts.slice(0, visibleCount).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {visibleCount < filteredProducts.length && (
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
