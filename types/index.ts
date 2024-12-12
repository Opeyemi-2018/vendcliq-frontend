export interface IButton {
  children: React.ReactNode;
  className?: string;
  action?: () => void;
}
export interface IReusableInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  accept?: string;
  readOnly?: boolean;
}

export interface RepaymentPatternResponse {
  status: string;
  msg: string;
  data: {
    key: string;
    value: string;
  }[];
}
export interface ISidebarButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  className?: string;
  onClick?: () => void;
}
export interface IRequestCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon?: React.ReactNode;
  primaryColor?: string;

  onRequestLoan?: () => void;
}

// lib/utils/types/apiTypes.ts

export type BusinessType = "DISTRIBUTOR" | "RETAILER" | "WHOLESALER";

export interface Business {
  isRegistered: boolean;
  type: BusinessType;
}

export interface SignupPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  business: Business;
  referral?: string;
}

export interface SignupResponse {
  message: string;
  data: {
    userId: string;
    email: string;
  };
  status: string;
}

export interface EmailVerificationPayload {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  msg: string;
  status: string;
  data: {
    email: string;
  };
  token: {
    token: string;
    type: string;
  };
}
export interface ConfirmPhoneNumberPayload {
  phone: string;
  isWhatsappNo: boolean;
}
export interface ConfirmPhoneNumberResponse {
  phone: string;
  isWhatsappNo: boolean;
  status?: string;
  msg?: string;
}

export interface VerifyPhoneNumberPayload {
  token: string;
}
export interface VerifyPhoneNumberResponse {
  token: string;
  status?: string;
  msg?: string;
}
export interface DashboardPayload {}
export interface DashboardResponse {
  status: string;
  msg: string;
  data: {
    customer: {
      id: number;
      firstname: string;
      lastname: string;
      email: string;
      status: string;
    };
    account: {
      number: string | null;
      bank: string | null;
      name: string | null;
      currency: string;
      balance: number;
    };
    loan: [];
    nextRepayment: string | null;
    cashReward: number;
  };
}
export interface SignInPayload {
  email: string;
  password: string;
}
export interface SignInResponse {
  status: string;
  msg: string;
  data: {
    token: {
      token: string;
      type: string;
    };
    user: {
      firstname: string;
      lastname: string;
      email: {
        email: string;
        verified: string | null;
      };
      phone: {
        number: string;
        verified: string | null;
      };
      account: {
        status: string;
        accountRole: string;
      };
      pin: boolean;
      identity: {
        card: string | null;
        verified: string | null;
      };
      business: {
        name: string;
        email: string;
        phone: string | null;
        type: string;
        alias: string | null;
        referral: string | null;
        creditLimit: number;
        registration: {
          rcNumber: string | null;
          certificate: string | null;
          memoOfAssociation: string | null;
          dateOfIncorporation: string | null;
          isRegistered: boolean;
        };
        address: {
          address: string | null;
          proofOfAddress: string | null;
          verified: boolean;
        };
        logo: string | null;
        tierLevel: string | null;
        profileCompletionStep: string;
        date: string;
      };
    };
  };
}

export interface CreateLoanPayload {
  items: Array<{
    item: string;
    quantity: number;
    amount: number;
  }>;
  vendorDetails: {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    invoiceNo: string;
    narration: string;
  };

  tenure: string;
  repaymentPattern: string;
  termsAccepted: boolean;
}

export interface CreateLoanResponse {
  status: string;
  msg: string;
  data: any;
}

export interface ListBanksResponse {
  status: string;
  msg: string;
  data: {
    banks: Array<{
      bankCode: string;
      bankName: string;
    }>;
    responseMessage: string;
    responseCode: string;
  };
}

export interface VerifyBankAccountPayload {
  accountNumber: string;
  bankCode: string;
}

export interface VerifyBankAccountResponse {
  status: string;
  msg: string;
  data: {
    accountName: string;
  };
}

export interface ResendEmailOtpPayload {
  email: string;
}

export interface ResendEmailOtpResponse {
  message: string;
  success: boolean;
}

export interface ApiResponse {
  status: number | string;

  message: string;
  data?: any; // or be more specific with the data type if known
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PinPayload {
  otp?: string;
  pin: string;
  confirmPin: string;
}

export interface UpdatePinPayload {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export interface GetTenuresResponse {
  status: string;
  msg: string;
  data: string[];
}

export interface RepaymentPatternPayload {
  items: Array<{
    item: string;
    quantity: number;
    amount: number;
  }>;
  tenure: string;
  repaymentPattern: string;
}

export interface PostRepaymentPatternResponse {
  status: string;
  msg: string;
  data: {
    repaymentPattern: Array<{
      due_date: string;
      principal: number;
      interest: number;
      amount: number;
      repayment_amount: number;
    }>;
    principal: number;
    interest: number;
    totalAmount: number;
  };
}

export interface LoanDetailsResponse {
  status: string;
  msg: string;
  data: {
    id: number;
    profileId: number;
    reference: string;
    loanTenure: number;
    repaymentPattern: string;
    amount: string;
    interestRate: string;
    interestAmount: string;
    expiringDate: string;
    items: Array<{
      item: string;
      quantity: number;
      amount: number;
      totalAmount: number;
    }>;
    attributes: {
      termsAccepted: boolean;
    };
    meta: {
      ip_address: string;
    };
    vendorDetails: {
      bankCode: string;
      invoiceNo: string;
      accountName: string;
      accountNumber: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    repayments: Array<{
      id: string;
      reference: string;
      repayment_date: string;
      due_date: string;
      principal: number;
      interest: number;
      amount: number;
      repayment_amount: number;
      status: string;
    }>;
    files: any[];
    reviewDate: string;
    disburseDate: string;
    interestFrequency: string;
    duration: number;
    interestDueToday: number;
    amountDueToday: number;
    purpose: string;
  };
}

export interface LoanResponse {
  status: string;
  msg: string;
  data: {
    meta: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      firstPage: number;
      firstPageUrl: string;
      lastPageUrl: string;
      nextPageUrl: string | null;
      previousPageUrl: string | null;
    };
    data: Array<{
      id: number;
      profileId: number;
      reference: string;
      loanTenure: number;
      repaymentPattern: string;
      amount: string;
      interestRate: string;
      interestAmount: string;
      expiringDate: string;
      items: string;
      attributes: {
        termsAccepted: boolean;
      };
      meta: {
        ip_address: string;
      };
      vendorDetails: {
        bankCode: string;
        invoiceNo: string;
        accountName: string;
        accountNumber: string;
      };
      status: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      repayments: Array<any>;
    }>;
  };
}

export interface SendOtpForForgetPasswordPayload {
  email: string;
}

export interface SendOtpForForgetPasswordResponse {
  status: string;
  msg: string;
  data: [];
}

export interface ResetPasswordPayload {
  otp: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  status: string;
  msg: string;
}
