"use client";
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A6DC0]"></div>
    </div>
  );
}
