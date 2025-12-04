import { AxiosError } from "axios";
import { AppError } from "./AppError";
import { logger } from "../logger";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Convert any error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  // Axios error
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message || axiosError.response?.data?.error;

    // Common status code messages
    if (status === 401) return "Invalid credentials. Please try again.";
    if (status === 403) return "You don't have permission to do this.";
    if (status === 404) return "Resource not found.";
    if (status === 429) return "Too many requests. Please try again later.";
    if (status && status >= 500) return "Server error. Please try again later.";
    
    return message || "Something went wrong. Please try again.";
  }

  // Regular Error
  if (error instanceof Error) {
    return error.message;
  }

  // String
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}

/**
 * Handle error with logging - logs dev message, returns user message
 */
export function handleError(error: unknown): string {
  const userMessage = getErrorMessage(error);
  
  // Log detailed error for developers
  if (process.env.NODE_ENV !== "production") {
    if (error instanceof AppError) {
      logger.error(`[${error.statusCode}] ${error.devMessage}`, {
        userMessage: error.userMessage,
        stack: error.stack,
      });
    } else if (error && typeof error === "object" && "isAxiosError" in error) {
      const axiosError = error as AxiosError;
      logger.error("Axios error:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } else {
      logger.error("Error:", error);
    }
  }

  return userMessage;
}
