"use server";
import { LoginFormData, SignupFormData } from "@/lib/schema/auth.schema";
import { api } from "../api/client";
import { UserSchema } from "@/lib/schema/user.schema";
import { handleError } from "@/lib/errors/errorHandler";
import { cookies } from "next/headers";

export async function signup(data: SignupFormData) {
  try {
    await api("/auth/signup", {
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function login(data: LoginFormData) {
  try {
    await api("/auth/login", {
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
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
    const response = await api("/auth/me");
    const validatedUser = UserSchema.parse(response.user);
    return validatedUser;
  } catch (error) {
    handleError(error);
    return null;
  }
}


export async function isAuthenticated() {
  const cookieStore = cookies();
  const session = (await cookieStore).get("session");
  return !!session;
}