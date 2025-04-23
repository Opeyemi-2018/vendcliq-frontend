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
  GetTenuresResponse,
  RepaymentPatternResponse,
  RepaymentPatternPayload,
  PostRepaymentPatternResponse,
  LoanDetailsResponse,
  LoanResponse,
  SendOtpForForgetPasswordResponse,
  SendOtpForForgetPasswordPayload,
  ResetPasswordResponse,
  ResetPasswordPayload,
  ResendVerificationResponse,
  TransactionHistoryResponse,
  AccountResponse,
  AccountByIdResponse,
  AccountDetailsByIdResponse,
  LoanStatDetailsResponse,
  OutsideTransferPayload,
  OutsideTransferResponse,
} from "@/types";
import axiosInstance from ".";
import {
  CHANGE_PASSWORD,
  CONFIRM_PHONE_NUMBER,
  CREATE_LOAN,
  CREATE_PIN,
  DASHBOARD,
  GET_ACCOUNT,
  GET_ACCOUNT_BY_ID,
  GET_ACCOUNT_DETAILS_BY_ID,
  GET_LOAN,
  GET_LOAN_DETAILS,
  GET_PROFILE,
  GET_TENURES,
  INVENTORY_LIST,
  LIST_BANKS,
  LOAN_STAT_DETAILS,
  LOCAL_TRANSFER,
  OUTSIDE_TRANSFER,
  PAY_LOAN,
  POST_REPAYMENT_PATTERN,
  REQUEST_PIN_TOKEN,
  RESEND_EMAIL_OTP,
  RESEND_VERIFICATION_TOKEN,
  RESET_PASSWORD,
  SEND_OTP_FOR_FORGET_PASSWORD,
  SIGN_IN,
  TRANSACTION_HISTORY,
  UPDATE_PIN,
  VERIFY_BANK_ACCOUNT,
  VERIFY_EMAIL,
  VERIFY_PHONE_NUMBER,
  VERIFY_VERA_BANK_ACCOUNT,
} from "@/url/api-url";
import { AxiosError } from "axios";

interface UserProfile {
  data: {
    business: {
      profileCompletionStep: string;
      status: string;
    };
    account: {
      status: string;
    };
    phone: {
      number: string;
    };
  };
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

interface InventoryResponse {
  data: InventoryItem[];
}

interface TransferPayload {
  senderAccountId: number;
  receiverAccountNo: string;

