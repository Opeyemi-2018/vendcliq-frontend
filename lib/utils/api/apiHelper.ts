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
  CREATE_INVOICE,
  CREATE_CUSTOMER,
  CREATE_CART,
  PIN_VALIDATE,
  CREATE_LOAN,
  // CREATE_PIN,
  UPDATE_TRANSFER_PIN,
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
  CHANGE_PASSWORD,
  VERIFY_BANK_ACCOUNT,
  VERIFY_EMAIL,
  VERIFY_PHONE_NUMBER,
  VERIFY_VERA_BANK_ACCOUNT,
  BUY_AIRTIME,
  BUY_DATA,

  // inventory endpoints
  GET_PRODUCTS,
  CREATE_STORE,
  CREATE_STOCK,
  ADD_SHOP_ATTENDANT,
  CHECKOUT_CART,
  PAY_CART,
  ASSIGN_ATTENDANT_PERMISSIONS,
  CREATE_EXPENSE,
  UPDATE_ATTENDANT_PERMISSIONS,
  PAY_SUB,
  GET_EXPENSES,
  DELETE_EXPENSE,
  GET_SUPPLIERS,
  GET_PURCHASED_INVOICES,
  CREATE_PURCHASE,
  USER_STOCKS,
  GET_PURCHASED_INVOICE_BY_ID,
  GET_ITEM_TRACKING_STATUS,
  UPDATE_STORE_SETTINGS,
  UPDATE_STORE,
  CREATE_PIN,
  GET_SUBSCRIPTION_ME,
  CREATE_BENEFICIARY,
  GET_BENEFICIARIES,
} from "@/url/api-url";

import { AxiosError } from "axios";
import { CreateStoreFormData, CreateStoreResponse, StoreSettingsPayload, StoreSettingsResponse, UpdateStorePayload, UpdateStoreResponse } from "@/types/store";
import { CreateStockResponse, ProductsResponse } from "@/types/stock";
import { TransactionHistoryResponse } from "@/types/transactions";
import {
  CreateBeneficiaryPayload,
  CreateBeneficiaryResponse,
  GetBeneficiariesResponse,
  OtherBankTransferPayload,
  OtherBankTransferResponse,
  PinValidatePayload,
  PinValidateResponse,
  VendCliqTransferPayload,
  VendCliqTransferResponse,
} from "@/types/transfer";
import { CreateWalletResponse } from "@/types/wallet";
import {
  AddShopAttendantPayload,
  AddShopAttendantResponse,
  AssignAttendantPermissionsPayload,
  AssignAttendantPermissionsResponse,
} from "@/types/shopAttendant";
import {
  CreatePurchaseInvoicePayload,
  CreateInvoiceResponse,
} from "@/types/invoice";
import {
  CreateCustomerPayload,
  CreateCustomerResponse,
} from "@/types/customer";
import {
  CreateCartPayload,
  CreateCartResponse,
  PayInvoicePayload,
  PayInvoiceResponse,
} from "@/types/cart";
import { CheckoutResponse } from "@/types/checkOut";
import {
  BuyAirtimePayload,
  BuyAirtimeResponse,
  BuyDataPayload,
  BuyDataResponse,
} from "@/types/utilityBills";
import { PinPayload, UpdatePinResponse } from "@/types/transferPin";
import { ChangePasswordResponse } from "@/types/passwordChange";
import {
  CreateExpensePayload,
  CreateExpenseResponse,
  Expense,
} from "@/types/expenses";
import {
  GetSubscriptionResponse,
  SubscriptionPaymentPayload,
  SubscriptionPaymentResponse,
} from "@/types/plans";
import { GetSuppliersResponse, Supplier } from "@/types/supplier";
import { CreatePurchasePayload, CreatePurchaseResponse, InvoiceDetailsResponse, PurchasedInvoicesResponse, TrackingStatusResponse } from "@/types/purchase";
import { UserStocksResponse } from "@/types/allMyStocks";

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
  params?: Record<string, unknown>,
): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
};

export const poster = async <T, U = unknown>(
  url: string,
  data?: U,
  headers?: Record<string, string>,
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
  headers?: Record<string, string>,
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

export const putter = async <T, U = unknown>(
  url: string,
  data?: U,
  headers?: Record<string, string>,
): Promise<T> => {
  const response = await axiosInstance.put<T>(url, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    validateStatus: () => true,
  });
  return response.data;
};

export const deleter = async <T>(
  url: string,
  headers?: Record<string, string>,
): Promise<T> => {
  const response = await axiosInstance.delete<T>(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    validateStatus: () => true,
  });
  return response.data;
};

