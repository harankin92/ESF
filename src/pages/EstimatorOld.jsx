import { useState, useEffect } from 'react';
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

const Estimator = ({ user, onBack, onSaved, initialData = null, estimateId = null }) => {
    // State
    const [projectName, setProjectName] = useState('New Project Estimate');
    const [clientName, setClientName] = useState('');
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [manualRoles, setManualRoles] = useState(DEFAULT_MANUAL_ROLES);
    const [techStack, setTechStack] = useState(DEFAULT_TECH_STACK);
    const [questions, setQuestions] = useState([]);
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

    // Sync state if prop changes
    useEffect(() => {
        setCurrentEstimateId(estimateId);
    }, [estimateId]);

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

            if (currentEstimateId) {
                await api.updateEstimate(currentEstimateId, projectName, estimateData);
            } else {
                const newEstimate = await api.createEstimate(projectName, estimateData);
                if (newEstimate && newEstimate.id) {
                    setCurrentEstimateId(newEstimate.id);
                }
            }

            setSaveMessage('Saved!');
            setTimeout(() => setSaveMessage(''), 2000);

            // Invoke onSaved callback if provided (e.g. to refresh dashboard)
            if (onSaved) onSaved();

        } catch (error) {
            console.error('Failed to save estimate:', error);
            alert('Failed to save estimate: ' + (error.message || error));
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        setShowPreview(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header
                projectName={projectName}
                setProjectName={setProjectName}
                clientName={clientName}
                setClientName={setClientName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onPrintReport={handlePrint}
                onSave={handleSave}
                onBack={onBack}
                saving={saving}
                saveMessage={saveMessage}
                user={user}
            />

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
