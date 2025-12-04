import { api } from "../api/client";
import { handleError } from "../errors/errorHandler";

export const connectDrive = async (id: string, driveName: string) => {
  try {
    const response = await api("/user/connect-drive", {
      method: "POST",
      data: { id, driveName },
    });
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const disconnectDrive = async (id: string, driveName: string) => {
  try {
    const response = await api("/user/disconnect-drive", {
      method: "POST",
      data: { id, driveName },
    });
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};
