"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";


const loginInputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type LoginInputType = z.infer<typeof loginInputSchema>;

export default function Login() {
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginInputType>({
    resolver: zodResolver(loginInputSchema),
    criteriaMode: "all",
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  
  const handleLogin = async (loginData: LoginInputType) => {
    // TODO: Implement login handler
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-card transition-all">
      <div className="w-full max-w-md transition-all">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
              PhotoVault
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your private vault
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-lg bg-card border border-border">
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email webauthn"
                    placeholder="you@example.com"
                    onChange={onChange}
                    onBlur={onBlur}
                    className="w-full"
                    required
                  />
                )}
              />
              {/* Email field Errors */}
              {errors && errors.email && (
                <div className="p-1 rounded-md text-destructive text-xs flex flex-nowrap gap-1 items-center">
                  <AlertCircle className="inline size-3"/>
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full"
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&#39;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>🔒 Your connection is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
