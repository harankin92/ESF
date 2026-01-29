import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estimator from './pages/EstimatorOld';
import SharedReport from './pages/SharedReport';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'estimator'
    const [currentEstimateId, setCurrentEstimateId] = useState(null);

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
        setView('estimator');
    };

    const handleCreateNew = () => {
        setCurrentEstimateId(null);
        setView('estimator');
    };

    const handleBack = () => {
        setView('dashboard');
        setCurrentEstimateId(null);
    };

    if (view === 'estimator') {
        return (
            <Estimator
                user={user}
                estimateId={currentEstimateId}
                onBack={handleBack}
                onSaved={() => { }}
            />
        );
    }

    return (
        <Dashboard
            onOpenEstimate={handleOpenEstimate}
            onCreateNew={handleCreateNew}
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
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
