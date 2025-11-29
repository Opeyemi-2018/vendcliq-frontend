"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function KYCLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="">
        <div className="max-w-[85rem] mx-auto  py-8 flex justify-between items-center">
          <Image
            src={"/v-blue-logo.svg"}
            width={50}
            height={50}
            alt="logo"
            className="w-[111px] h-[27px]"
          />
          <button
            onClick={() => router.back()}
            className="text-[#465364] hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8">{children}</main>
    </div>
  );
}
