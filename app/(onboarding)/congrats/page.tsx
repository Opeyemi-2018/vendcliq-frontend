"use client";

import Lottie from "lottie-react";
import animationData from "@/public/animate.json";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function ThanksPage() {
  return (
    <div className="w-full  px-4">
      <Image
        src={"/v-blue-logo.svg"}
        width={50}
        height={50}
        alt="logo"
        className="w-[111px] h-[27px] lg:mb-10"
      />
      <div className="text-center space-y-10 py-10 bg-white max-w-[75rem]  mx-auto">
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-64 h-64 mx-auto drop-shadow-lg"
        />

        <h1 className="font-clash font-semibold text-[20px] md:text-[25px] text-[#2F2F2F] leading-tight">
          Account Creation Successful
        </h1>

        <p className="text-[#9E9A9A] text-[14px] max-w-[26rem] mx-auto font-medium md:text-[16px] leading-relaxed">
          Your Vendcliq Account has been successfully created. Click the button
          below to continue to dashboard
        </p>

        <div className="max-w-md mx-auto">
          <Button
            asChild
            size="lg"
            className="bg-[#0A6DC0] hover:bg-[#085a9e] text-white w-full font-semibold px-16 py-6 rounded-xl shadow-lg transition-all"
          >
            <Link href="/dashboards/home">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
