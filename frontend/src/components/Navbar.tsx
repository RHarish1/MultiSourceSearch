import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                });

                if (!res.ok) return;
                const data = await res.json();
                setUser(data.user);
            } catch { }
        };
        load();
    }, []);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        navigate("/");
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
