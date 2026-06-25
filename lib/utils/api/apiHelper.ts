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
  CREATE_WALLET,
  CREATE_INVOICE,
  CREATE_CUSTOMER,
  CREATE_CART,
  PIN_VALIDATE,
  // CREATE_LOAN,
  // CREATE_PIN,
  UPDATE_TRANSFER_PIN,
  // DASHBOARD,
  // GET_ACCOUNT,
  // GET_ACCOUNT_BY_ID,
  // GET_ACCOUNT_DETAILS_BY_ID,
  // GET_LOAN,
  // GET_LOAN_DETAILS,
  // GET_PROFILE,
  // GET_TENURES,
  // INVENTORY_LIST,
  // LIST_BANKS,
  // LOAN_STAT_DETAILS,
  // LOCAL_TRANSFER,
  // OUTSIDE_TRANSFER,
  // PAY_LOAN,
  // POST_REPAYMENT_PATTERN,
  // REQUEST_PIN_TOKEN,
  // RESEND_EMAIL_OTP,
  // VERIFY_BANK_ACCOUNT,
  // VERIFY_VERA_BANK_ACCOUNT,
  REQUEST_PIN_TOKEN,
  VERIFY_EMAIL,
  VERIFY_PHONE_NUMBER,
  BUY_AIRTIME,
  BUY_DATA,
  CHANGE_PASSWORD,

  // inventory endpoints
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
  GET_ATTENDANT_PERMISSIONS,
  GET_ATTENDANTS,
  GET_BUSINESS_REPORT_COMPARISON,
  STOCK_HISTORY,
  GET_SALES,
  GET_PURCHASE_REQUEST,
  GET_PURCHASE_REQUEST_BY_ID,
  HAND_OVER_ITEM,
  GET_SALE_BY_ID,
  SUPPLIER_SALES,
  EDIT_INVOICE,
  GET_WALLET,
  GET_STORE_ITEMS_SALES,
  CREATE_OFFER,
  GET_ALL_PRODUCTS,
  GET_PRODUCTS_PAGINATED,
  UPDATE_STOCK_PRICES,
  UPDATE_CUSTOMER,
  RETURN_CUSTOMER_EMPTIES,
  GET_CUSTOMER_BY_ID,
  GET_SUPPLIER_STORES,
  GET_STORE_STOCKS,
  SUCCESSFUL_HANDOVER,
  PAY_CART_CREDIT_OTP,
  RECORD_CREDIT_PAYMENT,
  GET_CREDIT_LEDGER,
  GET_CREDIT_LEDGER_SUMMARY,
  GET_INVOICE_BY_ID,
  GET_MANUFACTURERS,
  GET_USER_STOCKS,
  RETURN_ITEMS,
  GET_CART,
  UPDATE_CART_ITEM,
  DELETE_CART_ITEM,
  LOOKUP_ACCOUNT,
  GET_CUSTOMERS,
  GET_STORE_STOCK_BY_ID,
  GET_MARKETPLACE_STOCKS,
  GET_MARKETPLACE_STOCK_DETAIL,
  GET_MARKETPLACE_OFFERS,
  GET_OFFER_DETAIL,
  GET_NIP_BANKS,
  NAME_ENQUIRY,
  GET_PRICING_PLANS,
  GET_STOCK_DETAIL,
  UPDATE_STOCK,
  MOVE_STOCK,
  GET_STORES,
  GET_STORE_BY_ID,
  GET_SUPPLIER_STOCKS,
  GET_NETWORK_PROVIDER,
  GET_DATA_PLANS,
  TRANSACTION_BY_ID,
  WALLET_TRANSFER,
  UPDATE_BENEFICIARY,
} from "@/url/api-url";

