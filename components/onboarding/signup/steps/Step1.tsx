"use client";
import BoxOption from "@/components/ui/BoxOption";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@radix-ui/react-radio-group";
import Link from "next/link";
import React, { useState } from "react";

type SignupStepOneProps = {
  nextStep: (data?: { businessType?: string }) => void;
  title: string;
};

const SignupStepOne: React.FC<SignupStepOneProps> = ({ nextStep, title }) => {
  const [businessType, setBusinessType] = useState("DISTRIBUTOR");
  const handleContinue = () => {
    console.log("businessType", businessType);
    nextStep({ businessType });
  };
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <p className="text-sm text-black text-center font-sans mt-5">
        Select the account type that best meets your needs.
      </p>
      <div className="mt-5">
        <RadioGroup
          className="space-y-6"
          value={businessType}
          onValueChange={setBusinessType}
        >
          <BoxOption
            value="DISTRIBUTOR"
            title="Distributor"
            description="For businesses that buy directly from manufacturers and sell to retailers"
            iconSrc="/assets/icon/streamline-emojis_delivery-truck.png"
            selectedValue={businessType}
          />
          <BoxOption
            value="RETAILER"
            title="Retailer"
            description="For businesses that buy from distributors and sell to final consumers"
            iconSrc="/assets/icon/noto-v1_shopping-cart.png"
            selectedValue={businessType}
          />
          <BoxOption
            value="WHOLESALER"
            title="Wholesaler"
            description="For businesses that buy from distributors and sell to final consumers"
            iconSrc="/assets/icon/wholesaler_10103180.png"
            selectedValue={businessType}
          />
        </RadioGroup>
      </div>

      <Button
        onClick={handleContinue}
        className="mt-6 text-white w-full rounded-none"
      >
        Continue
      </Button>

      <div className="flex gap-1 items-center justify-center mt-3 font-sans text-sm">
        <p className="text-black">I already have an account?</p>
        <Link href={"/"}>
          <p className="text-primary">Login</p>
        </Link>
      </div>
    </div>
  );
};

export default SignupStepOne;
