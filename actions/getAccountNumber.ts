// src/actions/lookupAccount.ts
"use server";

export async function lookupAccount(accountNumber: string, token: string) {
  if (accountNumber.length !== 10) {
    return { success: false, error: "Account number must be 10 digits" };
  }

  try {
    const res = await fetch(
      `${process.env.VERA_API_BASE_URL}/client/v2/wallet/lookup?accountNumber=${accountNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.msg || "Failed to verify account",
      };
    }

    const data = await res.json();

    if (data.status === "success" && data.data.isValid) {
      return {
        success: true,
        data: {
          accountName: data.data.accountName,
          provider: data.data.Provider,
        },
      };
    }

    return { success: false, error: "Account not found or invalid" };
  } catch (err) {
    console.error("Account lookup error:", err);
    return { success: false, error: "Network error. Try again." };
  }
}
