import {
  BriefcaseBusiness,
  ScrollText,
  BookOpen,
  CreditCard,
  Home,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

const items = [
  { title: "Home", url: "/dashboards/home", icon: Home },
  { title: "Loan", url: "/dashboards/about", icon: BriefcaseBusiness },
  { title: "Inventory", url: "#", icon: BookOpen },
  { title: "Invoicing", url: "#", icon: ScrollText },
  { title: "Bills Payment", url: "#", icon: CreditCard },
  { title: "Account", url: "#", icon: Calculator },
  { title: "Transactions", url: "#", icon: ArrowRightLeft },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
            className="h-[1px]"
            style={{ background: "#FFFFFF1A" }}
          />

          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="menuButton text-white hover:bg-white/10 data-[active=true]:bg-white/10"
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
                </SidebarMenuItem>
              ))}
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
                      className="menuButton text-white hover:bg-white/10 data-[active=true]:bg-white/10"
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
                      <AlertDialogAction className="alert-danger">
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
