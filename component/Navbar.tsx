"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, ChevronDown, Headphones, Sun, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/separator";

const Navbar = () => {
  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 border-b-2 border-[#0000001A] z-10 bg-white round ">
      <SidebarTrigger style={{ background: "#0A2540", color: "white" }} />
      <div style={{ gap: "30px" }} className="flex items-center">
        <div
          style={{ gap: "30px" }}
          className="flex items-center text-[13px] md:text-[16px] font-medium"
        >
          <div className="flex items-center gap-2">
            <Headphones />
            <h1>Support</h1>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <h1>John Doe</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center ">
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
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-[1.2rem] w-[1.2rem] mr-2" /> Profile
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
            <Settings className="h-[1.2rem] w-[1.2rem] mr-2" /> Settings
            </DropdownMenuItem> */}
            <DropdownMenuItem>
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
