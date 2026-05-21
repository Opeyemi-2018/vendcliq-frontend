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
const GET_WALLET = "/client/v2/wallets";
const ADD_SHOP_ATTENDANT = "/client/v2/attendants";
const CREATE_PIN = "/client/v2/auth/pin";
const REQUEST_PIN_TOKEN = "/client/v2/auth/request-pin-token";
const UPDATE_TRANSFER_PIN = "/client/v2/auth/pin-update";
const CHANGE_PASSWORD = "/client/v2/change-password";
const CREATE_BENEFICIARY = "/client/v2/wallet/beneficiaries";
const GET_BENEFICIARIES = "/client/v2/wallet/beneficiaries";

// v1 endpoint
// const BUSINESS_INFORMATION_SETUP_STEP_ONE =
//   "/client/v1/auth/business-information";
// const BUSINESS_INFORMATION_SETUP_STEP_TWO =
//   "/client/v1/auth/business-information-step2";
// const IDENTITY_UPLOAD = "/client/v1/auth/upload-identity";
// const GET_PROFILE = "/";
// const DASHBOARD = "/";
// const CREATE_LOAN = "/client/v1/loans";
// const GET_LOAN = "/client/v1/loans";
// const GET_LOAN_DETAILS = (id: string) => `/client/v1/loans/${id}`;
// const LIST_BANKS = "/client/v1/bank-accounts/banks/all";
// const VERIFY_BANK_ACCOUNT =
//   "/client/v1/bank-accounts/banks/verify-bank-account";
// const RESEND_EMAIL_OTP = "/client/v1/auth/resend-otp";
// const CHANGE_PASSWORD = "/client/v1/auth/change-password";
// const UPDATE_PIN = "/client/v1/auth/pin-update";
// const REQUEST_PIN_TOKEN = "/client/v1/auth/request-pin-token";
// const GET_TENURES = "/client/v1/loans/list/tenures";
// const REPAYMENT_PATTERN = (tenure: string) =>
//   `/client/v1/loans/list/repayment-pattern?tenure=${tenure}`;
// const POST_REPAYMENT_PATTERN = "/client/v1/loans/repayment/pattern";
// const INVENTORY_LIST = "/v1/inventory/search";
// const GET_BANK_ACCOUNT = "/client/v1/bank-accounts";
// const TRANSACTION_HISTORYs = "/client/v1/transactions";
// const GET_ACCOUNT = "/client/v1/bank-accounts";
// const GET_ACCOUNT_BY_ID = (id: string) => `/client/v1/bank-accounts/${id}`;
// const GET_ACCOUNT_DETAILS_BY_ID = (id: string) =>
//   `/client/v1/bank-accounts/accounts/${id}`;
// const LOAN_STAT_DETAILS = "/client/v1/loans/dashboard";
// const OUTSIDE_TRANSFER = "/client/v1/transfer/outside";
// const LOCAL_TRANSFER = "/client/v1/transfer/local";
// const VERIFY_VERA_BANK_ACCOUNT = (accountNumber: string) =>
//   `/client/v1/bank-accounts/accounts/verify/${accountNumber}`;
// const PAY_LOAN = (id: string) =>
//   `/client/v1/loans/repayments/installment/${id}`;
// EXPORT URLS

// inventory endpoint
const CREATE_STORE = "inventory/stores";
const CREATE_STOCK = "inventory/stocks";
// thr 2 below endpoint get all product and also get paginated product
const GET_PRODUCTS_PAGINATED =
  "inventory/products?page=1&limit=50&all=false&search=";
const GET_ALL_PRODUCTS = "inventory/products?all=true";
const CREATE_INVOICE = "inventory/invoices";
const EDIT_INVOICE = (invoiceId: string) => `inventory/invoices/${invoiceId}`;
const CREATE_CUSTOMER = "inventory/customers";
const UPDATE_CUSTOMER = (customerId: string) =>
  `inventory/customers/${customerId}`;
const GET_CUSTOMER_BY_ID = (customerId: string) =>
  `inventory/customers/${customerId}`;
const GET_SUPPLIER_STORES = (userId: number) => `inventory/suppliers/${userId}/stores`;
const GET_STORE_STOCKS = (storeId: string) => `inventory/stocks/${storeId}`;

const RETURN_CUSTOMER_EMPTIES = (customerId: string, emptiesId: string) =>
  `inventory/customers/${customerId}/empties/${emptiesId}/return`;
const CREATE_CART = "inventory/carts";
const CHECKOUT_CART = "inventory/carts/checkout";
const PAY_CART = (invoiceId: string) => `inventory/invoices/${invoiceId}/pay`;
 const PAY_CART_CREDIT_OTP = (invoiceId: string) => `inventory/invoices/${invoiceId}/verify-credit-otp`;
 const GET_CREDIT_LEDGER = () => `inventory/credit-ledger`;
  const GET_CREDIT_LEDGER_SUMMARY = () => `inventory/credit-ledger/summary`;

 const RECORD_CREDIT_PAYMENT = (uuid: string) => `inventory/credit-ledger/${uuid}/payments`;
const ASSIGN_ATTENDANT_PERMISSIONS = "inventory/attendant-permissions";
const UPDATE_ATTENDANT_PERMISSIONS = (attendantId: string) =>
  `inventory/attendant-permissions/attendant/${attendantId}`;
// the get attendant is not inventory endpoint
const GET_ATTENDANTS = "/client/v2/attendants";
const GET_ATTENDANT_PERMISSIONS = (attendantId: string | number) =>
  `inventory/attendant-permissions/attendant/${attendantId}`;