import { AxiosError } from "axios";
import { logger } from "@/lib/logger/otel-logger";
import {
  CreateStoreFormData,
  CreateStoreResponse,
  StoreSettingsPayload,
  StoreSettingsResponse,
  UpdateStorePayload,
  UpdateStoreResponse,
} from "@/types/store";
import {
  CreateStockResponse,
  GetManufacturersResponse,
  ProductsResponse,
  StockMovementsResponse,
  UpdateStockPricesPayload,
  UpdateStockPricesResponse,
} from "@/types/stock";
import {
  TransactionByIdResponse,
  TransactionHistoryResponse,
} from "@/types/transactions";
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
  WalletTransferPayload,
  WalletTransferResponse,
} from "@/types/transfer";
import { CreateWalletResponse, GetWalletResponse } from "@/types/wallet";
import {
  AddShopAttendantPayload,
  AddShopAttendantResponse,
  AssignAttendantPermissionsPayload,
  AssignAttendantPermissionsResponse,
} from "@/types/shopAttendant";
import {
  CreatePurchaseInvoicePayload,
  CreateInvoiceResponse,
  UpdateInvoicePayload,
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
import {
  GetSuppliersResponse,
  GetSupplierStocksResponse,
  Supplier,
} from "@/types/supplier";
import {
  CreatePurchasePayload,
  CreatePurchaseResponse,
  InvoiceDetailsResponse,
  PurchasedInvoicesResponse,
  TrackingStatusResponse,
} from "@/types/purchase";
import { UserStocksResponse } from "@/types/allMyStocks";
import { BusinessReportResponse } from "@/types/businessReport";
import {
  PurchaseRequest,
  PurchaseRequestDetailResponse,
  PurchaseRequestListResponse,
} from "@/types/purchaseRequest";
import {
  SaleDetailResponse,
  SaleInvoice,
  SupplierSalesResponse,
} from "@/types/sales";
import {
  CreditLedgerResponse,
  CreditLedgerSummaryResponse,
  CreditOtpPayload,
  CreditOtpResponse,
  RecordCreditPaymentPayload,
  RecordCreditPaymentResponse,
} from "@/types/creditLedger";
import {
  ConfirmDraftPayload,
  ConfirmDraftResponse,
  ConversationMessage,
} from "@/types/chatTypes";

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
  const start = Date.now();
  logger.info(JSON.stringify({ method: "GET", url }), "API");
  try {
    const response = await axiosInstance.get<T>(url, { params });
    logger.info(
      JSON.stringify({
        method: "GET",
        url,
        status: response.status,
        duration: `${Date.now() - start}ms`,
      }),
      "API",
    );
    return response.data;
  } catch (err) {
    logger.error(
      JSON.stringify({
        method: "GET",
        url,
        duration: `${Date.now() - start}ms`,
        error: String(err),
      }),
      "API",
    );
    throw err;
  }
};

export const poster = async <T, U = unknown>(
  url: string,
  data?: U,
  headers?: Record<string, string>,
): Promise<T> => {
  const start = Date.now();
  logger.info(JSON.stringify({ method: "POST", url }), "API");
  try {
    const response = await axiosInstance.post<T>(url, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      validateStatus: () => true,
    });
    logger.info(
      JSON.stringify({
        method: "POST",
        url,
        status: response.status,
        duration: `${Date.now() - start}ms`,
      }),
      "API",
    );
    return response.data;
  } catch (err) {
    logger.error(
      JSON.stringify({
        method: "POST",
        url,
        duration: `${Date.now() - start}ms`,
        error: String(err),
      }),
      "API",
    );
    throw err;
  }
};

export const posterWithMultipart = async <T>(
  url: string,
  formData: FormData,
  headers?: Record<string, string>,
): Promise<T> => {
  const start = Date.now();
  logger.info(JSON.stringify({ method: "POST(multipart)", url }), "API");
  try {
    const response = await axiosInstance.post<T>("", formData, {
      params: { endpoint: url },
      headers: {
        Accept: "*/*",
        ...headers,
      },
    });
    logger.info(
      JSON.stringify({
        method: "POST(multipart)",
        url,
        status: response.status,
        duration: `${Date.now() - start}ms`,
      }),
      "API",
    );
    return response.data;
  } catch (err) {
    logger.error(
      JSON.stringify({
        method: "POST(multipart)",
        url,
        duration: `${Date.now() - start}ms`,
        error: String(err),
      }),
      "API",
    );
    throw err;
  }
};

