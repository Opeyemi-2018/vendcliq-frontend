"use server";

interface InitializePaymentParams {
  planId: number;
  billingType: "monthly" | "yearly";
  multiplier: number;
  paymentType: "TRANSFER";
  token: string;
}

interface PaymentPayload {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  paymentReference: string;
  expiresAt: string;
  expectedAmount: number;
}

interface PaymentResponse {
  statusCode: number;
  error: string | null;
  data: {
    message: string;
    userId: number;
    planId: number;
    subscriptionId: string;
    paymentPayload: PaymentPayload;
  } | null;
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<PaymentResponse> {
  

  try {
    const response = await fetch(`${process.env.VERA_INVENTORY_API_BASE_URL}inventory/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({
        planId: params.planId,
        billingType: params.billingType,
        multiplier: params.multiplier,
        paymentType: params.paymentType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        error: data.error || "Failed to initialize payment",
        data: null,
      };
    }

    return data;
  } catch (error) {
    console.error("Payment initialization error:", error);
    return {
      statusCode: 500,
      error: "An error occurred while initializing payment",
      data: null,
    };
  }
}
