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
                const res = await apiFetch("/auth/me", {
                    credentials: "include",
                });

                if (res.ok) {
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

    // still checking
    if (loading) return <p className="text-center mt-5">Checking auth...</p>;

    // not logged in → redirect to login
    if (!authorized) return <Navigate to="/" replace />;

    return children;
}
