import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Filter,
    ChevronDown,
    Loader2,
    ArrowRight,
    Search,
    RotateCcw,
    X,
    SlidersHorizontal,
    LayoutGrid,
    ChevronRight,
    SearchX,
    ArrowUpDown
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null); // 'filter', 'sort', or null
    const [error, setError] = useState(null);

    // Filters & Sorting State
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prodRes, catRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);

                if (!prodRes.ok || !catRes.ok) throw new Error('Failed to fetch data');

                const prods = await prodRes.json();
                const cats = await catRes.json();

                setProducts(prods.map(p => ({ ...p, id: p._id })));
                setCategories(cats);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Sync state with URL params when they change
    useEffect(() => {
        setSelectedCategory(searchParams.get('category') || 'All');
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const resetFilters = () => {
        setSearchParams({ category: 'All' });
        setActiveDropdown(null);
    };

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const currentCategoryData = categories.find(c => c.name === selectedCategory);

    // Advanced Filtering Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // 1. Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // 3. Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        // 4. Sorting
        result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            // Default: newest first (assuming _id or createdAt)
            return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
        });

        return result;
    }, [products, selectedCategory, searchQuery, sortBy]);

    const SkeletonCard = () => (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="hidden sm:block h-4 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-gray-200 rounded w-1/4" />
                    <div className="h-9 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20" onClick={() => setActiveDropdown(null)}>
            {/* 1. Category Header (Blue Section) - Compact & Premium */}
            <div className="bg-[#0400fe] py-8 px-4 text-center">
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
                    {selectedCategory === 'All' ? 'Our Collection' : selectedCategory}
                </h1>
                <div className="h-1 w-16 bg-[#FFD700] mx-auto mt-3 rounded-full opacity-90" />
            </div>

            {/* 2. Banner Section - Clean & Premium */}
            {currentCategoryData?.banner && (
                <div className="w-full relative overflow-hidden">
                    <img
                        src={currentCategoryData.banner}
                        alt={selectedCategory}
                        className="w-full h-auto max-h-[350px] md:max-h-[450px] object-cover"
                    />
                </div>
            )}

            <div className="container mx-auto px-4 mt-10">
                {/* 3. Filter & Sort Bar (Home Style) */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {/* Sort Dropdown */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => toggleDropdown('sort')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-700 border border-gray-200 hover:border-[#0400fe] transition-all font-bold text-sm shadow-sm"
                            >
                                <ArrowUpDown size={16} />
                                <span>Sort Products</span>
                            </button>

                            {activeDropdown === 'sort' && (
                                <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2">
                                        {[
                                            { label: 'Newest First', value: 'newest' },
                                            { label: 'Price: Low to High', value: 'price-low' },
                                            { label: 'Price: High to Low', value: 'price-high' }
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => {
                                                    setSortBy(item.value);
                                                    setActiveDropdown(null);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1 last:mb-0 ${sortBy === item.value
                                                    ? 'bg-blue-50 text-[#0400fe]'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:block">
                        <span className="text-sm text-gray-400 font-medium bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            Showing <span className="text-[#0400fe] font-black">{filteredProducts.length}</span> products
                        </span>
                    </div>
                </div>

                {/* Active Filter Chips (Only Search) */}
                {searchQuery && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold text-[#0400fe] shadow-sm">
                            Search: "{searchQuery}"
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(window.location.search);
                                    params.delete('search');
                                    setSearchParams(params);
                                }}
                                className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 p-12 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <RotateCcw size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h3>
                        <p className="text-red-700 mb-6 text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white p-12 md:p-20 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <SearchX size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">We couldn't find any products matching your current filters. Try adjusting them.</p>
                        <button
                            onClick={resetFilters}
                            className="inline-flex items-center gap-2 bg-[#0400fe] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-200"
                        >
                            <RotateCcw size={18} /> Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