const CREATE_EXPENSE = "inventory/expenses";
const GET_EXPENSES = "inventory/expenses";
const DELETE_EXPENSE = (expenseId: string) => `inventory/expenses/${expenseId}`;
const PAY_SUB = "inventory/subscriptions";
const GET_PURCHASED_INVOICES = "inventory/invoices/purchases";
const CREATE_PURCHASE = "inventory/invoices/purchases";
const USER_STOCKS = "inventory/stocks/user/stocks";
const GET_SUPPLIERS = "inventory/suppliers";
const GET_PURCHASED_INVOICE_BY_ID = (invoiceId: string) =>
  `inventory/invoices/${invoiceId}`;
const GET_ITEM_TRACKING_STATUS = (itemId: string) => `/bids/track/${itemId}`;
const UPDATE_STORE_SETTINGS = (storeId: string) =>
  `inventory/stores/${storeId}/settings`;
const UPDATE_STORE = (storeId: string) => `inventory/stores/${storeId}`;
const GET_SUBSCRIPTION_ME = "inventory/subscriptions/me";
const GET_BUSINESS_REPORT_COMPARISON =
  "inventory/dashboard/business-report-comparison";
const STOCK_HISTORY = "inventory/stock-movements";
const GET_SALES = "inventory/invoices/sales";
const GET_PURCHASE_REQUEST = "inventory/invoices/purchase/sales";
const GET_PURCHASE_REQUEST_BY_ID = (id: string) => `inventory/invoices/${id}`;
const GET_SALE_BY_ID = (id: string) => `inventory/invoices/${id}`;
const HAND_OVER_ITEM = "inventory/items/verify-handover";
const SUCCESSFUL_HANDOVER = "inventory/items/add-to-store";
const SUPPLIER_SALES = "inventory/dashboard/supplier-sales";
const GET_STORE_ITEMS_SALES = "inventory/dashboard/store-items";
const CREATE_OFFER = "inventory/offers";
const UPDATE_STOCK_PRICES = (stockId: string) => `inventory/stocks/${stockId}`;
// get credit ledger items
 const GET_INVOICE_BY_ID = (id: string) => `inventory/invoices/${id}`;



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
  GET_ALL_PRODUCTS,
  GET_PRODUCTS_PAGINATED,
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
  GET_WALLET,
  ADD_SHOP_ATTENDANT,
  CREATE_INVOICE,
  GET_SUPPLIER_STORES,
  GET_STORE_STOCKS,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  GET_CUSTOMER_BY_ID,
  RETURN_CUSTOMER_EMPTIES,
  CREATE_CART,
  CHECKOUT_CART,
  PAY_CART,
  UPDATE_TRANSFER_PIN,
  CHANGE_PASSWORD,
  ASSIGN_ATTENDANT_PERMISSIONS,
  GET_ATTENDANTS,
  UPDATE_ATTENDANT_PERMISSIONS,
  GET_ATTENDANT_PERMISSIONS,
  CREATE_EXPENSE,
  GET_EXPENSES,
  DELETE_EXPENSE,
  PAY_SUB,
  GET_SUPPLIERS,
  GET_PURCHASED_INVOICES,
  CREATE_PURCHASE,
  USER_STOCKS,
  GET_PURCHASED_INVOICE_BY_ID,
  GET_ITEM_TRACKING_STATUS,
  UPDATE_STORE_SETTINGS,
  UPDATE_STORE,
  CREATE_PIN,
  REQUEST_PIN_TOKEN,
  GET_SUBSCRIPTION_ME,
  CREATE_BENEFICIARY,
  GET_BENEFICIARIES,
  GET_BUSINESS_REPORT_COMPARISON,
  STOCK_HISTORY,
  GET_PURCHASE_REQUEST,
  GET_PURCHASE_REQUEST_BY_ID,
  GET_SALE_BY_ID,
  GET_SALES,
  HAND_OVER_ITEM,
  SUCCESSFUL_HANDOVER,
  SUPPLIER_SALES,
  EDIT_INVOICE,
  GET_STORE_ITEMS_SALES,
  CREATE_OFFER,
  UPDATE_STOCK_PRICES,
  PAY_CART_CREDIT_OTP,
  GET_CREDIT_LEDGER,
  RECORD_CREDIT_PAYMENT,
  GET_CREDIT_LEDGER_SUMMARY,
  GET_INVOICE_BY_ID,

  // v1 endpoint
  // GET_PROFILE,
  // DASHBOARD,
  // BUSINESS_INFORMATION_SETUP_STEP_ONE,
  // BUSINESS_INFORMATION_SETUP_STEP_TWO,
  // IDENTITY_UPLOAD,
  // CREATE_LOAN,
  // LIST_BANKS,
  // VERIFY_BANK_ACCOUNT,
  // RESEND_EMAIL_OTP,
  // CREATE_PIN,
  // UPDATE_PIN,
  // REQUEST_PIN_TOKEN,
  // GET_TENURES,
  // REPAYMENT_PATTERN,
  // POST_REPAYMENT_PATTERN,
  // GET_LOAN_DETAILS,
  // GET_LOAN,
  // INVENTORY_LIST,
  // GET_BANK_ACCOUNT,
  // TRANSACTION_HISTORYs,
  // GET_ACCOUNT,
  // GET_ACCOUNT_BY_ID,
  // GET_ACCOUNT_DETAILS_BY_ID,
  // LOAN_STAT_DETAILS,
  // OUTSIDE_TRANSFER,
  // LOCAL_TRANSFER,
  // VERIFY_VERA_BANK_ACCOUNT,
  // PAY_LOAN,
};
