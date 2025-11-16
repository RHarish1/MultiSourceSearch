import { useState } from "react";

interface Drive {
    provider: string;
    email?: string;
}

interface Props {
    show: boolean;
    onClose: () => void;
    drives: Drive[];
    onUploaded: () => void;
}

export default function UploadModal({ show, onClose, drives, onUploaded }: Props) {
    const [provider, setProvider] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [tags, setTags] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert("Select a file");
            return;
        }

        const cleanTags = tags.split(",").map(t => t.trim()).filter(Boolean);
        if (cleanTags.length === 0) {
            alert("Enter at least one tag");
            return;
        }

        const form = new FormData();
        form.append("provider", provider);
        form.append("file", file);
        form.append("fileName", fileName);
        form.append("tags", cleanTags.join(","));

        const res = await fetch("/images/upload", {
            method: "POST",
            body: form,
        });

        const data = await res.json();

        if (data.success) {
            alert("Uploaded successfully");
            onUploaded();
            onClose();
            setFile(null);
            setFileName("");
            setTags("");
        } else {
            alert("Upload failed: " + data.error);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-backdrop fade show">
            <div className="modal d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={submit}>
                            <div className="modal-header">
                                <h5 className="modal-title">Upload Image</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={onClose}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <label className="form-label">Choose Drive</label>
                                <select
                                    className="form-select mb-3"
                                    value={provider}
                                    required
                                    onChange={(e) => setProvider(e.target.value)}
                                >
                                    <option value="">Select drive</option>
                                    {drives.map((d) => (
                                        <option key={d.provider} value={d.provider}>
                                            {d.provider.toUpperCase()} ({d.email})
                                        </option>
                                    ))}
                                </select>

                                <label className="form-label">Image</label>
                                <input
                                    type="file"
                                    className="form-control mb-3"
                                    accept="image/*"
                                    required
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />

                                <label className="form-label">Image Name</label>
                                <input
                                    className="form-control mb-3"
                                    value={fileName}
                                    required
                                    onChange={(e) => setFileName(e.target.value)}
                                />

                                <label className="form-label">Tags (comma-separated)</label>
                                <input
                                    className="form-control"
                                    value={tags}
                                    required
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-success" type="submit">
                                    Upload
                                </button>
                                <button className="btn btn-secondary" onClick={onClose} type="button">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
