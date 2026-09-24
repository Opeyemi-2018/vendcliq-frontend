"use client";

import { ReactNode } from "react";
import AuthShell from "@/components/site/AuthShell";
import { usePathname } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/congrats") {
    return (
      <div className="flex lg:h-screen lg:bg-[#F9FAFB]">
        <div className="flex w-full items-center justify-center px-3">
          {children}
        </div>
      </div>
    );
  }

  return <AuthShell>{children}</AuthShell>;
}
