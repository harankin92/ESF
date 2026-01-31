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
    },

    // Leads
    async getLeads() {
        const res = await fetch(`${API_URL}/leads`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch leads');
        return res.json();
    },

    async getPendingLeads() {
        const res = await fetch(`${API_URL}/leads/pending`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch pending leads');
        return res.json();
    },

    async getLead(id) {
        const res = await fetch(`${API_URL}/leads/${id}`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch lead');
        return res.json();
    },

    async createLead(data) {
        const res = await fetch(`${API_URL}/leads`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create lead');
        }
        return res.json();
    },

    async updateLead(id, data) {
        const res = await fetch(`${API_URL}/leads/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update lead');
        }
        return res.json();
    },

    async addProjectOverview(id, project_overview) {
        const res = await fetch(`${API_URL}/leads/${id}/overview`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ project_overview })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to add overview');
        }
        return res.json();
    },

    async startReviewLead(id) {
        const res = await fetch(`${API_URL}/leads/${id}/review`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to start review');
        }
        return res.json();
    },

    async approveLead(id, estimate_id) {
        const res = await fetch(`${API_URL}/leads/${id}/approve`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ estimate_id })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to approve lead');
        }
        return res.json();
    },

    async deleteLead(id) {
        const res = await fetch(`${API_URL}/leads/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete lead');
        }
        return res.json();
    },

    async rejectLead(id, reason) {
        const res = await fetch(`${API_URL}/leads/${id}/reject`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ reason })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to reject lead');
        }
        return res.json();
    },

    async convertToContract(id) {
        const res = await fetch(`${API_URL}/leads/${id}/contract`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to convert to contract');
        }
        return res.json();
    },

    // Projects
    async getProjects() {
        const res = await fetch(`${API_URL}/projects`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
    },

    async getProject(id) {
        const res = await fetch(`${API_URL}/projects/${id}`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch project');
        return res.json();
    },

    async updateProject(id, data) {
        const res = await fetch(`${API_URL}/projects/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update project');
        }
        return res.json();
    },

    async updateProjectStatus(id, status) {
        const res = await fetch(`${API_URL}/projects/${id}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update project status');
        }
        return res.json();
    },

    async updateProjectCredentials(id, credentials) {
        const res = await fetch(`${API_URL}/projects/${id}/credentials`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ credentials })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update credentials');
        }
        return res.json();
    },

    async updateProjectDocumentation(id, data) {
        const res = await fetch(`${API_URL}/projects/${id}/documentation`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update documentation');
        }
        return res.json();
    },

    async addProjectChangelogEntry(id, entry) {
        const res = await fetch(`${API_URL}/projects/${id}/changelog`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ entry })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to add changelog entry');
        }
        return res.json();
    },

    async updateProjectInvoices(id, invoices) {
        const res = await fetch(`${API_URL}/projects/${id}/invoices`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ invoices })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update invoices');
        }
        return res.json();
    }
};
