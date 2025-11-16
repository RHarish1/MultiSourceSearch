import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";

export default function PreventAuth({ children }: { children: JSX.Element }) {
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            const res = await fetch("/api/auth/me", {
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
