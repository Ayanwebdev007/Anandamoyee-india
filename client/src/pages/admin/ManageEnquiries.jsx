import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Trash2, CheckCircle, Clock, Search, Filter, RefreshCw, X, Eye } from 'lucide-react';

const ManageEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/enquiries');
            const data = await res.json();
            if (res.ok) {
                setEnquiries(data);
            }
        } catch (error) {
            console.error('Fetch enquiries error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/enquiries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setEnquiries(enquiries.map(enq => enq._id === id ? { ...enq, status } : enq));
                if (selectedEnquiry && selectedEnquiry._id === id) {
                    setSelectedEnquiry({ ...selectedEnquiry, status });
                }
            }
        } catch (error) {
            console.error('Update status error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEnquiries(enquiries.filter(enq => enq._id !== id));
                if (selectedEnquiry && selectedEnquiry._id === id) setSelectedEnquiry(null);
            }
        } catch (error) {
            console.error('Delete enquiry error:', error);
        }
    };

    const filteredEnquiries = enquiries.filter(enq => {
        const matchesSearch =
            enq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enq.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || enq.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'read': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'replied': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Customer <span className="text-blue-600">Enquiries</span></h1>
                    <p className="text-gray-500 font-medium">Manage and respond to machinery quotations and questions.</p>
                </div>
                <button
                    onClick={fetchEnquiries}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors font-bold text-sm"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400" size={20} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm appearance-none bg-white min-w-[140px]"
                    >
                        <option value="all">All Enquiries</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                    </select>
                </div>
            </div>

            {/* Content Table / Grid */}
            {loading && enquiries.length === 0 ? (
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-20 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Enquiries...</p>
                </div>
            ) : filteredEnquiries.length === 0 ? (
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-20 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">NO ENQUIRIES FOUND</h3>
                    <p className="text-gray-500 font-medium">Try changing your search or filter keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnquiries.map((enquiry) => (
                        <div
                            key={enquiry._id}
                            className={`bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 relative group overflow-hidden ${enquiry.status === 'new' ? 'ring-2 ring-blue-500/10' : ''}`}
                        >
                            {enquiry.status === 'new' && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-bl-2xl shadow-lg">New</div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl">
                                    {enquiry.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{enquiry.name}</h3>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-sm font-black text-gray-800 uppercase tracking-tight line-clamp-1">{enquiry.subject}</p>
                                <p className="text-sm text-gray-500 font-medium line-clamp-2 italic">"{enquiry.message}"</p>
                            </div>

                            <div className="border-t border-gray-50 pt-6 flex items-center justify-between">
                                <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(enquiry.status)}`}>
                                    {enquiry.status}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setSelectedEnquiry(enquiry); handleUpdateStatus(enquiry._id, 'read'); }}
                                        className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(enquiry._id)}
                                        className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedEnquiry && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEnquiry(null)} />
                    <div className="bg-white rounded-[40px] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Enquiry Details</h2>
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">ID: {selectedEnquiry._id}</p>
                            </div>
                            <button onClick={() => setSelectedEnquiry(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Name</label>
                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                        <Clock size={16} className="text-blue-600" /> {selectedEnquiry.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</label>
                                    <div className="flex gap-2 pt-1">
                                        {['new', 'read', 'replied'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(selectedEnquiry._id, status)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedEnquiry.status === status ? getStatusStyle(status) : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
                                    <p className="font-bold text-blue-600 flex items-center gap-2 hover:underline cursor-pointer">
                                        <Mail size={16} /> {selectedEnquiry.email}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</label>
                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                        <Phone size={16} className="text-green-600" /> +91 {selectedEnquiry.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject</label>
                                    <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{selectedEnquiry.subject}</p>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Message Content</label>
                                    <p className="text-gray-600 font-medium leading-relaxed italic">"{selectedEnquiry.message}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                            <a
                                href={`mailto:${selectedEnquiry.email}`}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-center shadow-lg transition-all"
                            >
                                Reply via Email
                            </a>
                            <button
                                onClick={() => handleDelete(selectedEnquiry._id)}
                                className="px-6 bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageEnquiries;
