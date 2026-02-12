/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  BookOpen,
  Home,
  RectangleEllipsis,
  Percent,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
import { clearAuthTokens } from "@/lib/utils/api";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRouter } from "next/navigation";

const items = [
  {
    title: "Account",
    url: "/dashboards/account/overview",
    icon: Home,
    children: [
      { title: "Overview", url: "/dashboards/account/overview" },
      { title: "Send Money", url: "/dashboards/account/send-money" },
      { title: "Pay Utility Bill", url: "/dashboards/account/pay-utility" },
      {
        title: "Transaction History",
        url: "/dashboards/account/transactionHistory",
      },
      {
        title: "Payment & Subscription",
        url: "/dashboards/payment-subscription",
      },
    ],
  },
  {
    title: "Inventory",
    url: "/dashboards/inventory/overview",
    icon: BookOpen,
    children: [
      { title: "Overview", url: "/dashboards/inventory/overview" },
      { title: "Sell", url: "/dashboards/inventory/sell" },
      { title: "Buy", url: "/dashboards/inventory/buy" },
      { title: "My Store", url: "/dashboards/inventory/my-store" },
      { title: "My Purchase", url: "/dashboards/my-purchase" },
    ],
  },
  {
    title: "Market Place",
    url: "/dashboards/market-place",
    icon: Percent,
  },
  {
    title: "More",
    url: "#",
    icon: RectangleEllipsis,
    children: [
      { title: "Business Report", url: "/dashboards/business-report" },
      { title: "Supplier List", url: "/dashboards/suppliers" },
      { title: "Customer List", url: "/dashboards/customer" },
      { title: "Expenses", url: "/dashboards/expenses" },
      { title: "Profile Settings", url: "/dashboards/profile-settings" },
      { title: "Referral", url: "/dashboards/referral" },
    ],
  },
];

export function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar collapsible="icon" className="" suppressHydrationWarning>
      {/* ↑ Add suppressHydrationWarning here – fixes all Radix ID mismatches */}
      <SidebarContent
        style={{
          backgroundColor: "#0A2540",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <SidebarGroup>
          {/* Logo */}
          <div className="px-4 py-4">
            <Image src={"/vl.avif"} width={150} height={150} alt="logo" />
          </div>

          <Separator
            orientation="horizontal"
            className="h-[1px] bg-[#FFFFFF1A]"
          />

          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    {item.children ? (
                      <Collapsible defaultOpen={false}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className="menuButton mb-3 text-white hover:bg-white/10"
                          >
                            <item.icon
                              style={{ width: "30px", height: "30px" }}
                              className="text-white pr-2"
                              strokeWidth={2}
                            />
                            <span className="text-white font-dm-sans text-[16px]">
                              {item.title}
                            </span>
                            <ChevronDown
                              className="ml-auto text-white transition-transform duration-200"
                              style={{ width: "20px", height: "20px" }}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="border-l-0 ml-0 pl-0">
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className="menuButton text-white hover:bg-white/10 ml-8"
                                >
                                  <Link href={child.url}>
                                    <span className="text-white font-dm-sans text-[14px]">
                                      {child.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className="menuButton mb-3 text-white hover:bg-white/10"
                      >
                        <Link href={item.url} className="flex">
                          <item.icon
                            style={{ width: "30px", height: "30px" }}
                            className="text-white pr-2"
                            strokeWidth={2}
                          />
                          <span className="text-white font-dm-sans text-[16px]">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom section – unchanged */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="space-y-3">
            {/* Payment Subscriptions card */}
            <SidebarMenu className="mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="">
                  <div
                    style={{
                      backgroundImage: "url('/mech.avif')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: "127px",
                    }}
                    className="h-[127px] w-[217px]"
                  >
                    <div className="space-y-3">
                      <h1 className="text-white font-clash text-[14px] font-semibold">
                        Payment Subscriptions
                      </h1>
                      <p className="text-[13px] font-dm-sans font-medium text-white leading-none">
                        View subscription, manage your plan and upgrade.
                      </p>
                      <Button
                        onClick={() => router.push("/dashboards/plans")}
                        className="bg-white text-[#0A2540] hover:bg-[#0A2540] hover:text-white"
                      >
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Logout */}
            <SidebarMenu>
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Logout"
                      className="menuButton text-white hover:bg-white/10"
                    >
                      <LogOut
                        style={{ width: "30px", height: "30px" }}
                        className="text-white pr-2"
                        strokeWidth={2}
                      />
                      <span className="text-white font-dm-sans text-[16px]">
                        Logout Account
                      </span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-clash font-semibold text-[25px]">
                        Log Out
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-dm-sans text-[#464343]">
                        Are you sure you want to Log Out of your Vendcliq
                        Account?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center flex-col gap-3 sm:flex-row justify-center">
                      <AlertDialogCancel className="w-full sm:w-auto hover:bg-[#0A6DC012] bg-[#0A6DC0] text-white">
                        No, Keep Vending
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          clearAuthTokens();
                          window.location.href = "/signin";
                        }}
                        className="bg-white text-[#2F2F2F] hover:bg-[#0A6DC012] w-full sm:w-auto"
                      >
                        Yes, Log Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
