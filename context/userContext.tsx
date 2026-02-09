/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UserData {
  createdAt?: string;          
  firstname: string;
  lastname: string;
  email: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | string;
  userId?: number;
  phone?: {
    number: string;
    verified: string | null;
  };
  pin?: boolean;
  referral?: {
    code: string;
    referredBy: string | null;
    referralCount: number;
  };
}

export interface WalletData {
  walletId: number;
  balance: string;
  currency: string;
  accountName: string;
  accountNumbers: {
    WEMA?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStatus {
  bvn: {
    isVerified: boolean;
    value: string | null;
  };
  documents: {
    hasAnyDocument: boolean;
    nin: {
      submitted: boolean;
      imageUrl: string | null;
      idNumber: string | null;
    };
    votersCard: {
      submitted: boolean;
      imageUrl: string | null;
      idNumber: string | null;
    };
    driversLicense: {
      submitted: boolean;
      imageUrl: string | null;
      idNumber: string | null;
    };
    internationalPassport: {
      submitted: boolean;
      imageUrl: string | null;
      idNumber: string | null;
    };
  };
  address: {
    isVerified: boolean;
    value: string | null;
  };
}

interface UserContextType {
  user: UserData | null;
  wallet: WalletData | null;
  verificationStatus: VerificationStatus | null;
  hasPin: boolean;
  isLoadingWallet: boolean;
  walletError: string | null;
  setUser: (user: UserData | null) => void;
  setWallet: (wallet: WalletData | null) => void;
  setVerificationStatus: (status: VerificationStatus | null) => void;
  setUserAndWallet: (user: UserData | null, wallet: WalletData | null) => void;
  setAllUserData: (
    user: UserData | null,
    wallet: WalletData | null,
    verification: VerificationStatus | null,
  ) => void;
  fetchWallet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  isUserPending: boolean;
  getUserFullName: () => string;
  getWalletBalance: () => string;
  getVerificationProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  getReferralCode: () => string;
  getReferralCount: () => number;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    return null;
  });

  const [wallet, setWalletState] = useState<WalletData | null>(() => {
    if (typeof window !== "undefined") {
      const storedWallet = localStorage.getItem("wallet");
      if (storedWallet) {
        try {
          return JSON.parse(storedWallet);
        } catch (error) {
          console.error("Error parsing wallet data:", error);
        }
      }
    }
    return null;
  });

  const [verificationStatus, setVerificationStatusState] =
    useState<VerificationStatus | null>(() => {
      if (typeof window !== "undefined") {
        const storedVerification = localStorage.getItem("verificationStatus");
        if (storedVerification) {
          try {
            return JSON.parse(storedVerification);
          } catch (error) {
            console.error("Error parsing verification data:", error);
          }
        }
      }
      return null;
    });

