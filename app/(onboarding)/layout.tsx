"use client";

import { ReactNode } from "react";
import AuthHero from "@/components/AuthHero";
import { usePathname } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isCongratPage = pathname === "/congrats";

  return (
    <div
      className={`flex lg:h-screen  ${
        isCongratPage ? "lg:bg-[#F9FAFB]" : "bg-white max-w-[80rem] mx-auto overflow-hidden"
      }`}
    >
      {!isCongratPage && (
        <div className="hidden md:flex w-full flex-1 items-center justify-center">
          <AuthHero />
        </div>
      )}

      <div
        className={`
          flex items-center justify-center px-3 min-h-screen
          ${!isCongratPage ? "flex-1 max-w-[40rem] mx-auto" : "w-full"}
        `}
      >
        {children}
      </div>
    </div>
  );
}
