"use client";
import Dashboard from "@/components/dashboard/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { User } from "@/lib/schema/user.schema";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { UserSchema } from "@/lib/schema/user.schema";
import { logger } from "@/lib/logger";
import { handleError } from "@/lib/errors/errorHandler";
import { ZodError } from "zod";

// Create QueryClient outside component to avoid recreation
const queryClient = new QueryClient();

function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentUser = await api("/auth/me");
        console.log(currentUser);
        const validatedUser = UserSchema.parse(currentUser);
        setUser(validatedUser);
      } catch (err) {
        if(err instanceof ZodError){
          logger.error("User data validation error:", err);
          setError("Invalid user data. Please log in again.");
          return;
        }
        logger.error("Failed to fetch user:", err);
        setError("Unauthorized. Please log in.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "User not found"}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-primary hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard user={user} />
    </QueryClientProvider>
  );
}

export default Page;
