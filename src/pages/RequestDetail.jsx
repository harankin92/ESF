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
    Send,
    XCircle,
    FileSignature,
    AlertTriangle,
    Calculator
} from 'lucide-react';

const RequestDetail = ({ requestId, onBack, onOpenEstimate, onCreateEstimate, onEdit }) => {
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Overview editing
    const [isEditingOverview, setIsEditingOverview] = useState(false);
    const [overviewText, setOverviewText] = useState('');

    // Rejection
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectModalType, setRejectModalType] = useState(''); // 'presale-reject', 'presale-reject-estimate', 'sale-reject', 'sale-request-edit'

    // Estimates
    const [estimates, setEstimates] = useState([]);
    const [selectedEstimate, setSelectedEstimate] = useState(null);

    const canEditRequest = (req) => {
        if (!req) return false;
        if (user?.role === 'Admin') return true;
        if (user?.role === 'Sale' && req.created_by === user?.id) return true;
        return false;
    };

    const loadRequest = async () => {
        try {
            const data = await api.getRequest(requestId);
            setRequest(data);
            setOverviewText(data.project_overview || '');
        } catch (err) {
            setError(err.message);
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

    useEffect(() => {
        loadRequest();
        loadEstimates();
    }, [requestId]);

    const handleSendToReview = async () => {
        try {
            await api.sendRequestToReview(requestId);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStartReview = async () => {
        try {
            await api.startReviewRequest(requestId);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSaveOverview = async () => {
        try {
            await api.addRequestOverview(requestId, overviewText);
            setIsEditingOverview(false);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApprove = async () => {
        try {
            if (!selectedEstimate) {
                alert('Please select an estimate first');
                return;
            }
            console.log('Frontend Approval Payload:', { requestId, selectedEstimate });
            await api.approveRequest(requestId, selectedEstimate);
            setSuccess('Request approved and sent to Pre-Sale review!');
            setTimeout(() => {
                loadRequest();
                setSuccess('');
            }, 2000);
        } catch (err) {
            console.error('Approve failed:', err);
            setError('Failed to approve request: ' + (err.message || 'Unknown error'));
        }
    };

    const handleReject = async () => {
        try {
            await api.rejectRequest(requestId, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    // PreSale rejects request (needs more info)
    const handlePresaleReject = async () => {
        try {
            await api.presaleRejectRequest(requestId, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    // PreSale sends to TechLead for estimation
    const handleSendToEstimation = async () => {
        try {
            await api.sendToEstimation(requestId);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    // PreSale approves estimate -> Sale Review
    const handlePresaleApprove = async () => {
        try {
            await api.presaleApproveEstimate(requestId);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    // PreSale rejects estimate -> back to TechLead
    const handlePresaleRejectEstimate = async () => {
        try {
            await api.presaleRejectEstimate(requestId, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    // Sale accepts estimate
    const handleSaleAccept = async () => {
        try {
            await api.saleAcceptEstimate(requestId);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    // Sale requests edit
    const handleSaleRequestEdit = async () => {
        try {
            await api.saleRequestEdit(requestId, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleConvertToContract = async () => {
        try {
            await api.convertRequestToContract(requestId);
            loadRequest();
        } catch (err) {
            setError(err.message);
        }
    };

    const InfoRow = ({ icon: Icon, label, value, isLink }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3 py-2">
                <Icon size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
                    {isLink ? (
                        <a href={value} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                            Open link <ExternalLink size={12} />
                        </a>
                    ) : (
                        <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{value}</p>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Request not found'}</p>
                    <button onClick={onBack} className="text-indigo-600 hover:underline">Go back</button>
                </div>
            </div>
        );
    }

    const isSale = user?.role === 'Sale' || user?.role === 'Admin';
    const isPreSale = user?.role === 'PreSale' || user?.role === 'Admin';
    const isTechLead = user?.role === 'TechLead' || user?.role === 'Admin';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    {request.client_name || 'Request'}
                                </h1>
                                <StatusBadge status={request.status} />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {request.work_type || 'Request'} • {request.cooperation_model || 'TBD'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canEditRequest(request) && request.status === 'New' && (
                            <button
                                onClick={() => onEdit?.(request)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit Request"
                            >
                                <Edit3 size={18} className="text-slate-600 dark:text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">{success}</span>
                    </div>
                )}
                {/* Action Banner */}
                {request.status === 'New' && isSale && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Send size={20} className="text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Ready to send for review?</span>
                        </div>
                        <button
                            onClick={handleSendToReview}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            Send to PreSale
                        </button>
                    </div>
                )}

                {request.status === 'Pending Review' && isPreSale && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">This request needs your review</span>
                        </div>
                        <button
                            onClick={handleStartReview}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            Start Review
                        </button>
                    </div>
                )}

                {/* Estimate Section */}
                {request.estimate_id ? (
                    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Calculator size={20} className="text-purple-600 dark:text-purple-400" />
                                <div>
                                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300 block">Estimate Linked</span>
                                    <span className="text-xs text-purple-600 dark:text-purple-400">ID: #{request.estimate_id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onOpenEstimate(request.estimate_id, request)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    {request.status === 'Pending Estimation' && isTechLead ? 'Edit Estimate' : 'View Estimate'}
                                </button>
                                {request.status === 'Pending Estimation' && isTechLead && (
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                                    >
                                        Approve
                                    </button>
                                )}
                            </div>
                        </div>

                        {request.status === 'Pending Estimation' && isTechLead && request.rejection_reason && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">Reason for changes:</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">{request.rejection_reason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    request.status === 'Pending Estimation' && isTechLead && (
                        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Ready for estimation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedEstimate || ''}
                                    onChange={(e) => setSelectedEstimate(e.target.value)}
                                    className="flex-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Select existing estimate (optional)</option>
                                    {estimates.map(est => (
                                        <option key={est.id} value={est.id}>{est.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => onCreateEstimate?.(request)}
                                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors whitespace-nowrap"
                                >
                                    Create New
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    )
                )}

                {
                    request.status === 'Estimated' && isSale && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileSignature size={20} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Estimation approved! Ready for contract?</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setRejectModalType('presale-reject'); setShowRejectModal(true); }}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleConvertToContract}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Convert to Contract
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    request.status === 'Rejected' && isSale && request.created_by === user?.id && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <XCircle size={20} className="text-red-600 dark:text-red-400" />
                                    <div>
                                        <span className="text-sm font-medium text-red-800 dark:text-red-300 block">Request Rejected</span>
                                        {request.rejection_reason && (
                                            <span className="text-xs text-red-600 dark:text-red-400">{request.rejection_reason}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendToReview}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Resubmit
                                </button>
                                <button
                                    onClick={() => onEdit && onEdit(request)}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    request.status === 'Rejected' && !isSale && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <XCircle size={20} className="text-red-600 dark:text-red-400" />
                                <div>
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300 block">Request Rejected</span>
                                    {request.rejection_reason && (
                                        <span className="text-xs text-red-600 dark:text-red-400">{request.rejection_reason}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Reviewing without overview: PreSale can reject or add overview */}
                {request.status === 'Reviewing' && isPreSale && !request.project_overview && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Add project overview below to proceed, or reject if more info needed</span>
                        </div>
                        <button
                            onClick={() => { setRejectModalType('presale-reject'); setShowRejectModal(true); }}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                )}

                {/* Reviewing: PreSale can add overview and send to estimation or reject */}
                {request.status === 'Reviewing' && isPreSale && request.project_overview && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Send size={20} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-300">Overview added. Send to TechLead for estimation?</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setRejectModalType('presale-reject'); setShowRejectModal(true); }}
                                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleSendToEstimation}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                Send to Estimation
                            </button>
                        </div>
                    </div>
                )
                }

                {/* PreSale Review: PreSale reviews TechLead's estimate */}
                {
                    request.status === 'PreSale Review' && isPreSale && (
                        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">TechLead submitted estimate. Review and approve?</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setRejectModalType('presale-reject-estimate'); setShowRejectModal(true); }}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Request Changes
                                </button>
                                <button
                                    onClick={handlePresaleApprove}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Approve & Send to Sale
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* Sale Review: Sale reviews and accepts or requests edit */}
                {
                    request.status === 'Sale Review' && isSale && (
                        <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileSignature size={20} className="text-cyan-600 dark:text-cyan-400" />
                                <span className="text-sm font-medium text-cyan-800 dark:text-cyan-300">Estimate ready for final approval</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setRejectModalType('sale-request-edit'); setShowRejectModal(true); }}
                                    className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-bold rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                    Request Edit
                                </button>
                                <button
                                    onClick={() => { setRejectModalType('sale-reject'); setShowRejectModal(true); }}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleSaleAccept}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* Accepted: Sale can convert to contract */}
                {
                    request.status === 'Accepted' && isSale && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Estimate accepted! Ready to convert to contract?</span>
                            </div>
                            <button
                                onClick={handleConvertToContract}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                Convert to Contract
                            </button>
                        </div>
                    )
                }

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Details */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Project Details
                            </h2>
                            <div className="grid grid-cols-2 gap-x-6">
                                <InfoRow icon={Briefcase} label="Cooperation Model" value={request.cooperation_model} />
                                <InfoRow icon={Briefcase} label="Work Type" value={request.work_type} />
                                <InfoRow icon={Code2} label="Tech Stack" value={request.tech_stack} />
                                <InfoRow icon={Briefcase} label="Project Stage" value={request.project_stage} />
                            </div>
                        </div>

                        {/* Financial & Timeline - Hidden from TechLead */}
                        {!isTechLead && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                    Financial & Timeline
                                </h2>
                                <div className="grid grid-cols-2 gap-x-6">
                                    <InfoRow icon={DollarSign} label="Hourly Rate" value={request.hourly_rate ? `$${request.hourly_rate}` : null} />
                                    <InfoRow icon={DollarSign} label="Budget" value={request.budget} />
                                    <InfoRow icon={Clock} label="Timeframe" value={request.timeframe} />
                                    <InfoRow icon={Calendar} label="Deadline" value={request.deadline} />
                                    <InfoRow icon={Calendar} label="Start Date" value={request.start_date} />
                                </div>
                            </div>
                        )}

                        {/* Timeline only for TechLead */}
                        {isTechLead && (request.timeframe || request.deadline || request.start_date) && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                    Timeline
                                </h2>
                                <div className="grid grid-cols-2 gap-x-6">
                                    <InfoRow icon={Clock} label="Timeframe" value={request.timeframe} />
                                    <InfoRow icon={Calendar} label="Deadline" value={request.deadline} />
                                    <InfoRow icon={Calendar} label="Start Date" value={request.start_date} />
                                </div>
                            </div>
                        )}

                        {/* Team & Communication */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Team & Communication
                            </h2>
                            <div className="grid grid-cols-2 gap-x-6">
                                <InfoRow icon={Users} label="Team Need" value={request.team_need} />
                                <InfoRow icon={MessageSquare} label="English Level" value={request.english_level} />
                                <InfoRow icon={Clock} label="Meetings" value={request.meetings} />
                            </div>
                        </div>

                        {/* Links */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Links & Resources
                            </h2>
                            <div className="space-y-1">
                                <InfoRow icon={LinkIcon} label="Intro Call" value={request.intro_call_link} isLink />
                                <InfoRow icon={LinkIcon} label="Presentation" value={request.presentation_link} isLink />
                                <InfoRow icon={LinkIcon} label="Design" value={request.design_link} isLink />
                            </div>
                            {request.call_summary && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Call Summary (AI)</h3>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{request.call_summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Descriptions */}
                        {(request.business_idea || request.job_description) && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                    Descriptions
                                </h2>
                                {request.business_idea && (
                                    <div className="mb-4">
                                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Business Idea</h3>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{request.business_idea}</p>
                                    </div>
                                )}
                                {request.job_description && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Job Description</h3>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{request.job_description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Project Overview (PreSale) */}
                        {(request.status === 'Reviewing' && isPreSale) || request.project_overview ? (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                        Project Overview
                                    </h2>
                                    {request.status === 'Reviewing' && isPreSale && !isEditingOverview && (
                                        <button
                                            onClick={() => setIsEditingOverview(true)}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            {request.project_overview ? 'Edit' : 'Add Overview'}
                                        </button>
                                    )}
                                </div>
                                {isEditingOverview ? (
                                    <div className="space-y-4">
                                        <textarea
                                            value={overviewText}
                                            onChange={(e) => setOverviewText(e.target.value)}
                                            rows={6}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Write your project overview..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditingOverview(false);
                                                    setOverviewText(request.project_overview || '');
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveOverview}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <Save size={16} />
                                                Save & Submit
                                            </button>
                                        </div>
                                    </div>
                                ) : request.project_overview ? (
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{request.project_overview}</p>
                                ) : (
                                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No overview yet</p>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Meta Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                Info
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Created By</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{request.creator_name}</p>
                                    </div>
                                </div>
                                {request.presale_name && (
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">PreSale</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{request.presale_name}</p>
                                        </div>
                                    </div>
                                )}
                                {request.techlead_name && (
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">TechLead</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{request.techlead_name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Linked Estimate */}
                        {request.estimate && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                                    Linked Estimate
                                </h2>
                                <button
                                    onClick={() => onOpenEstimate?.(request.estimate.id)}
                                    className="w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-left hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{request.estimate.name}</p>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">Click to open</p>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main >

            {/* Reject Modal */}
            {
                showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full">
                            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                                <AlertTriangle size={24} />
                                <h3 className="text-lg font-bold">
                                    {rejectModalType === 'sale-request-edit' ? 'Request Changes' :
                                        rejectModalType === 'presale-reject-estimate' ? 'Request Estimate Changes' :
                                            'Reject Request'}
                                </h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                {rejectModalType === 'sale-request-edit' ? 'Please describe what changes are needed:' :
                                    rejectModalType === 'presale-reject-estimate' ? 'Please describe what needs to be changed in the estimate:' :
                                        'Please provide a reason for rejection:'}
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm mb-4"
                                placeholder="Reason or changes needed..."
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => { setShowRejectModal(false); setRejectModalType(''); }}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (rejectModalType === 'presale-reject') handlePresaleReject();
                                        else if (rejectModalType === 'presale-reject-estimate') handlePresaleRejectEstimate();
                                        else if (rejectModalType === 'sale-request-edit') handleSaleRequestEdit();
                                        else if (rejectModalType === 'sale-reject') handleReject();
                                        else handleReject();
                                    }}
                                    className={`px-4 py-2 text-white text-sm font-bold rounded-lg ${rejectModalType === 'sale-request-edit' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {rejectModalType === 'sale-request-edit' ? 'Submit Request' :
                                        rejectModalType === 'presale-reject-estimate' ? 'Request Changes' :
                                            'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default RequestDetail;
