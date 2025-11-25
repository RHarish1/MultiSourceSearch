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

export default function UploadModal({ show, onClose, onUploaded }: Props) {
    const [provider, _] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [tags, setTags] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) return alert("Select a file");

        const cleanTags = tags
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);

        if (cleanTags.length === 0) {
            return alert("Enter at least one tag");
        }

        const form = new FormData();
        form.append("provider", provider);
        form.append("file", file);
        form.append("fileName", fileName);
        form.append("tags", cleanTags.join(","));

        // IMPORTANT: use your backend URL
        const API_URL = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API_URL}/images/upload`, {
            method: "POST",
            credentials: "include",     // <-- required for cookies
            body: form,
        });

        let data: any = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (res.ok && data?.success) {
            alert("Uploaded successfully");
            onUploaded();
            onClose();
            setFile(null);
            setFileName("");
            setTags("");
        } else {
            alert("Upload failed: " + (data?.error || "Unknown error"));
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>

            <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
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
                                {/* your form fields */}
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-success" type="submit">
                                    Upload
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );

}
