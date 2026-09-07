const TOKEN_KEY = 'apex_admin_token';
const USER_KEY = 'apex_admin_user';

// Read backend URL from Vite environment variable (set VITE_API_URL on Vercel)
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const api = {
  getBaseUrl() {
    return API_BASE_URL;
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(token, admin) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(admin));
  },

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getAdmin() {
    const data = localStorage.getItem(USER_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && endpoint.startsWith('/api/v1/admin')) {
          this.clearAuth();
          window.location.hash = '#admin';
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (err) {
      console.error('API Error:', endpoint, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async upload(file, category = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  }
};
