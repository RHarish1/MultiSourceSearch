import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch.ts";
interface User {
    username: string;
    email: string;
}

interface LinkedStatus {
    google: boolean;
    onedrive: boolean;
}

interface ApiResponse {
    user: User;
    linked: LinkedStatus;
}

export default function ManageDrives() {
    const navigate = useNavigate();

    const [data, setData] = useState<ApiResponse | null>(null);

    // Fetch linked drive status
    const loadStatus = async () => {
        const res = await apiFetch("/auth/me", {
            credentials: "include",
        });

        if (!res.ok) return navigate("/");

        const json = await res.json();
        setData(json);
    };

    const logout = async () => {
        await apiFetch("/auth/logout", { method: "POST", credentials: "include" });
        navigate("/");
    };

    useEffect(() => {
        loadStatus();
    }, []);

    return (
        <div className="bg-light min-vh-100">
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
                <a className="navbar-brand" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                    📂 Manage Drives
                </a>
                <div className="ms-auto">
                    <button className="btn btn-outline-light btn-sm" onClick={logout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mt-5">
                <h3 className="mb-4">Connected Drives</h3>

                {/* STATUS CARD */}
                {data ? (
                    <div className="card p-3 shadow-sm mb-4">
                        <p>
                            <strong>Username:</strong> {data.user.username}
                        </p>
                        <p>
                            <strong>Email:</strong> {data.user.email}
                        </p>
                        <p>
                            <strong>Google Drive:</strong>{" "}
                            {data.linked.google ? "✅ Linked" : "❌ Not linked"}
                        </p>
                        <p>
                            <strong>OneDrive:</strong>{" "}
                            {data.linked.onedrive ? "✅ Linked" : "❌ Not linked"}
                        </p>
                    </div>
                ) : (
                    <p className="text-muted">Loading drive status...</p>
                )}

                {/* LINK BUTTONS */}
                <div className="d-flex gap-3">
                    <button
                        className="btn btn-danger"
                        onClick={() => (window.location.href = "/api/auth/google")}
                    >
                        Link Google Drive
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => (window.location.href = "/api/auth/onedrive")}
                    >
                        Link OneDrive
                    </button>
                </div>
            </div>
        </div>
    );
}
