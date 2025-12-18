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

interface UserContextType {
  user: UserData | null;
  wallet: WalletData | null;
  setUser: (user: UserData | null) => void;
  setWallet: (wallet: WalletData | null) => void;
  setUserAndWallet: (user: UserData | null, wallet: WalletData | null) => void;
  isUserPending: boolean;
  getUserFullName: () => string;
  getWalletBalance: () => string;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [wallet, setWalletState] = useState<WalletData | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedWallet = localStorage.getItem("wallet");

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

  const setUserAndWallet = (
    userData: UserData | null,
    walletData: WalletData | null
  ) => {
    setUser(userData);
    setWallet(walletData);
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

  const clearUserData = () => {
    setUserState(null);
    setWalletState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("wallet");
    localStorage.removeItem("userStatus");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        wallet,
        setUser,
        setWallet,
        setUserAndWallet,
        isUserPending,
        getUserFullName,
        getWalletBalance,
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
