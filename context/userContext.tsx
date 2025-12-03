// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | string;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isUserPending: boolean;
  getUserFullName: () => string;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
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

  const isUserPending = user?.status === "PENDING";

  const getUserFullName = () => {
    if (!user) return "";
    return `${user.firstname} ${user.lastname}`;
  };

  const clearUserData = () => {
    setUserState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userStatus");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isUserPending,
        getUserFullName,
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

// Usage in your Step1 component:
// const { setUser } = useUser();
// setUser(response.data.user);

// Usage in dashboard:
// const { user, isUserPending, getUserFullName } = useUser();