export const handleEmailVerification = async (
  verificationCode: string,
): Promise<OtpApiResponse> => {
  const res = await poster<OtpApiResponse>(
    VERIFY_EMAIL,
    { verificationCode },
    {
      "X-Skip-Proxy-Wrap": "true",
    },
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
      },
    );
  };

export const handleVerifyPhoneNumber = async (
  verificationCode: string,
): Promise<OtpApiResponse> => {
  return await poster<OtpApiResponse>(
    VERIFY_PHONE_NUMBER,
    { verificationCode },
    {
      "X-Skip-Proxy-Wrap": "true",
    },
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
  channel: "phone" | "whatsapp" = "phone",
): Promise<OtpApiResponse> => {
  return await poster<OtpApiResponse>(
    RESEND_VERIFICATION_TOKEN,
    {
      channel: channel,
      phone: phone,
    },
    {
      "X-Skip-Proxy-Wrap": "true",
    },
  );
};

export const handleCreatePassword = async (
  password: string,
): Promise<ApiResponse> => {
  return await poster<ApiResponse>(
    CREATE_PASSWORD,
    {
      password,
      confirmPassword: password,
    },
    {
      "x-skip-proxy-wrap": "true",
    },
  );
};

export const handleCreateBusinessDetails = async (
  payload: BusinessInfoPayload,
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
      formData,
    );
  }
  return await poster<BusinessInfoResponse>(CREATE_BUSINESS_DETAILS, data);
};

export const handleSignIn = async (
  payload: SignInPayload,
): Promise<SignInResponse> => {
  return await poster<SignInResponse>(SIGN_IN, payload);
};

// business verification

export const handleValidateBvn = async (
  payload: ValidateBvnPayload,
): Promise<ValidateBvnResponse> => {
  return await poster<ValidateBvnResponse, ValidateBvnPayload>(
    VALIDATE_BVN,
    payload,
    {
      "X-Skip-Proxy-Wrap": "true",
    },
  );
};

export const handleRequestBvnToken = async (
  payload: RequestBvnTokenPayload,
): Promise<RequestBvnTokenResponse> => {
  return await poster<RequestBvnTokenResponse, RequestBvnTokenPayload>(
    REQUEST_BVN_TOKEN,
    payload,
    {
      "X-Skip-Proxy-Wrap": "true",
    },
  );
};

export const handleVerifyBvnToken = async (
  payload: VerifyBvnTokenPayload,
): Promise<VerifyBvnTokenResponse> => {
  return await poster<VerifyBvnTokenResponse, VerifyBvnTokenPayload>(
    VERIFY_BVN_TOKEN,
    payload,
    {
      "X-Skip-Proxy-Wrap": "true",
    },
  );
};

export const handleSubmitBusinessVerification = (payload: FormData) => {
  return posterWithMultipart<UploadCacResponse>(
    UPLOAD_BUSINESS_VERIFICATION,
    payload,
    { "X-Skip-Proxy-Wrap": "true" },
  );
};

export const handleGetTransactions = async (
  page: number = 1,
): Promise<TransactionHistoryResponse> => {
  return await fetcher<TransactionHistoryResponse>(
    `${TRANSACTION_HISTORY}?page=${page}`,
  );
};

// Validate PIN to get pinToken
export const handleValidatePin = async (
  payload: PinValidatePayload,
): Promise<PinValidateResponse> => {
  return await poster<PinValidateResponse, PinValidatePayload>(
    PIN_VALIDATE,
    payload,
  );
};

// Execute VendCliq Transfer
export const handleVendCliqTransfer = async (
  payload: VendCliqTransferPayload,
): Promise<VendCliqTransferResponse> => {
  return await poster<VendCliqTransferResponse, VendCliqTransferPayload>(
    VENDCLIQ_TRANSFER,
    payload,
  );
};
// Other Bank Transfer
export const handleOtherBankTransfer = async (
  payload: OtherBankTransferPayload,
): Promise<OtherBankTransferResponse> => {
  return await poster<OtherBankTransferResponse, OtherBankTransferPayload>(
    OTHERBANK_TRANSFER,
    payload,
  );
};

export const handleCreateBeneficiary = async (
  payload: CreateBeneficiaryPayload,
): Promise<CreateBeneficiaryResponse> => {
  return await poster<CreateBeneficiaryResponse, CreateBeneficiaryPayload>(
    CREATE_BENEFICIARY,
    payload,
  );
};

