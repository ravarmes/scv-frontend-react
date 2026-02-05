import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'https://scv-backend-node-sequelize.onrender.com';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout for Render.com cold starts
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
