/* eslint-disable @typescript-eslint/no-explicit-any */
// types.ts

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

// This is what your OTP endpoints ACTUALLY return
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

// types/auth.ts (or wherever you keep your types)

// types/auth.ts
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

// export interface PlanEntity {
//   id: number;
//   name: string;
//   monthlyPrice: number;
//   yearlyPrice: number;
//   webOnly: boolean;
//   storeLimit: number;
//   productLimitPerStore: number;
//   shopAttendantLimit: number;
//   aiStockRecommendationLimit: number;
//   hasPOSDevice: boolean;
//   autoStockUpdate: boolean;
//   invoiceAllowed: boolean;
//   createdAt: string;
//   updatedAt: string;
//   __entity: string;
// }

// export interface PlansApiResponse {
//   statusCode: number;
//   error: null | string;
//   data: PlanEntity[];
//   pagination: null | any;
// }

// export interface PlanFeature {
//   name: string;
//   included: boolean;
// }

// export interface DisplayPlan {
//   id: number;
//   name: string;
//   description: string;
//   monthlyPrice: number;
//   annualPrice: number;
//   badge?: string;
//   features: PlanFeature[];
//   buttonText: string;
//   borderColor: string;
//   bgColor: string;
//   isEnterprise?: boolean;
// }

export interface ContactResponse {
  success: boolean;
  message: string;
}

export const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  referralCode: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  verificationCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must be numeric"),
});

export const confirmPhoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  isWhatsappNo: z.string(),
});

export const verifyPhoneSchema = z.object({
  verificationCode: z
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
  businessType: z.string().min(1, "Business type is required"),
  companyGoal: z.string().min(1, "Company goal is required"),
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z
    .string()
    .min(3, "Business address must be at least 3 characters"),
  logo: z.any().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
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
