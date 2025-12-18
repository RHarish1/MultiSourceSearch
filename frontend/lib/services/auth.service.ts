import { LoginFormData, SignupFormData } from "@/lib/schema/auth.schema";
import { api } from "../api/client";
import { UserSchema } from "@/lib/schema/user.schema";
import { handleError } from "@/lib/errors/errorHandler";

export async function signup(data: SignupFormData) {
  return api("/auth/register", {
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

}

export async function login(data: LoginFormData) {
  return api("/auth/login", {
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
}

export async function logout() {
  try {
    await api("/auth/logout", { method: "POST" });
    return { success: true };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function getCurrentUser() {
  try {
    const response = await api("/auth/me",{method: "GET", withCredentials:true});
    const validatedUser = UserSchema.parse(response.user);
    return validatedUser;
  } catch (error) {
    handleError(error);
    return null;
  }
}
