"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, ChevronDown, Headphones, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { clearAuthTokens } from "@/lib/utils/api";
import Link from "next/link";

const Navbar = () => {
  const { user, isUserPending } = useUser();

  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 border-b-2 border-[#0000001A] z-10 bg-white ">
      <SidebarTrigger style={{ background: "#0A2540", color: "white" }} />
      <div style={{ gap: "30px" }} className="flex items-center">
        <div
          style={{ gap: "30px" }}
          className="flex items-center text-[13px] md:text-[16px] font-medium"
        >
          {isUserPending && (
            <Link
              href={"/dashboards/business-account"}
              className="font-inter font-dm-sans  cursor-pointer whitespace-nowrap text-[14px] lg:text-[16px] font-medium text-[#0A6DC0] hover:text-[#09599a] border-b-2 border-[#0A6DC0]"
            >
              Create Business Account{" "}
            </Link>
          )}
          <div className="hidden lg:flex items-center gap-2">
            <Headphones />
            <h1>Support</h1>
          </div>
          <Separator orientation="vertical" className="h-4 " />
          <h1 className="hidden lg:inline">{user?.firstname}</h1>
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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-[1.2rem] w-[1.2rem] mr-2" /> Profile
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
            <Settings className="h-[1.2rem] w-[1.2rem] mr-2" /> Settings
            </DropdownMenuItem> */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-[#FF0000] bg-[#FF0000]/20 cursor-pointer focus:bg-red-700"
                >
                  <div
                    className="flex gap-3 items-center"
                    style={{ color: "#FF0000" }}
                  >
                    <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                    <span>Log out</span>
                  </div>
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will log you out of the system
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearAuthTokens();
                      window.location.href = "/signin";
                    }}
                    className="alert-danger"
                  >
                    Continue
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
