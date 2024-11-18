import {
  ConfirmPhoneNumberPayload,
  ConfirmPhoneNumberResponse,
  EmailVerificationPayload,
  EmailVerificationResponse,
  SignInPayload,
  SignInResponse,
  VerifyPhoneNumberPayload,
  VerifyPhoneNumberResponse,
} from "@/types";
import axiosInstance from ".";
import {
  CONFIRM_PHONE_NUMBER,
  SIGN_IN,
  VERIFY_PHONE_NUMBER,
} from "@/url/api-url";
import { AxiosError } from "axios";

// Generic GET Request
export const fetcher = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
};
export const poster = async <T, U>(url: string, data: U): Promise<T> => {
  console.log("POST Request URL:", url);
  console.log("POST Data:", data);

  const response = await axiosInstance.post<T>(url, data);
  console.log("Response Data:", response.data);
  return response.data;
};

export const handleSignIn = async (
  payload: SignInPayload
): Promise<SignInResponse> => {
  return await poster<SignInResponse, SignInPayload>(SIGN_IN, payload);
};

export const handleGetProfile = async (
  payload: SignInPayload
): Promise<SignInResponse> => {
  return await poster<SignInResponse, SignInPayload>(SIGN_IN, payload);
};

export const handleEmailVerification = async (
  payload: EmailVerificationPayload
): Promise<EmailVerificationResponse> => {
  return await poster<EmailVerificationResponse, EmailVerificationPayload>(
    CONFIRM_PHONE_NUMBER,
    payload
  );
};

export const handleConfirmPhoneNumber = async (
  payload: ConfirmPhoneNumberResponse
): Promise<ConfirmPhoneNumberResponse> => {
  return await poster<ConfirmPhoneNumberResponse, ConfirmPhoneNumberPayload>(
    CONFIRM_PHONE_NUMBER,
    payload
  );
};

export const handleVerifyPhoneNumber = async (
  payload: VerifyPhoneNumberResponse
): Promise<VerifyPhoneNumberResponse> => {
  return await poster<VerifyPhoneNumberResponse, VerifyPhoneNumberPayload>(
    VERIFY_PHONE_NUMBER,
    payload
  );
};
export const handleApiError = (
  error: unknown,
  setError: (msg: string) => void
): void => {
  if (error instanceof AxiosError) {
    console.log("error>>>", error.response?.data.errors[0].message);

    setError(error.response?.data.errors[0].message || "An error occurred");
  } else {
    setError("An unexpected error occurred");
  }
};
// Other methods (PUT, DELETE, etc.) can be added similarly
