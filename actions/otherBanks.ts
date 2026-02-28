"use server";

export interface NipBank {
  name: string;
  code: string;
}

export interface NipBanksResponse {
  status: string;
  msg: string;
  data: {
    banks: string[];
  };
}

export interface NipBank {
  name: string;
  code: string;
}

export interface NipBanksResponse {
  status: string;
  msg: string;
  data: {
    banks: string[];
  };
}

export async function getNipBanks(token: string): Promise<NipBank[] | null> {
  if (!token) return null;

  try {
    const res = await fetch(
      `${process.env.VERA_API_BASE_URL}/client/v2/wallets/nip-banks`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data: NipBanksResponse = await res.json();

    if (data.status === "success") {
      return data.data.banks.map((item) => {
        const [name, code] = item.split("|");
        return { name: name.trim(), code: code.trim() };
      });
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch NIP banks:", error);
    return null;
  }
}

export interface NameEnquiryResponse {
  status: string;
  msg: string;
  data: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
  };
}

export interface NameEnquiryResponse {
  status: string;
  msg: string;
  data: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
  };
}

export async function performNameEnquiry(
  bankCode: string,
  accountNumber: string,
  token: string
): Promise<string | null> {
  if (!token || !bankCode || !accountNumber) return null;

  try {
    const res = await fetch(
      `${process.env.VERA_API_BASE_URL}/client/v2/wallets/name-enquiry`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BankCode: bankCode,
          AccountNumber: accountNumber,
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data: NameEnquiryResponse = await res.json();

    if (data.status === "success" && data.data?.accountName) {
      return data.data.accountName;
    }

    return null;
  } catch (error) {
    console.error("Name enquiry failed:", error);
    return null;
  }
}
