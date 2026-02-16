import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={product.image || "https://placehold.co/400x400/png?text=Product"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
            </Link>
            <div className="p-3">
                <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{product.category}</span>
                    <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight min-h-[2.5em]">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-1 flex flex-col gap-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-primary font-bold text-lg">₹{product.price}</span>
                        <span className="text-xs text-[#f70302] line-through">₹{product.originalPrice}</span>
                    </div>
                    <button className="bg-[#0400fe] hover:bg-blue-800 text-white py-2 rounded-sm transition shadow-sm flex items-center justify-center gap-2 w-full text-sm font-bold active:scale-95">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
