import {
  CaseDetail,
  DashboardMetrics,
  StaffUser,
  AuditEventItem,
  TriageResponse,
} from './types';

const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('cs_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('cs_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('cs_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Public reporting endpoints
  submitReport: async (formData: FormData) => {
    return request<{
      success: boolean;
      caseId: string;
      trackingSecret: string;
      category: string;
      platform: string;
      createdAt: string;
      message: string;
    }>('/reports', {
      method: 'POST',
      body: formData,
    });
  },

  trackCase: async (caseId: string, trackingSecret: string) => {
    return request<CaseDetail>('/reports/track', {
      method: 'POST',
      body: JSON.stringify({ caseId, trackingSecret }),
    });
  },

  submitFollowUp: async (caseId: string, trackingSecret: string, message: string) => {
    return request<{ success: boolean; followUp: { id: string; message: string; createdAt: string } }>(
      '/reports/follow-up',
      {
        method: 'POST',
        body: JSON.stringify({ caseId, trackingSecret, message }),
      }
    );
  },

  // Auth endpoints
  login: async (email: string, password: string) => {
    const data = await request<{ success: boolean; token: string; user: StaffUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  getMe: async () => {
    return request<{ user: StaffUser }>('/auth/me');
  },

  // Staff Cases endpoints
  getMetrics: async () => {
    return request<DashboardMetrics>('/cases/metrics');
  },

  getCases: async (params: {
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    assignedOfficerId?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.priority) query.set('priority', params.priority);
    if (params.assignedOfficerId) query.set('assignedOfficerId', params.assignedOfficerId);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return request<{ cases: CaseDetail[]; total: number; page: number; totalPages: number }>(
      `/cases?${query.toString()}`
    );
  },

  getCaseDetail: async (id: string) => {
    return request<{ case: CaseDetail }>(`/cases/${id}`);
  },

  updateStatus: async (id: string, newStatus: string, reason?: string) => {
    return request<{ success: boolean; case: CaseDetail }>(`/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ newStatus, reason }),
    });
  },

  updatePriority: async (id: string, priority: string) => {
    return request<{ success: boolean; case: CaseDetail }>(`/cases/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  },

  assignOfficer: async (id: string, officerId: string | null) => {
    return request<{ success: boolean; case: CaseDetail }>(`/cases/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ officerId }),
    });
  },

  addReporterUpdate: async (id: string, message: string, requiresInput = false) => {
    return request<{ success: boolean; update: any }>(`/cases/${id}/reporter-updates`, {
      method: 'POST',
      body: JSON.stringify({ message, requiresInput }),
    });
  },

  addInternalNote: async (id: string, content: string) => {
    return request<{ success: boolean; note: any }>(`/cases/${id}/internal-notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  recordResolution: async (id: string, resolutionDetails: string) => {
    return request<{ success: boolean; case: CaseDetail }>(`/cases/${id}/resolution`, {
      method: 'POST',
      body: JSON.stringify({ resolutionDetails }),
    });
  },

  downloadEvidenceUrl: (caseId: string, evidenceId: string) => {
    const token = getAuthToken();
    return `/api/cases/${caseId}/evidence/${evidenceId}${token ? `?auth=${token}` : ''}`;
  },

  // Admin endpoints
  getStaffUsers: async () => {
    return request<{ users: StaffUser[] }>('/admin/users');
  },

  createStaffUser: async (userData: {
    email: string;
    name: string;
    password: string;
    role: string;
    department?: string;
  }) => {
    return request<{ success: boolean; user: StaffUser }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  toggleUserStatus: async (id: string, isActive: boolean) => {
    return request<{ success: boolean; user: StaffUser }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  getAuditLogs: async (page = 1, limit = 50) => {
    return request<{ logs: AuditEventItem[]; total: number; page: number; totalPages: number }>(
      `/admin/audit-logs?page=${page}&limit=${limit}`
    );
  },

  // AI Triage endpoint
  runTriage: async (payload: { description: string; platform: string; currentCategory?: string }) => {
    return request<TriageResponse>('/ai/triage', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
