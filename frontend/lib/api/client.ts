import axios, { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
console.log("API Base URL:", baseURL);

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

function cleanEndpoint(endpoint: string) {
  return "/" + endpoint.replace(/^\/+|\/+$/g, "");
}

export async function api(endpoint:string, options: AxiosRequestConfig  = {}) {
  const url = cleanEndpoint(endpoint);
  const method = (options.method || "GET").toUpperCase();

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: options.headers,
    withCredentials: options.withCredentials !== undefined ? options.withCredentials : true,
  };

  if (method === "GET" || method === "DELETE" || method === "HEAD" || method === "OPTIONS") {
    if (options.params) config.params = options.params;
  } else if (method === "POST" || method === "PUT" || method === "PATCH") {
    if (options.data) config.data = options.data;
  } else {
    if (options.params) config.params = options.params;
    if (options.data) config.data = options.data;
  }

  const response = await apiClient(config);
  return response.data;
}