  amount: number;
  narration: string;
  saveAsBeneficiary: boolean;
  pin: string;
}

// Generic GET Request
export const fetcher = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const response = await axiosInstance.get<T>(url, {
    params,
  });
  // console.log("Response Data:", response.data);
  return response.data;
};
export const poster = async <T, U>(
  url: string,
  data?: U,
  headers?: Record<string, string>
): Promise<T> => {
  // console.log("POST Request URL:", url);
  // console.log("POST Data:", data);

  const response = await axiosInstance.post<T>(url, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
  });
  // console.log("Response Data:", response.data);

  return response.data;
};
// Generic POST Request with multipart/form-data
export const posterWithMultipart = async <T>(
  url: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<T> => {
  // console.log("POST Multipart Request URL:", url);
  // console.log("POST FormData:", formData);

  // Use the api instance from index.ts which routes through /api/client
  const response = await axiosInstance.post<T>('', formData, {
    params: { endpoint: url }, // Pass endpoint as query param for multipart
    headers: {
      Accept: "*/*",
      ...headers,
    },
  });
  // console.log("Response Data:", response.data);

  return response.data;
};

export const handleGetDashboard = async (): Promise<UserProfile> => {
  const response = await fetcher<UserProfile>(GET_PROFILE);
  // console.log(response);
  return response;
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

export const handleGetInventory = async (): Promise<InventoryResponse> => {
  if (!process.env.PRODUCT_API_KEY) {
    // console.log("API Key is missing");
    throw new Error("API Key is missing");
  }
  return await fetcher<InventoryResponse>(INVENTORY_LIST);
};

export const handleEmailVerification = async (
  payload: EmailVerificationPayload
): Promise<EmailVerificationResponse> => {
  // console.log("payload", payload);
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

export const handleGetRepaymentPattern = async (
  tenure: string
): Promise<RepaymentPatternResponse> => {
  return await fetcher<RepaymentPatternResponse>(
    `/client/v1/loans/list/repayment_pattern?tenure=${encodeURIComponent(
      tenure
    )}`
  );
};

export const handleGetLoanDetails = async (
  id: string
): Promise<LoanDetailsResponse> => {
  return await fetcher<LoanDetailsResponse>(GET_LOAN_DETAILS(id));
};

export const handleGetLoan = async (): Promise<LoanResponse> => {
  return await fetcher<LoanResponse>(GET_LOAN);
};

export const handlePostRepaymentPattern = async (
  payload: RepaymentPatternPayload
): Promise<PostRepaymentPatternResponse> => {
  return await poster<PostRepaymentPatternResponse, RepaymentPatternPayload>(
    POST_REPAYMENT_PATTERN,
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

export const handleGetTenures = async (): Promise<GetTenuresResponse> => {
  return await fetcher<GetTenuresResponse>(GET_TENURES);
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
  return await fetcher<ApiResponse>(REQUEST_PIN_TOKEN);
};

export const handleResetPassword = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  return await poster<ResetPasswordResponse, ResetPasswordPayload>(
    RESET_PASSWORD,
    payload
  );
};

export const handleResendEmailVerificationToken =
  async (): Promise<ResendVerificationResponse> => {
    return await fetcher<ResendVerificationResponse>(
      RESEND_VERIFICATION_TOKEN,
      { channel: "email" }
    );
  };

export const handleResendPhoneVerificationToken =
  async (): Promise<ResendVerificationResponse> => {
    return await fetcher<ResendVerificationResponse>(
      RESEND_VERIFICATION_TOKEN,
      { channel: "phone" }
    );
  };

export const handleSendOtpForForgetPassword = async (
  payload: SendOtpForForgetPasswordPayload
): Promise<SendOtpForForgetPasswordResponse> => {
  return await poster<
    SendOtpForForgetPasswordResponse,
    SendOtpForForgetPasswordPayload
  >(SEND_OTP_FOR_FORGET_PASSWORD, payload);
};

export const handleGetTransactionHistory = async (
  page?: number
): Promise<TransactionHistoryResponse> => {
  return await fetcher<TransactionHistoryResponse>(
    `${TRANSACTION_HISTORY}?page=${page || 1}`
  );
};

export const handleGetAccount = async (): Promise<AccountResponse> => {
  return await fetcher<AccountResponse>(GET_ACCOUNT);
};

export const handleGetAccountById = async (
  id: string
): Promise<AccountByIdResponse> => {
  return await fetcher<AccountByIdResponse>(GET_ACCOUNT_BY_ID(id));
};

export const handleGetAccountDetailsById = async (
  id: string
): Promise<AccountDetailsByIdResponse> => {
  return await fetcher<AccountDetailsByIdResponse>(
    GET_ACCOUNT_DETAILS_BY_ID(id)
  );
};

export const handleGetLoanStatDetails =
  async (): Promise<LoanStatDetailsResponse> => {
    return await fetcher<LoanStatDetailsResponse>(LOAN_STAT_DETAILS);
  };
export const handleApiError = (
  error: unknown,
  setError: (msg: string) => void
): void => {
  if (error instanceof AxiosError) {
    // console.log("error>>>", error.response?.data.errors[0].message);

    setError(error.response?.data.errors[0].message || "An error occurred");
  } else {
    setError("An unexpected error occurred");
  }
};
// Other methods (PUT, DELETE, etc.) can be added similarly

export const handleOutsideTransfer = async (
  payload: OutsideTransferPayload
): Promise<OutsideTransferResponse> => {
  return await poster<OutsideTransferResponse, OutsideTransferPayload>(
    OUTSIDE_TRANSFER,
    payload
  );
};

export const handleLocalTransfer = async (
  payload: TransferPayload
): Promise<ApiResponse> => {
  return await poster<ApiResponse, TransferPayload>(LOCAL_TRANSFER, payload);
};

export const handleVerifyVeraBankAccount = async (
  accountNumber: string
): Promise<ApiResponse> => {
  return await fetcher<ApiResponse>(VERIFY_VERA_BANK_ACCOUNT(accountNumber));
};

export const handlePayLoan = async (
  id: string,
  amount: number
): Promise<ApiResponse> => {
  return await poster<ApiResponse, { amount: number }>(PAY_LOAN(id), {
    amount,
  });
};
