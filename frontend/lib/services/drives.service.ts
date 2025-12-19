import { api } from "../api/client";
import { handleError } from "../errors/errorHandler";
import { isValidProvider, type ProviderType } from "../schema/drives.schema";

/**
 * Redirects to OAuth flow for connecting a drive
 */
export const connectDrive = (provider: ProviderType) => {
  if (!isValidProvider(provider)) {
    throw new Error("Invalid drive provider");
  }
  
  // Redirect to backend OAuth endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  window.location.href = `${apiUrl}/api/auth/${provider}`;
};

/**
 * Disconnects a drive from the user's account
 */
export const disconnectDrive = async (provider: ProviderType) => {
  try {
    if (!isValidProvider(provider)) {
      throw new Error("Invalid drive provider");
    }

    await api(`/auth/drives/${provider}`, {
      method: "DELETE",
    });
    
    return { success: true };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

/**
 * Gets all connected drives for the current user
 */
export const getConnectedDrives = async () => {
  try {
    const response = await api("/auth/drives", {
      method: "GET",
    });
    return response.drives;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

/**
 * Dismisses the drive connection prompt
 */
export const dismissDrivePrompt = async () => {
  try {
    await api("/auth/dismiss-drive-prompt", {
      method: "PATCH",
    });
    return { success: true };
  } catch (error) {
    throw new Error(handleError(error));
  }
};
