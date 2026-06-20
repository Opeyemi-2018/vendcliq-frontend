"use client";
import { SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, ChevronDown, Headphones, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthTokens } from "@/lib/utils/api";

const Navbar = () => {
  const { isAttendant } = useUser();

  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isUserWalletNull = user?.wallet === null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Call the logout API to clear HTTP-only cookies
      await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear client-side data
      clearAuthTokens();
      // Redirect to signin
      window.location.href = "/signin";
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className={`
    fixed top-0
    h-[72px]
    p-4
    flex items-center justify-between
    border-b-2 border-[#0000001A]
    z-40
    bg-white
    transition-all duration-300
    ${
      isCollapsed
        ? "md:left-[4rem] md:w-[calc(100%-4rem)]"
        : "md:left-[16rem] md:w-[calc(100%-16rem)]"
    }
    left-0 w-full
  `}
    >
      {" "}
      <SidebarTrigger
        style={{ background: "#0A2540", color: "white" }}
        className="md:-ml-8"
      />
      <div style={{ gap: "30px" }} className="flex items-center">
        <div
          style={{ gap: "30px" }}
          className="flex items-center text-[13px] md:text-[16px] font-medium"
        >
          {mounted && user && isUserWalletNull && !isAttendant && (
            <Link
              href="/business-account"
              className="font-inter font-dm-sans cursor-pointer whitespace-nowrap text-[14px] lg:text-[16px] font-medium text-[#0A6DC0] hover:text-[#09599a] border-b-2 border-[#0A6DC0]"
            >
              Create Business Account
            </Link>
          )}
          <a
            href="https://vendcliq.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2"
          >
            <Headphones />
            <h1>Support</h1>
          </a>

          <Separator
            orientation="vertical"
            className="h-4 hidden md:inline-block"
          />
          <h1 className="hidden lg:inline">{mounted ? user?.firstname : ""}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center">
              <Avatar>
                <AvatarImage
                  className="w-10 rounded-full "
                  src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <ChevronDown size={20} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile-settings")}>
              <User className="h-[1.2rem] w-[1.2rem] mr-2" /> Profile
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Logout"
                  className="hover:text-[#FF0000] hover:bg-[#FF0000]/20 cursor-pointer focus:bg-red-100"
                >
                  <LogOut
                    // style={{ width: "30px", height: "30px" }}
                    className="h-[1.2rem] w-[1.2rem] mr-2"
                    strokeWidth={2}
                  />
                  <span className="">Logout</span>
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent className="">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-clash font-semibold text-[25px]">
                    Log Out
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-dm-sans text-[#464343]">
                    Are you sure you want to Log Out of your Vendcliq Account?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex items-center flex-col gap-3 sm:flex-row justify-center">
                  <AlertDialogCancel className="w-full sm:w-auto hover:bg-[#0A6DC012] bg-[#0A6DC0] text-white">
                    No, Keep Vending
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout} 
                    className="bg-white text-[#2F2F2F] hover:bg-[#0A6DC012] w-full sm:w-auto"
                  >
                    Yes, Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
