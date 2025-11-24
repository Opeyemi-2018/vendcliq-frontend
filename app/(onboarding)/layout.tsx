// app/signup/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import AuthHero from "@/components/AuthHero";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Check if we're on the success step by looking at localStorage
  const [isStep9, setIsStep9] = useState(false);

  useEffect(() => {
    const savedStep = localStorage.getItem("signupStep");
    setIsStep9(savedStep === "9");
  }, [pathname]);

  return (
    <div className="flex lg:h-[100vh] bg-white max-w-[80rem] mx-auto">
      {/* Persistent Left Image - Hidden on step 9 */}
      {!isStep9 && (
        <div className="hidden md:flex w-full flex-1 items-center justify-center">
          <AuthHero />
        </div>
      )}

      {/* Right Content Area */}
      <div
        className={`flex-1 flex items-center justify-center ${
          isStep9 ? "w-full" : "w-full"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
