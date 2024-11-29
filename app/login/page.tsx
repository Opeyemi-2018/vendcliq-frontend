"use client";
import React, { useState } from "react";
import Input from "../../components/ui/Field";
import { Button } from "../../components/ui/button";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { FaQuoteLeft } from "react-icons/fa";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import Link from "next/link";
import { SignInPayload } from "@/types";
import { useRouter } from "next/navigation";
import { handleApiError, handleSignIn } from "@/lib/utils/api/apiHelper";
import { setCookie } from "nookies";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and Password is required.");
      return;
    }

    const payload: SignInPayload = {
      email,
      password,
    };
    console.log(payload);
    try {
      setLoading(true);
      setError("");
      const response = await handleSignIn(payload);
      console.log("response");

      if (response.status === "success") {
        setLoading(true);

        setCookie(null, "authToken", response.data.token.token, {
          path: "/",
          maxAge: 60 * 60 * 24,
        });

        router.push("/dashboard/home");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-screen">
      <div className="text-black  px-10 pt-5 pb-10">
        <Image
          src={"/assets/logo/logo.png"}
          alt=""
          width={150}
          height={100}
          className="object-cover"
        />
      </div>
      <div className="flex justify-center items-center h-[80%] gap-10 px-5 md:px-20 ">
        <div className="flex flex-col justify-center flex-1 h-full w-fit xl:w-full  bg-inherit md:bg-white  rounded-3xl  px-5 md:px-10">
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
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="text-primary underline font-semibold font-sans text-right mt-3">
            Forget Password
          </p>
          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="mt-10 w-full text-white"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Button className="flex items-center justify-center bg-white border rounded-sm border-border gap-3 w-full text-black hover:bg-inherit mt-5">
            <FcGoogle size={"24"} />
            Sign In With Google
          </Button>
          <div className="flex flex-col md:flex-row gap-1 items-center font-sans justify-center mt-3">
            <p className="text-black">Don`t have an account?</p>
            <Link href={"/signup"}>
              <p className="text-primary">Create an account</p>
            </Link>
          </div>
        </div>
        {/* </div> */}
        <div className=" h-full hidden flex-1 xl:flex rounded-xl relative">
          <Image
            src={"/assets/images/Subtract.svg"}
            alt=""
            width={10000}
            height={1000}
            className="object-fill h-full w-full"
          />
          <div className=" hidden   xl:flex flex-col justify-center absolute top-5 left-5   w-full h-full text-white px-10 py-10">
            <h1 className="text-5xl font-semibold">
              What’s our <br></br>{" "}
              <span className="text-primary">Customers</span> Saying{" "}
            </h1>
            <div className=" mt-10 font-sans">
              <FaQuoteLeft className=" " size="32" />

              <p className="w-full mt-5 text-xl ">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
                risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
                nec, ultricies sed, dolor.
              </p>
              <div className="mt-10 text-xl">
                <p className="font-semibold">Adeshola Adewoye</p>
                <p>Distributor</p>
              </div>
            </div>
            <div className="flex gap-5  mt-5">
              <Button className="bg-pastel-blue w-fit px-10 py-7 rounded-lg">
                <GoArrowLeft color="#010C3B" size="28" />
              </Button>
              <Button className="bg-dark-blue w-fit px-10 py-7 rounded-lg">
                <GoArrowRight color="#DADFF6" size="28" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
