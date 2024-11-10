"use client";
import BoxOption from "@/components/ui/BoxOption";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { RadioGroup } from "@radix-ui/react-radio-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineReload } from "react-icons/ai";
import { TbReload } from "react-icons/tb";

type SignupStepFiveProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepFive: React.FC<SignupStepFiveProps> = ({ nextStep, title }) => {
  const router = useRouter();
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <div className="font-sans">
        <p className="text-gray-600 text-center mt-4">
          Please enter your phone number to receive a confirmation code. Once
          you receive the code, input it below to proceed with the registration
          process.
        </p>
        <div className="mt-10 font-sans">
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            className="flex-1  my-5"
          />
          <Input
            label="Confirmation Code"
            placeholder="Enter your confirmation code"
            className="flex-1  my-5"
          />
        </div>

        <Button
          onClick={() => router.push("/dashboard/home")}
          className="mt-6 w-full text-white rounded-none"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SignupStepFive;
