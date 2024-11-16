import { Button } from "@/components/ui/button";
import { TiArrowRight } from "react-icons/ti";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const LoanLimitCard = () => (
  <div className="bg-[#39498C] font-medium w-full md:w-[600px] h-full rounded-lg p-5 relative">
    <div className="overflow-hidden rounded-b-lg">
      <Image
        src="/assets/images/lady.svg"
        alt="Lady illustration"
        height={300}
        width={300}
        className="object-fill w-44 sm:w-72 hidden md:block absolute z-20 right-0 bottom-0"
      />
      <Image
        src="/assets/images/pattern.png"
        alt="Pattern background"
        height={100}
        width={600}
        className="object-cover w-full h-20 sm:h-32 opacity-50 absolute z-0 right-0 bottom-0 rounded-b-lg"
      />
    </div>
    <div className="z-40 min-h-72 md:h-full text-white">
      <p className="text-3xl sm:text-4xl">Your Loan Limit is</p>
      <p className="text-6xl sm:text-8xl text-primary">N10M</p>
      <div className="mt-4 sm:mt-5">
        <div className="flex items-center gap-2">
          <FaCheck className="text-white" />
          <p className="text-sm sm:text-base">Disbursement within 24hrs</p>
        </div>
        <div className="flex items-center gap-2">
          <FaCheck className="text-white" />
          <p className="text-sm sm:text-base">Pay small small</p>
        </div>
      </div>
      <Link href={"/request"}>
        <Button className="w-fit z-30 h-10 mt-5 sm:mt-0 text-sm flex text-black rounded-md absolute bottom-5 sm:bottom-10">
          Request loan
          <TiArrowRight size="20" className="text-black ml-2" />
        </Button>
      </Link>
    </div>
  </div>
);
export default LoanLimitCard;
