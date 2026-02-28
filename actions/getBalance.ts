// src/actions/getWalletBalance.ts
"use server";

import { redirect } from "next/navigation";

export interface WalletResponse {
  status: string;
  msg: string;
  data: {
    walletId: number;
    balance: string;
    currency: string;
    accountNumbers: {
      WEMA?: string;
      [key: string]: string | undefined;
    };
    accountName: string;
    lastUpdated: string;
  };
}

export async function getWalletBalance(): Promise<WalletResponse | null> {
  const token = 
    typeof window !== "undefined" 
      ? localStorage.getItem("accessToken") || localStorage.getItem("authToken")
      : null;

  if (!token) {
    console.error("No authentication token found");
    redirect("/signin"); // or return null, depending on your flow
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_VERA_API_BASE_URL}/client/v2/wallets`,
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
      console.error("Failed to fetch wallet:", errorData.msg || res.statusText);
      return null;
    }

    const data: WalletResponse = await res.json();

    if (data.status === "success") {
      return data;
    }

    console.error("Wallet fetch failed:", data.msg);
    return null;
  } catch (error) {
    console.error("Network error fetching wallet:", error);
    return null;
  }
}