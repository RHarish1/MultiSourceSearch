"use client";
import { getCurrentUser } from "@/lib/services/auth.service";
import Dashboard from "@/components/dashboard/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { dummyUser } from "@/lib/schema/user.schema";

function Page() {
  // const user = await getCurrentUser();
  const user = dummyUser;
  const queryClient = new QueryClient();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard user={user} />
    </QueryClientProvider>
  );
}

export default Page;
