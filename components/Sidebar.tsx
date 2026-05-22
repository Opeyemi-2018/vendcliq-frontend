import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  RectangleEllipsis,
  Percent,
  LogOut,
  ChevronDown,
  Building2,
  Store,
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
  useSidebar,
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
import { useState } from "react";
import { useRouter } from "next/navigation";

const items = [
  {
    title: "Account",
    url: "/account/overview",
    icon: Home,
    children: [
      { title: "Overview", url: "/account/overview" },
      { title: "Send Money", url: "/account/send-money" },
      { title: "Pay Utility Bill", url: "/account/pay-utility" },
      {
        title: "Transaction History",
        url: "/account/transactionHistory",
      },
      {
        title: "Payment & Subscription",
        url: "/payment-subscription",
      },
    ],
  },
  {
    title: "Inventory",
    url: "/inventory/overview",
    icon: BookOpen,
    children: [
      { title: "Overview", url: "/inventory/overview" },
      { title: "Sell", url: "/inventory/sell" },
      { title: "Buy", url: "/inventory/buy" },
      { title: "My Store", url: "/inventory/my-store" },
      { title: "My Purchase", url: "/my-purchase" },
    ],
  },
  // { title: "Loans", url: "/loan", icon: BriefcaseBusiness },
  {
    title: "Market Place",
    url: "/market-place",
    icon: Store,
  },

  {
    title: "Enterprise",
    url: "/credit-ledger",
    icon: Building2,
    children: [
      { title: "Credit Ledger", url: "/credit-ledger" },
      { title: "Delivery", url: "/delivery" },
    ],
  },

  {
    title: "More",
    url: "#",
    icon: RectangleEllipsis,
    children: [
      { title: "Business Report", url: "/business-report" },
      { title: "Supplier List", url: "/suppliers" },
      { title: "Customer List", url: "/customer" },
      { title: "Expenses", url: "/expenses" },
      { title: "Profile Settings", url: "/profile-settings" },
      { title: "Referral", url: "/referral" },
      { title: "Account Deletion", url: "/request-account-deletion" },
    ],
  },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openItems, setOpenItems] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (url: string) => {
    if (!url || url === "#") return false;
    return pathname === url || pathname?.startsWith(url + "/");
  };

  const hasActiveChild = (children?: { url: string }[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.url));
  };

  const toggleItem = (title: string) => {
    setOpenItems(
      (prev) =>
        prev.includes(title) ? prev.filter((item) => item !== title) : [title], // Only keep the newly opened item
    );
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(true);
    }
  };

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarContent
        style={{
          backgroundColor: "#0A2540",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <SidebarGroup>
          {!isCollapsed && (
            <div className="px-4 py-4">
              <Image src={"/vl.avif"} width={150} height={150} alt="logo" />
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center py-4">
              <Image
                src="/sidebar-logo.svg"
                width={32}
                height={32}
                alt="logo"
              />
            </div>
          )}
          <Separator
            orientation="horizontal"
            className="h-[1px] bg-[#FFFFFF1A]"
          />

          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => {
                const parentActive =
                  hasActiveChild(item.children) || isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.children ? (
                      <Collapsible
                        open={openItems.includes(item.title)}
                        onOpenChange={() => toggleItem(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={parentActive}
                            className="menuButton mb-3 text-white hover:bg-white/10"
                            onClick={() => {
                              if (!isMobile) {
                                setOpen(true);
                              }
                            }}
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
                              className={`ml-auto text-white transition-transform duration-200 ${
                                openItems.includes(item.title)
                                  ? "rotate-180"
                                  : ""
                              }`}
                              style={{ width: "20px", height: "20px" }}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="border-l-0 ml-0 pl-0">
                            {item.children.map((child) => {
                              const childActive = isActive(child.url);
                              return (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={childActive}
                                    className="menuButton text-white hover:bg-white/10 ml-8"
                                  >
                                    <Link
                                      href={child.url}
                                      onClick={handleLinkClick}
                                    >
                                      <span className="text-white font-dm-sans text-[14px]">
                                        {child.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive(item.url)}
                        className="menuButton mb-3 text-white hover:bg-white/10"
                      >
                        <Link
                          href={item.url}
                          className="flex "
                          onClick={handleLinkClick}
                        >
                          <item.icon
                            style={{ width: "30px", height: "30px" }}
                            className="text-white pr-2 "
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

        {/* Bottom section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="space-y-3">
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
                    {!isCollapsed && (
                      <div className="space-y-3">
                        <h1 className="text-white font-clash text-[14px] font-semibold">
                          Payment Subscriptions
                        </h1>
                        <p className="text-[13px] font-dm-sans font-medium text-white leading-none ">
                          View subscription, manage your plan and upgrade.
                        </p>
                        <Button
                          onClick={() => router.push("/plans")}
                          className="bg-white text-[#0A2540] hover:bg-[#0A2540] hover:text-white"
                        >
                          Upgrade Plan
                        </Button>
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="flex justify-center py-4">
                        <Image
                          onClick={() => router.push("/plans")}
                          src="/sub.svg"
                          width={32}
                          height={32}
                          alt="logo"
                        />
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

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
                  <AlertDialogContent className=" ">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-clash font-semibold text-[25px]">
                        Log Out{" "}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-dm-sans text-[#464343] ">
                        Are you sure you want to Log Out of your Vendcliq
                        Account?{" "}
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
