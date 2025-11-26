"use server"

import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:3000",
  timeout: 10000,
});

function cleanEndpoint(endpoint:string) {
  return "/" + endpoint.replace(/^\/+|\/+$/g, "");
}

export async function apiFetch(endpoint:string, options: AxiosRequestConfig  = {}) {
  const url = cleanEndpoint(endpoint);

  try {
    const response = await api({
      url,
      method: options.method || "GET",
      params: options.params,
      data: options.data,
      headers: options.headers,
    });
    return response.data;
  } catch (error){
    if(isAxiosError(error)){
      throw error.response?.data || error.message;
    }
    throw new Error("Unexpected Error occurred!");
  }
}
