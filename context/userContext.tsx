// contexts/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | string;
  userId?: number;
  phone?: {
    number: string;
    verified: string | null;
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
  setUser: (user: UserData | null) => void;
  setWallet: (wallet: WalletData | null) => void;
  setVerificationStatus: (status: VerificationStatus | null) => void;
  setUserAndWallet: (user: UserData | null, wallet: WalletData | null) => void;
  setAllUserData: (
    user: UserData | null,
    wallet: WalletData | null,
    verification: VerificationStatus | null
  ) => void;
  isUserPending: boolean;
  getUserFullName: () => string;
  getWalletBalance: () => string;
  getVerificationProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [wallet, setWalletState] = useState<WalletData | null>(null);
  const [verificationStatus, setVerificationStatusState] =
    useState<VerificationStatus | null>(null);

  useEffect(() => {
    // Load user data from localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedWallet = localStorage.getItem("wallet");
    const storedVerification = localStorage.getItem("verificationStatus");

    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    if (storedWallet) {
      try {
        setWalletState(JSON.parse(storedWallet));
      } catch (error) {
        console.error("Error parsing wallet data:", error);
      }
    }

    if (storedVerification) {
      try {
        setVerificationStatusState(JSON.parse(storedVerification));
      } catch (error) {
        console.error("Error parsing verification data:", error);
      }
    }
  }, []);

  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userStatus", userData.status);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("userStatus");
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
    walletData: WalletData | null
  ) => {
    setUser(userData);
    setWallet(walletData);
  };

  const setAllUserData = (
    userData: UserData | null,
    walletData: WalletData | null,
    verification: VerificationStatus | null
  ) => {
    setUser(userData);
    setWallet(walletData);
    setVerificationStatus(verification);
  };

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
    const total = 2; // Only BVN and Documents

    // Check BVN
    if (verificationStatus.bvn.isVerified) completed++;

    // Check if any document is submitted
    if (verificationStatus.documents.hasAnyDocument) completed++;

    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  const clearUserData = () => {
    setUserState(null);
    setWalletState(null);
    setVerificationStatusState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("wallet");
    localStorage.removeItem("userStatus");
    localStorage.removeItem("verificationStatus");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        wallet,
        verificationStatus,
        setUser,
        setWallet,
        setVerificationStatus,
        setUserAndWallet,
        setAllUserData,
        isUserPending,
        getUserFullName,
        getWalletBalance,
        getVerificationProgress,
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

// Helper function to extract verification status from API response
export function extractVerificationStatus(
  businessData: any
): VerificationStatus {
  const documents = businessData?.documents || {};
  const bvn = businessData?.bvn;
  const address = businessData?.address;

  // Check if any document exists (check for both image URL and ID number)
  const hasAnyDocument =
    !!(documents.ninImage || documents.ninId) ||
    !!(documents.votersCardImage || documents.votersCardId) ||
    !!(documents.driversLicenseImage || documents.driversLicenseId) ||
    !!(documents.internationalPassportImage || documents.internationalPassportId);

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
        submitted: !!(documents.driversLicenseImage || documents.driversLicenseId),
        imageUrl: documents.driversLicenseImage || null,
        idNumber: documents.driversLicenseId || null,
      },
      internationalPassport: {
        submitted: !!(documents.internationalPassportImage || documents.internationalPassportId),
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