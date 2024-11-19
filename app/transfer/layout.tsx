"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { IoCloseOutline } from "react-icons/io5";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-between items-center px-5 md:px-20 pt-10 w-full">
        <Image
          src="/assets/logo/logo.png"
          alt="Vera logo"
          width={150}
          height={80}
        />
        <Button
          className=" text-black bg-inherit hover:bg-inherit"
          onClick={() => router.back()}
        >
          <IoCloseOutline size="28" />
        </Button>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
