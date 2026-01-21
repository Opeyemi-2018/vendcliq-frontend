

export interface PlanEntity {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  webOnly: boolean;
  storeLimit: number;
  productLimitPerStore: number;
  shopAttendantLimit: number;
  aiStockRecommendationLimit: number;
  hasPOSDevice: boolean;
  autoStockUpdate: boolean;
  invoiceAllowed: boolean;
  createdAt: string;
  updatedAt: string;
  __entity: string;
}

export interface PlansApiResponse {
  statusCode: number;
  error: null | string;
  data: PlanEntity[];
  pagination: null | any;
}

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface DisplayPlan {
  id: number | string;  // ← allow both number and string
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  buttonText: string;
  borderColor: string;
  bgColor: string;
}

// types/subscription.ts (or append to types/plans.ts)

export interface SubscriptionPaymentPayload {
  planId: number;
  billingType: "monthly" | "yearly";
  multiplier: number;
  paymentType: "WALLET" | "TRANSFER";
  transactionPin?: string; // Required only when paymentType === "WALLET"
}

export interface SubscriptionPaymentResponse {
  statusCode: number;
  error: string | null;
  data: {
    paymentPayload: any;
    user_id: number;
    billing_type: "monthly" | "yearly";
    status: string; // e.g. "active"
    next_billing_date: string; // ISO date string
    last_payment_date: string; // ISO date string
    outstanding_balance: number;
    plan: {
      id: number;
      name: string;
      monthlyPrice: number;
      yearlyPrice: number;
      webOnly: boolean;
      storeLimit: number;
      productLimitPerStore: number;
      shopAttendantLimit: number;
      aiStockRecommendationLimit: number;
      hasPOSDevice: boolean;
      autoStockUpdate: boolean;
      invoiceAllowed: boolean;
      createdAt: string;
      updatedAt: string;
    };
    grace_start_date: string | null;
    id: number;
    created_at: string;
    updated_at: string;
  };
}

// Optional: If TRANSFER response includes payment details separately
export interface TransferPaymentDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  expectedAmount: number;
  paymentReference: string;
  expiresAt?: string;
}

// If the API returns transfer details in a nested field (common pattern)
export interface SubscriptionPaymentTransferResponse {
  statusCode: number;
  error: string | null;
  data: {
    subscription: {
      // same fields as above
      user_id: number;
      // ... etc.
    };
    paymentPayload?: TransferPaymentDetails;
  };
}