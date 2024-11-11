"use client";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";

import React from "react";

type SignupStepFourProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepFour: React.FC<SignupStepFourProps> = ({ nextStep, title }) => {
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

        <Button
          onClick={nextStep}
          className="mt-6 w-full text-white rounded-none"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SignupStepFour;
