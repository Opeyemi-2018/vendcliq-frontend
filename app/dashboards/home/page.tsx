import { Button } from "@/components/ui/button";
import { CircleCheck, Copy, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Separator } from "@/components/ui/separator";
import Table from "./chunks/Table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Home = () => {
  return (
    <div className="">
      <h1 className="font-bold font-dm-sans text-[#2F2F2F] text-[20px] md:text-[25px]">
        Welcome back, Shotayo
      </h1>
      <div className="bg-white text-center text-[12px] md:text-[14px] md:font-bold text-[#2F2F2F] py-3 px-2 md:px-6  items-center gap-2 md:gap-4 inline-flex rounded-md border-2 border-[#0000001A]/10 w-full md:w-auto">
        <h1 className="flex-shrink-0">904567892</h1>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="flex-shrink-0">Providus Bank</h1>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="flex-shrink-0">Chukwudi & Sons</h1>
        <Copy className="w-5 h-5 text-[#0A6DC0] flex-shrink-0 cursor-pointer" />
      </div>

      <div className="bg-[url('/blue.svg')] bg-no-repeat bg-cover bg-center  overflow-hidden h-[218px] mt-6 flex justify-between rounded-2xl">
        <div className="max-w-[50rem] justify-between h-full p-6 flex flex-col ">
          <h1 className="text-[16px] lg:text-[25px] xl:text-[31px] md:font-semibold font-clash text-white  md:leading-6 lg:leading-10">
            Need quick cash flow to boost and grow your business? Get up to ₦10M
            today.
          </h1>
          <Button className="w-[188px] bg-white font-medium hover:text-white hover:bg-[#0A2540] text-[16px] font-dm-sans text-[#2F2F2F]">
            Request Loan <MoveRight />
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

      <div className="mt-6 flex gap-5 flex-col lg:flex-row">
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
            <Button className="bg-[#0A2540] hover:bg-[#304c6a] text-[16px] flex gap-2 lg:gap-10 px-6 py-2  w-full text-white">
              <Image src={"/export.svg"} width={20} height={20} alt="wallet" />
              Send Money
            </Button>
            <Button className="bg-[#0A6DC0] hover:bg-[#09599a]  text-[16px] flex gap-2 lg:gap-10 px-6 py-2 w-full text-white">
              <Image
                src={"/export.svg"}
                width={20}
                height={20}
                alt="wallet"
                className="rotate-180"
              />{" "}
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
            className="font-inter w-fit cursor-pointer text-[16px] font-medium text-[#0A6DC0] border-b-2 border-[#0A6DC0]"
          >
            Take your first loan
          </Link>
        </div>
      </div>

      <div className="border-2 border-[#E4E4E4] px-4 lg:px-7 py-5  bg-white rounded-2xl mt-6">
        <Table />
      </div>

      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="border-none flex items-center  gap-4 p-0 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] h-[360px] md:h-[418px] overflow-hidden">
          <Image
            src={"/modal-woman.svg"}
            width={224}
            height={439}
            alt="stock"
            className="hidden md:inline"
          />
          <div className="space-y-6 md:space-y-10 px-5">
            <DialogHeader>
              <div>
                <DialogTitle className="font-clash text-left text-[#2F2F2F] text-[20px] md:text-[25px] font-semibold">
                  Welcome to Vendcliq
                </DialogTitle>
                <DialogDescription className="text-left mt-4 text-[14px] md:text-[16px] font-dm-sans text-[#2F2F2F] leading-none">
                  Buy, sell, and manage your businesses digitally, all from one
                  easy-to-use app.
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image
                  src={"/checkbox.svg"}
                  width={20}
                  height={20}
                  alt="check"
                />
                <p className="text-[13px] font-dm-sans font-regular text-[#9E9A9A] leading-none">
                  Connect with suppliers to order drinks and compare prices in
                  real time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src={"/checkbox.svg"}
                  width={20}
                  height={20}
                  alt="check"
                />
                <p className="text-[13px] font-dm-sans font-regular text-[#9E9A9A] leading-none">
                  Monitor stock levels and track your inventory automatically.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src={"/checkbox.svg"}
                  width={20}
                  height={20}
                  alt="check"
                />
                <p className="text-[13px] font-dm-sans font-regular text-[#9E9A9A] leading-none">
                  Access financing and other digital tools designed to make
                  vending smarter and easier and lots more.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="bg-[#0A6DC0] hover:bg-[#09599a]">
                Create a Store
              </Button>
              <Button className="bg-[#0A2540] hover:bg-[#304c6a]">
                Create Business Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
