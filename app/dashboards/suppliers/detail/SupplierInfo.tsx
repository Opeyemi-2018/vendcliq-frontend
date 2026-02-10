"use client";

import { Supplier } from "@/types/supplier";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";

interface SupplierFullDetailsProps {
  supplier: Supplier;
  onBack: () => void;
  onViewProducts: () => void;
}

export function SupplierFullDetails({
  supplier,
  onBack,
  onViewProducts,
}: SupplierFullDetailsProps) {
  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <ArrowLeft onClick={onBack} className="w-5 h-5 mb-2 cursor-pointer" />
          <div className="mb-2 md:mb-6">
            <h1 className="font-clash text-[16px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
              {supplier.name}
            </h1>
            <p className=" font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
              All info you need to know about this supplier
            </p>
          </div>
        </div>
        <Button
          className="bg-[#0A6DC0] hover:bg-[#09599a] md:py-6 mb-2 md:mb-0"
          onClick={onViewProducts}
        >
          <ShoppingCart className="mr-2 w-5 h-5" />
          See Product List
        </Button>
      </div>

      <Card className="md:p-4 lg:p-8 bg-white">
        <div className="grid md:grid-cols-2 md:gap-y-5 gap-y-2 font-dm-sans text-[#2F2F2F]">
          <div className="font-regular lowercase">
            <p className="font-bold">Supplier Name</p>
            <p>{supplier.name}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">Address</p>
            <p>{supplier.address}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">phone</p>
            <p>{supplier.phone}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">Email Address</p>
            <p>{supplier.email}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">Supplier Type</p>
            <p>{supplier.type}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">Bank</p>
            <p>{supplier.wallet.bank_name}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">Account Number</p>
            <p>{supplier.wallet.account_number}</p>
          </div>
          <div className="font-regular lowercase">
            <p className="font-bold">Account Name</p>
            <p>{supplier.wallet.account_name}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
