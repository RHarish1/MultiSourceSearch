// src/utils/api.ts


export interface ApiError {
    status: number;
    message: string;
}

export type ApiResult<T> = {
    data?: T;
    error?: ApiError;
};

const BASE_URL = "http://localhost:5000";

// --- build full URL with query params ---
function buildUrl(path: string, query?: Record<string, any>) {
    if (!query) return BASE_URL + path;

    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    return `${BASE_URL}${path}?${params.toString()}`;
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
            credentials: "include", // send cookies/JWT
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            ...options,
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok) {
            return {
                error: {
                    status: res.status,
                    message: json?.message || "API error",
                },
            };
        }

        return { data: json as T };
    } catch (err: any) {
        return {
            error: {
                status: -1,
                message: err.message || "Network error",
            },
        };
    }
}

// --- convenience GET/POST/PUT/DELETE helpers ---
export const api = {
    get: <T>(path: string, query?: Record<string, any>) =>
        request<T>(path, { method: "GET" }, query),

    post: <T>(path: string, body: any) =>
        request<T>(path, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: <T>(path: string, body: any) =>
        request<T>(path, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    del: <T>(path: string) =>
        request<T>(path, { method: "DELETE" }),
};
