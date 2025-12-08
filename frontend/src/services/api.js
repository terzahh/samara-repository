/**
 * API Service Configuration
 * Centralized API client for making requests to the backend
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * API Client with common HTTP methods
 */
export const apiClient = {
    /**
     * GET request
     * @param {string} endpoint - API endpoint (e.g., '/api/users')
     * @param {object} options - Additional fetch options
     * @returns {Promise} Response data
     */
    async get(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            credentials: 'include', // Important for cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body data
     * @param {object} options - Additional fetch options
     * @returns {Promise} Response data
     */
    async post(endpoint, data, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body data
     * @param {object} options - Additional fetch options
     * @returns {Promise} Response data
     */
    async put(endpoint, data, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Additional fetch options
     * @returns {Promise} Response data
     */
    async delete(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    /**
     * Upload file(s)
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - FormData with file(s)
     * @param {object} options - Additional fetch options
     * @returns {Promise} Response data
     */
    async upload(endpoint, formData, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },
};

/**
 * Get the base API URL
 * @returns {string} API URL
 */
export const getApiUrl = () => API_URL;

export default apiClient;