export const putter = async <T, U = unknown>(
  url: string,
  data?: U,
  headers?: Record<string, string>,
): Promise<T> => {
  const start = Date.now();
  logger.info(JSON.stringify({ method: "PUT", url }), "API");
  try {
    const response = await axiosInstance.put<T>(url, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      validateStatus: () => true,
    });
    logger.info(
      JSON.stringify({
        method: "PUT",
        url,
        status: response.status,
        duration: `${Date.now() - start}ms`,
      }),
      "API",
    );
    return response.data;
  } catch (err) {
    logger.error(
      JSON.stringify({
        method: "PUT",
        url,
        duration: `${Date.now() - start}ms`,
        error: String(err),
      }),
      "API",
    );
    throw err;
  }
};

export const deleter = async <T>(
  url: string,
  headers?: Record<string, string>,
): Promise<T> => {
  const start = Date.now();
  logger.info(JSON.stringify({ method: "DELETE", url }), "API");
  try {
    const response = await axiosInstance.delete<T>(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      validateStatus: () => true,
    });
    logger.info(
      JSON.stringify({
        method: "DELETE",
        url,
        status: response.status,
        duration: `${Date.now() - start}ms`,
      }),
      "API",
    );
    return response.data;
  } catch (err) {
    logger.error(
      JSON.stringify({
        method: "DELETE",
        url,
        duration: `${Date.now() - start}ms`,
        error: String(err),
      }),
      "API",
    );
    throw err;
  }
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
  limit: number = 50,
): Promise<TransactionHistoryResponse> => {
  return await fetcher<TransactionHistoryResponse>(
    `${TRANSACTION_HISTORY}?page=${page}&limit=${limit}`,
  );
};

