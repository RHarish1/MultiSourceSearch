import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";

interface User {
    username: string;
}

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    // fetch logged-in user
    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiFetch("/auth/me", {
                    credentials: "include",
                });

                if (data && data.user) {
                    setUser(data.user);
                }
            } catch {
                // Not logged in → ignore
            }
        };

        load();
    }, []);

    const logout = async () => {
        try {
            await apiFetch("/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            navigate("/");
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <Link className="navbar-brand" to="/dashboard">
                Multi-Drive App
            </Link>

            <div className="ms-auto d-flex align-items-center gap-3">
                {user && (
                    <span className="text-light small">
                        Logged in as <strong>{user.username}</strong>
                    </span>
                )}

                <button className="btn btn-outline-light btn-sm" onClick={logout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
