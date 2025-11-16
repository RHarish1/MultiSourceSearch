import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadModal from "../components/UploadModal.tsx";

interface Drive {
    provider: string;
    email?: string;
}

interface ImageItem {
    id: string;
    fileName: string;
    fileUrl: string;
    tags: string[];
}

export default function ImageSearch() {
    const navigate = useNavigate();

    const [drives, setDrives] = useState<Drive[]>([]);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [search, setSearch] = useState("");
    const [andSearch, setAndSearch] = useState(false);

    const [showUpload, setShowUpload] = useState(false);

    // Fetch linked drives
    const loadDrives = async () => {
        const res = await fetch("/api/auth/drives");
        const data = await res.json();
        setDrives(data.drives || []);
    };

    // Fetch user images
    const loadImages = async () => {
        const res = await fetch("/api/images");
        if (!res.ok) return navigate("/dashboard");
        setImages(await res.json());
    };

    // Delete image
    const deleteImage = async (id: string) => {
        if (!confirm("Delete this image?")) return;
        await fetch(`/api/images/${id}`, { method: "DELETE" });
        loadImages();
    };

    // Edit image
    const editImage = async (id: string) => {
        const newName = prompt("Enter new name:");
        const newTags = prompt("Enter new tags (comma-separated):");

        await fetch(`/api/images/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileName: newName,
                tags: newTags,
            }),
        });

        loadImages();
    };

    // Search request
    const searchImages = async () => {
        if (!search.trim()) {
            alert("Enter at least one tag.");
            return;
        }

        const res = await fetch(
            `/api/images/search?q=${encodeURIComponent(search)}&and=${andSearch}`
        );
        const data = await res.json();
        setImages(data.images || []);
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        navigate("/");
    };

    useEffect(() => {
        loadDrives();
        loadImages();
    }, []);

    return (
        <div className="bg-light min-vh-100">
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
                <a className="navbar-brand" href="/dashboard">
                    🖼️ Manage Images
                </a>
                <div className="ms-auto">
                    <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mt-5">
                <h3 className="mb-4">Your Uploaded Images</h3>

                {/* DRIVES SECTION */}
                <div className="mb-4">
                    <h5>Linked Drives</h5>

                    <div className="d-flex flex-wrap gap-2 mb-2">
                        {drives.length === 0 ? (
                            <p className="text-muted">No drives linked.</p>
                        ) : (
                            drives.map((d) => (
                                <span key={d.provider} className="badge bg-success">
                                    {d.provider.toUpperCase()} ({d.email || "N/A"})
                                </span>
                            ))
                        )}
                    </div>

                    <button
                        className="btn btn-primary mt-2"
                        disabled={drives.length === 0}
                        onClick={() => setShowUpload(true)}
                    >
                        Upload New Image
                    </button>
                </div>

                <hr />

                {/* SEARCH BAR */}
                <div className="input-group mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by tags (comma-separated)"
                        className="form-control"
                    />

                    <div className="input-group-text">
                        <input
                            type="checkbox"
                            checked={andSearch}
                            onChange={(e) => setAndSearch(e.target.checked)}
                            className="form-check-input mt-0"
                        />
                        <label className="ms-2 mb-0">AND Search</label>
                    </div>

                    <button className="btn btn-outline-primary" onClick={searchImages}>
                        Search
                    </button>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                            setSearch("");
                            setAndSearch(false);
                            loadImages();
                        }}
                    >
                        Clear
                    </button>
                </div>

                {/* IMAGE LIST */}
                <div className="row g-3">
                    {images.length === 0 ? (
                        <p className="text-muted">No images yet.</p>
                    ) : (
                        images.map((img) => (
                            <div className="col-md-3" key={img.id}>
                                <div className="card-body text-center border rounded p-2 bg-white shadow-sm">
                                    <p className="fw-semibold">{img.fileName}</p>
                                    <small className="text-muted">
                                        {img.tags.join(", ")}
                                    </small>
                                    <br />

                                    <a
                                        href={img.fileUrl}
                                        target="_blank"
                                        className="btn btn-sm btn-outline-primary mt-2"
                                    >
                                        View Image
                                    </a>

                                    <button
                                        className="btn btn-sm btn-warning ms-2"
                                        onClick={() => editImage(img.id)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-sm btn-danger ms-2"
                                        onClick={() => deleteImage(img.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* UPLOAD MODAL */}
            <UploadModal
                show={showUpload}
                onClose={() => setShowUpload(false)}
                drives={drives}
                onUploaded={() => loadImages()}
            />
        </div>
    );
}
