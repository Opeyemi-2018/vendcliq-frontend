import {
  ConfirmPhoneNumberPayload,
  ConfirmPhoneNumberResponse,
  CreateLoanPayload,
  CreateLoanResponse,
  DashboardResponse,
  EmailVerificationPayload,
  EmailVerificationResponse,
  ListBanksResponse,
  SignInPayload,
  SignInResponse,
  VerifyPhoneNumberPayload,
  VerifyPhoneNumberResponse,
  VerifyBankAccountResponse,
  VerifyBankAccountPayload,
  ResendEmailOtpPayload,
  ResendEmailOtpResponse,
  ChangePasswordPayload,
  ApiResponse,
  PinPayload,
  UpdatePinPayload,
} from "@/types";
import axiosInstance from ".";
import {
  CHANGE_PASSWORD,
  CONFIRM_PHONE_NUMBER,
  CREATE_LOAN,
  CREATE_PIN,
  DASHBOARD,
  LIST_BANKS,
  REQUEST_PIN_TOKEN,
  RESEND_EMAIL_OTP,
  SIGN_IN,
  UPDATE_PIN,
  VERIFY_BANK_ACCOUNT,
  VERIFY_EMAIL,
  VERIFY_PHONE_NUMBER,
} from "@/url/api-url";
import { AxiosError } from "axios";

// Generic GET Request
export const fetcher = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  console.log("Response Data:", response.data);
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
  console.log("payload", payload);
  return await poster<EmailVerificationResponse, EmailVerificationPayload>(
    VERIFY_EMAIL,

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

export const handleCreateLoan = async (
  payload: CreateLoanPayload
): Promise<CreateLoanResponse> => {
  return await poster<CreateLoanResponse, CreateLoanPayload>(
    CREATE_LOAN,
    payload
  );
};
export const handleVerifyPhoneNumber = async (
  payload: VerifyPhoneNumberPayload
): Promise<VerifyPhoneNumberResponse> => {
  return await poster<VerifyPhoneNumberResponse, VerifyPhoneNumberPayload>(
    VERIFY_PHONE_NUMBER,
    payload
  );
};

export const handleResendEmailOtp = async (
  payload: ResendEmailOtpPayload
): Promise<ResendEmailOtpResponse> => {
  return await poster<ResendEmailOtpResponse, ResendEmailOtpPayload>(
    RESEND_EMAIL_OTP,
    payload
  );
};

export const handleListBanks = async (): Promise<ListBanksResponse> => {
  return await fetcher<ListBanksResponse>(LIST_BANKS);
};
export const handleDashboard = async (): Promise<DashboardResponse> => {
  return await fetcher<DashboardResponse>(DASHBOARD);
};

export const handleVerifyBankAccount = async (
  payload: VerifyBankAccountPayload
): Promise<VerifyBankAccountResponse> => {
  return await poster<VerifyBankAccountResponse, VerifyBankAccountPayload>(
    VERIFY_BANK_ACCOUNT,
    payload
  );
};
export const handleChangePassword = async (
  payload: ChangePasswordPayload
): Promise<ApiResponse> => {
  return await poster<ApiResponse, ChangePasswordPayload>(
    CHANGE_PASSWORD,
    payload
  );
};

export const handleCreatePin = async (
  payload: PinPayload
): Promise<ApiResponse> => {
  return await poster<ApiResponse, PinPayload>(CREATE_PIN, payload);
};

export const handleUpdatePin = async (
  payload: UpdatePinPayload
): Promise<ApiResponse> => {
  return await poster<ApiResponse, UpdatePinPayload>(UPDATE_PIN, payload);
};

export const handleRequestPinToken = async (): Promise<ApiResponse> => {
  return await poster<ApiResponse, object>(REQUEST_PIN_TOKEN, {});
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
