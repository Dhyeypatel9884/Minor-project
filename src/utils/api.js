/**
 * Centralized API utility
 * Automatically attaches JWT Bearer token to all requests
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const getToken = () => localStorage.getItem('token');

const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        ...(options.headers || {}),
    };

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        const message = data?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data;
};

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    put: (endpoint, body) => apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

export default api;
