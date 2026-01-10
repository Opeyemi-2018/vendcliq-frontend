//client v2 endpoints
const SIGN_UP = "/client/v2/auth/signup";
const RESEND_VERIFICATION_TOKEN = "/client/v2/auth/resend-verification";
const VERIFY_EMAIL = "/client/v2/auth/verify-email";
const CONFIRM_PHONE_NUMBER = "/client/v2/auth/confirm-phone";
const VERIFY_PHONE_NUMBER = "/client/v2/auth/verify-phone";
const CREATE_PASSWORD = "/client/v2/auth/create-password";
const CREATE_BUSINESS_DETAILS = "/client/v2/profile/business-information";
const SIGN_IN = "/client/v2/auth/signin";
const VALIDATE_BVN = "/client/v2/profile/validate-bvn";
const REQUEST_BVN_TOKEN = "/client/v2/profile/send-bvn-otp";
const VERIFY_BVN_TOKEN = "/client/v2/profile/validate-bvn-token";
const UPLOAD_BUSINESS_VERIFICATION =
  "/client/v2/profile/upload-identity-documents";
const SEND_OTP_FOR_FORGET_PASSWORD = "/client/v2/auth/forgot-password";
const RESET_PASSWORD = "/client/v2/auth/reset-password";
const TRANSACTION_HISTORY = "/client/v2/wallets/transactions";
const VENDCLIQ_TRANSFER = "/client/v2/wallets/transfers/vendcliq";
const OTHERBANK_TRANSFER = "/client/v2/wallets/transfer";
const PIN_VALIDATE = "/client/v2/wallets/validate-pin";
const BUY_AIRTIME = "/client/v2/payments/airtime";
const BUY_DATA = "/client/v2/payments/data";
const CREATE_WALLET = "/client/v2/wallets/virtual-accounts/create";

// v1 endpoint
const BUSINESS_INFORMATION_SETUP_STEP_ONE =
  "/client/v1/auth/business-information";
const BUSINESS_INFORMATION_SETUP_STEP_TWO =
  "/client/v1/auth/business-information-step2";
const IDENTITY_UPLOAD = "/client/v1/auth/upload-identity";
const GET_PROFILE = "/";
const DASHBOARD = "/";
const CREATE_LOAN = "/client/v1/loans";
const GET_LOAN = "/client/v1/loans";
const GET_LOAN_DETAILS = (id: string) => `/client/v1/loans/${id}`;
const LIST_BANKS = "/client/v1/bank-accounts/banks/all";
const VERIFY_BANK_ACCOUNT =
  "/client/v1/bank-accounts/banks/verify-bank-account";
const RESEND_EMAIL_OTP = "/client/v1/auth/resend-otp";
const CHANGE_PASSWORD = "/client/v1/auth/change-password";
const CREATE_PIN = "/client/v1/auth/pin";
const UPDATE_PIN = "/client/v1/auth/pin-update";
const REQUEST_PIN_TOKEN = "/client/v1/auth/request-pin-token";
const GET_TENURES = "/client/v1/loans/list/tenures";
const REPAYMENT_PATTERN = (tenure: string) =>
  `/client/v1/loans/list/repayment-pattern?tenure=${tenure}`;
const POST_REPAYMENT_PATTERN = "/client/v1/loans/repayment/pattern";
const INVENTORY_LIST = "/v1/inventory/search";
const GET_BANK_ACCOUNT = "/client/v1/bank-accounts";
const TRANSACTION_HISTORYs = "/client/v1/transactions";
const GET_ACCOUNT = "/client/v1/bank-accounts";
const GET_ACCOUNT_BY_ID = (id: string) => `/client/v1/bank-accounts/${id}`;
const GET_ACCOUNT_DETAILS_BY_ID = (id: string) =>
  `/client/v1/bank-accounts/accounts/${id}`;
const LOAN_STAT_DETAILS = "/client/v1/loans/dashboard";
const OUTSIDE_TRANSFER = "/client/v1/transfer/outside";
const LOCAL_TRANSFER = "/client/v1/transfer/local";
const VERIFY_VERA_BANK_ACCOUNT = (accountNumber: string) =>
  `/client/v1/bank-accounts/accounts/verify/${accountNumber}`;
const PAY_LOAN = (id: string) =>
  `/client/v1/loans/repayments/installment/${id}`;
// EXPORT URLS

// inventory endpoint
const CREATE_STORE = "inventory/stores";
const CREATE_STOCK = "inventory/stocks";
const GET_PRODUCTS = "inventory/products?page=1&limit=50&all=false&search=";
const ADD_SHOP_ATTENDANT = "client/v2/attendants";
const CREATE_INVOICE = "inventory/invoices";
const CREATE_CUSTOMER = "inventory/customers";
const CREATE_CART = "inventory/carts";
const CHECKOUT_CART = "inventory/carts/checkout";
const PAY_CART = (invoiceId: string) => `inventory/invoices/${invoiceId}/pay`;

export {
  // v2 endpoint
  VERIFY_EMAIL,
  CONFIRM_PHONE_NUMBER,
  CREATE_PASSWORD,
  SIGN_IN,
  SIGN_UP,
  VERIFY_PHONE_NUMBER,
  CREATE_BUSINESS_DETAILS,
  VALIDATE_BVN,
  REQUEST_BVN_TOKEN,
  VERIFY_BVN_TOKEN,
  UPLOAD_BUSINESS_VERIFICATION,
  CREATE_STORE,
  CREATE_STOCK,
  GET_PRODUCTS,
  SEND_OTP_FOR_FORGET_PASSWORD,
  RESET_PASSWORD,
  RESEND_VERIFICATION_TOKEN,
  TRANSACTION_HISTORY,
  VENDCLIQ_TRANSFER,
  OTHERBANK_TRANSFER,
  PIN_VALIDATE,
  BUY_AIRTIME,
  BUY_DATA,
  CREATE_WALLET,
  ADD_SHOP_ATTENDANT,
  CREATE_INVOICE,
  CREATE_CUSTOMER,
  CREATE_CART,
  CHECKOUT_CART,
  PAY_CART,
  // v1 endpoint
  GET_PROFILE,
  DASHBOARD,
  BUSINESS_INFORMATION_SETUP_STEP_ONE,
  BUSINESS_INFORMATION_SETUP_STEP_TWO,
  IDENTITY_UPLOAD,
  CREATE_LOAN,
  LIST_BANKS,
  VERIFY_BANK_ACCOUNT,
  RESEND_EMAIL_OTP,
  CHANGE_PASSWORD,
  CREATE_PIN,
  UPDATE_PIN,
  REQUEST_PIN_TOKEN,
  GET_TENURES,
  REPAYMENT_PATTERN,
  POST_REPAYMENT_PATTERN,
  GET_LOAN_DETAILS,
  GET_LOAN,
  INVENTORY_LIST,
  GET_BANK_ACCOUNT,
  TRANSACTION_HISTORYs,
  GET_ACCOUNT,
  GET_ACCOUNT_BY_ID,
  GET_ACCOUNT_DETAILS_BY_ID,
  LOAN_STAT_DETAILS,
  OUTSIDE_TRANSFER,
  LOCAL_TRANSFER,
  VERIFY_VERA_BANK_ACCOUNT,
  PAY_LOAN,
};
