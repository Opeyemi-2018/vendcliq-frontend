"use client";
import { PayLoan } from "@/components/dashboard/loan/PayLoan";
import Logo from "@/components/Logo";

import { X } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import React from "react";
const Page = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  return (
    <div className="h-full">
      <div className="flex justify-between px-20 pt-10 w-full">
        <div>
          <Logo />
        </div>

        <X size={24} onClick={() => router.back()} />
      </div>
      <div className=" ">
        <PayLoan id={id} />
      </div>
    </div>
  );
};
export default Page;
