"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/userContext";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";

const Referral = () => {
  const { getReferralCode, getReferralCount } = useUser();

  const referralCode = getReferralCode();
  const referralMessage = `Join VendCliq using my referral code: ${referralCode}. Get amazing benefits and start your business journey!`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Code copied!");
    } catch (error) {
      toast.error("Failed to copy code");
      console.error("Copy error:", error);
    }
  };

  const handleReferNow = () => {
    // Open WhatsApp with the referral message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(referralMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="text-[#2F2F2F] font-dm-sans">
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Referrals
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          View and share referral code, earn rewards and track your referral
          progress{" "}
        </p>
      </div>

      <div className="bg-[url('/referral.svg')] bg-no-repeat bg-cover bg-center  overflow-hidden h-[218px] mt-6 flex gap-20 rounded-2xl">
        <div className="max-w-[50rem] justify-between h-full p-6 flex flex-col gap-3">
          <h1 className="text-[16px] lg:text-[25px] xl:text-[31px] md:font-semibold font-clash text-white leading-none  md:leading-6 lg:leading-10">
            Refer 10 people this month and enjoy interest-free goods on credit
            for any product of your choice
          </h1>
          {/* Progress Bar */}
          <div className="">
            <div className="relative w-full h-4 md:h-6 bg-white rounded-lg overflow-hidden ">
              {/* Progress Fill */}
              <div
                className="absolute top-0 left-0 h-full bg-[#0A2540] transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min((getReferralCount() / 10) * 100, 100)}%`,
                }}
              />
              {/* Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[14px] md:text-[16px] md:font-bold z-10">
                  {getReferralCount()}/10
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleReferNow}
            className="w-[150px] text-[#2F2F2F] flex items-center bg-white font-bold hover:bg-gray-100"
          >
            Refer Now
          </Button>
        </div>
        <Image
          src={"/gift.svg"}
          alt="gift"
          width={150}
          height={150}
          className=" -ml-12 sm:-ml-0"
        />
      </div>

      <div className="bg-[url('/ref.svg')] bg-no-repeat bg-cover bg-center p-6 md:w-[458px] h-[104px] overflow-hidden  mt-6 flex justify-between rounded-2xl">
        <div>
          <h1 className="font-semibold md:text-[20px]">{getReferralCount()}</h1>
          <p>Total People Referred</p>
        </div>
        <Image
          src={"/gif.svg"}
          alt="referral icon"
          width={25}
          height={25}
          className=""
        />
      </div>

      <div className="bg-[#0A6DC012] p-4 flex justify-between items-center mt-4 rounded-lg">
        <h1 className="font-semibold text-[20px]">
          {referralCode || "Loading..."}
        </h1>
        <Button
          onClick={handleCopyCode}
          className="w-[150px] flex items-center bg-[#0A6DC0] font-bold hover:bg-[#085a9e]"
        >
          Copy Code
        </Button>
      </div>
    </div>
  );
};

export default Referral;
