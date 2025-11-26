import { Button } from "@/components/ui/button";
import { Copy, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Separator } from "@/components/ui/separator";

const Home = () => {
  return (
    <div className="">
      <h1 className="font-bold font-dm-sans text-[#2F2F2F] text-[20px] md:text-[25px]">
        Welcome back, Shotayo
      </h1>
      <div className="bg-white text-[12px] md:text-[14px] md:font-bold text-[#2F2F2F] py-3 px-2 md:px-6  items-center gap-2 md:gap-4 inline-flex rounded-md border-2 border-[#0000001A]/10">
        <h1 className="flex-shrink-0">904567892</h1>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="flex-shrink-0">Providus Bank</h1>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="flex-shrink-0">Chukwudi & Sons</h1>
        <Copy className="w-5 h-5 text-[#0A6DC0] flex-shrink-0 cursor-pointer" />
      </div>

      <div className="bg-[url('/blue.svg')] bg-no-repeat bg-cover bg-center  overflow-hidden h-[218px] mt-10 flex justify-between rounded-2xl">
        <div className="max-w-[50rem] space-y-6 p-6">
          <h1 className="text-[16px] lg:text-[25px] xl:text-[31px] md:font-semibold font-clash text-white  md:leading-6 lg:leading-10">
            Need quick cash flow to boost and grow your business? Get up to ₦10M
            today.
          </h1>
          <Button className="bg-white font-medium hover:text-white hover:bg-[#0A2540] text-[16px] font-dm-sans text-[#2F2F2F]">
            Request Loan{" "}
            <MoveRight className="text-[#2F2F2F] hover:text-white" />
          </Button>
        </div>
        <Image
          src={"/fine-girl.svg"}
          alt="girl"
          width={100}
          height={100}
          className="w-[350px] h-[400px]"
        />
      </div>

      <div className="mt-8 flex gap-5 flex-col md:flex-row">
        <div className=" border-[#E4E4E4] border-2 bg-white px-4 lg:px-7 py-5 rounded-2xl flex flex-col justify-between h-[218px] w-full">
          <div className="flex justify-between items-start">
            <div className="space-y-1 md:space-y-2">
              <h1 className="font-bold font-dm-sans text-[13px]  md:text-[16px] text-[#2F2F2F]">
                Wallet Balance
              </h1>
              <h1 className="font-clash text-[#2F2F2F] text-[20px] lg:text-[25px] font-semibold">
                NGN 0.00
              </h1>
            </div>
            <Image src={"/wallet.svg"} width={35} height={35} alt="wallet" />
          </div>
          <div className="flex justify-between gap-3">
            <Button className="bg-[#0A2540] hover:bg-[#0A6DC0] text-[16px]  w-full text-white">
              Send Money
            </Button>
            <Button className="bg-[#0A6DC0] hover:bg-[#0A2540]  text-[16px] w-full text-white">
              Fund Wallet
            </Button>
          </div>
        </div>
        <div className=" border-[#E4E4E4] border-2 bg-white px-4 lg:px-7 py-5 rounded-2xl flex flex-col justify-between h-[218px] w-full">
          <div className="flex justify-between items-start">
            <div className="space-y-1 md:space-y-2">
              <h1 className="font-bold font-dm-sans text-[13px]  md:text-[16px] text-[#2F2F2F]">
                Active Loans
              </h1>
              <h1 className="font-clash whitespace-nowrap text-[#2F2F2F] text-[20px] lg:text-[25px] font-semibold">
                NGN 0.00
              </h1>
            </div>
            <Image src={"/document.svg"} width={35} height={35} alt="wallet" />
          </div>
          <Link
            href={"#"}
            className="font-inter text-[16px] font-medium text-[#0A6DC0] underline"
          >
            Take your first loan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
