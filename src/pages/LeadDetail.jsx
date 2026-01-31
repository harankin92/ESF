import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import {
    ArrowLeft,
    Building2,
    Briefcase,
    Code2,
    DollarSign,
    Calendar,
    Users,
    Globe,
    Clock,
    Link as LinkIcon,
    FileText,
    MessageSquare,
    User,
    CheckCircle,
    ExternalLink,
    Edit3,
    Save,
    X,
    Plus,
    Send
} from 'lucide-react';

const LeadDetail = ({ leadId, onBack, onOpenEstimate, onCreateEstimate, onEdit, onDelete }) => {
    const { user, canReviewLead, canApproveLead } = useAuth();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showOverviewForm, setShowOverviewForm] = useState(false);
    const [projectOverview, setProjectOverview] = useState('');
    const [saving, setSaving] = useState(false);
    const [estimates, setEstimates] = useState([]);
    const [selectedEstimateId, setSelectedEstimateId] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    const canEditLead = (lead) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        if (user.role === 'Sale' && lead.created_by === user.id) return true;
        return false;
    };

    const handleUpdateName = async () => {
        if (!editedName.trim() || editedName === lead.client_name) {
            setIsEditingName(false);
            return;
        }

        try {
            setSaving(true);
            await api.updateLead(leadId, { client_name: editedName });
            await loadLead();
            setIsEditingName(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadLead();
        if (canApproveLead()) {
            loadEstimates();
        }
    }, [leadId]);

    const loadLead = async () => {
        try {
            const data = await api.getLead(leadId);
            setLead(data);
            setProjectOverview(data.project_overview || '');
        } catch (err) {
            setError('Failed to load lead');
        } finally {
            setLoading(false);
        }
    };

    const loadEstimates = async () => {
        try {
            const data = await api.getEstimates();
            setEstimates(data);
        } catch (err) {
            console.error('Failed to load estimates:', err);
        }
    };

    const handleStartReview = async () => {
        try {
            setSaving(true);
            await api.startReviewLead(leadId);
            await loadLead();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveOverview = async () => {
        if (!projectOverview.trim()) {
            setError('Project overview is required');
            return;
        }
        try {
            setSaving(true);
            await api.addProjectOverview(leadId, projectOverview);
            // Update status to Pending Estimation
            await api.updateLead(leadId, { status: 'Pending Estimation' });
            await loadLead();
            setShowOverviewForm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedEstimateId) {
            setError('Please select an estimate');
            return;
        }
        try {
            setSaving(true);
            await api.approveLead(leadId, parseInt(selectedEstimateId));
            await loadLead();
            setShowApproveModal(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSendToReview = async () => {
        if (!confirm('Send this lead to PreSale for review?')) return;
        try {
            setSaving(true);
            await api.updateLead(leadId, { status: 'Pending Review' });
            await loadLead();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const InfoRow = ({ icon: Icon, label, value, isLink }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3 py-2">
                <Icon size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wide mb-0.5">
                        {label}
                    </div>
                    {isLink ? (
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                        >
                            {value}
                            <ExternalLink size={12} />
                        </a>
                    ) : (
                        <div className="text-sm text-slate-800 dark:text-slate-100">{value}</div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400 dark:text-slate-500">Loading...</div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-red-500">Lead not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            {/* Editable Title */}
                            <div className="flex items-center gap-2 group">
                                {isEditingName ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleUpdateName();
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            autoFocus
                                            onBlur={handleUpdateName}
                                        />
                                    </form>
                                ) : (
                                    <>
                                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate max-w-md">
                                            {lead.client_name}
                                        </h1>
                                        {canEditLead(lead) && (
                                            <button
                                                onClick={() => {
                                                    setIsEditingName(true);
                                                    setEditedName(lead.client_name);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-500 transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={lead.status} size="xs" />
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    Lead #{lead.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Sale: Send to PreSale on Review */}
                        {canEditLead(lead) && lead.status === 'New' && (
                            <button
                                onClick={handleSendToReview}
                                disabled={saving}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                            >
                                <Send size={16} />
                                Send to PreSale
                            </button>
                        )}

                        {/* PreSale: Start Review */}
                        {canReviewLead() && lead.status === 'Pending Review' && (
                            <button
                                onClick={handleStartReview}
                                disabled={saving}
                                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                            >
                                <Edit3 size={16} />
                                Start Review
                            </button>
                        )}

                        {/* Sale/Admin: Edit & Delete */}
                        {canEditLead(lead) && (
                            <>
                                <button
                                    onClick={() => onEdit?.(lead)}
                                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                >
                                    <Edit3 size={16} />
                                    Edit Lead
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this lead?')) {
                                            onDelete?.(lead.id);
                                        }
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </>
                        )}

                        {/* PreSale: Add Overview */}
                        {canReviewLead() && (lead.status === 'New' || lead.status === 'Reviewing') && (
                            <button
                                onClick={() => setShowOverviewForm(true)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                            >
                                <FileText size={16} />
                                {lead.project_overview ? 'Edit Overview' : 'Add Overview'}
                            </button>
                        )}

                        {/* TechLead: Start Estimation */}
                        {canApproveLead() && lead.status === 'Pending Estimation' && (
                            <button
                                onClick={() => onCreateEstimate(lead.id)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                            >
                                <Plus size={16} />
                                Start Estimation
                            </button>
                        )}

                        {/* View linked estimate */}
                        {lead.estimate_id && (
                            <button
                                onClick={() => onOpenEstimate?.(lead.estimate_id)}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                            >
                                <ExternalLink size={16} />
                                View Estimate
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Overview Form Modal */}
                {showOverviewForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Project Overview
                                </h2>
                                <button
                                    onClick={() => setShowOverviewForm(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={projectOverview}
                                    onChange={(e) => setProjectOverview(e.target.value)}
                                    placeholder="Write a detailed project overview and estimation request based on the lead information..."
                                    rows={10}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                                <div className="mt-4 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowOverviewForm(false)}
                                        className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveOverview}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Save size={16} />
                                        {saving ? 'Saving...' : 'Save & Send to Estimation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approve Modal */}
                {showApproveModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Approve Estimation
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Select an estimate to link with this lead
                                </p>
                            </div>
                            <div className="p-6">
                                <select
                                    value={selectedEstimateId}
                                    onChange={(e) => setSelectedEstimateId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100"
                                >
                                    <option value="">Select estimate...</option>
                                    {estimates.map(est => (
                                        <option key={est.id} value={est.id}>
                                            {est.name} (#{est.id})
                                        </option>
                                    ))}
                                </select>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowApproveModal(false)}
                                        className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={saving || !selectedEstimateId}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <CheckCircle size={16} />
                                        {saving ? 'Approving...' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meta Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>Created by {lead.creator_name}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{new Date(lead.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Project Overview */}
                {lead.project_overview && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
                        <h3 className="text-sm font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-3">
                            Project Overview
                        </h3>
                        <div className="text-sm text-indigo-900 dark:text-indigo-100 whitespace-pre-wrap">
                            {lead.project_overview}
                        </div>
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
                        <InfoRow icon={Building2} label="Client Name" value={lead.client_name} />
                        <InfoRow icon={Briefcase} label="Cooperation Model" value={lead.cooperation_model} />
                        <InfoRow icon={Briefcase} label="Work Type" value={lead.work_type} />
                        <InfoRow icon={Code2} label="Tech Stack" value={lead.tech_stack} />
                    </div>
                </div>

                {/* Financial - Hidden for TechLead */}
                {user?.role !== 'TechLead' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                            Financial Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <InfoRow icon={DollarSign} label="Hourly Rate" value={lead.hourly_rate ? `$${lead.hourly_rate}` : null} />
                            <InfoRow icon={DollarSign} label="Budget" value={lead.budget} />
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                        Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                        <InfoRow icon={Clock} label="Timeframe" value={lead.timeframe} />
                        <InfoRow icon={Calendar} label="Deadline" value={lead.deadline ? new Date(lead.deadline).toLocaleDateString() : null} />
                        <InfoRow icon={Calendar} label="Start Date" value={lead.start_date ? new Date(lead.start_date).toLocaleDateString() : null} />
                    </div>
                </div>

                {/* Team */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                        Team & Communication
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <InfoRow icon={Users} label="Team Need" value={lead.team_need} />
                        <InfoRow icon={MessageSquare} label="English Level" value={lead.english_level} />
                        <InfoRow icon={Clock} label="Meetings" value={lead.meetings} />
                        <InfoRow icon={Globe} label="Timezone" value={lead.timezone} />
                        <InfoRow icon={Briefcase} label="Project Stage" value={lead.project_stage} />
                    </div>
                </div>

                {/* Links */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                        Links & Resources
                    </h3>
                    <div className="space-y-2">
                        <InfoRow icon={LinkIcon} label="Intro Call Recording" value={lead.intro_call_link} isLink />
                        <InfoRow icon={LinkIcon} label="Presentation Links" value={lead.presentation_link} isLink />
                        <InfoRow icon={LinkIcon} label="Design / Reference" value={lead.design_link} isLink />
                    </div>
                </div>

                {/* Descriptions */}
                {(lead.business_idea || lead.job_description) && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                        {lead.business_idea && (
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-3">
                                    Business Idea (RU/UA)
                                </h3>
                                <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    {lead.business_idea}
                                </div>
                            </div>
                        )}
                        {lead.job_description && (
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-3">
                                    Job Description
                                </h3>
                                <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    {lead.job_description}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeadDetail;
