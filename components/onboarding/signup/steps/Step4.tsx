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

type SignupStepFourProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepFour: React.FC<SignupStepFourProps> = ({ nextStep, title }) => {
  const [selectedValue, setSelectedValue] = useState("yes");
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <div className="font-sans">
        <div className="mt-10 font-sans">
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            className="flex-1  my-5"
          />
        </div>

        <Button action={nextStep} className="mt-6 text-white rounded-none">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SignupStepFour;
