import configs from "../configs";
import { useAuthStore, showErrorModal } from "../store";

class FetchService {
    static instance = null;

    constructor(baseUrl) {
        if (FetchService.instance) {
            return FetchService.instance;
        }
        FetchService.instance = this;
        this.baseUrl = baseUrl;
    }

    getAuthToken() {
        const store = useAuthStore.getState();
        return store.token;
    }

    async request(endpoint, options = {}, skipAuth = false) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getAuthToken();

        const headers = { ...options.headers };
        if (!skipAuth && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    useAuthStore.getState().logOut();
                    window.location.href = '/auth/sign-in';
                    return {
                        ok: false,
                        data: null,
                        message: 'Unauthorized',
                    };
                }
                const message = data.message || `HTTP error! Status: ${response.status}`;
                showErrorModal({
                    title: "Request failed",
                    message,
                    details: data?.error ? JSON.stringify(data.error, null, 2) : null,
                });
                return {
                    ok: false,
                    data: null,
                    message,
                };
            }

            return {
                ok: true,
                data,
                message: 'Request successful',
            };
        } catch (error) {
            console.error('Fetch error:', error);
            const message = error.message || 'Network error';
            showErrorModal({
                title: "Network error",
                message,
                details: error.stack || null,
            });
            return {
                ok: false,
                data: null,
                message,
            };
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    /** Public request (no JWT). Use for login, setup, forgot-password, reset-password, change-password, login-token. */
    async requestPublic(endpoint, options = {}) {
        return this.request(endpoint, options, true);
    }

    async postPublic(endpoint, body) {
        return this.requestPublic(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    /** Public POST with FormData (e.g. setup with picture). Do not set Content-Type so browser sets multipart boundary. */
    async postPublicFormData(endpoint, formData) {
        return this.requestPublic(endpoint, {
            method: 'POST',
            body: formData,
            headers: {},
        });
    }
}

const fetchService = new FetchService(configs.baseUrl);
Object.freeze(fetchService);

export default fetchService;