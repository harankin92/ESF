import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { calculateTotals } from '../hooks/useTotals';
import { DEFAULT_MANUAL_ROLES, DEFAULT_SECTIONS } from '../constants/defaults';
import LeadCard from '../components/leads/LeadCard';
import {
    Plus,
    Layers,
    Clock,
    User,
    Trash2,
    Edit3,
    LogOut,
    Calendar,
    DollarSign,
    AlertCircle,
    Users,
    FileText,
    Briefcase
} from 'lucide-react';

const Dashboard = ({ onOpenEstimate, onCreateNew, onOpenLead, onCreateLead }) => {
    const { user, logout, canCreate, canEdit, canDelete, canCreateLead, canViewLeads, canViewEstimates } = useAuth();
    const [estimates, setEstimates] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Determine default tab based on role
    const getDefaultTab = () => {
        if (user?.role === 'Sale') return 'leads';
        if (user?.role === 'TechLead') return 'pending';
        if (user?.role === 'PreSale') return 'pending-review';
        return 'estimates';
    };

    const [activeTab, setActiveTab] = useState(getDefaultTab());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load estimates if user can view them
            if (canViewEstimates()) {
                const estimatesData = await api.getEstimates();
                setEstimates(estimatesData);
            }

            // Load leads
            const leadsData = await api.getLeads();
            setLeads(leadsData);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this estimate?')) return;
        try {
            await api.deleteEstimate(id);
            setEstimates(estimates.filter(e => e.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLeadDelete = async (id) => {
        try {
            await api.deleteLead(id);
            setLeads(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            alert('Failed to delete lead: ' + err.message);
        }
    };

    const roleColors = {
        Admin: 'bg-purple-100 text-purple-700',
        PreSale: 'bg-green-100 text-green-700',
        TechLead: 'bg-blue-100 text-blue-700',
        PM: 'bg-orange-100 text-orange-700',
        Sale: 'bg-cyan-100 text-cyan-700'
    };

    // Filter leads by status
    const pendingLeads = leads.filter(l => l.status === 'Pending Estimation');
    const pendingReviewLeads = leads.filter(l => l.status === 'Pending Review');
    const myLeads = leads.filter(l => l.created_by === user?.id);

    // Define tabs based on role
    const getTabs = () => {
        const tabs = [];

        if (user?.role === 'Sale') {
            tabs.push({ id: 'leads', label: 'My Leads', icon: Briefcase, count: myLeads.length });
        } else if (user?.role === 'PreSale' || user?.role === 'Admin') {
            tabs.push({ id: 'leads', label: 'All Leads', icon: Briefcase, count: leads.length });
            tabs.push({ id: 'pending-review', label: 'Pending Review', icon: FileText, count: pendingReviewLeads.length });
            tabs.push({ id: 'pending', label: 'Pending Estimation', icon: Clock, count: pendingLeads.length });
            tabs.push({ id: 'estimates', label: 'Estimates', icon: Layers, count: estimates.length });
        } else if (user?.role === 'TechLead') {
            tabs.push({ id: 'pending', label: 'Pending Estimation', icon: Clock, count: pendingLeads.length });
            tabs.push({ id: 'estimates', label: 'Estimates', icon: Layers, count: estimates.length });
        } else if (user?.role === 'PM') {
            tabs.push({ id: 'leads', label: 'All Leads', icon: Briefcase, count: leads.length });
            tabs.push({ id: 'estimates', label: 'Estimates', icon: Layers, count: estimates.length });
        }

        return tabs;
    };

    const tabs = getTabs();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">ESF Estimator</h1>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name}</div>
                                <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold inline-block ${roleColors[user?.role]}`}>
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Leads</div>
                        <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{leads.length}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Pending</div>
                        <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{pendingLeads.length}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Estimates</div>
                        <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{estimates.length}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Your Role</div>
                        <div className={`text-lg font-black ${user?.role === 'Admin' ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {user?.role}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                        {activeTab === 'leads' && (user?.role === 'Sale' ? 'My Leads' : 'All Leads')}
                        {activeTab === 'pending' && 'Pending Estimation'}
                        {activeTab === 'estimates' && 'Project Estimates'}
                    </h2>
                    <div className="flex gap-2">
                        {activeTab === 'leads' && canCreateLead() && (
                            <button
                                onClick={onCreateLead}
                                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-cyan-100 dark:shadow-none transition-all"
                            >
                                <Plus size={18} />
                                New Lead
                            </button>
                        )}
                        {activeTab === 'estimates' && canCreate() && (
                            <button
                                onClick={onCreateNew}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
                            >
                                <Plus size={18} />
                                New Estimate
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400 dark:text-slate-500">Loading...</div>
                ) : (
                    <>
                        {/* Leads Tab */}
                        {(activeTab === 'leads') && (
                            <>
                                {(user?.role === 'Sale' ? myLeads : leads).length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">No leads yet</h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
                                            {canCreateLead() ? 'Create your first lead' : 'No leads available'}
                                        </p>
                                        {canCreateLead() && (
                                            <button
                                                onClick={onCreateLead}
                                                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-bold"
                                            >
                                                <Plus size={18} />
                                                Create Lead
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(user?.role === 'Sale' ? myLeads : leads).map(lead => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                onOpen={onOpenLead}
                                                onDelete={handleLeadDelete}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pending Review Tab */}
                        {activeTab === 'pending-review' && (
                            <>
                                {pendingReviewLeads.length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">No leads pending review</h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                                            Good job! All leads have been reviewed.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {pendingReviewLeads.map(lead => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                onOpen={onOpenLead}
                                                onDelete={handleLeadDelete}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pending Estimation Tab */}
                        {activeTab === 'pending' && (
                            <>
                                {pendingLeads.length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">No pending estimations</h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                                            All caught up! Check back later.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {pendingLeads.map(lead => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                onOpen={onOpenLead}
                                                onDelete={handleLeadDelete}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Estimates Tab */}
                        {activeTab === 'estimates' && (
                            <>
                                {estimates.length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                                        <Layers size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">No estimates yet</h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
                                            {canCreate() ? 'Create your first project estimate' : 'No estimates available'}
                                        </p>
                                        {canCreate() && (
                                            <button
                                                onClick={onCreateNew}
                                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
                                            >
                                                <Plus size={18} />
                                                Create Estimate
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {estimates.map(estimate => {
                                            const data = estimate.data || {};
                                            const sections = data.sections || DEFAULT_SECTIONS;
                                            const manualRoles = data.manualRoles || DEFAULT_MANUAL_ROLES;
                                            const qaPercent = data.qaPercent ?? 15;
                                            const pmPercent = data.pmPercent ?? 10;
                                            const qaRate = data.qaRate ?? 45;
                                            const pmRate = data.pmRate ?? 55;

                                            const totals = calculateTotals(
                                                sections,
                                                manualRoles,
                                                qaPercent,
                                                pmPercent,
                                                qaRate,
                                                pmRate
                                            );

                                            return (
                                                <div
                                                    key={estimate.id}
                                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md dark:hover:border-slate-700 transition-all group flex flex-col"
                                                >
                                                    <div className="p-6 flex-1">
                                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 truncate" title={estimate.name}>{estimate.name}</h3>

                                                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-6">
                                                            <User size={12} />
                                                            <span>{estimate.creator_name}</span>
                                                            <span className="text-slate-300 dark:text-slate-600">•</span>
                                                            <Calendar size={12} />
                                                            <span>{new Date(estimate.created_at).toLocaleDateString()}</span>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3 text-center">
                                                                <div className="text-[9px] uppercase text-indigo-400 dark:text-indigo-500 font-black mb-1">Budget</div>
                                                                <div className="text-xs font-black text-indigo-700 dark:text-indigo-400 truncate">
                                                                    ${totals.totalCostOpt.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                                                <div className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black mb-1">Hours</div>
                                                                <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                                                                    {totals.totalOptHours?.toLocaleString()}-{totals.totalPessHours?.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                                                <div className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black mb-1">Weeks</div>
                                                                <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                                                                    ~{Math.ceil(totals.maxWeeks)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                                                        <button
                                                            onClick={() => onOpenEstimate(estimate.id)}
                                                            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                                        >
                                                            {canEdit(estimate.created_by) ? 'Open & Edit' : 'View'}
                                                        </button>

                                                        {canDelete(estimate.created_by) && (
                                                            <button
                                                                onClick={() => handleDelete(estimate.id)}
                                                                className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
