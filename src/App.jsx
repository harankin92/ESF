import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { api } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estimator from './pages/EstimatorOld';
import SharedReport from './pages/SharedReport';
import LeadForm from './pages/LeadForm';
import LeadDetail from './pages/LeadDetail';
import RequestForm from './pages/RequestForm';
import RequestDetail from './pages/RequestDetail';
import ProjectDetail from './pages/ProjectDetail';
import { saveNavState, loadNavState } from './utils/navUtils';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [view, setView] = useState('dashboard');
    const [currentEstimateId, setCurrentEstimateId] = useState(null);
    const [currentLeadId, setCurrentLeadId] = useState(null);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [currentProjectTab, setCurrentProjectTab] = useState(null);
    const [leadToEdit, setLeadToEdit] = useState(null);
    const [requestToEdit, setRequestToEdit] = useState(null);
    const [requestLeadId, setRequestLeadId] = useState(null);
    const [estimateContext, setEstimateContext] = useState(null);
    const [isStateRestored, setIsStateRestored] = useState(false);

    // Restore navigation state on mount
    useEffect(() => {
        if (user && !isStateRestored) {
            try {
                // Priority 1: URL parameters (for direct links/refresh)
                const params = new URLSearchParams(window.location.search);
                const viewParam = params.get('view');

                if (viewParam) {
                    setView(viewParam);
                    setCurrentEstimateId(params.get('estimateId'));
                    setCurrentLeadId(params.get('leadId'));
                    setCurrentRequestId(params.get('requestId'));
                    setCurrentProjectId(params.get('projectId'));
                } else {
                    // Priority 2: LocalStorage (for session persistence)
                    const savedState = loadNavState();
                    if (savedState) {
                        if (savedState.view) setView(savedState.view);
                        if (savedState.currentEstimateId) setCurrentEstimateId(savedState.currentEstimateId);
                        if (savedState.currentLeadId) setCurrentLeadId(savedState.currentLeadId);
                        if (savedState.currentRequestId) setCurrentRequestId(savedState.currentRequestId);
                        if (savedState.currentProjectId) setCurrentProjectId(savedState.currentProjectId);
                        if (savedState.estimateContext) setEstimateContext(savedState.estimateContext);
                    }
                }
            } catch (err) {
                console.error('State restoration failed:', err);
            } finally {
                setIsStateRestored(true);
            }
        }
    }, [user, isStateRestored]);

    // Save navigation state whenever it changes
    useEffect(() => {
        if (user && isStateRestored) {
            saveNavState({
                view,
                currentEstimateId,
                currentLeadId,
                currentRequestId,
                currentProjectId,
                estimateContext
            });

            // Update URL using pushState (pseudo-routing)
            const params = new URLSearchParams();
            params.set('view', view);
            if (currentEstimateId) params.set('estimateId', currentEstimateId);
            if (currentLeadId) params.set('leadId', currentLeadId);
            if (currentRequestId) params.set('requestId', currentRequestId);
            if (currentProjectId) params.set('projectId', currentProjectId);

            const newUrl = `${window.location.pathname}?${params.toString()}`;
            if (window.location.search !== `?${params.toString()}`) {
                window.history.pushState({ view, currentEstimateId, currentLeadId, currentRequestId, currentProjectId }, '', newUrl);
            }
        }
    }, [user, isStateRestored, view, currentEstimateId, currentLeadId, currentRequestId, currentProjectId, estimateContext]);

    // Handle back button (popstate)
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state) {
                const { view, currentEstimateId, currentLeadId, currentRequestId, currentProjectId } = event.state;
                setView(view || 'dashboard');
                setCurrentEstimateId(currentEstimateId || null);
                setCurrentLeadId(currentLeadId || null);
                setCurrentRequestId(currentRequestId || null);
                setCurrentProjectId(currentProjectId || null);
            } else {
                // Try to parse from URL if no state (direct entry or initial load)
                const params = new URLSearchParams(window.location.search);
                const viewParam = params.get('view');
                if (viewParam) {
                    setView(viewParam);
                    setCurrentEstimateId(params.get('estimateId'));
                    setCurrentLeadId(params.get('leadId'));
                    setCurrentRequestId(params.get('requestId'));
                    setCurrentProjectId(params.get('projectId'));
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!user && view !== 'shared-report') {
        return <Login onLoginSuccess={() => setView('dashboard')} />;
    }

    const handleOpenEstimate = (id, context = null) => {
        setCurrentEstimateId(id);
        if (context) {
            setEstimateContext({
                ...context,
                requestId: context.requestId || context.id
            });
        } else {
            setEstimateContext(null);
        }
        setView('estimator');
    };

    const handleCreateNew = (arg = null) => {
        setCurrentEstimateId(null);

        if (arg && typeof arg === 'object' && !arg.nativeEvent) {
            setEstimateContext(arg);
        } else if (['string', 'number'].includes(typeof arg)) {
            setEstimateContext({ requestId: arg });
        } else {
            setEstimateContext(null);
        }

        setView('estimator');
    };

    const handleBack = () => {
        setView('dashboard');
        setCurrentEstimateId(null);
        setCurrentLeadId(null);
        setCurrentRequestId(null);
        setCurrentProjectId(null);
        setCurrentProjectTab(null);
        setLeadToEdit(null);
        setRequestToEdit(null);
        setRequestLeadId(null);
        setEstimateContext(null);
    };

    const handleBackToLead = () => {
        setView('lead-detail');
        setCurrentRequestId(null);
        setRequestToEdit(null);
    };

    const handleOpenLead = (id) => {
        setCurrentLeadId(id);
        setView('lead-detail');
        setLeadToEdit(null);
    };

    const handleCreateLead = () => {
        setLeadToEdit(null);
        setView('lead-form');
    };

    const handleEditLead = (lead) => {
        setLeadToEdit(lead);
        setView('lead-form');
    };

    const handleDeleteLead = async (id) => {
        try {
            await api.deleteLead(id);
            handleBack();
        } catch (err) {
            alert('Failed to delete lead: ' + err.message);
        }
    };

    // Request handlers
    const handleOpenRequest = (id) => {
        setCurrentRequestId(id);
        setView('request-detail');
    };

    const handleCreateRequest = (leadId) => {
        setRequestLeadId(leadId);
        setRequestToEdit(null);
        setView('request-form');
    };

    const handleEditRequest = (request) => {
        setRequestToEdit(request);
        setRequestLeadId(request.lead_id);
        setView('request-form');
    };

    const handleOpenProject = (id, tab = null) => {
        setCurrentProjectId(id);
        setCurrentProjectTab(tab);
        setView('project-detail');
    };

    // Lead Form
    if (view === 'lead-form') {
        return (
            <LeadForm
                onBack={handleBack}
                onSuccess={() => setView('dashboard')}
                initialData={leadToEdit}
            />
        );
    }

    // Lead Detail
    if (view === 'lead-detail') {
        return (
            <LeadDetail
                leadId={currentLeadId}
                onBack={handleBack}
                onOpenRequest={handleOpenRequest}
                onCreateRequest={handleCreateRequest}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
            />
        );
    }

    // Request Form
    if (view === 'request-form') {
        return (
            <RequestForm
                leadId={requestLeadId}
                onBack={currentLeadId ? handleBackToLead : handleBack}
                onSuccess={() => currentLeadId ? setView('lead-detail') : setView('dashboard')}
                initialData={requestToEdit}
            />
        );
    }

    // Request Detail
    if (view === 'request-detail') {
        return (
            <RequestDetail
                requestId={currentRequestId}
                onBack={handleBack}
                onOpenEstimate={handleOpenEstimate}
                onCreateEstimate={handleCreateNew}
                onEdit={handleEditRequest}
            />
        );
    }

    // Project Detail
    if (view === 'project-detail') {
        return (
            <ProjectDetail
                projectId={currentProjectId}
                onBack={handleBack}
                onOpenEstimate={handleOpenEstimate}
                initialTab={currentProjectTab}
            />
        );
    }

    // Estimator
    if (view === 'estimator') {
        return (
            <Estimator
                user={user}
                estimateId={currentEstimateId}
                context={estimateContext}
                onBack={handleBack}
                onSaved={() => { }}
            />
        );
    }

    // Dashboard
    return (
        <Dashboard
            onOpenEstimate={handleOpenEstimate}
            onCreateNew={handleCreateNew}
            onOpenLead={handleOpenLead}
            onCreateLead={handleCreateLead}
            onOpenRequest={handleOpenRequest}
            onOpenProject={handleOpenProject}
        />
    );
};

const App = () => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
        const parts = path.split('/share/');
        const uuid = parts[1];
        if (uuid && uuid.trim() !== '') {
            return <SharedReport uuid={uuid} />;
        }
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <NotificationsProvider>
                    <AppContent />
                </NotificationsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
