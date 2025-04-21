"use client";
import React, { useState } from "react";
import Input from "../../components/ui/Field";
import { Button } from "../../components/ui/button";

import Image from "next/image";
import { FaQuoteLeft } from "react-icons/fa";

import Link from "next/link";
import { SignInPayload } from "@/types";
import { useRouter } from "next/navigation";
import { handleSignIn } from "@/lib/utils/api/apiHelper";
import { setCookie } from "nookies";
import { AxiosError } from "axios";
import Logo from "@/components/Logo";
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
//import Autoplay from "embla-carousel-autoplay";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const testimonials = [
    {
      quote:
        "This incredible company has been an absolute game-changer for me. With each infusion of funds, I find myself effortlessly navigating the marketplace, securing an array of goods at just the right quantity and price. It's like having a personal guide through the network of shopping, ensuring every purchase is not just a transaction, but a triumph.",
      name: "Adeyemi Jackson, ",
      role: "Distributor",
    },
    {
      quote:
        "Your service has been an invaluable asset to my business endeavours. Your unwavering presence and prompt responses to my needs have been instrumental in navigating various situations. Thank you for being a steadfast partner in my journey towards success.",
      name: "Nneka Okafor, ",
      role: "Retailer",
    },
    {
      quote:
        "vendcliq has been instrumental in enabling me to keep my inventory well-stocked, ensuring that I can consistently meet the demands of my valued customers.",
      name: "Frankly Enterprises, ",
      role: "Store Owner",
    },
  ];
  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and Password are required.");
      return;
    }

    const payload: SignInPayload = { email, password };

    try {
      setLoading(true);
      setError("");

      // Handle sign in and token storage in parallel
      const [response] = await Promise.all([
        handleSignIn(payload),
        // Pre-fetch dashboard data while signing in
        // router.prefetch("/dashboard/home"),
      ]);

      if (response.status === "success") {
        const token = response.data.token.token;

        // Set token in localStorage and cookie simultaneously
        await Promise.all([
          Promise.resolve(localStorage.setItem("authToken", token)),
          Promise.resolve(
            setCookie(null, "authToken", token, {
              path: "/",
              maxAge: 60 * 60 * 24,
            })
          ),
        ]);
        // console.log("response>>>", response);
        if (response.data.user.email.verified === null) {
          router.push(`/signup?step=3`);
        } else if (response.data.user.phone.verified === null) {
          router.push(`/signup?step=4`);
        } else {
          router.push("/dashboard/home");
        }
        // Navigate immediately after token is set
        // router.push("/dashboard/home");
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.msg || "An error occurred");
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen">
      <div className="text-black px-10 pt-5 pb-10">
        <Logo />
      </div>

      <div className="flex justify-center items-center h-[80%] gap-10 px-5 md:px-20">
        <div className="flex flex-col justify-center h-full w-full xl:w-[600px] bg-inherit md:bg-white rounded-3xl px-5 md:px-10">
          <h1 className="font-semibold text-black text-2xl">Sign In</h1>
          <div className="mt-10 space-y-5 font-sans">
            {error && (
              <p className="text-red-600 text-sm mt-3 bg-red-100 p-2 rounded">
                {error}
              </p>
            )}
            <Input
              label="Email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[43px] text-gray-500"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p
            className="text-primary underline font-semibold font-sans text-right mt-3 cursor-pointer hover:cursor-pointer"
            onClick={() => router.push("/forget-password/otp")}
          >
            Forgot Password?
          </p>

          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="mt-10 w-full text-white"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="flex flex-col md:flex-row gap-1 items-center font-sans justify-center mt-3">
            <p className="text-black">Don&apos;t have an account?</p>
            <Link href="/signup?step=1">
              <p className="text-primary">Create an account</p>
            </Link>
          </div>
        </div>

        <div className="hidden xl:flex flex-1 relative rounded-xl h-full w-full">
          <Image
            src="/assets/images/Subtract.png"
            alt="Background Image"
            fill
            className="h-full w-full object-cover rounded-xl"
          />
          <div className="absolute top-0 left-5 w-full h-full text-white px-10 py-10 gap-10 flex flex-col justify-center">
            <h1 className="text-5xl font-semibold">
              What our <br />
              <span className="text-primary">Customers</span> are Saying
            </h1>
            <Carousel
              className="w-full mt-0 relative font-sans"
              // plugins={[
              //   Autoplay({
              //     delay: 2000,
              //   }),
              // ]}
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <div>
                      <FaQuoteLeft size={32} />
                      <p className="mt-5 text-xl ">{testimonial.quote}</p>
                      <div className="mt-10 text-xl">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-[16px]">{testimonial.role}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex absolute w-36 left-10 mt-20 gap-5 ">
                <CarouselPrevious className="bg-pastel-blue w-fit px-10 py-7 rounded-lg" />
                <CarouselNext className="bg-dark-blue w-fit px-10 py-7 rounded-lg" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
