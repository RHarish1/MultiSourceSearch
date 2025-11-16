import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";

export default function PreventAuth({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            try {
                const data = await apiFetch("/auth/me", {
                    credentials: "include",
                });

                // If user is already logged in → redirect to dashboard
                if (data && data.user) {
                    navigate("/dashboard");
                }
            } catch {
                // Not logged in → do nothing, allow page to show
            }
        };

        check();
    }, [navigate]);

    return children;
}
