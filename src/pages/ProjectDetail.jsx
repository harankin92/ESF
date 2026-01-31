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
    FileText,
    Key,
    History,
    Receipt,
    Play,
    Pause,
    CheckCircle,
    ExternalLink,
    Plus,
    Save,
    X,
    Edit3,
    Trash2,
    Link as LinkIcon,
    GitBranch,
    Server,
    Layers,
    MessageSquare
} from 'lucide-react';

const ProjectDetail = ({ projectId, onBack, onOpenEstimate }) => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [saving, setSaving] = useState(false);

    // Credentials state
    const [credentials, setCredentials] = useState({ git: '', api_keys: [], other: [] });
    const [newApiKey, setNewApiKey] = useState({ name: '', value: '' });
    const [newOther, setNewOther] = useState({ name: '', value: '' });

    // Documentation state
    const [projectCharter, setProjectCharter] = useState('');

    // Changelog state
    const [newChangelogEntry, setNewChangelogEntry] = useState('');

    // Invoice state
    const [invoices, setInvoices] = useState([]);
    const [newInvoice, setNewInvoice] = useState({ number: '', amount: '', date: '', status: 'pending' });

    // Estimates & Requests state
    const [projectEstimates, setProjectEstimates] = useState([]);
    const [estimateRequests, setEstimateRequests] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestScope, setRequestScope] = useState('');

    const canEditProject = () => {
        if (!user) return false;
        return user.role === 'PM' || user.role === 'Admin';
    };

    useEffect(() => {
        loadProject();
        if (activeTab === 'estimates') {
            loadEstimatesAndRequests();
        }
    }, [projectId, activeTab]);

    const loadProject = async () => {
        try {
            const data = await api.getProject(projectId);
            setProject(data);

            // Parse JSON fields
            if (data.credentials) {
                try {
                    setCredentials(JSON.parse(data.credentials));
                } catch (e) {
                    setCredentials({ git: '', api_keys: [], other: [] });
                }
            }
            if (data.project_charter) {
                setProjectCharter(data.project_charter);
            }
            if (data.invoices) {
                try {
                    setInvoices(JSON.parse(data.invoices));
                } catch (e) {
                    setInvoices([]);
                }
            }
        } catch (err) {
            setError('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Change project status to ${newStatus}?`)) return;
        try {
            setSaving(true);
            await api.updateProjectStatus(projectId, newStatus);
            await loadProject();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCredentials = async () => {
        try {
            setSaving(true);
            await api.updateProjectCredentials(projectId, credentials);
            await loadProject();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDocumentation = async () => {
        try {
            setSaving(true);
            await api.updateProjectDocumentation(projectId, { project_charter: projectCharter });
            await loadProject();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddChangelogEntry = async () => {
        if (!newChangelogEntry.trim()) return;
        try {
            setSaving(true);
            await api.addProjectChangelogEntry(projectId, newChangelogEntry);
            setNewChangelogEntry('');
            await loadProject();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveInvoices = async () => {
        try {
            setSaving(true);
            await api.updateProjectInvoices(projectId, invoices);
            await loadProject();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addApiKey = () => {
        if (!newApiKey.name || !newApiKey.value) return;
        setCredentials({
            ...credentials,
            api_keys: [...credentials.api_keys, { ...newApiKey }]
        });
        setNewApiKey({ name: '', value: '' });
    };

    const addOtherCredential = () => {
        if (!newOther.name || !newOther.value) return;
        setCredentials({
            ...credentials,
            other: [...credentials.other, { ...newOther }]
        });
        setNewOther({ name: '', value: '' });
    };

    const addInvoice = () => {
        if (!newInvoice.number || !newInvoice.amount) return;
        setInvoices([...invoices, { ...newInvoice, id: Date.now() }]);
        setNewInvoice({ number: '', amount: '', date: '', status: 'pending' });
    };

    const loadEstimatesAndRequests = async () => {
        try {
            const [ests, reqs] = await Promise.all([
                api.getProjectEstimates(projectId),
                api.getProjectEstimateRequests(projectId)
            ]);
            setProjectEstimates(ests);
            setEstimateRequests(reqs);
        } catch (err) {
            console.error('Failed to load estimates data:', err);
        }
    };

    const handleCreateRequest = async () => {
        if (!requestScope.trim()) return;
        try {
            setSaving(true);
            await api.createEstimateRequest(projectId, requestScope);
            await loadEstimatesAndRequests();
            setShowRequestModal(false);
            setRequestScope('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'estimates', label: 'Estimates', icon: Layers },
        { id: 'credentials', label: 'Credentials', icon: Key },
        { id: 'documentation', label: 'Documentation', icon: FileText },
        { id: 'changelog', label: 'Changelog', icon: History },
        { id: 'financial', label: 'Financial', icon: Receipt }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400 dark:text-slate-500">Loading...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-red-500">Project not found</div>
            </div>
        );
    }

    const changelog = project.changelog ? JSON.parse(project.changelog) : [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate max-w-md">
                                {project.client_name}
                            </h1>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={project.status} size="xs" />
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    Project #{project.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Actions */}
                    {canEditProject() && (
                        <div className="flex items-center gap-2">
                            {project.status === 'New' && (
                                <button
                                    onClick={() => handleStatusChange('Active')}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                >
                                    <Play size={16} />
                                    Start Project
                                </button>
                            )}
                            {project.status === 'Active' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('Paused')}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                    >
                                        <Pause size={16} />
                                        Pause
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('Finished')}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                    >
                                        <CheckCircle size={16} />
                                        Complete
                                    </button>
                                </>
                            )}
                            {project.status === 'Paused' && (
                                <button
                                    onClick={() => handleStatusChange('Active')}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                >
                                    <Play size={16} />
                                    Resume
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                        <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Lead Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Lead Information (from Sales)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500">Client:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.client_name}</span></div>
                                <div><span className="text-slate-500">Created by:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.sale_name}</span></div>
                                <div><span className="text-slate-500">Cooperation Model:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.cooperation_model || '-'}</span></div>
                                <div><span className="text-slate-500">Work Type:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.work_type || '-'}</span></div>
                                <div><span className="text-slate-500">Tech Stack:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.tech_stack || '-'}</span></div>
                                <div><span className="text-slate-500">Budget:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.budget || '-'}</span></div>
                                <div><span className="text-slate-500">Timezone:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.timezone || '-'}</span></div>
                                <div><span className="text-slate-500">Deadline:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</span></div>
                            </div>
                        </div>

                        {/* Project Overview from PreSale */}
                        {project.project_overview && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
                                <h3 className="text-sm font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-3">
                                    Project Overview (from PreSale)
                                </h3>
                                <div className="text-sm text-indigo-900 dark:text-indigo-100 whitespace-pre-wrap">
                                    {project.project_overview}
                                </div>
                            </div>
                        )}

                        {/* Estimate Link */}
                        {project.estimate_id && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
                                <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-3">
                                    Linked Estimate
                                </h3>
                                <button
                                    onClick={() => onOpenEstimate?.(project.estimate_id)}
                                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium"
                                >
                                    <ExternalLink size={16} />
                                    View Estimate #{project.estimate_id}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Estimates Tab */}
                {activeTab === 'estimates' && (
                    <div className="space-y-8">
                        {/* Request Modal */}
                        {showRequestModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg">
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            Request Estimate
                                        </h2>
                                        <button
                                            onClick={() => setShowRequestModal(false)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                        >
                                            <X size={20} className="text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Scope / Requirements
                                        </label>
                                        <textarea
                                            value={requestScope}
                                            onChange={(e) => setRequestScope(e.target.value)}
                                            placeholder="Describe what needs to be estimated..."
                                            rows={5}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        />
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                onClick={() => setShowRequestModal(false)}
                                                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreateRequest}
                                                disabled={saving || !requestScope.trim()}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                                            >
                                                {saving ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Requests Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                                    <MessageSquare size={16} />
                                    Estimate Requests
                                </h3>
                                {canEditProject() && (
                                    <button
                                        onClick={() => setShowRequestModal(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs"
                                    >
                                        <Plus size={14} />
                                        Request Estimate
                                    </button>
                                )}
                            </div>

                            {estimateRequests.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                                    <div className="text-sm text-slate-400 dark:text-slate-500">No active requests</div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {estimateRequests.map(req => (
                                        <div key={req.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <StatusBadge status={req.status} size="xs" />
                                                    <span className="text-xs text-slate-400">
                                                        Requested by {req.requester_name} • {new Date(req.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                    {req.scope_description}
                                                </p>
                                                {req.estimate_id && (
                                                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                                        <CheckCircle size={12} />
                                                        Completed with Estimate #{req.estimate_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Completed Estimates Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                                <Layers size={16} />
                                Completed Estimates
                            </h3>

                            {projectEstimates.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                                    <div className="text-sm text-slate-400 dark:text-slate-500">No linked estimates</div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {projectEstimates.map(est => (
                                        <div key={est.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                                                    {est.name}
                                                </h4>
                                                <div className="text-xs text-slate-400">
                                                    Created by {est.creator_name} • {new Date(est.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onOpenEstimate?.(est.id)}
                                                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold text-sm"
                                            >
                                                View
                                                <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Credentials Tab */}
                {activeTab === 'credentials' && (
                    <div className="space-y-6">
                        {/* Git Access */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <GitBranch size={16} />
                                Git Repository
                            </h3>
                            <input
                                type="text"
                                value={credentials.git || ''}
                                onChange={(e) => setCredentials({ ...credentials, git: e.target.value })}
                                placeholder="https://github.com/..."
                                disabled={!canEditProject()}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 disabled:opacity-50"
                            />
                        </div>

                        {/* API Keys */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Server size={16} />
                                API Keys
                            </h3>
                            <div className="space-y-3">
                                {credentials.api_keys?.map((key, idx) => (
                                    <div key={idx} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                        <span className="font-medium text-sm text-slate-600 dark:text-slate-300 min-w-[100px]">{key.name}</span>
                                        <span className="text-sm text-slate-800 dark:text-slate-100 font-mono flex-1 truncate">{key.value}</span>
                                        {canEditProject() && (
                                            <button
                                                onClick={() => setCredentials({
                                                    ...credentials,
                                                    api_keys: credentials.api_keys.filter((_, i) => i !== idx)
                                                })}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {canEditProject() && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newApiKey.name}
                                            onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                                            placeholder="Key name"
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={newApiKey.value}
                                            onChange={(e) => setNewApiKey({ ...newApiKey, value: e.target.value })}
                                            placeholder="Key value"
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                        />
                                        <button
                                            onClick={addApiKey}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Other Credentials */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Key size={16} />
                                Other Credentials
                            </h3>
                            <div className="space-y-3">
                                {credentials.other?.map((cred, idx) => (
                                    <div key={idx} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                        <span className="font-medium text-sm text-slate-600 dark:text-slate-300 min-w-[100px]">{cred.name}</span>
                                        <span className="text-sm text-slate-800 dark:text-slate-100 flex-1 truncate">{cred.value}</span>
                                        {canEditProject() && (
                                            <button
                                                onClick={() => setCredentials({
                                                    ...credentials,
                                                    other: credentials.other.filter((_, i) => i !== idx)
                                                })}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {canEditProject() && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newOther.name}
                                            onChange={(e) => setNewOther({ ...newOther, name: e.target.value })}
                                            placeholder="Name"
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={newOther.value}
                                            onChange={(e) => setNewOther({ ...newOther, value: e.target.value })}
                                            placeholder="Value"
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                        />
                                        <button
                                            onClick={addOtherCredential}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {canEditProject() && (
                            <button
                                onClick={handleSaveCredentials}
                                disabled={saving}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Credentials'}
                            </button>
                        )}
                    </div>
                )}

                {/* Documentation Tab */}
                {activeTab === 'documentation' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Project Charter
                            </h3>
                            <textarea
                                value={projectCharter}
                                onChange={(e) => setProjectCharter(e.target.value)}
                                placeholder="Write project charter, goals, scope, and key deliverables..."
                                rows={15}
                                disabled={!canEditProject()}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-100 disabled:opacity-50 resize-none"
                            />
                        </div>

                        {canEditProject() && (
                            <button
                                onClick={handleSaveDocumentation}
                                disabled={saving}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Documentation'}
                            </button>
                        )}
                    </div>
                )}

                {/* Changelog Tab */}
                {activeTab === 'changelog' && (
                    <div className="space-y-6">
                        {canEditProject() && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                    Add Entry
                                </h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newChangelogEntry}
                                        onChange={(e) => setNewChangelogEntry(e.target.value)}
                                        placeholder="What happened?"
                                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm"
                                    />
                                    <button
                                        onClick={handleAddChangelogEntry}
                                        disabled={saving || !newChangelogEntry.trim()}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                History
                            </h3>
                            {changelog.length === 0 ? (
                                <div className="text-sm text-slate-400 dark:text-slate-500">No entries yet</div>
                            ) : (
                                <div className="space-y-3">
                                    {[...changelog].reverse().map((entry, idx) => (
                                        <div key={idx} className="flex gap-4 items-start border-l-2 border-indigo-200 dark:border-indigo-800 pl-4 py-2">
                                            <div className="flex-1">
                                                <div className="text-sm text-slate-800 dark:text-slate-100">{entry.action}</div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                    {entry.user} • {new Date(entry.date).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Financial Tab */}
                {activeTab === 'financial' && (
                    <div className="space-y-6">
                        {canEditProject() && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                    Add Invoice
                                </h3>
                                <div className="grid grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        value={newInvoice.number}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, number: e.target.value })}
                                        placeholder="Invoice #"
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newInvoice.amount}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                        placeholder="Amount ($)"
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={newInvoice.date}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm"
                                    />
                                    <button
                                        onClick={addInvoice}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Invoices
                            </h3>
                            {invoices.length === 0 ? (
                                <div className="text-sm text-slate-400 dark:text-slate-500">No invoices yet</div>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map((inv, idx) => (
                                        <div key={inv.id || idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <Receipt size={20} className="text-slate-400" />
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100">#{inv.number}</div>
                                                    <div className="text-xs text-slate-400">{inv.date || 'No date'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-slate-800 dark:text-slate-100">${inv.amount}</span>
                                                <select
                                                    value={inv.status}
                                                    onChange={(e) => {
                                                        const updated = [...invoices];
                                                        updated[idx].status = e.target.value;
                                                        setInvoices(updated);
                                                    }}
                                                    disabled={!canEditProject()}
                                                    className="text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="overdue">Overdue</option>
                                                </select>
                                                {canEditProject() && (
                                                    <button
                                                        onClick={() => setInvoices(invoices.filter((_, i) => i !== idx))}
                                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {canEditProject() && invoices.length > 0 && (
                            <button
                                onClick={handleSaveInvoices}
                                disabled={saving}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Invoices'}
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectDetail;
