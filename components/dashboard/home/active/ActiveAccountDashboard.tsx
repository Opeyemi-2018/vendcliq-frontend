// pages/ActiveAccountDashboard.tsx
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import React from "react";
import { FaCheck } from "react-icons/fa";
import { TiArrowRight } from "react-icons/ti";
import { DashboardCard } from "./DashboardCard";
import { TransactionListItem } from "./TransactionListItem";
import TransactionSummary from "./TransactionSummary";
import LoanTransactionTable from "./LoanTransactionTable";

export const ActiveAccountDashboard: React.FC = () => {
  return (
    <div className="h-screen">
      <div className="py-5 px-10 space-y-5 h-full">
        <h1 className="text-black font-medium text-xl">Hi Godwin</h1>
        <div className="flex bg-white items-center text-md text-black w-fit gap-5 py-1 px-5 font-sans border border-border rounded-lg">
          <p>904567892</p>
          <p className="border-x border-border px-3">Providus Bank</p>
          <p>Chukwudi & Sons</p>
        </div>
        <div className="flex mt-5 gap-10 h-[390px]">
          <div className="flex-1 flex flex-col h-full gap-5">
            <DashboardCard
              title="Active loan"
              amount="NGN4,000,000"
              nextPaymentDate="20-05-2023"
            />
            <DashboardCard
              title="Wallet balance"
              amount="NGN20,000,000.00"
              showButtons
              onSendMoney={() => alert("Send Money Clicked")}
              onFundWallet={() => alert("Fund Wallet Clicked")}
            />
          </div>
          <div className="bg-[#39498C] font-medium w-[600px] h-full rounded-lg p-5 relative">
            <div>
              <Image
                src="/assets/images/lady.png"
                alt=""
                height={300}
                width={300}
                className="object-fill w-72 absolute z-20 right-0 bottom-0"
              />
              <Image
                src="/assets/images/pattern.png"
                alt=""
                height={100}
                width={600}
                className="object-cover w-full h-32 opacity-50 absolute z-0 right-0 bottom-0"
              />
            </div>
            <div className="z-40 text-white">
              <p className="text-4xl">Your Loan Limit is</p>
              <p className="text-8xl text-primary">N10M</p>
              <div className="mt-5">
                <div className="flex gap-2">
                  <FaCheck className="text-white" />
                  <p>Disbursement within 24hrs</p>
                </div>
                <div className="flex gap-2">
                  <FaCheck className="text-white" />
                  <p>Pay small small</p>
                </div>
              </div>
              <Button className="w-fit z-40 bottom-10 h-8 text-sm flex text-black absolute rounded-md">
                Request loan
                <TiArrowRight size="20" className="text-black" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white w-full font-sans">
          <Tabs defaultValue="account" className="w-full p-5">
            <TabsList className="bg-white border-b border-border w-full pb-5">
              <TabsTrigger value="account">Payment Transactions</TabsTrigger>
              <TabsTrigger value="password">Loan Transactions</TabsTrigger>
              <SearchInput className="w-80 ml-20 rounded-none" />
            </TabsList>
            <TabsContent value="account">
              <div className="flex gap-20 px-3 ">
                <div className="flex-1 ">
                  <TransactionListItem
                    date="7 Mar 2024 | 17:38:00"
                    description="OUTWARD TRANSFER (N) 2334647 To"
                    recipientInfo="WEMA BANK | EBUBE DRINKS LIMITED"
                    transactionId="/00003883383364YTHD647749904"
                    amount="- 5,000,000 NGN"
                    isOutgoing={true}
                  />
                  <TransactionListItem
                    date="7 Mar 2024 | 17:38:00"
                    description="OUTWARD TRANSFER (N) 2334647 To"
                    recipientInfo="WEMA BANK | EBUBE DRINKS LIMITED"
                    transactionId="/00003883383364YTHD647749904"
                    amount="5,000,000 NGN"
                    isOutgoing={false}
                  />
                </div>
                <div className="w-[40%] ">
                  <TransactionSummary />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="password">
              <LoanTransactionTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ActiveAccountDashboard;
