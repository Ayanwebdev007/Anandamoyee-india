import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const productId = product.id || product._id;
    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group h-full flex flex-col">
            <Link to={`/product/${productId}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <img
                    src={product.image || "https://placehold.co/400x400/png?text=Product"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-[#f70302] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {discount}% OFF
                    </div>
                )}
            </Link>
            <div className="p-3 flex-1 flex flex-col">
                <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">
                        {product.category}
                    </span>
                    <Link to={`/product/${productId}`}>
                        <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-[#0400fe] transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto pt-2">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#1a1a1a] font-black text-lg">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                    </div>
                    <Link
                        to={`/product/${productId}`}
                        className="py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2 w-full text-xs font-bold bg-[#0400fe] hover:bg-blue-800 text-white active:scale-95 shadow-blue-100"
                    >
                        ORDER NOW <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