export const handleGetBeneficiaries = async (): Promise<GetBeneficiariesResponse> => {
  return await fetcher<GetBeneficiariesResponse>(GET_BENEFICIARIES);
};

export const handleBuyAirtime = async (
  payload: BuyAirtimePayload,
): Promise<BuyAirtimeResponse> => {
  return await poster<BuyAirtimeResponse, BuyAirtimePayload>(
    BUY_AIRTIME,
    payload,
  );
};

export const handleBuyData = async (
  payload: BuyDataPayload,
): Promise<BuyDataResponse> => {
  return await poster<BuyDataResponse, BuyDataPayload>(BUY_DATA, payload);
};

export const handleCreateWallet = async (): Promise<CreateWalletResponse> => {
  return await poster<CreateWalletResponse>(CREATE_WALLET, {});
};

export const handleUpdateTransactionPin = async (
  payload: UpdatePinPayload,
): Promise<UpdatePinResponse> => {
  return await poster<UpdatePinResponse, UpdatePinPayload>(
    UPDATE_TRANSFER_PIN,
    payload,
  );
};

export const handleCreatePin = async (
  payload: PinPayload,
): Promise<ApiResponse> => {
  return await poster<ApiResponse, PinPayload>(CREATE_PIN, payload);
};

export const handleChangePassword = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  return await poster<ChangePasswordResponse, ChangePasswordPayload>(
    CHANGE_PASSWORD,
    payload,
  );
};


export const handleRequestPinToken = async (): Promise<ApiResponse> => {
  return await fetcher<ApiResponse>(REQUEST_PIN_TOKEN);
};

export const handleResendEmailOtp = async (
  payload: ResendEmailOtpPayload,
): Promise<ResendEmailOtpResponse> => {
  return await poster<ResendEmailOtpResponse, ResendEmailOtpPayload>(
    RESEND_EMAIL_OTP,
    payload,
  );
};

export const handleListBanks = async (): Promise<ListBanksResponse> => {
  return await fetcher<ListBanksResponse>(LIST_BANKS);
};



export const handleVerifyBankAccount = async (
  payload: VerifyBankAccountPayload,
): Promise<VerifyBankAccountResponse> => {
  return await poster<VerifyBankAccountResponse, VerifyBankAccountPayload>(
    VERIFY_BANK_ACCOUNT,
    payload,
  );
};



// export const handleRequestPinToken = async (): Promise<ApiResponse> => {
//   return await fetcher<ApiResponse>(REQUEST_PIN_TOKEN);
// };

export const handleResetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  return await poster<ResetPasswordResponse, ResetPasswordPayload>(
    RESET_PASSWORD,
    payload,
  );
};

export const handleSendOtpForForgetPassword = async (
  payload: SendOtpForForgetPasswordPayload,
): Promise<SendOtpForForgetPasswordResponse> => {
  return await poster<
    SendOtpForForgetPasswordResponse,
    SendOtpForForgetPasswordPayload
  >(SEND_OTP_FOR_FORGET_PASSWORD, payload);
};





export const handleApiError = (
  error: unknown,
  setError: (msg: string) => void,
): void => {
  if (error instanceof AxiosError) {
    setError(error.response?.data.errors?.[0]?.message || "An error occurred");
  } else {
    setError("An unexpected error occurred");
  }
};


// inventory api call

export const handleGetProducts = async (): Promise<ProductsResponse> => {
  return await fetcher<ProductsResponse>(GET_PRODUCTS);
};

export const handleCreateStore = async (
  payload: CreateStoreFormData,
): Promise<CreateStoreResponse> => {
  return await poster<CreateStoreResponse, CreateStoreFormData>(
    CREATE_STORE,
    payload,
  );
};

export const handleCreateStock = async (
  payload: any,
): Promise<CreateStockResponse> => {
  return await poster<CreateStockResponse, any>(CREATE_STOCK, payload);
};

export const handleAddShopAttendant = async (
  payload: AddShopAttendantPayload,
): Promise<AddShopAttendantResponse> => {
  return await poster<AddShopAttendantResponse, AddShopAttendantPayload>(
    ADD_SHOP_ATTENDANT,
    payload,
  );
};

export const handleCreateInvoice = async (
  payload: CreatePurchaseInvoicePayload,
): Promise<CreateInvoiceResponse> => {
  return await poster<CreateInvoiceResponse, CreatePurchaseInvoicePayload>(
    CREATE_INVOICE,
    payload,
  );
};

