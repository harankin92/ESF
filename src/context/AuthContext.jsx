import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = await api.getCurrentUser();
                if (data?.user) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem('token');
                }
            } catch {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Permission helpers
    const canCreate = () => user && user.role !== 'PM';
    const canEdit = (createdBy) => {
        if (!user) return false;
        if (user.role === 'PM') return false;
        if (user.role === 'Admin') return true;
        return createdBy === user.id;
    };
    const canDelete = (createdBy) => canEdit(createdBy);

    // Lead permissions
    const canCreateLead = () => user && (user.role === 'Sale' || user.role === 'Admin');
    const canReviewLead = () => user && (user.role === 'PreSale' || user.role === 'Admin');
    const canApproveLead = () => user && (user.role === 'TechLead' || user.role === 'Admin');
    const canViewLeads = () => user && user.role !== 'TechLead'; // TechLead only sees pending
    const canViewEstimates = () => user && user.role !== 'Sale'; // Sale doesn't see estimates

    const canEditLead = (lead) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        if (user.role === 'Sale' && lead.created_by === user.id) return true;
        return false;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            canCreate,
            canEdit,
            canDelete,
            canCreateLead,
            canReviewLead,
            canApproveLead,
            canViewLeads,
            canViewEstimates,
            canEditLead // Exports the new permission
        }}>
            {children}
        </AuthContext.Provider>
    );
};
