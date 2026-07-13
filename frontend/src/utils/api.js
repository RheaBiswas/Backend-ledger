const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        // Token expired or invalid, log out
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
    }
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
};

export const api = {
    auth: {
        async login(email, password) {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await handleResponse(res);
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new Event("auth-changed"));
            }
            return data;
        },

        async register(email, name, password) {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password }),
            });
            const data = await handleResponse(res);
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new Event("auth-changed"));
            }
            return data;
        },

        async logout() {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: "POST",
                    headers: getHeaders(),
                });
            } catch (e) {
                console.error("Logout request failed:", e);
            } finally {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("auth-changed"));
            }
        },

        async forgotPassword(email) {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            return handleResponse(res);
        },

        async resetPassword(token, newPassword) {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            return handleResponse(res);
        },

        getCurrentUser() {
            const userStr = localStorage.getItem("user");
            try {
                return userStr ? JSON.parse(userStr) : null;
            } catch (e) {
                return null;
            }
        },

        isAuthenticated() {
            return !!localStorage.getItem("token");
        }
    },

    accounts: {
        async list() {
            const res = await fetch(`${API_URL}/accounts`, {
                method: "GET",
                headers: getHeaders(),
            });
            return handleResponse(res);
        },

        async create() {
            const res = await fetch(`${API_URL}/accounts`, {
                method: "POST",
                headers: getHeaders(),
            });
            return handleResponse(res);
        },

        async getBalance(accountId) {
            const res = await fetch(`${API_URL}/accounts/balance/${accountId}`, {
                method: "GET",
                headers: getHeaders(),
            });
            return handleResponse(res);
        },

        async getLedger(accountId) {
            const res = await fetch(`${API_URL}/accounts/${accountId}/ledger`, {
                method: "GET",
                headers: getHeaders(),
            });
            return handleResponse(res);
        }
    },

    transactions: {
        async list() {
            const res = await fetch(`${API_URL}/transactions`, {
                method: "GET",
                headers: getHeaders(),
            });
            return handleResponse(res);
        },

        async create(fromAccount, toAccount, amount, idempotencyKey) {
            const res = await fetch(`${API_URL}/transactions`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ fromAccount, toAccount, amount: Number(amount), idempotencyKey }),
            });
            return handleResponse(res);
        },

        async mint(toAccount, amount, idempotencyKey) {
            const res = await fetch(`${API_URL}/transactions/system/initial-funds`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ toAccount, amount: Number(amount), idempotencyKey }),
            });
            return handleResponse(res);
        }
    }
};
