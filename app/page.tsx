// import Login from "@/components/auth/Login";
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/signin");
  });
  return <div>{/* <Login /> */}</div>;
}
