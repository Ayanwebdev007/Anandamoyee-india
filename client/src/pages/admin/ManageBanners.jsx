import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Loader2, X, Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';

const ManageBanners = () => {
    const [banners, setBanners] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        altText: '',
        link: ''
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingBanner, setEditingBanner] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64String })
                });
                const result = await res.json();
                if (res.ok) {
                    setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
                }
            } catch (err) {
                console.error('Upload failed:', err);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/banners');
            const data = await res.json();
            setBanners(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.imageUrl) return;

        const url = editingBanner
            ? `/api/banners/${editingBanner._id}`
            : '/api/banners';
        const method = editingBanner ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', imageUrl: '', altText: '', link: '' });
                setEditingBanner(null);
                fetchBanners();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            imageUrl: banner.imageUrl,
            altText: banner.altText || '',
            link: banner.link || ''
        });
        setShowModal(true);
    };

    const openAdd = () => {
        setEditingBanner(null);
        setFormData({ title: '', imageUrl: '', altText: '', link: '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await fetch(`/api/banners/${id}`, { method: 'DELETE' });
            fetchBanners();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Banners</h1>
                    <p className="text-gray-500 text-sm">Update your homepage banners dynamically.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-[#0400fe] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#FFD700] hover:text-[#0400fe] transition-colors duration-300 flex items-center gap-2 shadow-md shadow-blue-200/50"
                >
                    <Plus size={20} />
                    Add Banner
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin inline-block text-brand-blue mb-2" size={32} />
                        <p className="text-gray-500">Loading banners...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No banners found</h3>
                        <p className="text-gray-500">Add your first banner to display on the homepage.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Link</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {banners.map((banner) => (
                                <tr key={banner._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-16 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                                            {banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={18} className="text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{banner.title}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm truncate max-w-xs">{banner.link || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(banner._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
                    <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Title <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Summer Sale"
                                            className="w-full rounded-lg border-gray-300 border py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image <span className="text-red-500">*</span></label>
                                    <div className="flex flex-col gap-4">
                                        <div className="w-full h-40 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center relative group">
                                            {formData.imageUrl ? (
                                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <ImageIcon size={32} />
                                                    <span className="text-xs">No image selected</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="banner-image-upload"
                                            />
                                            <label
                                                htmlFor="banner-image-upload"
                                                className={`w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="animate-spin mr-2" size={16} />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <ImageIcon size={16} />
                                                        Choose an Image
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text</label>
                                    <input
                                        type="text"
                                        name="altText"
                                        value={formData.altText}
                                        onChange={handleChange}
                                        placeholder="e.g. Discount on Rice Mills"
                                        className="w-full rounded-lg border-gray-300 border py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Descriptive text for accessibility.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Link (Optional)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="link"
                                            value={formData.link}
                                            onChange={handleChange}
                                            placeholder="e.g. /products?category=rice-mill"
                                            className="w-full rounded-lg border-gray-300 border py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-[#0400fe] text-white py-3 rounded-xl font-bold hover:bg-[#FFD700] hover:text-[#0400fe] transition-colors duration-300 shadow-lg shadow-blue-900/20 active:scale-[0.99] transform mt-4">
                                    {editingBanner ? 'Update Banner' : 'Add Banner'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBanners;
