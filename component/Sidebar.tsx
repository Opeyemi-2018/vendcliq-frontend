import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ScrollText,
  BookOpen,
  CreditCard,
  Home,
  RectangleEllipsis,
  ArrowRightLeft,
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
        url: "/dashboards/home/transaction-history",
      },
    ],
  },
  {
    title: "Inventory",
    url: "#",
    icon: BookOpen,
    children: [
      { title: "Sell", url: "/dashboards/inventory/sell" },
      { title: "Buy", url: "/dashboards/inventory/buy" },
      { title: "My Store", url: "/dashboards/inventory/my-store" },
    ],
  },
  { title: "Loan", url: "/dashboards/loan", icon: BriefcaseBusiness },
  {
    title: "Market Place",
    url: "/dashboards/market-place",
    icon: Percent,
  },

  { title: "Invoicing", url: "#", icon: ScrollText },

  {
    title: "More",
    url: "#",
    icon: RectangleEllipsis,
    children: [
      { title: "Business Report", url: "/dashboards/business-report" },
      { title: "Supplier List", url: "/dashboards/supplier-list" },
      { title: "Customer List", url: "/dashboards/customer-list" },
      { title: "Expenses", url: "/dashboards/expenses" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openItems, setOpenItems] = useState<string[]>([]);
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (!url || url === "#") return false;
    return pathname === url || pathname?.startsWith(url + "/");
  };

  const hasActiveChild = (children?: { url: string }[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.url));
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar collapsible="icon">
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
              <Image src={"/vl.svg"} width={150} height={150} alt="logo" />
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
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const childActive = isActive(child.url);
                              return (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={childActive} // THIS IS THE KEY PROP
                                    className="menuButton text-white hover:bg-white/10"
                                  >
                                    <Link href={child.url}>
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
                        <Link href={item.url} className="flex gap-4">
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

        {/* Bottom section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="space-y-3">
            <SidebarMenu className="mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="">
                  <div
                    style={{
                      backgroundImage: "url('/mesh.svg')",
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
                        <Button className="bg-white text-[#0A2540] hover:bg-[#0A2540] hover:text-white">
                          Upgrade Plan
                        </Button>
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="flex justify-center py-4">
                        <Image
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
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will log you out of the system
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center flex-row justify-center">
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
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
