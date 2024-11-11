"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Captions,
  ChevronDown,
  Headphones,
  ReceiptText,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ISidebarButtonProps } from "@/types";
import { RiHome5Line } from "react-icons/ri";
import "../globals.css";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/DropdownMenu";
import cn from "@/lib/utils/cn";
import { CgFileDocument } from "react-icons/cg";
import { HiOutlineBookOpen } from "react-icons/hi";
import { SlWallet } from "react-icons/sl";

const SidebarButton = ({
  href,
  icon,
  label,
  isActive,
  className,
}: ISidebarButtonProps) => (
  <Link href={href} className="w-full">
    <Button
      className={cn(
        `w-full flex justify-start text-black font-sans text-md items-center pl-5 my-2 py-5 h-14 rounded-none bg-inherit hover:bg-active  ${
          isActive ? "bg-active text-black  border-r-4 border-primary" : ""
        }`,
        className
      )}
    >
      <div className="text-neutral-gray">{icon}</div>
      {label}
    </Button>
  </Link>
);

const menuItems = [
  {
    href: "/dashboard/home",
    icon: <RiHome5Line className="mr-2 h-5 w-5 text-black" />,
    label: "Home",
  },
  {
    href: "/dashboard/loans",
    icon: <CgFileDocument className="mr-2 h-5 w-5 text-black" />,
    label: "Loans",
  },
  {
    href: "/dashboard/inventory",
    icon: <HiOutlineBookOpen className="mr-2 h-5 w-5 text-black" />,
    label: "Inventory",
  },
  {
    href: "/dashboard/bill",
    icon: <ReceiptText className="mr-2 h-5 w-5 text-black" />,
    label: "Bill Payment",
  },

  {
    href: "/dashboard/account",
    icon: <SlWallet className="mr-2 h-5 w-5 text-black" />,
    label: "Account",
  },
  {
    href: "/dashboard/transaction",
    icon: <Captions className="mr-2 h-5 w-5 text-black" />,
    label: "Transaction",
  },
  {
    href: "/dashboard/settings",
    icon: <Settings className="mr-2 h-5 w-5 text-black" />,
    label: "Settings",
  },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const firstName = "Awuya";
  const lastName = "Godwin";
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="fixed bg-white w-full z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end items-center ">
            <div className="flex items-center space-x-4">
              <Button
                aria-label="support"
                className="bg-inherit flex items-center gap-2"
              >
                <Headphones size={20} />
                <span className="font-medium text-nowrap text-gray-700">
                  Support
                </span>
              </Button>
              <div className="border-r-2 border-border h-7"></div>
              <div className="flex items-center gap-5 rounded-full">
                <span className="font-medium text-nowrap text-gray-700">
                  {`${firstName} ${lastName}`}
                </span>{" "}
                <Avatar>
                  <AvatarFallback className="bg-active border-2 text-black">
                    {initials}
                  </AvatarFallback>
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt={`${firstName} ${lastName}`}
                  />
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-4 py-2 text-white rounded-md">
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" w-fit mt-2 px-5 mr-5   py-5"></DropdownMenuContent>
                </DropdownMenu>{" "}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex flex-col md:flex-row bg-white border ">
          <div className="md:w-64 z-40 border-r border-[#BDBDBD]">
            <aside className="w-full fixed md:w-64 md:mt-5 md:mr-8">
              <nav className="h-full w-full px-5">
                <div className="flex gap-20 flex-1">
                  <div className="flex items-center mt-3">
                    <Image
                      src="/assets/logo/logo.png"
                      alt="Vera logo"
                      width={80}
                      height={80}
                      className="mr-2"
                    />
                  </div>
                </div>
                <div className="mt-20">
                  {menuItems.map((item) => (
                    <SidebarButton
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={
                        pathname === item.href || pathname.startsWith(item.href)
                      }
                    />
                  ))}
                </div>
              </nav>
            </aside>
          </div>

          <div
            className="flex-1 min-h-screen  mt-[80px] border-t border-border bg-background 
          "
          >
            <main className="">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
