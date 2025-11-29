"use client";

import { ReactNode } from "react";
import AuthHero from "@/components/AuthHero";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex lg:h-screen bg-white max-w-[80rem] mx-auto overflow-hidden">
      {/* Hero shows ONLY when the next sibling has data-full-width */}
      <div className="hidden md:flex w-full flex-1 items-center justify-center [&:has(+[data-full-width])]:flex">
        <AuthHero />
      </div>

      <div className="flex-1 flex items-center justify-center px-3 min-h-screen">
        {children}
      </div>
    </div>
  );
}
