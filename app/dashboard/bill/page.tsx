"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center mt-60">
      <div className="flex flex-col items-center justify-center h-fit w-fit p-10 bg-gradient-to-b bg-white">
        <h1 className="text-4xl font-bold text-primary mb-4">Coming Soon</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          We&apos;re working hard to bring you an amazing billing experience.
          Stay tuned!
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition-all"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Page;