export const handleCreateCustomer = async (
  payload: CreateCustomerPayload,
): Promise<CreateCustomerResponse> => {
  return await poster<CreateCustomerResponse, CreateCustomerPayload>(
    CREATE_CUSTOMER,
    payload,
  );
};

export const handleAddToCart = async (
  payload: CreateCartPayload,
): Promise<CreateCartResponse> => {
  return await poster<CreateCartResponse, CreateCartPayload>(
    CREATE_CART,
    payload,
  );
};

export const handleCheckoutCart = async (): Promise<CheckoutResponse> => {
  return await poster<CheckoutResponse>(CHECKOUT_CART, {});
};

export const handlePayInvoice = async (
  invoiceId: string,
  payload: PayInvoicePayload,
): Promise<PayInvoiceResponse> => {
  return await putter<PayInvoiceResponse, PayInvoicePayload>(
    PAY_CART(invoiceId),
    payload,
  );
};

export const handleAssignAttendantPermissions = async (
  payload: AssignAttendantPermissionsPayload,
): Promise<AssignAttendantPermissionsResponse> => {
  return await poster<
    AssignAttendantPermissionsResponse,
    AssignAttendantPermissionsPayload
  >(ASSIGN_ATTENDANT_PERMISSIONS, payload);
};

export const handleCreateExpense = async (
  payload: CreateExpensePayload,
): Promise<CreateExpenseResponse> => {
  return await poster<CreateExpenseResponse, CreateExpensePayload>(
    CREATE_EXPENSE,
    payload,
  );
};

export const handleGetExpenses = async (): Promise<any> => {
  return await fetcher<any>(GET_EXPENSES);
};

export const handleDeleteExpense = async (expenseId: string): Promise<any> => {
  return await axiosInstance.delete("", {
    params: {
      endpoint: DELETE_EXPENSE(expenseId),
    },
  });
};

export const handleUpdateAttendantPermissions = async (
  payload: AssignAttendantPermissionsPayload,
): Promise<AssignAttendantPermissionsResponse> => {
  const url = UPDATE_ATTENDANT_PERMISSIONS(payload.attendant_id.toString());
  return await putter<AssignAttendantPermissionsResponse>(url, payload);
};

export const handlePaySubscription = async (
  payload: SubscriptionPaymentPayload,
): Promise<SubscriptionPaymentResponse> => {
  return await poster<SubscriptionPaymentResponse>(PAY_SUB, payload);
};

export const handleGetSuppliers = async (): Promise<Supplier> => {
  return await fetcher<any>(GET_SUPPLIERS);
};

export const handleGetPurchasedInvoices = async (): Promise<PurchasedInvoicesResponse> => {
  return await fetcher<PurchasedInvoicesResponse>(GET_PURCHASED_INVOICES);
};
export const handleCreatePurchaseWithFile = async (
  payload: CreatePurchasePayload
): Promise<CreatePurchaseResponse> => {
  return await poster<CreatePurchaseResponse>(
    CREATE_PURCHASE,
    payload
  );
};

export const handleGetUserStocks = async (
  page: number = 1,
  limit: number = 10,
): Promise<UserStocksResponse> => {
  return await fetcher<UserStocksResponse>(`${USER_STOCKS}?page=${page}&limit=${limit}`);
};


export const handleGetPurchasedInvoiceById = async (
  invoiceId: string
): Promise<InvoiceDetailsResponse> => {
  const url = GET_PURCHASED_INVOICE_BY_ID(invoiceId);
  return await fetcher<InvoiceDetailsResponse>(url);
};

export const handleGetItemTrackingStatus = async (
  itemId: string
) => {
  const url = GET_ITEM_TRACKING_STATUS(itemId);
  return await fetcher<TrackingStatusResponse>(url);
};

export const handleUpdateStoreSettings = async (
  storeId: string,
  payload: StoreSettingsPayload,
): Promise<StoreSettingsResponse> => {
  const url = UPDATE_STORE_SETTINGS(storeId);
  return await putter<StoreSettingsResponse, StoreSettingsPayload>(url, payload);
};

export const handleUpdateStore = async (
  storeId: string,
  payload: UpdateStorePayload,
): Promise<UpdateStoreResponse> => {
  const url = UPDATE_STORE(storeId);
  return await putter<UpdateStoreResponse, UpdateStorePayload>(url, payload);
};

export const handleGetMySubscription = async (): Promise<GetSubscriptionResponse> => {
  return await fetcher<GetSubscriptionResponse>(GET_SUBSCRIPTION_ME);
};

