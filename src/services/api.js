const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const api = {
    // Auth
    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Login failed');
        }
        return res.json();
    },

    async getCurrentUser() {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: authHeaders()
        });
        if (!res.ok) return null;
        return res.json();
    },

    // Estimates
    async getEstimates() {
        const res = await fetch(`${API_URL}/estimates`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch estimates');
        return res.json();
    },

    async getEstimate(id) {
        const res = await fetch(`${API_URL}/estimates/${id}`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch estimate');
        return res.json();
    },

    async createEstimate(name, data) {
        const res = await fetch(`${API_URL}/estimates`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, data })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create');
        }
        return res.json();
    },

    async updateEstimate(id, name, data) {
        const res = await fetch(`${API_URL}/estimates/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ name, data })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update');
        }
        return res.json();
    },

    async deleteEstimate(id) {
        const res = await fetch(`${API_URL}/estimates/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete');
        }
        return res.json();
    },

    // Sharing
    async shareEstimate(id) {
        const res = await fetch(`${API_URL}/estimates/${id}/share`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to generate share link');
        return res.json();
    },

    async getSharedEstimate(uuid) {
        // Public endpoint, no auth headers
        const res = await fetch(`${API_URL}/shared/${uuid}`);
        if (!res.ok) throw new Error('Failed to load shared estimate');
        return res.json();
    }
};
