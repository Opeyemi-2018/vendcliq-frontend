"use client";

import { ReactNode } from "react";
import AuthHero from "@/components/AuthHero";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex lg:h-[100vh] bg-white max-w-[80rem] mx-auto">
      <div className="hidden md:flex w-full flex-1 items-center justify-center">
        <AuthHero />
      </div>

      <div className={`flex-1 flex items-center justify-center px-3`}>
        
        {children}
      </div>
    </div>
  );
}
