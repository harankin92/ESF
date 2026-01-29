import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { calculateTotals } from '../hooks/useTotals';
import { DEFAULT_MANUAL_ROLES, DEFAULT_SECTIONS } from '../constants/defaults';
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
    AlertCircle
} from 'lucide-react';

const Dashboard = ({ onOpenEstimate, onCreateNew }) => {
    const { user, logout, canCreate, canEdit, canDelete } = useAuth();
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEstimates();
    }, []);

    const loadEstimates = async () => {
        try {
            const data = await api.getEstimates();
            setEstimates(data);
        } catch (err) {
            setError('Failed to load estimates');
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

    const roleColors = {
        Admin: 'bg-purple-100 text-purple-700',
        PreSale: 'bg-green-100 text-green-700',
        TechLead: 'bg-blue-100 text-blue-700',
        PM: 'bg-orange-100 text-orange-700'
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">ESF Estimator</h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <User size={16} className="text-indigo-600" />
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                                <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold inline-block ${roleColors[user?.role]}`}>
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Estimates</div>
                        <div className="text-3xl font-black text-slate-800">{estimates.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Role</div>
                        <div className={`text-xl font-black ${user?.role === 'Admin' ? 'text-purple-600' : 'text-indigo-600'}`}>
                            {user?.role}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Permissions</div>
                        <div className="text-sm font-medium text-slate-600">
                            {user?.role === 'PM' ? 'View Only' : 'Full Access'}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-800">Project Estimates</h2>
                    {canCreate() && (
                        <button
                            onClick={onCreateNew}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
                        >
                            <Plus size={18} />
                            New Estimate
                        </button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading estimates...</div>
                ) : estimates.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <div className="text-slate-300 mb-4">
                            <Layers size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 mb-2">No estimates yet</h3>
                        <p className="text-slate-400 text-sm mb-6">
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
                    /* Estimates Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {estimates.map(estimate => {
                            const data = estimate.data || {};
                            // Use defaults if data is missing
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
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                                >
                                    <div className="p-6 flex-1">
                                        <h3 className="font-bold text-lg text-slate-800 mb-2 truncate" title={estimate.name}>{estimate.name}</h3>

                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                                            <User size={12} />
                                            <span>{estimate.creator_name}</span>
                                            <span className="text-slate-300">•</span>
                                            <Calendar size={12} />
                                            <span>{new Date(estimate.created_at).toLocaleDateString()}</span>
                                        </div>

                                        {/* Updated Stats: Budget, Hours, Timeline */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-indigo-50/50 rounded-lg p-3 text-center">
                                                <div className="text-[9px] uppercase text-indigo-400 font-black mb-1">Budget</div>
                                                <div className="text-xs font-black text-indigo-700 truncate">
                                                    ${totals.totalCostOpt.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <div className="text-[9px] uppercase text-slate-400 font-black mb-1">Hours</div>
                                                <div className="text-xs font-black text-slate-700">
                                                    {totals.totalOptHours?.toLocaleString()}-{totals.totalPessHours?.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <div className="text-[9px] uppercase text-slate-400 font-black mb-1">Weeks</div>
                                                <div className="text-xs font-black text-slate-700">
                                                    ~{Math.ceil(totals.maxWeeks)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                                        <button
                                            onClick={() => onOpenEstimate(estimate.id)}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                                        >
                                            {canEdit(estimate.created_by) ? 'Open & Edit' : 'View'}
                                        </button>

                                        {canDelete(estimate.created_by) && (
                                            <button
                                                onClick={() => handleDelete(estimate.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
            </main>
        </div>
    );
};

export default Dashboard;
