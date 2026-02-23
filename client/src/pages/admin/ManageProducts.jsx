import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Loader2, X, Search, Filter, Image as ImageIcon } from 'lucide-react';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingExtra, setUploadingExtra] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const emptyForm = {
        name: '', price: '', originalPrice: '', category: '', image: '',
        description: '', modelNumber: '', warranty: '',
        specifications: [], features: [], images: []
    };

    const [formData, setFormData] = useState(emptyForm);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                setFormData({ ...formData, image: result.imageUrl });
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleExtraImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingExtra(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                setFormData({ ...formData, images: [...formData.images, result.imageUrl] });
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploadingExtra(false);
        }
    };

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories')
            ]);
            const prods = await prodRes.json();
            const cats = await catRes.json();
            setProducts(prods);
            setCategories(cats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingProduct
            ? `/api/products/${editingProduct._id}`
            : '/api/products';
        const method = editingProduct ? 'PUT' : 'POST';

        // Clean up empty specs and features
        const cleanData = {
            ...formData,
            specifications: formData.specifications.filter(s => s.label.trim() && s.value.trim()),
            features: formData.features.filter(f => f.trim()),
            images: formData.images.filter(img => img.trim())
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanData)
            });
            if (res.ok) {
                setShowModal(false);
                setEditingProduct(null);
                setFormData(emptyForm);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || '',
            category: product.category,
            image: product.image,
            description: product.description || '',
            modelNumber: product.modelNumber || '',
            warranty: product.warranty || '',
            specifications: product.specifications || [],
            features: product.features || [],
            images: product.images || []
        });
        setShowModal(true);
    };

    // Specs helpers
    const addSpec = () => setFormData({ ...formData, specifications: [...formData.specifications, { label: '', value: '' }] });
    const updateSpec = (index, field, val) => {
        const specs = [...formData.specifications];
        specs[index][field] = val;
        setFormData({ ...formData, specifications: specs });
    };
    const removeSpec = (index) => setFormData({ ...formData, specifications: formData.specifications.filter((_, i) => i !== index) });

    // Features helpers
    const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
    const updateFeature = (index, val) => {
        const feats = [...formData.features];
        feats[index] = val;
        setFormData({ ...formData, features: feats });
    };
    const removeFeature = (index) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });

    // Extra images helpers
    const removeExtraImage = (index) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
                    <p className="text-gray-500 text-sm">Add, edit, or remove products from your catalog.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData(emptyForm);
                        setShowModal(true);
                    }}
                    className="bg-[#0400fe] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#FFD700] hover:text-[#0400fe] transition-colors duration-300 flex items-center gap-2 shadow-md shadow-blue-200/50"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full md:w-48 py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-700 bg-transparent"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin inline-block text-brand-blue mb-2" size={32} />
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{product.name}</p>
                                                    {product.modelNumber && (
                                                        <span className="text-xs text-gray-400">Model: {product.modelNumber}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">₹{Number(product.price).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-2xl w-full max-w-3xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* === BASIC INFO === */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Basic Info</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                            <input
                                                required type="text" value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                placeholder="e.g. Premium Rice Huller"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
                                                <input
                                                    required type="number" value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price (₹) <span className="font-normal text-gray-400">(Optional)</span></label>
                                                <input
                                                    type="number" value={formData.originalPrice}
                                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Model Number <span className="font-normal text-gray-400">(Optional)</span></label>
                                                <input
                                                    type="text" value={formData.modelNumber}
                                                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                    placeholder="e.g. AM-6N40"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                                <select
                                                    required value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Warranty <span className="font-normal text-gray-400">(Optional)</span></label>
                                                <input
                                                    type="text" value={formData.warranty}
                                                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                    placeholder="e.g. 1 Year Manufacturing Warranty"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* === DESCRIPTION === */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Description</h3>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all resize-none"
                                        placeholder="Write a detailed description about this product..."
                                    />
                                </div>

                                {/* === IMAGES === */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Images</h3>
                                    <div className="space-y-4">
                                        {/* Primary Image */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Image</label>
                                            <div className="flex items-start gap-4">
                                                <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                                    {formData.image ? (
                                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300" size={32} />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="relative">
                                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="product-image-upload" />
                                                        <label
                                                            htmlFor="product-image-upload"
                                                            className={`w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {uploading ? (<><Loader2 className="animate-spin mr-2" size={16} /> Uploading...</>) : ('Choose from Device')}
                                                        </label>
                                                    </div>
                                                    <input
                                                        type="text" placeholder="Or paste image URL" value={formData.image}
                                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                        className="w-full rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Images */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images <span className="font-normal text-gray-400">(Optional)</span></label>
                                            {formData.images.length > 0 && (
                                                <div className="flex flex-wrap gap-3 mb-3">
                                                    {formData.images.map((img, i) => (
                                                        <div key={i} className="relative group">
                                                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                                <img src={img} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                                                            </div>
                                                            <button
                                                                type="button" onClick={() => removeExtraImage(i)}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="relative">
                                                <input type="file" accept="image/*" onChange={handleExtraImageUpload} className="hidden" id="extra-image-upload" />
                                                <label
                                                    htmlFor="extra-image-upload"
                                                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors ${uploadingExtra ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {uploadingExtra ? (<><Loader2 className="animate-spin" size={14} /> Uploading...</>) : (<><Plus size={14} /> Add Image</>)}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* === SPECIFICATIONS === */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Specifications <span className="font-normal text-gray-400 normal-case">(Optional)</span></h3>
                                    <div className="space-y-2">
                                        {formData.specifications.map((spec, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type="text" value={spec.label}
                                                    onChange={(e) => updateSpec(i, 'label', e.target.value)}
                                                    placeholder="Label (e.g. Weight)"
                                                    className="flex-1 rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                />
                                                <input
                                                    type="text" value={spec.value}
                                                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                                                    placeholder="Value (e.g. 50kg)"
                                                    className="flex-1 rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                />
                                                <button type="button" onClick={() => removeSpec(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button" onClick={addSpec}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                        >
                                            <Plus size={14} /> Add Specification
                                        </button>
                                    </div>
                                </div>

                                {/* === FEATURES === */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Features <span className="font-normal text-gray-400 normal-case">(Optional)</span></h3>
                                    <div className="space-y-2">
                                        {formData.features.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type="text" value={feat}
                                                    onChange={(e) => updateFeature(i, e.target.value)}
                                                    placeholder="e.g. Heavy duty cast iron body"
                                                    className="flex-1 rounded-lg border-gray-300 border py-2 px-3 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                />
                                                <button type="button" onClick={() => removeFeature(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button" onClick={addFeature}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                        >
                                            <Plus size={14} /> Add Feature
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-[#0400fe] text-white py-3.5 rounded-xl font-bold hover:bg-[#FFD700] hover:text-[#0400fe] transition-colors duration-300 shadow-lg shadow-blue-900/20 active:scale-[0.99] transform">
                                        {editingProduct ? 'Update Product' : 'Save Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