  const [hasPin, setHasPin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hasPin");
      return stored ? stored === "true" : false;
    }
    return false;
  });

  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userStatus", userData.status);
      localStorage.setItem("hasPin", String(!!userData.pin));
      setHasPin(!!userData.pin);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("userStatus");
      localStorage.removeItem("hasPin");
      setHasPin(false);
    }
  };

  const setWallet = (walletData: WalletData | null) => {
    setWalletState(walletData);
    if (walletData) {
      localStorage.setItem("wallet", JSON.stringify(walletData));
    } else {
      localStorage.removeItem("wallet");
    }
  };

  const setVerificationStatus = (status: VerificationStatus | null) => {
    setVerificationStatusState(status);
    if (status) {
      localStorage.setItem("verificationStatus", JSON.stringify(status));
    } else {
      localStorage.removeItem("verificationStatus");
    }
  };

  const setUserAndWallet = (
    userData: UserData | null,
    walletData: WalletData | null,
  ) => {
    setUser(userData);
    setWallet(walletData);
  };

  const setAllUserData = (
    userData: UserData | null,
    walletData: WalletData | null,
    verification: VerificationStatus | null,
  ) => {
    setUser(userData);
    setWallet(walletData);
    setVerificationStatus(verification);
  };

  // Fetch wallet from API endpoint
  const fetchWallet = async () => {
    setIsLoadingWallet(true);
    setWalletError(null);

    try {
      const token = 
        localStorage.getItem("accessToken") || 
        localStorage.getItem("authToken");
      
      if (!token) {
        setWalletError("No authentication token found");
        setIsLoadingWallet(false);
        return;
      }

      const response = await fetch("https://api.vendcliq.com/api/v1/wallet", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "success" && data.data) {
        const formattedWalletData: WalletData = {
          walletId: data.data.walletId,
          balance: data.data.balance,
          currency: data.data.currency,
          accountName: data.data.accountName,
          accountNumbers: data.data.accountNumbers || {},
          createdAt: data.data.lastUpdated || new Date().toISOString(),
          updatedAt: data.data.lastUpdated || new Date().toISOString(),
        };

        setWallet(formattedWalletData);
      } else {
        setWalletError(data.msg || "Failed to fetch wallet");
      }
    } catch (error: any) {
      console.error("Wallet fetch error:", error);
      setWalletError(error.message || "Failed to fetch wallet");
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Alias for better semantics
  const refreshWallet = fetchWallet;

  const isUserPending = user?.status === "PENDING";

  const getUserFullName = () => {
    if (!user) return "";
    return `${user.firstname} ${user.lastname}`;
  };

  const getWalletBalance = () => {
    if (!wallet) return "0.00";
    return wallet.balance;
  };

  const getVerificationProgress = () => {
    if (!verificationStatus) {
      return { completed: 0, total: 2, percentage: 0 };
    }

    let completed = 0;
    const total = 2;

    if (verificationStatus.bvn.isVerified) completed++;
    if (verificationStatus.documents.hasAnyDocument) completed++;

    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  const getReferralCode = () => {
    if (!user?.referral) return "";
    return user.referral.code;
  };

  const getReferralCount = () => {
    if (!user?.referral) return 0;
    return user.referral.referralCount;
  };

  const clearUserData = () => {
    setUserState(null);
    setWalletState(null);
    setVerificationStatusState(null);
    setHasPin(false);
    setIsLoadingWallet(false);
    setWalletError(null);
    localStorage.removeItem("user");
    localStorage.removeItem("wallet");
    localStorage.removeItem("userStatus");
    localStorage.removeItem("verificationStatus");
    localStorage.removeItem("hasPin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        wallet,
        verificationStatus,
        hasPin,
        isLoadingWallet,
        walletError,
        setUser,
        setWallet,
        setVerificationStatus,
        setUserAndWallet,
        setAllUserData,
        fetchWallet,
        refreshWallet,
        isUserPending,
        getUserFullName,
        getWalletBalance,
        getVerificationProgress,
        getReferralCode,
        getReferralCount,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function extractVerificationStatus(
  businessData: any,
): VerificationStatus {
  const documents = businessData?.documents || {};
  const bvn = businessData?.bvn;
  const address = businessData?.address;

  const hasAnyDocument =
    !!(documents.ninImage || documents.ninId) ||
    !!(documents.votersCardImage || documents.votersCardId) ||
    !!(documents.driversLicenseImage || documents.driversLicenseId) ||
    !!(
      documents.internationalPassportImage || documents.internationalPassportId
    );

  return {
    bvn: {
      isVerified: !!(bvn && bvn.trim().length > 0),
      value: bvn || null,
    },
    documents: {
      hasAnyDocument,
      nin: {
        submitted: !!(documents.ninImage || documents.ninId),
        imageUrl: documents.ninImage || null,
        idNumber: documents.ninId || null,
      },
      votersCard: {
        submitted: !!(documents.votersCardImage || documents.votersCardId),
        imageUrl: documents.votersCardImage || null,
        idNumber: documents.votersCardId || null,
      },
      driversLicense: {
        submitted: !!(
          documents.driversLicenseImage || documents.driversLicenseId
        ),
        imageUrl: documents.driversLicenseImage || null,
        idNumber: documents.driversLicenseId || null,
      },
      internationalPassport: {
        submitted: !!(
          documents.internationalPassportImage ||
          documents.internationalPassportId
        ),
        imageUrl: documents.internationalPassportImage || null,
        idNumber: documents.internationalPassportId || null,
      },
    },
    address: {
      isVerified: address?.isVerified || false,
      value: address?.address || null,
    },
  };
}