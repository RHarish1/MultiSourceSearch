import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";

interface Props {
    children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await apiFetch("/auth/me", {
                    credentials: "include",
                });

                // /auth/me should return { user: {...} }
                if (data && data.user) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            } catch {
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <p className="text-center mt-5">Checking auth...</p>;
    }

    if (!authorized) {
        return <Navigate to="/" replace />;
    }

    return children;
}
