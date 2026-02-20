import axios from 'axios';

export const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
});

export const chatApi = axios.create({
    baseURL: 'http://localhost:3003/api/v1/chat',
    withCredentials: true,
});

// Request Interceptor: Attach Clerk session token
let getTokenFn: (() => Promise<string | null>) | null = null;

export const setClerkGetToken = (fn: () => Promise<string | null>) => {
    getTokenFn = fn;
};

// Helper to wait until `getTokenFn` is defined
const waitForGetTokenFn = async (maxWaitMs = 5000): Promise<(() => Promise<string | null>) | null> => {
    const startTime = Date.now();
    while (!getTokenFn) {
        if (Date.now() - startTime > maxWaitMs) return null;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return getTokenFn;
};

const attachToken = async (config: any) => {
    const fn = await waitForGetTokenFn();
    if (fn) {
        const token = await fn();
        console.log('[AXIOS INTERCEPTOR] URL:', config.url, 'Token obtained:', token ? (token.substring(0, 10) + '...') : 'null');
        if (token) {
            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers.Authorization = `Bearer ${token}`; // Fallback
            }
        }
    } else {
        console.warn('[AXIOS INTERCEPTOR] getTokenFn was never initialized');
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
