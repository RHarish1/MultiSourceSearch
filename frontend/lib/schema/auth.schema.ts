import {z} from "zod";

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginFormData = z.infer<typeof loginInputSchema>;

// ********************** SIGN-UP **********************

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full Name is required")
      .max(100, "Full Name is too long"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
      })
      .refine((val) => /[!@#$%^&*]/.test(val), {
        message:
          "Password must contain at least one special character (!@#$%^&*)",
      })
      .refine((val) => !/\s/.test(val), {
        message: "Password must not contain spaces",
      }),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupFormData = z.infer<typeof signupSchema>;