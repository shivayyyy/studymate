import axios from 'axios';

export const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
});

export const chatApi = axios.create({
    baseURL: 'http://localhost:3003/api/v1/chat',
    withCredentials: true,
});

const attachToken = async (config: any) => {
    try {
        // We retrieve the active token securely from the globally exposed Clerk session
        // @ts-ignore
        if (window.Clerk && window.Clerk.session) {
            // @ts-ignore
            const token = await window.Clerk.session.getToken();
            if (token) {
                if (config.headers && typeof config.headers.set === 'function') {
                    config.headers.set('Authorization', `Bearer ${token}`);
                } else {
                    config.headers.Authorization = `Bearer ${token}`; // Fallback
                }
            }
        }
    } catch (error) {
        console.warn('Failed to retrieve Clerk session token in interceptor', error);
    }
    return config;
};

// Attach token interceptor to BOTH instances
api.interceptors.request.use(attachToken);
chatApi.interceptors.request.use(attachToken);

// Response Interceptor: Handle errors (no redirect — Clerk manages auth state)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        return Promise.reject(error);
    }
);
