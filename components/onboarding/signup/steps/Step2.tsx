"use client";
import BoxOption from "@/components/ui/BoxOption";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { RadioGroup } from "@radix-ui/react-radio-group";
import Link from "next/link";
import React, { useState } from "react";

type SignupStepTwoProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepTwo: React.FC<SignupStepTwoProps> = ({ nextStep, title }) => {
  const [selectedValue, setSelectedValue] = useState("yes");
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>

      <div className="mt-5 font-sans">
        <div className="flex gap-5 ">
          <Input label="First Name" className="flex-1 mb-0" />
          <Input label="Last Name" className="flex-1 mb-0" />
        </div>
        <p className="text-gray-400 text-sm">
          Please ensure this is first and last name on your Government ID
          document.
        </p>
        <Input label="Email Address" type="email" className="flex-1  my-5" />
        <RadioGroup
          className=" flex gap-7"
          value={selectedValue}
          onValueChange={setSelectedValue}
        >
          <BoxOption value="yes" title="Yes" selectedValue={selectedValue} />
          <BoxOption value="no" title="No" selectedValue={selectedValue} />
        </RadioGroup>

        <Input label="Password" type="password" className="flex-1  my-5" />
      </div>

      <Button action={nextStep} className="mt-6 text-white rounded-none">
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

export default SignupStepTwo;
