// API BASE URL

const VERIFY_EMAIL = "/client/v1/auth/verify-email-address";
const SIGN_UP = "/client/v1/auth/signup";
const CONFIRM_PHONE_NUMBER = "/client/v1/auth/confirm-phone-number";
const SIGN_IN = "/client/v1/auth/signin";
const VERIFY_PHONE_NUMBER = "/client/v1/auth/verify-phone-number";
const GET_PROFILE = "/client/v1/auth/profile";
const DASHBOARD = "/client/v1/dashboard";

const BUSINESS_INFORMATION_SETUP_STEP_ONE =
  "/client/v1/auth/business-information";
const BUSINESS_INFORMATION_SETUP_STEP_TWO =
  "/client/v1/auth/business-information-step2";
const IDENTITY_UPLOAD = "/client/v1/auth/upload-identity";
const CREATE_LOAN = "/client/v1/loans";
const LIST_BANKS = "/client/v1/bank-accounts/banks/all";
const VERIFY_BANK_ACCOUNT =
  "/client/v1/bank-accounts/banks/verify-bank-account";
const RESEND_EMAIL_OTP = "/client/v1/auth/resend-otp";
const CHANGE_PASSWORD = "/client/v1/auth/change-password";
const CREATE_PIN = "/client/v1/auth/pin";
const UPDATE_PIN = "/client/v1/auth/pin-update";
const REQUEST_PIN_TOKEN = "client/v1/auth/request-pin-token";
// EXPORT URLS
export {
  VERIFY_EMAIL,
  CONFIRM_PHONE_NUMBER,
  SIGN_IN,
  SIGN_UP,
  VERIFY_PHONE_NUMBER,
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
};
