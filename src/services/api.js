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

    async createEstimate(name, data, projectId = null) {
        const res = await fetch(`${API_URL}/estimates`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, data, project_id: projectId })
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
        const res = await fetch(`${API_URL}/shared/${uuid}`);
        if (!res.ok) throw new Error('Failed to load shared estimate');
        return res.json();
    },

    // Leads (basic client info)
    async getLeads() {
        const res = await fetch(`${API_URL}/leads`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch leads');
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

    // Requests (project details, 1 Lead -> N Requests)
    async getRequests() {
        const res = await fetch(`${API_URL}/requests`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
    },

    async getRequestsByLead(leadId) {
        const res = await fetch(`${API_URL}/requests/by-lead/${leadId}`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
    },

    async getPendingRequests() {
        const res = await fetch(`${API_URL}/requests/pending`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch pending requests');
        return res.json();
    },

    async getRequest(id) {
        const res = await fetch(`${API_URL}/requests/${id}`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch request');
        return res.json();
    },

    async createRequest(data) {
        const res = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create request');
        }
        return res.json();
    },

    async updateRequest(id, data) {
        const res = await fetch(`${API_URL}/requests/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update request');
        }
        return res.json();
    },

    async sendRequestToReview(id) {
        const res = await fetch(`${API_URL}/requests/${id}/send-to-review`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to send to review');
        }
        return res.json();
    },

    async startReviewRequest(id) {
        const res = await fetch(`${API_URL}/requests/${id}/review`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to start review');
        }
        return res.json();
    },

    async addRequestOverview(id, project_overview) {
        const res = await fetch(`${API_URL}/requests/${id}/overview`, {
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

    async approveRequest(id, estimate_id) {
        const res = await fetch(`${API_URL}/requests/${id}/approve`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ estimate_id })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to approve request');
        }
        return res.json();
    },

    async rejectRequest(id, rejection_reason) {
        const res = await fetch(`${API_URL}/requests/${id}/reject`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ rejection_reason })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to reject request');
        }
        return res.json();
    },

    // PreSale rejects request (needs more info from Sale)
    async presaleRejectRequest(id, rejection_reason) {
        const res = await fetch(`${API_URL}/requests/${id}/presale-reject`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ rejection_reason })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to reject request');
        }
        return res.json();
    },

    // PreSale sends to TechLead for estimation
    async sendToEstimation(id) {
        const res = await fetch(`${API_URL}/requests/${id}/send-to-estimation`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to send to estimation');
        }
        return res.json();
    },

    // PreSale approves estimate -> Sale Review
    async presaleApproveEstimate(id) {
        const res = await fetch(`${API_URL}/requests/${id}/presale-approve`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to approve');
        }
        return res.json();
    },

    // PreSale rejects estimate -> back to TechLead
    async presaleRejectEstimate(id, rejection_reason) {
        const res = await fetch(`${API_URL}/requests/${id}/presale-reject-estimate`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ rejection_reason })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to reject estimate');
        }
        return res.json();
    },

    // Sale accepts final estimate
    async saleAcceptEstimate(id) {
        const res = await fetch(`${API_URL}/requests/${id}/sale-accept`, {
            method: 'PUT',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to accept');
        }
        return res.json();
    },

    // Sale requests edit -> back to TechLead
    async saleRequestEdit(id, rejection_reason) {
        const res = await fetch(`${API_URL}/requests/${id}/sale-request-edit`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ rejection_reason })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to request edit');
        }
        return res.json();
    },

    async convertRequestToContract(id, project_name = null) {
        const res = await fetch(`${API_URL}/requests/${id}/contract`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ project_name })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to convert to contract');
        }
        return res.json();
    },

    async deleteRequest(id) {
        const res = await fetch(`${API_URL}/requests/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete request');
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
    },

    // Estimate Requests (for projects)
    async getEstimateRequests() {
        const res = await fetch(`${API_URL}/estimate-requests`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch estimate requests');
        return res.json();
    },

    async createEstimateRequest(projectId, scopeDescription) {
        const res = await fetch(`${API_URL}/estimate-requests`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ project_id: projectId, scope_description: scopeDescription })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create estimate request');
        }
        return res.json();
    },

    async completeEstimateRequest(requestId, estimateId) {
        const res = await fetch(`${API_URL}/estimate-requests/${requestId}/complete`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ estimate_id: estimateId })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to complete estimate request');
        }
        return res.json();
    },

    async getProjectEstimates(projectId) {
        const res = await fetch(`${API_URL}/projects/${projectId}/estimates`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch project estimates');
        return res.json();
    },

    async getProjectEstimateRequests(projectId) {
        const res = await fetch(`${API_URL}/projects/${projectId}/requests`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch project estimate requests');
        return res.json();
    },

    // Request Prioritization
    async setRequestPriority(id, priority) {
        const res = await fetch(`${API_URL}/requests/${id}/set-priority`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ priority })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to set priority');
        }
        return res.json();
    },

    async setRequestPresalePriority(id, presale_priority) {
        const res = await fetch(`${API_URL}/requests/${id}/set-presale-priority`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ presale_priority })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to set presale priority');
        }
        return res.json();
    }
};
