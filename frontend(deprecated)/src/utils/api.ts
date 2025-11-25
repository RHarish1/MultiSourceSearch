// src/utils/api.ts

export interface ApiError {
    status: number;
    message: string;
}

export type ApiResult<T> = {
    data?: T;
    error?: ApiError;
};

// ✔ Use environment variable
const BASE_URL = import.meta.env.VITE_API_URL as string;

// --- build full URL with query params ---
function buildUrl(path: string, query?: Record<string, any>) {
    const url = new URL(path, BASE_URL);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
}

// --- core request wrapper ---
async function request<T>(
    path: string,
    options: RequestInit = {},
    query?: Record<string, any>
): Promise<ApiResult<T>> {
    try {
        const url = buildUrl(path, query);

        const res = await fetch(url, {
            credentials: "include",        // send cookies/JWT
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        // Read raw text first (because body may be empty)
        const raw = await res.text();
        let json: any = null;

        try {
            json = raw ? JSON.parse(raw) : null;
        } catch {
            json = null;
        }

        if (!res.ok) {
            return {
                error: {
                    status: res.status,
                    message: json?.message || json?.error || "API error",
                },
            };
        }

        return { data: json as T };
    } catch (err: any) {
        return {
            error: {
                status: -1,
                message: err?.message || "Network error",
            },
        };
    }
}

// --- convenience GET/POST/PUT/DELETE helpers ---
export const api = {
    get: <T>(path: string, query?: Record<string, any>) =>
        request<T>(path, { method: "GET" }, query),

    post: <T>(path: string, body?: any) =>
        request<T>(path, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(path: string, body: any) =>
        request<T>(path, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    del: <T>(path: string) =>
        request<T>(path, { method: "DELETE" }),
};
