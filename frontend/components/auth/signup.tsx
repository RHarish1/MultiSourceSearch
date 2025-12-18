"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormData, signupSchema } from "@/lib/schema/auth.schema";
import { signup } from "@/lib/services/auth.service";
import { handleError } from "@/lib/errors/errorHandler";
import toast, { Toaster } from "react-hot-toast";

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div
    className={`flex items-center gap-2 text-xs transition-colors ${
      met ? "text-green-600" : "text-muted-foreground"
    }`}
  >
    {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    <span className={met ? "line-through" : ""}>{text}</span>
  </div>
);

export default function SignUp() {
  const router = useRouter();
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    criteriaMode: "all",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const password = watch("password") || "";

  // Check password requirements
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
    noSpaces: !/\s/.test(password) || password.length === 0,
  };

  const allRequirementsMet = Object.values(requirements).every(Boolean);

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      const response  = await signup(data);
      if(response.userId) {
        toast.success("Registered successfully");
        router.push("/dashboard");
      }
      else{
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-card">
      <Toaster />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
              PhotoVault
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Sign Up</h1>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-lg bg-card border border-border">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>
              <Controller
                control={control}
                name="username"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="John_Doe_001"
                    value={value || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="w-full"
                    autoComplete="name"
                  />
                )}
              />
              {errors.username && (
                <p className="text-xs text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="username email"
                    placeholder="you@example.com"
                    value={value || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="w-full"
                  />
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      value={value || ""}
                      onChange={onChange}
                      onBlur={() => {
                        onBlur();
                        setTimeout(() => setPasswordFocused(false), 200);
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      className="w-full pr-10"
                      autoComplete="new-password"
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements Tooltip */}
              {passwordFocused && !allRequirementsMet && (
                <div className="absolute z-10 mt-2 p-4 bg-card border border-border rounded-lg shadow-lg w-full">
                  <p className="text-xs font-medium mb-2">
                    Password must contain:
                  </p>
                  <div className="space-y-1.5">
                    <PasswordRequirement
                      met={requirements.minLength}
                      text="At least 8 characters"
                    />
                    <PasswordRequirement
                      met={requirements.hasUppercase}
                      text="One uppercase letter (A-Z)"
                    />
                    <PasswordRequirement
                      met={requirements.hasLowercase}
                      text="One lowercase letter (a-z)"
                    />
                    <PasswordRequirement
                      met={requirements.hasNumber}
                      text="One number (0-9)"
                    />
                    <PasswordRequirement
                      met={requirements.hasSpecial}
                      text="One special character (!@#$%^&*)"
                    />
                    <PasswordRequirement
                      met={requirements.noSpaces}
                      text="No spaces"
                    />
                  </div>
                </div>
              )}

              {errors.password && !passwordFocused && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={value || ""}
                      onChange={onChange}
                      onBlur={onBlur}
                      className="w-full pr-10"
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our privacy-first approach. Your data
              is always encrypted.
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
