/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UserData {
  createdAt?: string;
  firstname: string;
  lastname: string;
  email: string;
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

  wallet?: {
    walletId: number;
    balance?: string;
    currency?: string;
    accountName?: string;
    accountNumbers?: Record<string, string>;
    createdAt?: string;
    updatedAt?: string;
  } | null;
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
  verificationStatus: VerificationStatus | null;
  hasPin: boolean;
  setUser: (user: UserData | null) => void;
  setVerificationStatus: (status: VerificationStatus | null) => void;
  setAllUserData: (
    user: UserData | null,
    verification: VerificationStatus | null,
  ) => void;
  isUserWalletNull: boolean;
  getUserFullName: () => string;
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

  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("hasPin", String(!!userData.pin));
      setHasPin(!!userData.pin);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("hasPin");
      setHasPin(false);
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

  const setAllUserData = (
    userData: UserData | null,
    verification: VerificationStatus | null,
  ) => {
    setUser(userData);
    setVerificationStatus(verification);
  };

  const isUserWalletNull = user?.wallet === null;
  const getUserFullName = () => {
    if (!user) return "";
    return `${user.firstname} ${user.lastname}`;
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
    setVerificationStatusState(null);
    setHasPin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("verificationStatus");
    localStorage.removeItem("hasPin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("wallet"); 
  };

  return (
    <UserContext.Provider
      value={{
        user,
        verificationStatus,
        hasPin,
        setUser,
        setVerificationStatus,
        setAllUserData,
        isUserWalletNull,
        getUserFullName,
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
