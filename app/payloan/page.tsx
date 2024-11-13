"use client";
import { PayLoan } from "@/components/dashboard/loan/PayLoan";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
const Page = () => {
  const router = useRouter();
  return (
    <div className="h-full">
      <div className="flex justify-between px-20 pt-10 w-full">
        <Image
          src="/assets/logo/logo.svg"
          alt="Vera logo"
          width={150}
          height={80}
        />
        <Button className=" text-black" onClick={() => router.back()}>
          x
        </Button>
      </div>
      <div className=" ">
        <PayLoan />
      </div>
    </div>
  );
};
export default Page;
