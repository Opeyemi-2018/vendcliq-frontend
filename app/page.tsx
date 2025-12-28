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
    const user = localStorage.getItem("user");

    // Check if user has incomplete signup
    if (signupProgress && signupStep) {
      router.push("/signup");
      return;
    }

    // Check if user is fully authenticated (has token AND user data)
    if (accessToken && user) {
      try {
        const userData = JSON.parse(user);
        // Check if user account is fully set up
        if (userData.status === "ACTIVE") {
          router.push("/dashboard/account/overview");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // If user has token but signup is incomplete, redirect to signup
    if (accessToken && signupProgress) {
      router.push("/signup");
      return;
    }

    // Default: redirect to signin
    router.push("/signin");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Image src={"/vendcliq.svg"} width={400} height={400} alt="logo" />
    </div>
  );
}