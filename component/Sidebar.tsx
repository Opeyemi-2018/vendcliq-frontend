import {
  BriefcaseBusiness,
  ScrollText,
  BookOpen,
  CreditCard,
  Home,
  Inbox,
  Calculator,
  ArrowRightLeft,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
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
import { Button } from "@/components/ui/button";

// Menu items.
const items = [
  {
    title: "Home",
    url: "dashboards/home",
    icon: Home,
  },
  {
    title: "Loan",
    url: "/dashboards/about",
    icon: BriefcaseBusiness,
  },
  {
    title: "Inventory",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "Invoicing",
    url: "#",
    icon: ScrollText,
  },
  {
    title: "Bills Payment",
    url: "#",
    icon: CreditCard,
  },
  {
    title: "Account",
    url: "#",
    icon: Calculator,
  },
  {
    title: "Transactions",
    url: "#",
    icon: ArrowRightLeft,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent
        style={{ backgroundColor: "#0A2540" }}
        className="p-4 flex justify-between"
      >
        <SidebarGroup>
          <Image src={"/vl.svg"} width={150} height={150} alt="logo" />
          <Separator
            orientation="horizontal"
            className="h-[1px] mt-3 text-red-700"
          />

          <SidebarGroupContent>
            <SidebarMenu className="mt-10">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton asChild className="menuButton py-5 ">
                    <Link href={item.url} className="flex gap-4 ">
                      <item.icon
                        style={{ width: "24px", height: "24px" }}
                        className="text-white"
                        strokeWidth={2}
                      />
                      <span className="text-white font-dm-sans text-[16px] font-regular">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <AlertDialog>
          <AlertDialogTrigger className="flex items-center gap-2 px-3 py-2 text-white menuButton font-dm-sans text-[16px] font-regular">
            <LogOut /> Logout
          </AlertDialogTrigger>
          <AlertDialogContent className="">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will log you out of the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center flex-row justify-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                // onClick={() => logout()}
                className=" alert-danger"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarContent>
    </Sidebar>
  );
}
