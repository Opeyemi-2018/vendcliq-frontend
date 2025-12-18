/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Copy,
  MoveRight,
  EyeOff,
  Eye,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import Table from "../../account/chunks/Table";
{
  /* <LayoutDashboard />; */
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";

const Home = () => {
  const { user, isUserPending, wallet } = useUser();
  const [showBalance, setShowBallance] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();

  //   const handleCreateStore = () => {
  //     // Navigate to create store page
  //     window.location.href = "/dashboards/inventory/my-store";
  //     setShowWelcomeModal(false);
  //   };

  //   const handleCreateBusinessAccount = () => {
  //     router.push("/dashboards/business-account");
  //     setShowWelcomeModal(false);
  //   };

  return (
    <div className="">
      <h1 className="text-[20px] md:text-[25px] font-bold font-dm-sans text-[#2F2F2F]">
        Inventory
      </h1>
      <div className="bg-[url('/blue.svg')] bg-no-repeat bg-cover bg-center p-6 overflow-hidden h-[218px] mt-3 flex flex-col md:flex-row justify-between rounded-2xl">
        <div className="max-w-[50rem] justify-between h-full flex flex-col ">
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3">
              <p className="text-white">Total Sales</p>
              <button
                className="text-white"
                type="button"
                onClick={() => setShowBallance(!showBalance)}
              >
                {showBalance ? <EyeOff size={21} /> : <Eye size={23} />}
              </button>
            </div>

            {showBalance ? (
              <h1 className="text-[28px] font-clash font-bold text-white">
                ****
              </h1>
            ) : (
              <div className="font-clash text-[#2F2F2F] text-[20px] lg:text-[25px] font-semibold">
                <h1 className="text-[16px] lg:text-[25px] xl:text-[31px] md:font-semibold font-clash text-white  md:leading-6 lg:leading-10">
                  ₦300,500,750
                </h1>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center gap-14 ">
            <div className="flex items-center gap-1">
              <p className="text-white">Breakdown by Store</p>
              <ChevronRight color="white" />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-white">Breakdown by Medium</p>
              <ChevronRight color="white" />
            </div>
          </div>
        </div>
        <div className="pt-6">
          <Button className="bg-white text-[#2F2F2F] font-medium text-[14px] font-dm-sans">
            button
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h1 className="font-bold text-[16px] font-dm-sans text-[#2F2F2F]">
          Quick Actions
        </h1>
        <div className="mt-4 flex items-center gap-4">
          <Button className="bg-[#0A6DC0] hover:bg-[#09599a] w-full text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-white">
            <Image src={"/sell.svg"} width={20} height={20} alt="wallet" />
            Sell
          </Button>
          <Button className="bg-[#0A2540] hover:bg-[#304c6a] w-full text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-white">
            <Image src={"/iv-buy.svg"} width={20} height={20} alt="wallet" />
            Buy
          </Button>
          <Button variant={"outline"} className="bg-white w-full text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-#2F2F2F">
            <Image src={"/store.svg"} width={20} height={20} alt="wallet" />
            My Store
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
