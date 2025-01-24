"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  ChevronDown,
  Headphones,
  Loader2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { ISidebarButtonProps } from "@/types";
import "../globals.css";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import cn from "@/lib/utils/cn";
import {
  Bill,
  Book1,
  Home2,
  PercentageSquare,
  Setting2,
  TableDocument,
  Wallet2,
} from "iconsax-react";
import { useDashboardData } from "@/services/home/home";
import { destroyToken } from "@/lib/utils/api";
import Logo from "@/components/Logo";
import Link from "next/link";
import { handleGetDashboard } from "@/lib/utils/api/apiHelper";
import { toast } from "react-toastify";

const menuItems = [
  {
    href: "/dashboard/home",
    icon: <Home2 size="28" color="black" />,
    label: "Home",
  },
  {
    href: "/dashboard/loans",
    icon: <TableDocument size="28" color="black" />,
    label: "Loans",
  },
  {
    href: "/dashboard/inventory",
    icon: <Book1 size="28" color="#000000" />,
    label: "Inventory",
  },
  {
    href: "/dashboard/bill",
    icon: <Bill size="28" color="#000000" />,
    label: "Bill Payment",
  },
  {
    href: "/dashboard/account",
    icon: <Wallet2 size="28" color="#000000" />,
    label: "Account",
  },
  {
    href: "/dashboard/transaction",
    icon: <PercentageSquare size="28" color="#000000" />,
    label: "Transaction",
  },
  {
    href: "/dashboard/settings",
    icon: <Setting2 size="28" color="#000000" />,
    label: "Settings",
  },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFinishedSetup, setIsFinishedSetup] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDashboardData();

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await handleGetDashboard();
        console.log("response>>>>>", response);
        const profileCompletionStep = response.data.business.status;

        const isComplete =
          profileCompletionStep === "ACTIVATED" &&
          response.data.account.status === "ACTIVE";

        console.log("isComplete>>>>>", isComplete);
        setIsFinishedSetup(isComplete);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsFinishedSetup(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  // Check if current path should exclude the dashboard layout
  const excludedPaths = [
    "/dashboard/payloan",
    "/dashboard/request",
    "/dashboard/setup",
  ];
  if (excludedPaths.some((path) => pathname?.startsWith(path))) {
    return <>{children}</>;
  }

  const customer = data?.data.customer;
  const firstName = customer?.firstname;
  const lastName = customer?.lastname;
  const initials = `${firstName?.[0]}${lastName?.[0]}`;

  const ModifiedSidebarButton = ({
    href,
    icon,
    label,
    isActive,
    className,
  }: ISidebarButtonProps) => (
    <button
      onClick={() => {
        if (isFinishedSetup) {
          router.push(href);
          setIsSidebarOpen(false);
        } else {
          toast.error("Please complete the setup process first.");
          router.push("/dashboard/setup");
        }
      }}
      className={cn(
        `w-full flex justify-start text-black   font-sans text-[16px] items-center pl-5 my-5 py-5 h-12 rounded-none bg-inherit hover:bg-active ${
          isActive ? "bg-active text-black border-r-4 border-primary" : ""
        }`,
        className
      )}
    >
      <div className="text-neutral-gray">{icon}</div>
      <div
        className={cn(
          `w-full flex justify-start text-black   font-[500] text-[16px] items-center pl-5 my-5 py-5 h-12 `
        )}
      >
        {label}
      </div>
    </button>
  );

  return (
    <>
      <div className="">
        <header className="fixed bg-white w-full  flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 border-b  border-[#BDBDBD] z-40">
          <button
            className="xl:hidden text-gray-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex justify-end w-full items-center space-x-4">
            <Link
              aria-label="support"
              href="https://vendcliq.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-inherit flex items-center gap-2"
            >
              <Headphones size={20} />
              <span className="font-medium text-nowrap text-gray-700">
                Support
              </span>
            </Link>
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
                <DropdownMenuContent className="w-fit mt-2 px-5 mr-5 py-5">
                  <DropdownMenuItem
                    onClick={() => {
                      destroyToken();
                      localStorage.removeItem("authToken");
                      window.location.href = "/";
                    }}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      </div>

      <div className="flex flex-col md:flex-row h-screen ">
        {/* Sidebar for desktop */}
        <div className="hidden xl:block h-full  md:w-[25%] xl:w-[15%]">
          <aside className="fixed h-full z-50 bg-white border-r  border-[#BDBDBD] md:w-[25%] xl:w-[15%]">
            <div className="absolute top-5 left-5 z-50">
              <Logo />
            </div>
            <nav className="h-full w-full px-5 mt-28">
              {menuItems.map((item) => (
                <ModifiedSidebarButton
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={
                    pathname
                      ? pathname === item.href || pathname.startsWith(item.href)
                      : false
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
              <X size={20} />
            </button>
            <nav>
              {menuItems.map((item) => (
                <ModifiedSidebarButton
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={
                    pathname
                      ? pathname === item.href || pathname.startsWith(item.href)
                      : false
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
              {firstName ||
              (lastName &&
                firstName !== "undefined" &&
                lastName !== "undefined") ? (
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
                    <DropdownMenuContent className="w-fit mt-2 px-5 mr-5 py-5">
                      <DropdownMenuItem
                        onClick={() => {
                          destroyToken();
                          localStorage.removeItem("authToken");
                          window.location.href = "/";
                        }}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
              )}
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

        <div className="flex-1   min-h-screen  bg-background mt-[75px]">
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
