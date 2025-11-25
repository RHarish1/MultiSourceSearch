import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/apiFetch.ts";

interface User {
    username: string;
    email?: string;
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
            const data = await apiFetch("/auth/me", {
                credentials: "include",
            });

            if (!data || !data.user) {
                setUser(null);
            } else {
                setUser(data.user);
            }
        } catch (err: any) {
            setUser(null);
            setError(err.message || "Failed to load user");
        }

        setLoading(false);
    }, []);

    // Load user on mount
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // --- Login ---
    const login = async (login: string, password: string) => {
        try {
            await apiFetch("/auth/login", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ login, password }),
            });

            await fetchUser();
        } catch (err: any) {
            throw new Error(err.message || "Login failed");
        }
    };

    // --- Register ---
    const register = async (username: string, email: string, password: string) => {
        try {
            await apiFetch("/auth/register", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ username, email, password }),
            });

            await fetchUser();
        } catch (err: any) {
            throw new Error(err.message || "Registration failed");
        }
    };

    // --- Logout ---
    const logout = async () => {
        try {
            await apiFetch("/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            setUser(null);
        }
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
