"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const signupProgress = localStorage.getItem("signupFormData");
    const signupStep = localStorage.getItem("signupStep");
    const user = localStorage.getItem("user");

    // Check if user has incomplete signup
    if (signupProgress && signupStep) {
      router.push("/signup");
      return;
    }

    // Check if user is logged in
    if (user) {
      try {
        const userData = JSON.parse(user);
        // ✅ Allow both ACTIVE and PENDING status
        if (userData.status === "ACTIVE" || userData.status === "PENDING") {
          // Redirect based on role
          if (userData.accountRole === "ATTENDANTS") {
            router.push("/inventory/overview");
          } else {
            router.push("/account/overview");
          }
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // If no user data or incomplete signup, redirect to signin
    router.push("/signin");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Image src={"/vendcliq.svg"} width={400} height={400} alt="logo" />
    </div>
  );
}