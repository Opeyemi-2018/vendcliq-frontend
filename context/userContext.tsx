/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UserData {
  createdAt?: string;
  firstname: string;
  lastname: string;
  email: string;
  accountRole?: "CUSTOMER" | "ATTENDANTS";

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
export interface AttendantPermissions {
  can_buy: boolean;
  can_sell: boolean;
  can_sell_on_credit: boolean;
  can_update_stock: boolean;
  can_move_stock: boolean;
  can_add_stock: boolean;
  can_market_place: boolean;
  can_push_to_market: boolean;
  can_view_store_info: boolean;
  can_reporting: boolean;
  can_expenses: boolean;
}
interface UserContextType {
  user: UserData | null;
  verificationStatus: VerificationStatus | null;
  attendantPermissions: AttendantPermissions | null;
  isAttendant: boolean;
  setAttendantPermissions: (p: AttendantPermissions | null) => void;

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
  canBuy: () => boolean;
  canSell: () => boolean;
  canUpdateStock: () => boolean;
  canMoveStock: () => boolean;
  canAddStock: () => boolean;
  canSellOnCredit: () => boolean;
  canAccessMarketplace: () => boolean;
  canPushToMarket: () => boolean;
  canViewStoreInfo: () => boolean;
  canReporting: () => boolean;
  canExpenses: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          /* ignore */
        }
      }
    }
    return null;
  });

  const [verificationStatus, setVerificationStatusState] =
    useState<VerificationStatus | null>(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("verificationStatus");
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            /* ignore */
          }
        }
      }
      return null;
    });

  const [hasPin, setHasPin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasPin") === "true";
    }
    return false;
  });

  // 👇 new: attendant permissions state
  const [attendantPermissions, setAttendantPermissionsState] =
    useState<AttendantPermissions | null>(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("attendantPermissions");
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            /* ignore */
          }
        }
      }
      return null;
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

  // 👇 new setter
  const setAttendantPermissions = (p: AttendantPermissions | null) => {
    setAttendantPermissionsState(p);
    if (p) {
      localStorage.setItem("attendantPermissions", JSON.stringify(p));
    } else {
      localStorage.removeItem("attendantPermissions");
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
  const isAttendant = user?.accountRole === "ATTENDANTS"; // 👈

  const getUserFullName = () => {
    if (!user) return "";
    return `${user.firstname} ${user.lastname}`;
  };

  const getVerificationProgress = () => {
    if (!verificationStatus) return { completed: 0, total: 2, percentage: 0 };
    let completed = 0;
    const total = 2;
    if (verificationStatus.bvn.isVerified) completed++;
    if (verificationStatus.documents.hasAnyDocument) completed++;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  };

  const getReferralCode = () => user?.referral?.code ?? "";
  const getReferralCount = () => user?.referral?.referralCount ?? 0;

  const clearUserData = () => {
    setUserState(null);
    setVerificationStatusState(null);
    setAttendantPermissionsState(null); 
    setHasPin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("verificationStatus");
    localStorage.removeItem("hasPin");
    localStorage.removeItem("wallet");
    localStorage.removeItem("attendantPermissions"); 
  };

  // 👇 permission helpers — non-attendants get full access (true) by default
  //    so CUSTOMER users are never blocked by these checks
  const canBuy = () => !isAttendant || (attendantPermissions?.can_buy ?? false);
  const canSell = () =>
    !isAttendant || (attendantPermissions?.can_sell ?? false);
  const canUpdateStock = () =>
    !isAttendant || (attendantPermissions?.can_update_stock ?? false);
  const canSellOnCredit = () =>
    !isAttendant || (attendantPermissions?.can_sell_on_credit ?? false);
  const canMoveStock = () =>
    !isAttendant || (attendantPermissions?.can_move_stock ?? false);
  const canAddStock = () =>
    !isAttendant || (attendantPermissions?.can_add_stock ?? false);
  const canAccessMarketplace = () =>
    !isAttendant || (attendantPermissions?.can_market_place ?? false);
  const canPushToMarket = () =>
    !isAttendant || (attendantPermissions?.can_push_to_market ?? false);
  const canViewStoreInfo = () =>
    !isAttendant || (attendantPermissions?.can_view_store_info ?? false);
  const canReporting = () =>
    !isAttendant || (attendantPermissions?.can_reporting ?? false);
  const canExpenses = () =>
    !isAttendant || (attendantPermissions?.can_expenses ?? false);

  return (
    <UserContext.Provider
      value={{
        user,
        verificationStatus,
        attendantPermissions,
        hasPin,
        isAttendant,
        setUser,
        setVerificationStatus,
        setAttendantPermissions,
        setAllUserData,
        isUserWalletNull,
        getUserFullName,
        getVerificationProgress,
        getReferralCode,
        getReferralCount,
        clearUserData,
        canBuy,
        canSell,
        canSellOnCredit,
        canUpdateStock,
        canMoveStock,
        canAddStock,
        canAccessMarketplace,
        canPushToMarket,
        canViewStoreInfo,
        canReporting,
        canExpenses,
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
