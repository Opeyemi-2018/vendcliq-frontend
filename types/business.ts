import { z } from "zod";

export interface ValidateBvnResponse {
  status: "success" | "failed";
  msg: string;
  data: {
    message: string;
    phoneNumber1: string;
    phoneNumber2: string | null;
    profileCompletionStep: string;
  };
}

export interface RequestBvnTokenResponse {
  status: "success" | "failed";
  msg: string;
  data: {
    message: string;
    phoneNumber: string;
  };
}

export interface VerifyBvnTokenResponse {
  status: "success" | "failed";
  msg: string;
  data: {
    message: string;
    profileCompletionStep: string;
  };
}

export interface ValidateBvnPayload {
  bvnNumber: string;
}

export interface RequestBvnTokenPayload {
  phoneNumber: string;
}

export interface VerifyBvnTokenPayload {
  verificationCode: string;
}

export const validateBvnSchema = z.object({
  bvnNumber: z
    .string()
    .min(11, "BVN must be 11 digits")
    .max(11, "BVN must be 11 digits")
    .regex(/^\d+$/, "BVN must contain only numbers"),
});

export const requestBvnTokenSchema = z.object({
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^\d+$/, "Phone number must contain only numbers"),
});

export const verifyBvnTokenSchema = z.object({
  verificationCode: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

export interface UploadCacPayload {
  isRegistered: "register" | "notRegistered";
  cacNumber?: string;
  cacApplicationDocumentsImage?: File;
  memartImage?: File;
}

export interface UploadGovernmentIdPayload {
  idType:
    | "votersCardId"
    | "ninId"
    | "driversLicenseId"
    | "internationalPassportId";
  idNumber: string;
  idImage: File;
}

export interface UploadCacResponse {
  status: "success" | "failed";
  msg: string;
  data?: {
    message: string;
    profileCompletionStep?: string;
  };
}

export interface UploadGovernmentIdResponse {
  status: "success" | "failed";
  msg: string;
  data?: {
    message: string;
    profileCompletionStep?: string;
  };
}

export const cacRegistrationSchema = z.object({
  isRegistered: z.enum(["register", "notRegistered"]),
  cacNumber: z.string().optional(),
  cacApplicationDocumentsImage: z.instanceof(File).optional(),
  memartImage: z.instanceof(File).optional(),
});


export const governmentIdSchema = z
  .object({
    idType: z.enum([
      "votersCardId",
      "ninId",
      "driversLicenseId",
      "internationalPassportId",
    ]),
    idNumber: z.string().min(1, "ID number is required"),
    idImage: z.instanceof(File, { message: "ID image is required" }),
  })
  .superRefine((data, ctx) => {
    const { idType, idNumber } = data;
    const trimmed = idNumber.trim();
    const digitsOnly = trimmed.replace(/\D/g, "");

    switch (idType) {
      case "ninId": {
        if (digitsOnly.length !== 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "NIN must be exactly 11 digits",
            path: ["idNumber"],
          });
        }
        if (digitsOnly !== trimmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "NIN must contain only numbers (no spaces or letters)",
            path: ["idNumber"],
          });
        }
        break;
      }

      case "internationalPassportId": {
        if (!/^[A-Za-z]\d{8}$/.test(trimmed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Passport number must be 1 letter + 8 digits (e.g., A12345678)",
            path: ["idNumber"],
          });
        }
        break;
      }

      case "votersCardId": {
        // Nigerian Voter's Card VIN is 19 digits
        if (digitsOnly.length !== 19) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Voter's Card number must be exactly 19 digits",
            path: ["idNumber"],
          });
        }
        if (digitsOnly !== trimmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Remove any spaces or special characters",
            path: ["idNumber"],
          });
        }
        break;
      }

      case "driversLicenseId": {
        // Less strict — varies by state, but usually 12 characters
        if (trimmed.length < 6 || trimmed.length > 15) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Driver's License number should be 6–15 characters",
            path: ["idNumber"],
          });
        }
        break;
      }
    }
  });
export const ID_TYPE_LABELS: Record<string, string> = {
  votersCardId: "Voter's Card",
  ninId: "NIN",
  driversLicenseId: "Driver's License",
  internationalPassportId: "International Passport",
};
export type ValidateBvnData = z.infer<typeof validateBvnSchema>;
export type RequestBvnTokenData = z.infer<typeof requestBvnTokenSchema>;
export type VerifyBvnTokenData = z.infer<typeof verifyBvnTokenSchema>;
export type CacRegistrationData = z.infer<typeof cacRegistrationSchema>;
export type GovernmentIdData = z.infer<typeof governmentIdSchema>;
