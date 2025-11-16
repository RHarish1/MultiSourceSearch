import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/apiFetch.ts";
interface User {
    username: string;
    email?: string;
}

interface AuthResponse {
    user: User;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch current user ---
    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await apiFetch("/auth/me", {
                credentials: "include",
            });

            if (res.ok) {
                const data: AuthResponse = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err: any) {
            setUser(null);
            setError(err.message);
        }

        setLoading(false);
    }, []);

    // Load user on mount
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // --- Login ---
    const login = async (login: string, password: string) => {
        const res = await apiFetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ login, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Login failed");
        }

        await fetchUser();
    };

    // --- Register ---
    const register = async (username: string, email: string, password: string) => {
        const res = await apiFetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Registration failed");
        }

        await fetchUser();
    };

    // --- Logout ---
    const logout = async () => {
        await apiFetch("/auth/logout", { method: "POST", credentials: "include" });
        setUser(null);
    };

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        fetchUser,
        isAuthenticated: !!user,
    };
}
