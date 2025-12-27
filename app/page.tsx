"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const signupProgress = localStorage.getItem("signupFormData");
    const signupStep = localStorage.getItem("signupStep");
    const accessToken = localStorage.getItem("accessToken");

    if (signupProgress && signupStep) {
      router.push("/signup");
    } else if (accessToken) {
      router.push("/dashboards/account/overview");
    } else {
      router.push("/signin");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Image src={"/vendcliq.svg"} width={400} height={400} alt="logo" />
    </div>
  );
}
