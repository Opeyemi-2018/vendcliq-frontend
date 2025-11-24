"use client";

import Image from "next/image";
import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "@/public/animate.json";
import ProgressHeader from "./ProgressHeader";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
interface Props {
  data: FormData;
}

export default function Step9({ data }: Props) {
  useEffect(() => {
    localStorage.removeItem("signupFormData");
    localStorage.removeItem("signupStep");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
  }, []);
  return (
    <div className="flex flex-col justify-between h-[80vh] py-5">
      {/* <ProgressHeader currentStep={9} /> */}

      <div className="flex items-center justify-center">
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-40 h-40"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-[#2F2F2F] text-center capitalize font-clash font-bold text-[22px]">
          account creation successful
        </h1>
        <div className="text-[#9E9A9A] text-center text-[16px] leading-relaxed mb-8 max-w-md mx-auto">
          Your Vendcliq Account has been successfully created. Click the button
          below to continue to dashboard
          <Button className="bg-[#0A6DC0] hover:bg-[#085a9e] w-[411px] ">
            <Link href={"/dashboard/home"} className=" font-bold text-[16px]">
              Go to Dashboard
            </Link>
          </Button>
          .
        </div>
      </div>
    </div>
  );
}
