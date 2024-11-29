"use client";
import BoxOption from "@/components/ui/BoxOption";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import { poster } from "@/lib/utils/api/apiHelper";
import { SIGN_UP } from "@/url/api-url";
import { Label } from "@radix-ui/react-dropdown-menu";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { AxiosError } from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { parseCookies, setCookie } from "nookies";
type SignupPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  business: {
    isRegistered: boolean;
    type: string;
  };
  referral: string;
  token: string;
  data: {
    token: {
      token: string;
    };
  };
};

type SignupStepTwoProps = {
  nextStep: () => void;
  title: string;
  previousData: { businessType: string };
};

const SignupStepTwo: React.FC<SignupStepTwoProps> = ({
  nextStep,
  title,
  previousData,
}) => {
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    isRegistered: true,
    referral: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async () => {
    const { ...rest } = formData;
    try {
      // Prepare data for POST request
      const payload = {
        ...rest,
        business: {
          isRegistered: true,
          type: previousData.businessType,
        },
      };
      console.log(payload);
      // Call the poster utility function to make the API request
      const response = await poster<SignupPayload, typeof payload>(
        SIGN_UP,
        payload
      );

      const token = response.data.token.token;

      localStorage.setItem("getToken", token);
      localStorage.setItem("email", payload.email);
      nextStep();
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };
  const [registered, setRegistered] = useState("yes");
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>

      <div className="mt-5 font-sans">
        <div className="flex gap-5 ">
          <Input
            label="First Name"
            name="firstname"
            onChange={handleChange}
            value={formData.firstname}
            className="flex-1 mb-0"
          />
          <Input
            label="Last Name"
            name="lastname"
            onChange={handleChange}
            value={formData.lastname}
            className="flex-1 mb-0"
          />
        </div>
        <p className="text-gray-400 text-sm">
          Please ensure this is first and last name on your Government ID
          document.
        </p>
        <Input
          label="Email Address"
          name="email"
          type="email"
          onChange={handleChange}
          value={formData.email}
          className="flex-1  my-5"
        />
        <div>
          <Label className="text-sm text-[#2F2F2F] pb-2">
            Is your business incorporated with the Corporate Affairs Commission?
          </Label>
          <RadioGroup
            className=" flex gap-7"
            value={registered}
            onValueChange={setRegistered}
          >
            <BoxOption value="yes" title="Yes" selectedValue={registered} />
            <BoxOption value="no" title="No" selectedValue={registered} />
          </RadioGroup>
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          onChange={handleChange}
          value={formData.password}
          className="flex-1  my-5"
        />
        <Input
          label="Referal Code"
          name="referral"
          onChange={handleChange}
          value={formData.referral}
          className="flex-1  my-5"
        />
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        className="mt-6 w-full text-white rounded-none"
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

export default SignupStepTwo;
