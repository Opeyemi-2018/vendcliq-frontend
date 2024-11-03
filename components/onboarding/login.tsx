"use client";
import React, { useState } from "react";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { FaQuoteLeft } from "react-icons/fa";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import Link from "next/link";

export const Login = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  return (
    <div className=" h-screen">
      <div className="flex h-full gap-10 px-20 py-24 relative">
        <div>
          <div className="text-black absolute top-10">
            <Image
              src={"/assets/logo/logo.png"}
              alt=""
              width={100}
              height={70}
              className="object-cover"
            />
          </div>
          <div className=" h-full min-w-[700px]  bg-white rounded-3xl pt-24 px-20">
            <h1 className="font-semibold text-black text-2xl">Sign In</h1>
            <div className="mt-10 space-y-5 font-sans">
              <Input
                label="Email"
                placeholder="Enter your email"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <p className="text-primary underline font-semibold font-sans text-right mt-3">
              Forget Password
            </p>
            <Link href={"/dashboard"}>
              <Button className="mt-10 text-white">Sign In</Button>
            </Link>
            <Button className="flex items-center justify-center bg-white border rounded-sm border-border gap-3 mt-5">
              <FcGoogle size={"24"} />
              Sign In With Google
            </Button>
            <div className="flex gap-1 items-center font-sans justify-center mt-3">
              <p className="text-black">Don't have an account?</p>
              <Link href={"/signup"}>
                <p className="text-primary">Create an account</p>
              </Link>
            </div>
          </div>
        </div>
        <div className=" h-full  flex-1 rounded-xl relative">
          <Image
            src={"/assets/images/Subtract.png"}
            alt=""
            width={800}
            height={800}
            className="object-fill h-full w-full"
          />
          <div className=" absolute top-5 left-5 h-full w-full  text-white px-20 py-20">
            <h1 className="text-7xl font-semibold">
              What’s our <br></br>{" "}
              <span className="text-primary">Customers</span> Saying{" "}
            </h1>
            <div className="e mt-20 font-sans">
              <FaQuoteLeft className=" " size="32" />

              <p className="w-full mt-10 text-2xl ">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
                risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
                nec, ultricies sed, dolor.
              </p>
              <div className="mt-10 text-xl">
                <p className="font-semibold">Adeshola Adewoye</p>
                <p>Distributor</p>
              </div>
              <div className="flex gap-5 mt-16">
                <Button className="bg-pastel-blue w-fit px-10 py-5 rounded-lg">
                  <GoArrowLeft color="#010C3B" size="28" />
                </Button>
                <Button className="bg-dark-blue w-fit px-10 py-5 rounded-lg">
                  <GoArrowRight color="#DADFF6" size="28" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
