"use client";
import BoxOption from "@/components/ui/BoxOption";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { RadioGroup } from "@radix-ui/react-radio-group";
import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineReload } from "react-icons/ai";
import { TbReload } from "react-icons/tb";

type SignupStepThreeProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepThree: React.FC<SignupStepThreeProps> = ({
  nextStep,
  title,
}) => {
  const [selectedValue, setSelectedValue] = useState("yes");
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <div className="font-sans">
        <p className="font-medium text-black text-center mt-5">
          A confirmation code has been sent to your email address has been sent
          to <span className="text-primary">g.awuya@vera.africa</span>
        </p>
        <div className="mt-10 font-sans">
          <Input
            label="Confirmation Code"
            placeholder="Enter Confirmation Code"
            className="flex-1  my-5"
          />
        </div>
        <div className="flex gap-1 items-center justify-center mt-3 font-sans text-sm">
          <Button className=" flex items-center justify-center bg-inherit gap-2 font-medium text-secondary">
            <TbReload size="20" />
            Resend confirmation code
          </Button>
        </div>
        <Button action={nextStep} className="mt-6 text-white rounded-none">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SignupStepThree;
