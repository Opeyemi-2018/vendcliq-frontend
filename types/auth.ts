/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

export interface SignUpResponse {
  status: string;
  msg: string;
  data: {
    user: {
      firstname: string;
      lastname: string;
      email: string;
      status: string;
    };
    tokens: {
      accessToken: {
        token: string;
        type: string;
        expiresIn: string;
      };
    };
    message: string;
  };
}

export interface OtpApiResponse {
  status: "success" | "failed";
  msg: string;
}

export interface LegacyApiResponse {
  status: "success" | "error";
  msg?: string;
  message?: string;
  data?: unknown;
}

export interface SignInResponse {
  status: "success" | "failed";
  msg: string;
  data: {
    tokens: {
      accessToken: {
        token: string;
        type: string;
        expiresIn: string;
      };
    };
    user: {
      userId: number;
      firstname: string;
      lastname: string;
      email: {
        email: string;
        verified: string | null;
      };
      phone: {
        number: string;
        verified: string | null;
      };
      account: {
        status: string;
        accountRole: string;
        accessLevel: number;
      };
      pin: boolean;
      identity: {
        card: string;
        verified: string | null;
      };
      referral: {
        code: string;
        referredBy: string | null;
        referralCount: number;
      };
      deviceInfo: any;
      createdAt: string;
      updatedAt: string;
      business: any;
      wallet: any;
      meta: any;
      storeIds: any;
      terminals: any[];
    };
  } | null;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// business detail
export interface BusinessInfoPayload {
  businessType: "DISTRIBUTOR" | "WHOLESALER" | "RETAILER";
  businessName: string;
  businessAddress: string;
  companyGoal: "Fast Sales" | "Higher Profit";
  logo?: File;
}

export interface BusinessInfoResponse {
  status: "success" | "failed";
  msg: string;
  data?: any;
}

export const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  referralCode: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  verificationCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must be numeric"),
});

export const confirmPhoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  isWhatsappNo: z.enum(["true", "false"]),
});

export const verifyPhoneSchema = z.object({
  phoneVerificationCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must be numeric"),
});

export const createPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain letters")
      .regex(/\d/, "Password must contain numbers")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Password must contain symbols"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const businessInformationSchema = z.object({
  businessType: z.enum(["DISTRIBUTOR", "WHOLESALER", "RETAILER"] as const, {
    error: () => ({ message: "Business type is required" }),
  }),
  companyGoal: z.enum(["Fast Sales", "Higher Profit"] as const, {
    error: () => ({ message: "Company goal is required" }),
  }),
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z
    .string()
    .min(3, "Business address must be at least 3 characters"),
  uploadedLogo: z.any().optional().nullable(),
  uploadedLogoPreview: z.string().optional().nullable(),
});

export const signInSchema = z.object({
  email: z.string().min(1, "email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const completeSignupSchema = step1Schema
  .partial()
  .merge(verifyEmailSchema.partial())
  .merge(confirmPhoneSchema.partial())
  .merge(verifyPhoneSchema.partial())
  .merge(createPasswordSchema.partial())
  .merge(businessInformationSchema.partial());

// Combined type for the entire flow
export interface ForgotPasswordFormData {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
}
export interface ResetPasswordResponse {
  status: string;
  msg: string;
}

// Step 1: Request OTP Schema
export const forgotPasswordStep1Schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

// Step 2: Reset Password Schema
export const forgotPasswordStep2Schema = z
  .object({
    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain letters")
      .regex(/\d/, "Password must contain numbers")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Password must contain special characters"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type exports

export type SignupFormData = z.infer<typeof completeSignupSchema>;
export type Step1FormData = z.infer<typeof step1Schema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ConfirmPhoneData = z.infer<typeof confirmPhoneSchema>;
export type VerifyPhoneData = z.infer<typeof verifyPhoneSchema>;
export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;
export type BusinessInformationFormData = z.infer<
  typeof businessInformationSchema
>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ForgotPasswordStep1Data = z.infer<typeof forgotPasswordStep1Schema>;
export type ForgotPasswordStep2Data = z.infer<typeof forgotPasswordStep2Schema>;
