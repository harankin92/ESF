import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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

const AppContent = () => {
    const { user, loading } = useAuth();
    const [view, setView] = useState('dashboard');
    const [currentEstimateId, setCurrentEstimateId] = useState(null);
    const [currentLeadId, setCurrentLeadId] = useState(null);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [leadToEdit, setLeadToEdit] = useState(null);
    const [requestToEdit, setRequestToEdit] = useState(null);
    const [requestLeadId, setRequestLeadId] = useState(null);
    const [estimateContext, setEstimateContext] = useState(null);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const handleOpenEstimate = (id, context = null) => {
        setCurrentEstimateId(id);
        if (context) {
            setEstimateContext({
                requestId: context.id,
                project_name: context.project_name,
                client_name: context.client_name
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

    const handleOpenProject = (id) => {
        setCurrentProjectId(id);
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
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