// Add new function:
export const handleGetTransactionById = async (
  id: string,
): Promise<TransactionByIdResponse> => {
  return await fetcher<TransactionByIdResponse>(TRANSACTION_BY_ID(id));
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

export const handleTransfer = async (
  payload: WalletTransferPayload,
): Promise<WalletTransferResponse> => {
  return await poster<WalletTransferResponse, WalletTransferPayload>(
    WALLET_TRANSFER,
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

export const handleGetBeneficiaries =
  async (): Promise<GetBeneficiariesResponse> => {
    return await fetcher<GetBeneficiariesResponse>(GET_BENEFICIARIES);
  };

export const handleUpdateBeneficiary = async (
  id: string,
  payload: { email?: string; phone?: string },
): Promise<any> => {
  return await putter<any>(UPDATE_BENEFICIARY(id), payload);
};

export const handleBuyAirtime = async (
  payload: BuyAirtimePayload,
): Promise<BuyAirtimeResponse> => {
  return await poster<BuyAirtimeResponse, BuyAirtimePayload>(
    BUY_AIRTIME,
    payload,
  );
};
export const getNetworkProvider = async (phone: string): Promise<any> => {
  return await fetcher<any>(GET_NETWORK_PROVIDER, { phone });
};

export const fetchDataPlans = async (phone: string): Promise<any> => {
  return await fetcher<any>(GET_DATA_PLANS, { phone });
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

export const lookupAccount = async (accountNumber: string): Promise<any> => {
  return await fetcher<any>(LOOKUP_ACCOUNT(accountNumber));
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

export const handleGetWallet = async (): Promise<GetWalletResponse> => {
  return await fetcher<GetWalletResponse>(GET_WALLET);
};

export const handleRequestPinToken = async (): Promise<ApiResponse> => {
  return await fetcher<ApiResponse>(REQUEST_PIN_TOKEN);
};

export const getNipBanks = async (): Promise<any> => {
  return await fetcher<any>(GET_NIP_BANKS);
};

export const performNameEnquiry = async (
  bankCode: string,
  accountNumber: string,
): Promise<any> => {
  return await poster<any>(NAME_ENQUIRY, {
    BankCode: bankCode,
    AccountNumber: accountNumber,
  });
};

// export const handleResendEmailOtp = async (
//   payload: ResendEmailOtpPayload,
// ): Promise<ResendEmailOtpResponse> => {
//   return await poster<ResendEmailOtpResponse, ResendEmailOtpPayload>(
//     RESEND_EMAIL_OTP,
//     payload,
//   );
// };

// export const handleListBanks = async (): Promise<ListBanksResponse> => {
//   return await fetcher<ListBanksResponse>(LIST_BANKS);
// };

// export const handleVerifyBankAccount = async (
//   payload: VerifyBankAccountPayload,
// ): Promise<VerifyBankAccountResponse> => {
//   return await poster<VerifyBankAccountResponse, VerifyBankAccountPayload>(
//     VERIFY_BANK_ACCOUNT,
//     payload,
//   );
// };

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
  context?: string,
): void => {
  if (error instanceof AxiosError) {
    const msg =
      error.response?.data.errors?.[0]?.message || "An error occurred";
    logger.error(
      JSON.stringify({
        url: error.config?.url,
        status: error.response?.status,
        message: msg,
      }),
      context ?? "API",
    );
    setError(msg);
  } else {
    logger.error(
      JSON.stringify({
        message: "An unexpected error occurred",
        error: String(error),
      }),
      context ?? "API",
    );
    setError("An unexpected error occurred");
  }
};

// inventory api call

export const handleGetProducts = async (
  fetchAll = false,
): Promise<ProductsResponse> => {
  const endpoint = fetchAll ? GET_ALL_PRODUCTS : GET_PRODUCTS_PAGINATED;
  return await fetcher<ProductsResponse>(endpoint);
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

export const handleUpdateInvoice = async (
  invoiceId: string,
  payload: UpdateInvoicePayload,
): Promise<CreateInvoiceResponse> => {
  return await putter<CreateInvoiceResponse, UpdateInvoicePayload>(
    EDIT_INVOICE(invoiceId),
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

export const getCustomers = async (): Promise<any> => {
  return await fetcher<any>(GET_CUSTOMERS);
};

export const handleUpdateCustomer = async (
  customerId: string,
  payload: Omit<CreateCustomerPayload, "email">,
): Promise<CreateCustomerResponse> => {
  const url = UPDATE_CUSTOMER(customerId);
  return await putter<CreateCustomerResponse, typeof payload>(url, payload);
};

export const getStoreStock = async (storeId: string): Promise<any> => {
  return await fetcher<any>(GET_STORE_STOCK_BY_ID(storeId));
};

export const getMarketplaceStocks = async (
  search = "",
  page = 1,
  limit = 20,
): Promise<any> => {
  return await fetcher<any>(GET_MARKETPLACE_STOCKS(search, page, limit));
};

export const getMarketplaceStockDetail = async (
  stockId: string,
): Promise<any> => {
  return await fetcher<any>(GET_MARKETPLACE_STOCK_DETAIL(stockId));
};

export const getMarketplaceOffers = async (): Promise<any> => {
  return await fetcher<any>(GET_MARKETPLACE_OFFERS);
};

export const getOfferDetail = async (offerId: string): Promise<any> => {
  return await fetcher<any>(GET_OFFER_DETAIL(offerId));
};

export const handleGetCustomerById = async (
  customerId: string,
): Promise<any> => {
  const url = GET_CUSTOMER_BY_ID(customerId);
  return await fetcher<any>(url);
};

export const handleReturnCustomerEmpties = async (
  customerId: string,
  emptiesId: string,
  payload: { quantityReturned: number; notes?: string },
): Promise<any> => {
  const url = RETURN_CUSTOMER_EMPTIES(customerId, emptiesId);
  return await poster<any, typeof payload>(url, payload);
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

export const getCartData = async (): Promise<any> => {
  return await fetcher<any>(GET_CART);
};

export const updateCartItem = async (
  itemId: string,
  updates: { quantity?: number; delivery?: boolean },
): Promise<any> => {
  return await putter<any>(UPDATE_CART_ITEM(itemId), updates);
};

export const deleteCartItem = async (itemId: string): Promise<any> => {
  return await axiosInstance.delete("", {
    params: {
      endpoint: DELETE_CART_ITEM(itemId),
    },
  });
};

export const handlePayInvoiceCreditOtp = async (
  invoiceId: string,
  payload: CreditOtpPayload,
): Promise<CreditOtpResponse> => {
  return await putter<CreditOtpResponse, CreditOtpPayload>(
    PAY_CART_CREDIT_OTP(invoiceId),
    payload,
  );
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
export const handleAssignAttendantPermissions = async (
  payload: AssignAttendantPermissionsPayload,
): Promise<AssignAttendantPermissionsResponse> => {
  return await poster<
    AssignAttendantPermissionsResponse,
    AssignAttendantPermissionsPayload
  >(ASSIGN_ATTENDANT_PERMISSIONS, payload);
};

export const handleUpdateAttendantPermissions = async (
  payload: AssignAttendantPermissionsPayload,
): Promise<AssignAttendantPermissionsResponse> => {
  const url = UPDATE_ATTENDANT_PERMISSIONS(payload.attendant_id.toString());
  return await putter<AssignAttendantPermissionsResponse>(url, payload);
};

export const handleGetAttendants = async (): Promise<any> => {
  return await fetcher<any>(GET_ATTENDANTS);
};

export const handleGetAttendantPermissions = async (
  attendantId: string | number,
): Promise<any> => {
  const url = GET_ATTENDANT_PERMISSIONS(attendantId);
  return await fetcher<any>(url);
};

export const handlePaySubscription = async (
  payload: SubscriptionPaymentPayload,
): Promise<SubscriptionPaymentResponse> => {
  return await poster<SubscriptionPaymentResponse>(PAY_SUB, payload);
};

export const handleGetSuppliers = async (): Promise<GetSuppliersResponse> => {
  return await fetcher<any>(GET_SUPPLIERS);
};

export const handleGetPurchasedInvoices =
  async (): Promise<PurchasedInvoicesResponse> => {
    return await fetcher<PurchasedInvoicesResponse>(GET_PURCHASED_INVOICES);
  };
export const handleCreatePurchaseWithFile = async (
  payload: CreatePurchasePayload,
): Promise<CreatePurchaseResponse> => {
  return await poster<CreatePurchaseResponse>(CREATE_PURCHASE, payload);
};

export const handleGetUserStocks = async (
  page: number = 1,
  limit: number = 10,
): Promise<UserStocksResponse> => {
  return await fetcher<UserStocksResponse>(
    `${USER_STOCKS}?page=${page}&limit=${limit}`,
  );
};

export const handleGetPurchasedInvoiceById = async (
  invoiceId: string,
): Promise<InvoiceDetailsResponse> => {
  const url = GET_PURCHASED_INVOICE_BY_ID(invoiceId);
  return await fetcher<InvoiceDetailsResponse>(url);
};

export const handleGetItemTrackingStatus = async (itemId: string) => {
  const url = GET_ITEM_TRACKING_STATUS(itemId);
  return await fetcher<TrackingStatusResponse>(url);
};

export const handleUpdateStoreSettings = async (
  storeId: string,
  payload: StoreSettingsPayload,
): Promise<StoreSettingsResponse> => {
  const url = UPDATE_STORE_SETTINGS(storeId);
  return await putter<StoreSettingsResponse, StoreSettingsPayload>(
    url,
    payload,
  );
};

export const handleGetSupplierStocks = async (
  userId: string,
): Promise<GetSupplierStocksResponse> => {
  return await fetcher<GetSupplierStocksResponse>(GET_SUPPLIER_STOCKS(userId));
};

export const handleUpdateStore = async (
  storeId: string,
  payload: UpdateStorePayload,
): Promise<UpdateStoreResponse> => {
  const url = UPDATE_STORE(storeId);
  return await putter<UpdateStoreResponse, UpdateStorePayload>(url, payload);
};

export const handleGetMySubscription =
  async (): Promise<GetSubscriptionResponse> => {
    return await fetcher<GetSubscriptionResponse>(GET_SUBSCRIPTION_ME);
  };

export const handleGetBusinessReportComparison = async (
  startDate?: string,
  endDate?: string,
  manufacturer?: string,
  sku?: string,
): Promise<BusinessReportResponse> => {
  const params: Record<string, string> = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (manufacturer) params.manufacturer = manufacturer;
  if (sku) params.sku = sku;

  return await fetcher<BusinessReportResponse>(
    GET_BUSINESS_REPORT_COMPARISON,
    params,
  );
};

export const handleGetStockMovements = async (
  stockId: string,
  page: number = 1,
  limit: number = 10,
): Promise<StockMovementsResponse> => {
  const params = { stockId, page, limit };
  return await fetcher<StockMovementsResponse>(STOCK_HISTORY, params);
};

export const getSales = async (): Promise<SaleInvoice[]> => {
  const response = await fetcher<any>(`${GET_SALES}?limit=1000`);
  return response?.data || [];
};

export const getSaleById = async (id: string): Promise<SaleDetailResponse> => {
  return await fetcher<SaleDetailResponse>(GET_SALE_BY_ID(id));
};

export const getPurchaseRequest = async (): Promise<PurchaseRequest[]> => {
  const response = await fetcher<PurchaseRequestListResponse>(
    `${GET_PURCHASE_REQUEST}?limit=1000`,
  );
  return response?.data || [];
};

// Single purchase request detail by ID
export const getPurchaseRequestById = async (
  id: string,
): Promise<PurchaseRequestDetailResponse> => {
  return await fetcher<PurchaseRequestDetailResponse>(
    GET_PURCHASE_REQUEST_BY_ID(id),
  );
};

export const verifyHandover = async (payload: {
  item_id: string;
  otp: string;
  handover_type: "customer" | "driver";
}): Promise<any> => {
  return await poster<any>(HAND_OVER_ITEM, payload);
};
export const handleSuccessfulHandover = async (payload: {
  item_id: string;
  store_id: string;
}): Promise<any> => {
  return await poster<any>(SUCCESSFUL_HANDOVER, payload);
};

export const getTotalSales = async (
  startDate: string,
  endDate: string,
): Promise<SupplierSalesResponse> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  }).toString();

  const url = `${SUPPLIER_SALES}?${params}`;

  const response = await fetcher<any>(url);

  return (response.data ?? {
    total_sales: 0,
    stores: [],
    medium: {},
  }) as SupplierSalesResponse;
};

export const getStoreStockSales = async (
  storeId: string,
  startDate: string,
  endDate: string,
): Promise<any> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    storeId,
  }).toString();

  const url = `${GET_STORE_ITEMS_SALES}?${params}`;

  return await fetcher(url);
};

export const handleCreatePromo = async (payload: {
  stock_id: string;
  qty: number;
  price: number;
  expiry_date: string;
  minimum_qty: number;
  supply_fee: number;
}): Promise<any> => {
  return await poster(CREATE_OFFER, payload);
};

export const handleUpdateStockPrices = async (
  stockId: string,
  payload: UpdateStockPricesPayload,
): Promise<UpdateStockPricesResponse> => {
  const url = UPDATE_STOCK_PRICES(stockId);
  return await putter<UpdateStockPricesResponse, UpdateStockPricesPayload>(
    url,
    payload,
  );
};

export const handleGetSupplierStores = async (userId: number): Promise<any> => {
  return await fetcher<any>(GET_SUPPLIER_STORES(userId));
};

export const handleGetStoreStocks = async (storeId: string): Promise<any> => {
  return await fetcher<any>(GET_STORE_STOCKS(storeId));
};

export const getCreditLedger = async (
  page: number = 1,
  limit: number = 5,
  search: string = "",
  status: string = "",
): Promise<CreditLedgerResponse> => {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (search) params.search = search;
  if (status) params.status = status;

  return await fetcher<CreditLedgerResponse>(GET_CREDIT_LEDGER(), params);
};

export const recordCreditPayment = async (
  uuid: string,
  payload: RecordCreditPaymentPayload,
): Promise<RecordCreditPaymentResponse> => {
  return await poster<RecordCreditPaymentResponse, RecordCreditPaymentPayload>(
    RECORD_CREDIT_PAYMENT(uuid),
    payload,
  );
};

export const getCreditLedgerSummary =
  async (): Promise<CreditLedgerSummaryResponse> => {
    return await fetcher<CreditLedgerSummaryResponse>(
      GET_CREDIT_LEDGER_SUMMARY(),
    );
  };

export const getInvoiceById = async (id: string) => {
  return await fetcher<any>(GET_INVOICE_BY_ID(id));
};

export const getManufacturers = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
): Promise<GetManufacturersResponse> => {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (search && search.trim()) {
    params.search = search.trim();
  }

  return await fetcher<GetManufacturersResponse>(GET_MANUFACTURERS, params);
};

export const getUserStocks = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
): Promise<any> => {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (search) params.search = search;

  return await fetcher<any>(GET_USER_STOCKS, params);
};

export const handleReturnItems = async (payload: {
  invoice_id: string;
  items: { item_id: string; quantity: number; reason: string }[];
}): Promise<any> => {
  return await poster<any>(RETURN_ITEMS, payload);
};

export const fetchPricingPlans = async (): Promise<any> => {
  return await fetcher<any>(GET_PRICING_PLANS);
};

export const getStores = async (): Promise<any> => {
  return await fetcher<any>(GET_STORES);
};

export const getStoreById = async (storeId: string): Promise<any> => {
  return await fetcher<any>(GET_STORE_BY_ID(storeId));
};

export const moveStock = async (
  targetStoreId: string,
  items: Array<{ stock_id: string; quantity: number; selling_price: number }>,
): Promise<any> => {
  return await poster<any>(MOVE_STOCK, {
    target_store_id: targetStoreId,
    items,
  });
};

export const updateStock = async (
  stockId: string,
  data: {
    cost_price: number;
    selling_price: number;
    selling_price_pieces: number;
    empties_price: number;
    exp_date: string;
    stock_alert_no: number;
    sku: string;
    remark: string;
  },
): Promise<any> => {
  return await putter<any>(UPDATE_STOCK(stockId), data);
};

export const updateStockWithMovement = async (
  stockId: string,
  data: {
    action: "Added" | "Removed";
    quantity: number;
    empties_qty: number;
    remark: string;
  },
): Promise<any> => {
  return await putter<any>(UPDATE_STOCK(stockId), data);
};

export const getStockDetail = async (
  stockId: string,
  storeId: string,
): Promise<any> => {
  return await fetcher<any>(GET_STOCK_DETAIL(stockId, storeId));
};

export const handleChatMessage = async (
  message: string,
  conversationUuid?: string,
  onEvent?: (event: any) => void,
  signal?: AbortSignal,
): Promise<string> => {
  const payload: any = { message };
  if (conversationUuid) {
    payload.conversation_uuid = conversationUuid;
  }

  // No token needed here - cookies will be sent automatically
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  // Handle SSE stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  if (!reader) throw new Error("No reader available");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (onEvent) onEvent(data);
          if (data.type === "token" && data.text) {
            fullText += data.text;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  return fullText;
};

export const handleConfirmDraft = async (confirmId: string): Promise<any> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ confirm_id: confirmId }),
  });

  return await response.json();
};

export const getConversations = async (
  limit = 30,
  offset = 0,
): Promise<any> => {
  const response = await fetch(
    `/api/conversation?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  return await response.json();
};

export const getConversationMessages = async (
  uuid: string,
): Promise<ConversationMessage[]> => {
  const response = await fetch(`/api/conversation/${uuid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch conversation messages");
  }

  const data = await response.json();
  return data.items || [];
};

export const deleteConversation = async (uuid: string): Promise<any> => {
  const response = await fetch(`/api/conversation/${uuid}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete conversation");
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
};
