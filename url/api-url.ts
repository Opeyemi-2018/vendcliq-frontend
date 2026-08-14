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
// const TRANSACTION_HISTORY = "/client/v2/wallets/transactions";
// const VENDCLIQ_TRANSFER = "/client/v2/wallets/transfers/vendcliq";
// const OTHERBANK_TRANSFER = "/client/v2/wallets/transfer";
const PIN_VALIDATE = "/client/v2/wallets/validate-pin";
const BUY_AIRTIME = "/client/v2/payments/airtime";
const BUY_DATA = "/client/v2/payments/data";
const CREATE_WALLET = "/client/v2/wallets/virtual-accounts/create";
// const GET_WALLET = "/client/v2/wallets";
const ADD_SHOP_ATTENDANT = "/client/v2/attendants";
const CREATE_PIN = "/client/v2/auth/pin";
const REQUEST_PIN_TOKEN = "/client/v2/auth/request-pin-token";
const UPDATE_TRANSFER_PIN = "/client/v2/auth/pin-update";
const CHANGE_PASSWORD = "/client/v2/change-password";
const CREATE_BENEFICIARY = "/client/v2/wallet/beneficiaries";
// const GET_BENEFICIARIES = "/client/v2/wallet/beneficiaries";
const LOOKUP_ACCOUNT = (accountNumber: string) =>
  `/client/v2/wallet/lookup?accountNumber=${accountNumber}`;
// const GET_NIP_BANKS = "/client/v2/wallets/nip-banks";
const NAME_ENQUIRY = "/client/v2/wallets/name-enquiry";
const GET_NETWORK_PROVIDER = "/client/v2/payments/network";
const GET_DATA_PLANS = "/client/v2/payments/data-plans";

// below is v3 vendcliq endpoint
const GET_WALLET = "/payment/v3/wallet/balance";
const TRANSACTION_HISTORY = "/payment/v3/wallet/transactions";
const TRANSACTION_BY_ID = (id: string) =>
  `/payment/v3/wallet/transactions/${id}`;
const WALLET_TRANSFER = "/payment/v3/wallet/transfer";
const GET_NIP_BANKS = "/payment/v3/wallet/nip-banks";
const GET_BENEFICIARIES = "/payment/v3/wallet/beneficiaries";
 const UPDATE_BENEFICIARY = (id: string) =>
  `/payment/v3/wallet/beneficiaries/${id}`;

export const VENDCLIQ_BANK_CODE = "656656";

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
// the 2 below endpoint get all product and also get paginated product
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
const GET_SUPPLIER_STORES = (userId: number) =>
  `inventory/suppliers/${userId}/stores`;
const GET_CUSTOMERS = "inventory/customers";
const GET_STORE_STOCKS = (storeId: string) => `inventory/stocks/${storeId}`;
const GET_CART = "inventory/carts";
const UPDATE_CART_ITEM = (id: string) => `inventory/carts/${id}`;
const DELETE_CART_ITEM = (id: string) => `inventory/carts/${id}`;
const RETURN_CUSTOMER_EMPTIES = (customerId: string, emptiesId: string) =>
  `inventory/customers/${customerId}/empties/${emptiesId}/return`;
const CREATE_CART = "inventory/carts";
const CHECKOUT_CART = "inventory/carts/checkout";
const PAY_CART = (invoiceId: string) => `inventory/invoices/${invoiceId}/pay`;
const PAY_CART_CREDIT_OTP = (invoiceId: string) =>
  `inventory/invoices/${invoiceId}/verify-credit-otp`;
const GET_CREDIT_LEDGER = () => `inventory/credit-ledger`;
const GET_CREDIT_LEDGER_SUMMARY = () => `inventory/credit-ledger/summary`;
const GET_MANUFACTURERS = "inventory/manufacturers";
const RECORD_CREDIT_PAYMENT = (uuid: string) =>
  `inventory/credit-ledger/${uuid}/payments`;
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
const GET_USER_STOCKS = "inventory/stocks/user/stocks";
const RETURN_ITEMS = "inventory/items/return";
const GET_STORE_STOCK_BY_ID = (storeId: string) =>
  `inventory/stocks/${storeId}?limit=200&all=true`;
const GET_MARKETPLACE_STOCKS = (search = "", page = 1, limit = 20) =>
  `inventory/stocks?page=${page}&limit=${limit}&search=${search}`;
const GET_MARKETPLACE_STOCK_DETAIL = (stockId: string) =>
  `inventory/stocks/marketplace/${stockId}`;
const GET_MARKETPLACE_OFFERS = "inventory/offers";
const GET_OFFER_DETAIL = (offerId: string) => `inventory/offers/${offerId}`;
const GET_PRICING_PLANS = "inventory/plans?page=1&limit=10&all=true";
const GET_STORES = "inventory/stores";
const GET_STORE_BY_ID = (storeId: string) => `inventory/stores/${storeId}`;
const MOVE_STOCK = "inventory/stocks/move";
const DELETE_STOCKS_BULK = "inventory/stocks/bulk";
const STOCK_CONDITIONS = "inventory/stock-conditions";
const STOCK_CONDITIONS_BY_STOCK = (stockId: string) =>
  `inventory/stock-conditions/stock/${stockId}`;
const UPDATE_STOCK = (stockId: string) => `inventory/stocks/${stockId}`;
const GET_STOCK_DETAIL = (stockId: string, storeId: string) =>
  `inventory/stocks/${stockId}/${storeId}`;
const GET_SUPPLIER_STOCKS = (userId: string) =>
  `inventory/suppliers/${userId}/stocks`;

export {
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
  WALLET_TRANSFER,
  PIN_VALIDATE,
  BUY_AIRTIME,
  BUY_DATA,
  CREATE_WALLET,
  LOOKUP_ACCOUNT,
  GET_NETWORK_PROVIDER,
  GET_DATA_PLANS,
  GET_NIP_BANKS,
  NAME_ENQUIRY,
  GET_WALLET,
  TRANSACTION_BY_ID,
  UPDATE_BENEFICIARY,

  // inventory
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
  GET_CART,
  UPDATE_CART_ITEM,
  DELETE_CART_ITEM,
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
  GET_CUSTOMERS,
  HAND_OVER_ITEM,
  SUCCESSFUL_HANDOVER,
  SUPPLIER_SALES,
  EDIT_INVOICE,
  GET_STORE_ITEMS_SALES,
  CREATE_OFFER,
  UPDATE_STOCK_PRICES,
  DELETE_STOCKS_BULK,
  STOCK_CONDITIONS,
  STOCK_CONDITIONS_BY_STOCK,
  PAY_CART_CREDIT_OTP,
  GET_CREDIT_LEDGER,
  RECORD_CREDIT_PAYMENT,
  GET_CREDIT_LEDGER_SUMMARY,
  GET_INVOICE_BY_ID,
  GET_MANUFACTURERS,
  GET_USER_STOCKS,
  RETURN_ITEMS,
  GET_STORE_STOCK_BY_ID,
  GET_MARKETPLACE_STOCKS,
  GET_MARKETPLACE_OFFERS,
  GET_OFFER_DETAIL,
  GET_MARKETPLACE_STOCK_DETAIL,
  GET_PRICING_PLANS,
  GET_STORES,
  GET_STORE_BY_ID,
  MOVE_STOCK,
  UPDATE_STOCK,
  GET_STOCK_DETAIL,
  GET_SUPPLIER_STOCKS,

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
