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
import ProjectDetail from './pages/ProjectDetail';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'estimator' | 'lead-form' | 'lead-detail' | 'project-detail'
    const [currentEstimateId, setCurrentEstimateId] = useState(null);
    const [currentLeadId, setCurrentLeadId] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [leadToEdit, setLeadToEdit] = useState(null);
    const [sourceLeadId, setSourceLeadId] = useState(null);
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

    const handleOpenEstimate = (id) => {
        setCurrentEstimateId(id);
        setSourceLeadId(null);
        setEstimateContext(null);
        setView('estimator');
    };

    const handleCreateNew = (arg = null) => {
        setCurrentEstimateId(null);

        // Handle argument types: context object vs lead ID vs event/null
        if (arg && typeof arg === 'object' && !arg.nativeEvent) {
            // It's a context object { requestId, projectId, leadId }
            setEstimateContext(arg);
            setSourceLeadId(arg.leadId || null);
        } else if (['string', 'number'].includes(typeof arg)) {
            // It's a lead ID (primitive)
            setSourceLeadId(arg);
            setEstimateContext({ leadId: arg });
        } else {
            // Event or null
            setSourceLeadId(null);
            setEstimateContext(null);
        }

        setView('estimator');
    };

    const handleBack = () => {
        setView('dashboard');
        setCurrentEstimateId(null);
        setCurrentLeadId(null);
        setCurrentProjectId(null);
        setLeadToEdit(null);
        setEstimateContext(null);
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
                onOpenEstimate={handleOpenEstimate}
                onCreateEstimate={handleCreateNew}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
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
                sourceLeadId={sourceLeadId}
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
            onOpenProject={handleOpenProject}
        />
    );
};

const App = () => {
    // Check for public share route
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
