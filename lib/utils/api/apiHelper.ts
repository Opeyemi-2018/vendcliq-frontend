/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/utils/api/apiHelper.ts
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
  ResetPasswordPayload,
  ResendVerificationResponse,
  // TransactionHistoryResponse,
  AccountResponse,
  AccountByIdResponse,
  AccountDetailsByIdResponse,
  LoanStatDetailsResponse,
  OutsideTransferPayload,
  OutsideTransferResponse,
} from "@/types";
import type {
  BusinessInfoPayload,
  BusinessInfoResponse,
  OtpApiResponse,
  ResetPasswordResponse,
} from "@/types/auth";
import {
  ValidateBvnPayload,
  ValidateBvnResponse,
  RequestBvnTokenPayload,
  RequestBvnTokenResponse,
  VerifyBvnTokenPayload,
  VerifyBvnTokenResponse,
  UploadCacPayload,
  UploadGovernmentIdPayload,
  UploadCacResponse,
} from "@/types/business";

import axiosInstance from ".";
import {
  CHANGE_PASSWORD,
  CONFIRM_PHONE_NUMBER,
  CREATE_PASSWORD,
  CREATE_BUSINESS_DETAILS,
  VALIDATE_BVN,
  REQUEST_BVN_TOKEN,
  VERIFY_BVN_TOKEN,
  UPLOAD_BUSINESS_VERIFICATION,
  RESEND_VERIFICATION_TOKEN,
  RESET_PASSWORD,
  SEND_OTP_FOR_FORGET_PASSWORD,
  SIGN_IN,
  TRANSACTION_HISTORY,
  VENDCLIQ_TRANSFER,
  OTHERBANK_TRANSFER,
  CREATE_WALLET,
  PIN_VALIDATE,
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
  UPDATE_PIN,
  VERIFY_BANK_ACCOUNT,
  VERIFY_EMAIL,
  VERIFY_PHONE_NUMBER,
  VERIFY_VERA_BANK_ACCOUNT,

  // inventory endpoints
  GET_PRODUCTS,
  CREATE_STORE,
  CREATE_STOCK,
  ADD_SHOP_ATTENDANT
} from "@/url/api-url";

import { AxiosError } from "axios";
import { CreateStoreFormData, CreateStoreResponse } from "@/types/store";
import { CreateStockResponse, ProductsResponse } from "@/types/stock";
import { TransactionHistoryResponse } from "@/types/transactions";
import {
  OtherBankTransferPayload,
  OtherBankTransferResponse,
  PinValidatePayload,
  PinValidateResponse,
  VendCliqTransferPayload,
  VendCliqTransferResponse,
} from "@/types/transfer";
import { CreateWalletResponse } from "@/types/wallet";
import { AddShopAttendantPayload, AddShopAttendantResponse } from "@/types/shopAttendant";

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
export type BusinessVerificationPayload = UploadCacPayload &
  UploadGovernmentIdPayload;

export const fetcher = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
};

export const poster = async <T, U = unknown>(
  url: string,
  data?: U,
  headers?: Record<string, string>
): Promise<T> => {
  const response = await axiosInstance.post<T>(url, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    validateStatus: () => true,
  });
  return response.data;
};

