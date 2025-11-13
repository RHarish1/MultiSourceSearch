const API_URL = "http://localhost:3000"; // backend URL

export async function me() {
    const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
    });
    return res.json();
}
