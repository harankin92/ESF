import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DEFAULT_MANUAL_ROLES, DEFAULT_SECTIONS, DEFAULT_TECH_STACK } from '../constants/defaults';
import { useTotals } from '../hooks/useTotals';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import TechStackTab from '../components/tabs/TechStackTab';
import QuestionsTab from '../components/tabs/QuestionsTab';
import StatsGrid from '../components/stats/StatsGrid';
import SettingsTab from '../components/settings/SettingsTab';
import PrintPreview from '../components/print/PrintPreview';
import EstimationTab from '../components/estimation/EstimationTab';
import LeadOverviewTab from '../components/tabs/LeadOverviewTab';

import { CommentsList } from '../components/comments/CommentsList';

const Estimator = ({ user, onBack, onSaved, initialData = null, estimateId = null, sourceLeadId = null, context = null }) => {
    // State
    const [projectName, setProjectName] = useState('New Project Estimate');
    const [clientName, setClientName] = useState('');
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [manualRoles, setManualRoles] = useState(DEFAULT_MANUAL_ROLES);
    const [techStack, setTechStack] = useState(DEFAULT_TECH_STACK);
    const [questions, setQuestions] = useState([]);
    const [users, setUsers] = useState([]);
    const [qaPercent, setQaPercent] = useState(15);

    const [pmPercent, setPmPercent] = useState(10);
    const [qaRate, setQaRate] = useState(40);
    const [pmRate, setPmRate] = useState(45);
    const [discount, setDiscount] = useState(0);
    const [activeTab, setActiveTab] = useState('estimation'); // 'estimation', 'tech-stack', 'questions', 'settings'
    const [showPreview, setShowPreview] = useState(false);

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const [currentEstimateId, setCurrentEstimateId] = useState(estimateId);
    const [lead, setLead] = useState(null);
    const [linkedRequest, setLinkedRequest] = useState(null);

    // Sync state if prop changes
    useEffect(() => {
        setCurrentEstimateId(estimateId);
    }, [estimateId]);

    // Fetch associated lead & request
    useEffect(() => {
        const fetchContextData = async () => {
            try {
                // Fetch Request if context or estimate has it
                let reqId = context?.requestId || context?.id;

                if (!reqId && estimateId) {
                    const est = await api.getEstimate(estimateId);
                    if (est.request_id) reqId = est.request_id;
                }

                if (reqId) {
                    let reqData;
                    if (context?.type === 'project_estimate_request') {
                        reqData = await api.getProjectEstimateRequest(reqId);
                    } else {
                        reqData = await api.getRequest(reqId);
                    }
                    setLinkedRequest(reqData);
                }

                if (sourceLeadId) {
                    const data = await api.getLead(sourceLeadId);
                    setLead(data);
                } else if (estimateId) {
                    // Try to find lead associated with this estimate
                    const leads = await api.getLeads();
                    const found = leads.find(l => l.estimate_id === Number(estimateId));
                    if (found) setLead(found);
                }
            } catch (err) {
                console.error('Failed to fetch context data:', err);
            }
        };
        fetchContextData();
    }, [sourceLeadId, estimateId, context]);

    // Load initial data if provided (edit mode)
    useEffect(() => {
        const loadData = async () => {
            // Use prop-based estimateId for initial load to avoid redundant fetches on create
            if (estimateId && !initialData) {
                try {
                    const data = await api.getEstimate(estimateId);
                    setProjectName(data.name || 'New Project Estimate');
                    if (data.data) {
                        setSections(data.data.sections || DEFAULT_SECTIONS);
                        setManualRoles(data.data.manualRoles || DEFAULT_MANUAL_ROLES);
                        setTechStack(data.data.techStack || DEFAULT_TECH_STACK);
                        setQuestions(data.data.questions || []);
                        setQaPercent(data.data.qaPercent ?? 15);
                        setPmPercent(data.data.pmPercent ?? 10);
                        setQaRate(Number(data.data.qaRate ?? 40));
                        setPmRate(Number(data.data.pmRate ?? 45));
                        setDiscount(Number(data.data.discount ?? 0));
                        setClientName(data.data.clientName || '');
                    }
                } catch (error) {
                    console.error('Failed to load estimate:', error);
                }
            } else if (initialData) {
                // ... (rest of initialData logic unchanged)
                setProjectName(initialData.name || 'New Project Estimate');
                if (initialData.data) {
                    setSections(initialData.data.sections || DEFAULT_SECTIONS);
                    setManualRoles(initialData.data.manualRoles || DEFAULT_MANUAL_ROLES);
                    setTechStack(initialData.data.techStack || DEFAULT_TECH_STACK);
                    setQuestions(initialData.data.questions || []);
                    setQaPercent(Number(initialData.data.qaPercent ?? 15));
                    setPmPercent(Number(initialData.data.pmPercent ?? 10));
                    setQaRate(Number(initialData.data.qaRate ?? 40));
                    setPmRate(Number(initialData.data.pmRate ?? 45));
                    setDiscount(Number(initialData.data.discount ?? 0));
                    setClientName(initialData.data.clientName || '');
                }
            }
        };

        loadData();
    }, [initialData, estimateId]);

    // Prefill from request context (when creating estimate from RequestDetail)
    useEffect(() => {
        if (context && !estimateId && !initialData) {
            // context is a request object with project_name and client_name
            if (context.project_name) {
                setProjectName(context.project_name);
            }
            if (context.client_name) {
                setClientName(context.client_name);
            }
        }
    }, [context, estimateId, initialData]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await api.getUsers();
                setUsers(data);
            } catch (err) {
                console.error('Failed to load users:', err);
            }
        };
        loadUsers();
    }, []);

    // Recalculate totals
    const totals = useTotals(sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate, discount);

    // Handlers
    const handleAddTask = (sectionId) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                tasks: [...s.tasks, {
                    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: '',
                    description: '',
                    estimates: {},
                    includeQA: true,
                    includePM: true
                }]
            };
        }));
    };

    const handleAddSection = () => {
        setSections(prev => [...prev, {
            id: `sec-${Date.now()}`,
            title: 'New Section',
            tasks: []
        }]);
    };

    const handleUpdateEstimate = (sectionId, taskId, roleId, field, value) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                tasks: s.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return {
                        ...t,
                        estimates: {
                            ...t.estimates,
                            [roleId]: {
                                ...t.estimates[roleId],
                                [field]: parseInt(value) || 0
                            }
                        }
                    };
                })
            };
        }));
    };

    const handleUpdateTaskInfo = (sectionId, taskId, field, value) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                tasks: s.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return { ...t, [field]: value };
                })
            };
        }));
    };

    const handleDeleteTask = (sectionId, taskId) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                tasks: s.tasks.filter(t => t.id !== taskId)
            };
        }));
    };

    const handleUpdateSectionTitle = (sectionId, title) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return { ...s, title };
        }));
    };

    const handleToggleQA = (sectionId, taskId) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                tasks: s.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return { ...t, includeQA: t.includeQA === false ? true : false };
                })
            };
        }));
    };

    const handleTogglePM = (sectionId, taskId) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                tasks: s.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return { ...t, includePM: t.includePM === false ? true : false };
                })
            };
        }));
    };

    // Role Handlers
    const handleAddRole = () => {
        const id = `role-${Date.now()}`;
        setManualRoles([...manualRoles, {
            id,
            label: 'New Role',
            rate: 40,
            hoursPerDay: 8,
            color: 'bg-slate-100 text-slate-700'
        }]);
    };

    const handleUpdateRole = (id, field, value) => {
        setManualRoles(manualRoles.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const handleDeleteRole = (id) => {
        setManualRoles(manualRoles.filter(r => r.id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');
        try {
            const estimateData = {
                sections,
                manualRoles,
                techStack,
                questions,
                qaPercent,
                pmPercent,
                qaRate,
                pmRate,
                discount,
                clientName
            };

            let savedId = currentEstimateId;
            if (currentEstimateId) {
                await api.updateEstimate(currentEstimateId, projectName, estimateData);
            } else {
                // Pass project_id from context if available
                const projectId = context?.projectId || null;
                const newEstimate = await api.createEstimate(projectName, estimateData, projectId);
                if (newEstimate && newEstimate.id) {
                    setCurrentEstimateId(newEstimate.id);
                    savedId = newEstimate.id;
                }
            }

            setSaveMessage('Saved!');
            setTimeout(() => setSaveMessage(''), 2000);

            // Invoke onSaved callback if provided (e.g. to refresh dashboard)
            if (onSaved) onSaved();

            return savedId;

        } catch (error) {
            console.error('Failed to save estimate:', error);
            alert('Failed to save estimate: ' + (error.message || error));
        } finally {
            setSaving(false);
        }
    };

    const handleRequestChanges = async () => {
        const requestId = context?.requestId || context?.id;
        if (!requestId) return;

        const reason = prompt('Please provide a reason for the changes requested:');
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            alert('A reason is required to request changes.');
            return;
        }

        try {
            await api.updateEstimateRequestStatus(requestId, 'Changes Requested', reason);
            alert('Changes requested! Sent back to Tech Lead.');
            if (onBack) onBack();
        } catch (e) {
            console.error(e);
            alert('Failed to request changes: ' + e.message);
        }
    };

    const handleApprove = async () => {
        // Support both lead-based approval and request-based approval
        const canApproveLead = !!lead;
        const requestId = context?.requestId || context?.id;
        const canApproveRequest = !!requestId;
        const isPMRequest = context?.type === 'project_estimate_request';

        if (!canApproveLead && !canApproveRequest && !isPMRequest) return;

        let confirmMsg = 'Approve this estimation?';
        if (canApproveLead) confirmMsg = 'Approve this estimation? Current lead status will be updated to "Estimated".';
        else if (isPMRequest) {
            if (user?.role === 'PM') confirmMsg = 'Approve this estimate and complete the request?';
            else confirmMsg = 'Submit this estimate to PM for review?';
        }
        else if (canApproveRequest) confirmMsg = 'Complete this estimate request?';

        if (!confirm(confirmMsg)) return;

        try {
            const id = await handleSave();
            if (id) {
                // PM Request Workflow
                if (isPMRequest) {
                    if (user?.role === 'PM') {
                        await api.updateEstimateRequestStatus(requestId, 'Approved');
                        alert('Estimate approved!');
                    } else {
                        await api.completeEstimateRequest(requestId, id);
                        alert('Estimate sent to PM for review!');
                    }
                    if (onBack) onBack();
                    return;
                }

                // If we have a lead, approve it
                if (canApproveLead) {
                    await api.approveLead(lead.id, id);
                    setLead(prev => ({ ...prev, status: 'Estimated', estimate_id: id }));
                }

                // If we have a request context, complete the request
                if (canApproveRequest) {
                    await api.approveRequest(requestId, id);
                }

                alert(canApproveLead ? 'Estimation approved & lead updated!' : 'Estimate request sent to Pre-Sale review!');
            }
        } catch (e) {
            console.error(e);
            alert('Approval failed: ' + e.message);
        }
    };

    const handlePrint = () => {
        setShowPreview(true);
    };

    const isPMRequest = context?.type === 'project_estimate_request';
    const isPMReview = user?.role === 'PM' && isPMRequest && linkedRequest?.status === 'Pending Review';
    const isTechLeadAction = (user?.role === 'TechLead' || user?.role === 'Admin') &&
        (lead || (context?.requestId && (!linkedRequest || ['Pending', 'Changes Requested'].includes(linkedRequest.status)))) &&
        currentEstimateId;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
            <Header
                projectName={projectName}
                setProjectName={setProjectName}
                clientName={clientName}
                onSave={handleSave}
                onApprove={(isTechLeadAction || isPMReview) ? handleApprove : undefined}
                onRequestChanges={isPMReview ? handleRequestChanges : undefined}
                onPrint={handlePrint}
                onBack={onBack}
                saving={saving}
                saveMessage={saveMessage}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                approveLabel={
                    isPMReview ? 'Approve Estimate' :
                        (isPMRequest && isTechLeadAction) ? 'Submit to PM' :
                            (context?.requestId || context?.id) ? 'Send to PreSale Review' :
                                'Approve'
                }
            />

            {linkedRequest?.rejection_reason && (user?.role === 'TechLead' || user?.role === 'Admin') && (
                <div className="max-w-7xl mx-auto w-full px-6 mt-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl shadow-sm">
                        <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Reason for changes:</p>
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium whitespace-pre-wrap">
                                {linkedRequest.rejection_reason}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 overflow-auto">
                {activeTab === 'estimation' && (
                    <div className="space-y-8 animate-slide-up">
                        <StatsGrid
                            totals={totals}
                            qaPercent={qaPercent}
                            pmPercent={pmPercent}
                        />

                        <EstimationTab
                            sections={sections}
                            manualRoles={manualRoles}
                            qaPercent={qaPercent}
                            pmPercent={pmPercent}
                            onAddTask={handleAddTask}
                            onAddSection={handleAddSection}
                            onUpdateEstimate={handleUpdateEstimate}
                            onUpdateTaskInfo={handleUpdateTaskInfo}
                            onDeleteTask={handleDeleteTask}
                            onUpdateSectionTitle={handleUpdateSectionTitle}
                            onToggleQA={handleToggleQA}
                            onTogglePM={handleTogglePM}
                        />
                    </div>
                )}

                {activeTab === 'tech-stack' && (
                    <div className="animate-slide-up">
                        <TechStackTab
                            techStack={techStack}
                            setTechStack={setTechStack}
                        />
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="animate-slide-up">
                        <QuestionsTab
                            questions={questions}
                            setQuestions={setQuestions}
                        />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="animate-slide-up">
                        <SettingsTab
                            manualRoles={manualRoles}
                            onAddRole={handleAddRole}
                            onUpdateRole={handleUpdateRole}
                            onDeleteRole={handleDeleteRole}
                            qaPercent={qaPercent}
                            setQaPercent={setQaPercent}
                            pmPercent={pmPercent}
                            setPmPercent={setPmPercent}
                            qaRate={qaRate}
                            setQaRate={setQaRate}
                            pmRate={pmRate}
                            setPmRate={setPmRate}
                            discount={discount}
                            setDiscount={setDiscount}
                        />
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="animate-slide-up">
                        <LeadOverviewTab lead={lead} />
                    </div>
                )}

                {currentEstimateId && (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-slide-up">
                        <CommentsList
                            entityType="estimate"
                            entityId={currentEstimateId}
                            currentUser={user}
                            users={users}
                        />
                    </div>
                )}
            </main>

            <PrintPreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                projectName={projectName}
                clientName={clientName}
                totals={totals}
                sections={sections}
                manualRoles={manualRoles}
                qaPercent={qaPercent}
                pmPercent={pmPercent}
                qaRate={qaRate}
                pmRate={pmRate}
                techStack={techStack}
                questions={questions}
                discount={totals.discountedCost > 0 ? discount : 0}
                estimateId={currentEstimateId}
            />
        </div>
    );
};

export default Estimator;
