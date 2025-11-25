import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";

interface User {
    username: string;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await apiFetch("/auth/me", {
                    credentials: "include",
                });

                // If backend returns { user: {...} }
                if (!data || !data.user) throw new Error("Not logged in");

                setUser(data.user);
            } catch (err) {
                navigate("/");
            }
        };

        loadUser();
    }, [navigate]);

    // Logout
    const handleLogout = async () => {
        try {
            await apiFetch("/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            navigate("/");
        } catch {
            navigate("/");
        }
    };

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard</h2>
                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* User Info */}
            <div className="alert alert-info">
                {user ? `Logged in as: ${user.username}` : "Loading user..."}
            </div>

            {/* Action Cards */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title">Manage Drives</h5>
                            <p className="card-text">Link and manage your connected cloud drives.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/manageDrives")}
                            >
                                Go to Manage Drives
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title">Image Search</h5>
                            <p className="card-text">Search your uploaded or linked images efficiently.</p>
                            <button
                                className="btn btn-success"
                                onClick={() => navigate("/imageSearch")}
                            >
                                Go to Image Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
