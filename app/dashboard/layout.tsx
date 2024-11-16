"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ChevronDown, Headphones } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ISidebarButtonProps } from "@/types";
import "../globals.css";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/DropdownMenu";
import cn from "@/lib/utils/cn";
import {
  Bill,
  Book1,
  DocumentText1,
  Home2,
  Setting2,
  TableDocument,
  Wallet2,
} from "iconsax-react";

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
        `w-full flex justify-start text-black font-sans text-md items-center pl-5 my-2 py-5 h-14 rounded-none bg-inherit hover:bg-active ${
          isActive ? "bg-active text-black border-r-4 border-primary" : ""
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
    icon: <Home2 size="80" color="black" />,
    label: "Home",
  },
  {
    href: "/dashboard/loans",
    icon: <TableDocument size="60" color="black" />,
    label: "Loans",
  },
  {
    href: "/dashboard/inventory",
    icon: <Book1 size="60" color="#000000" />,
    label: "Inventory",
  },
  {
    href: "/dashboard/bill",
    icon: <DocumentText1 size="60" color="#000000" />,
    label: "Bill Payment",
  },
  {
    href: "/dashboard/account",
    icon: <Bill size="60" color="#000000" />,
    label: "Account",
  },
  {
    href: "/dashboard/transaction",
    icon: <Wallet2 size="60" color="#000000" />,
    label: "Transaction",
  },
  {
    href: "/dashboard/settings",
    icon: <Setting2 size="60" color="#000000" />,
    label: "Settings",
  },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const firstName = "Awuya";
  const lastName = "Godwin";
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <html lang="en">
      <body className="min-h-screen h-full ">
        <div className="h-14">
          <header className="fixed bg-white w-full z-40 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
            <Image
              src="/assets/logo/logo.svg"
              alt="Vera logo"
              width={150}
              height={80}
            />
            <button
              className="xl:hidden text-gray-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="hidden md:flex justify-end w-full items-center space-x-4">
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
                <span className="font-medium text-nowrap text-gray-700">{`${firstName} ${lastName}`}</span>
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
                  <DropdownMenuContent className="w-fit mt-2 px-5 mr-5 py-5"></DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
        </div>

        <div className="flex flex-col md:flex-row h-screen">
          {/* Sidebar for desktop */}
          <div className="hidden xl:block h-full border-r md:w-[25%] xl:w-[15%] border-[#BDBDBD]">
            <aside className="fixed h-full z-50 bg-white  md:w-[25%] xl:w-[15%]">
              <nav className="h-full w-full px-5 mt-20">
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
              </nav>
            </aside>
          </div>

          {/* Sidebar for mobile */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 bg-white p-5 xl:hidden">
              <button
                className="text-gray-700 text-xl font-bold mb-4"
                onClick={() => setIsSidebarOpen(false)}
              >
                ×
              </button>
              <nav>
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
              </nav>
              <div className="flex  justify-start w-full items-left space-x-4">
                <Button
                  aria-label="support"
                  className="bg-inherit flex w-fit items-center gap-2"
                >
                  <Headphones size={20} />
                  <span className="font-medium text-nowrap  text-gray-700">
                    Support
                  </span>
                </Button>

                <div className="flex items-center gap-5 rounded-full">
                  <span className="font-medium text-nowrap text-gray-700">{`${firstName} ${lastName}`}</span>
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
                    <DropdownMenuContent className="w-fit mt-2 px-5 mr-5 py-5"></DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black opacity-50 xl:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          <div className="flex-1   min-h-screen border-t border-border bg-background mt-5">
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
