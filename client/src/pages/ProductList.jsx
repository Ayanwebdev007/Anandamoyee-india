import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

const mockProducts = [
    { id: 1, name: "Rice Mill Screen 1mm", price: 1200, category: "Spare Parts", image: "Screen 1" },
    { id: 2, name: "6N40 Rice Polisher", price: 45000, category: "Rice Mill Machines", image: "Polisher" },
    { id: 3, name: "Heavy Duty Pulverizer", price: 28000, category: "Pulverizer Machines", image: "Pulverizer" },
    { id: 4, name: "Chaff Cutter Blade set", price: 850, category: "Spare Parts", image: "Blade" },
    { id: 5, name: "Digital Paddy Thresher", price: 62000, category: "Paddy Thresher", image: "Thresher" },
    { id: 6, name: "Rubber Roll 10 inch", price: 4200, category: "Spare Parts", image: "Rubber Roll" },
];

const categories = ['All', 'Rice Mill Machines', 'Flour Mill Machines', 'Pulverizer Machines', 'Spare Parts'];

const ProductList = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = selectedCategory === 'All'
        ? mockProducts
        : mockProducts.filter(p => p.category === selectedCategory);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Filter className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg">Filters</h3>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 text-gray-700">Categories</h4>
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <li key={cat}>
                                        <label className="flex items-center gap-2 cursor-pointer hover:text-primary">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-primary' : 'text-gray-600'}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 text-gray-700">Price Range</h4>
                            <div className="flex bg-gray-100 rounded-md p-2">
                                <span className="text-xs text-gray-500">Range slider placeholder</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedCategory} Products</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Sort by:</span>
                            <select className="border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                                <option>Newest</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden">
                                {/* Image Placeholder */}
                                <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                    <div className="text-gray-400 group-hover:scale-110 transition duration-500">{product.image}</div>
                                    <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:bg-primary hover:text-white transition">
                                        <span className="sr-only">Quick View</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    </button>
                                </div>

                                <div className="p-4">
                                    <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                                    <h3 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                                        <button className="bg-primary text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 transition">
                                            ADD TO CART
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductList;
