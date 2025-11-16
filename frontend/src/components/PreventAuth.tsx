import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";
export default function PreventAuth({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            const res = await apiFetch("/auth/me", {
                credentials: "include",
            });

            if (res.ok) {
                // Already logged in → redirect to dashboard
                navigate("/dashboard");
            }
        };

        check();
    }, []);

    return children;
}
