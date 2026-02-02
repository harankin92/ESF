import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import RequestCard from '../components/requests/RequestCard';
import {
    ArrowLeft,
    Building2,
    Globe,
    MapPin,
    User,
    Calendar,
    Plus,
    Edit3,
    Trash2
} from 'lucide-react';

const LeadDetail = ({ leadId, onBack, onOpenRequest, onCreateRequest, onEdit, onDelete }) => {
    const { user } = useAuth();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const canEdit = () => {
        if (!lead) return false;
        if (user?.role === 'Admin') return true;
        if (user?.role === 'Sale' && lead.created_by === user?.id) return true;
        return false;
    };

    const loadLead = async () => {
        try {
            const data = await api.getLead(leadId);
            setLead(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLead();
    }, [leadId]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try {
            await api.deleteLead(leadId);
            onBack();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;
        try {
            await api.deleteRequest(id);
            setLead(prev => ({
                ...prev,
                requests: prev.requests.filter(r => r.id !== id)
            }));
        } catch (err) {
            alert('Failed to delete request: ' + err.message);
        }
    };

    const getSourceColor = (source) => {
        const colors = {
            'Upwork': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'LinkedIn': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'Website': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'Referral': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'Other': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        };
        return colors[source] || colors['Other'];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Lead not found'}</p>
                    <button onClick={onBack} className="text-indigo-600 hover:underline">Go back</button>
                </div>
            </div>
        );
    }

    const isSale = user?.role === 'Sale' || user?.role === 'Admin';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    {lead.client_name}
                                </h1>
                                {lead.source && (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSourceColor(lead.source)}`}>
                                        {lead.source}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {lead.company || 'No company'} • {lead.requests?.length || 0} request(s)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canEdit() && (
                            <>
                                <button
                                    onClick={() => onEdit?.(lead)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Edit Lead"
                                >
                                    <Edit3 size={18} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Lead"
                                >
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Client Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Client Info
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Building2 size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Client</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{lead.client_name}</p>
                                    </div>
                                </div>
                                {lead.company && (
                                    <div className="flex items-center gap-3">
                                        <Building2 size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Company</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{lead.company}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.timezone && (
                                    <div className="flex items-center gap-3">
                                        <Globe size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Timezone</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{lead.timezone}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.source && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Source</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{lead.source}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Created By</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{lead.creator_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requests */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                Requests ({lead.requests?.length || 0})
                            </h2>
                            {isSale && (
                                <button
                                    onClick={() => onCreateRequest?.(lead.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    <Plus size={16} />
                                    Add Request
                                </button>
                            )}
                        </div>

                        {lead.requests && lead.requests.length > 0 ? (
                            <div className="grid gap-4">
                                {lead.requests.map(request => (
                                    <RequestCard
                                        key={request.id}
                                        request={request}
                                        onClick={onOpenRequest}
                                        onDelete={handleDeleteRequest}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                                <p className="text-slate-500 dark:text-slate-400 mb-4">No requests yet</p>
                                {isSale && (
                                    <button
                                        onClick={() => onCreateRequest?.(lead.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
                                    >
                                        <Plus size={16} />
                                        Create First Request
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LeadDetail;
