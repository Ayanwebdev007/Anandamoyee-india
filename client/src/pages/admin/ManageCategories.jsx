import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Loader2, X, Image as ImageIcon } from 'lucide-react';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [CategoryImage, setCategoryImage] = useState('');
    const [CategoryBanner, setCategoryBanner] = useState('');
    const [uploading, setUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleFileUpload = async (e, type = 'image') => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'image') setUploading(true);
        else setBannerUploading(true);

        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                if (type === 'image') setCategoryImage(result.imageUrl);
                else setCategoryBanner(result.imageUrl);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            if (type === 'image') setUploading(false);
            else setBannerUploading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        const url = editingCategory
            ? `/api/categories/${editingCategory._id}`
            : '/api/categories';
        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategory,
                    image: CategoryImage,
                    banner: CategoryBanner
                })
            });
            if (res.ok) {
                setShowModal(false);
                setNewCategory('');
                setCategoryImage('');
                setCategoryBanner('');
                setEditingCategory(null);
                fetchCategories();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (cat) => {
        setEditingCategory(cat);
        setNewCategory(cat.name);
        setCategoryImage(cat.image || '');
        setCategoryBanner(cat.banner || '');
        setShowModal(true);
    };

    const openAdd = () => {
        setEditingCategory(null);
        setNewCategory('');
        setCategoryImage('');
        setCategoryBanner('');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
                    <p className="text-gray-500 text-sm">Organize your products into categories.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-[#0400fe] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#FFD700] hover:text-[#0400fe] transition-colors duration-300 flex items-center gap-2 shadow-md shadow-blue-200/50"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin inline-block text-brand-blue mb-2" size={32} />
                        <p className="text-gray-500">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No categories found</h3>
                        <p className="text-gray-500">Create your first category to get started.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{category.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                                            {category.image ? (
                                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={18} className="text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(category._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="e.g. Rice Mill Machines"
                                        className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image (Icon)</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                            {CategoryImage ? (
                                                <img src={CategoryImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-gray-300" size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'image')}
                                                    className="hidden"
                                                    id="category-image-upload"
                                                />
                                                <label
                                                    htmlFor="category-image-upload"
                                                    className={`w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Choose Icon'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category Banner (Page Top)</label>
                                    <div className="space-y-3">
                                        <div className="w-full aspect-[3/1] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                            {CategoryBanner ? (
                                                <img src={CategoryBanner} alt="Banner Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="text-gray-300 mx-auto mb-1" size={24} />
                                                    <span className="text-[10px] text-gray-400">Banner Recommendation: 1200x400</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'banner')}
                                                className="hidden"
                                                id="category-banner-upload"
                                            />
                                            <label
                                                htmlFor="category-banner-upload"
                                                className={`w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors ${bannerUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {bannerUploading ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Choose Banner'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-[#FFD700] hover:text-[#0400fe] transition-colors duration-300 shadow-lg shadow-blue-900/20 active:scale-[0.99] transform">
                                    {editingCategory ? 'Update Category' : 'Add Category'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