export const posterWithMultipart = async <T>(
  url: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<T> => {
  const response = await axiosInstance.post<T>("", formData, {
    params: { endpoint: url },
    headers: {
      Accept: "*/*",
      ...headers,
    },
  });
  return response.data;
};

export const handleEmailVerification = async (
  verificationCode: string
): Promise<OtpApiResponse> => {
  const res = await poster<OtpApiResponse>(
    VERIFY_EMAIL,
    { verificationCode },
    {
      "X-Skip-Proxy-Wrap": "true",
    }
  );
  return res;
};

export const handleResendEmailVerificationToken =
  async (): Promise<OtpApiResponse> => {
    return await poster<OtpApiResponse>(
      RESEND_VERIFICATION_TOKEN,
      { channel: "email" },
      {
        "X-Skip-Proxy-Wrap": "true",
      }
    );
  };

export const handleVerifyPhoneNumber = async (
  verificationCode: string
): Promise<OtpApiResponse> => {
  return await poster<OtpApiResponse>(
    VERIFY_PHONE_NUMBER,
    { verificationCode },
    {
      "X-Skip-Proxy-Wrap": "true",
    }
  );
};

export const handleConfirmPhoneNumber = async (payload: {
  phone: string;
  isWhatsappNo: "true" | "false";
}): Promise<OtpApiResponse> => {
  return await poster<OtpApiResponse>(CONFIRM_PHONE_NUMBER, payload, {
    "X-Skip-Proxy-Wrap": "true",
  });
};

export const handleResendPhoneVerificationToken = async (
  phone?: string,
  channel: "phone" | "whatsapp" = "phone"
): Promise<OtpApiResponse> => {
  return await poster<OtpApiResponse>(
    RESEND_VERIFICATION_TOKEN,
    {
      channel: channel,
      phone: phone,
    },
    {
      "X-Skip-Proxy-Wrap": "true",
    }
  );
};

export const handleCreatePassword = async (
  password: string
): Promise<ApiResponse> => {
  return await poster<ApiResponse>(
    CREATE_PASSWORD,
    {
      password,
      confirmPassword: password,
    },
    {
      "x-skip-proxy-wrap": "true",
    }
  );
};

export const handleCreateBusinessDetails = async (
  payload: BusinessInfoPayload
): Promise<BusinessInfoResponse> => {
  const { logo, ...data } = payload;
  if (logo) {
    const formData = new FormData();
    formData.append("logo", logo);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    return await posterWithMultipart<BusinessInfoResponse>(
      CREATE_BUSINESS_DETAILS,
      formData
    );
  }
  return await poster<BusinessInfoResponse>(CREATE_BUSINESS_DETAILS, data);
};

export const handleSignIn = async (
  payload: SignInPayload
): Promise<SignInResponse> => {
  return await poster<SignInResponse>(SIGN_IN, payload);
};

// business verification

export const handleValidateBvn = async (
  payload: ValidateBvnPayload
): Promise<ValidateBvnResponse> => {
  return await poster<ValidateBvnResponse, ValidateBvnPayload>(
    VALIDATE_BVN,
    payload,
    {
      "X-Skip-Proxy-Wrap": "true",
    }
  );
};

export const handleRequestBvnToken = async (
  payload: RequestBvnTokenPayload
): Promise<RequestBvnTokenResponse> => {
  return await poster<RequestBvnTokenResponse, RequestBvnTokenPayload>(
    REQUEST_BVN_TOKEN,
    payload,
    {
      "X-Skip-Proxy-Wrap": "true",
    }
  );
};

export const handleVerifyBvnToken = async (
  payload: VerifyBvnTokenPayload
): Promise<VerifyBvnTokenResponse> => {
  return await poster<VerifyBvnTokenResponse, VerifyBvnTokenPayload>(
    VERIFY_BVN_TOKEN,
    payload,
    {
      "X-Skip-Proxy-Wrap": "true",
    }
  );
};

export const handleSubmitBusinessVerification = (payload: FormData) => {
  return posterWithMultipart<UploadCacResponse>(
    UPLOAD_BUSINESS_VERIFICATION,
    payload,
    { "X-Skip-Proxy-Wrap": "true" }
  );
};

export const handleGetTransactions = async (
  page: number = 1
): Promise<TransactionHistoryResponse> => {
  return await fetcher<TransactionHistoryResponse>(
    `${TRANSACTION_HISTORY}?page=${page}`
  );
};

// Validate PIN to get pinToken
export const handleValidatePin = async (
  payload: PinValidatePayload
): Promise<PinValidateResponse> => {
  return await poster<PinValidateResponse, PinValidatePayload>(
    PIN_VALIDATE,
    payload
  );
};

// Execute VendCliq Transfer
export const handleVendCliqTransfer = async (
  payload: VendCliqTransferPayload
): Promise<VendCliqTransferResponse> => {
  return await poster<VendCliqTransferResponse, VendCliqTransferPayload>(
    VENDCLIQ_TRANSFER,
    payload
  );
};
// Other Bank Transfer
export const handleOtherBankTransfer = async (
  payload: OtherBankTransferPayload
): Promise<OtherBankTransferResponse> => {
  return await poster<OtherBankTransferResponse, OtherBankTransferPayload>(
    OTHERBANK_TRANSFER,
    payload
  );
};

// Add this to your apiHelper.ts file

export const handleCreateWallet = async (): Promise<CreateWalletResponse> => {
  return await poster<CreateWalletResponse>(CREATE_WALLET, {});
};



// export const handleGetProducts = async (): Promise<{ data: any[] }> => {
//   return await fetcher<{ data: any[] }>(GET_PRODUCTS);
// };

export const handleGetProfile = async (
  payload: SignInPayload
): Promise<SignInResponse> => {
  return await poster<SignInResponse, SignInPayload>(SIGN_IN, payload);
};

export const handleGetDashboard = async (): Promise<UserProfile> => {
  return await fetcher<UserProfile>(GET_PROFILE);
};
export const handleGetInventory = async (): Promise<InventoryResponse> => {
  if (!process.env.PRODUCT_API_KEY) throw new Error("API Key is missing");
  return await fetcher<InventoryResponse>(INVENTORY_LIST);
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

// export const handleDashboard = async (): Promise<DashboardResponse> => {
//   return await fetcher<DashboardResponse>(DASHBOARD);
// };

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

export const handleSendOtpForForgetPassword = async (
  payload: SendOtpForForgetPasswordPayload
): Promise<SendOtpForForgetPasswordResponse> => {
  return await poster<
    SendOtpForForgetPasswordResponse,
    SendOtpForForgetPasswordPayload
  >(SEND_OTP_FOR_FORGET_PASSWORD, payload);
};

// export const handleGetTransactionHistory = async (
//   page?: number
// ): Promise<TransactionHistoryResponse> => {
//   return await fetcher<TransactionHistoryResponse>(
//     `${TRANSACTION_HISTORY}?page=${page || 1}`
//   );
// };

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
    setError(error.response?.data.errors?.[0]?.message || "An error occurred");
  } else {
    setError("An unexpected error occurred");
  }
};

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

// inventory api call

// get product list
export const handleGetProducts = async (): Promise<ProductsResponse> => {
  return await fetcher<ProductsResponse>(GET_PRODUCTS);
};

// Create store
export const handleCreateStore = async (
  payload: CreateStoreFormData
): Promise<CreateStoreResponse> => {
  return await poster<CreateStoreResponse, CreateStoreFormData>(
    CREATE_STORE,
    payload
  );
};

// Create stock
export const handleCreateStock = async (
  payload: any
): Promise<CreateStockResponse> => {
  return await poster<CreateStockResponse, any>(CREATE_STOCK, payload);
};

export const handleAddShopAttendant = async (
  payload: AddShopAttendantPayload
): Promise<AddShopAttendantResponse> => {
  return await poster<AddShopAttendantResponse, AddShopAttendantPayload>(
    ADD_SHOP_ATTENDANT,
    payload
  );
};
