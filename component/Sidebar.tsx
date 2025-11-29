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
              <Separator
                orientation="horizontal"
                className="h-[1px] mt-3"
                style={{ background: "#FFFFFF1A" }}
              />
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
          <SidebarGroupContent>
            
              <SidebarMenu className="mt-4">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="menuButton text-white hover:bg-white/10 data-[active=true]:bg-white/10"
                  >
                    <div
                      style={{
                        backgroundImage: "url('/mesh.svg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "127px",
                      }}
                      className="h-[127px] w-[217px]"
                    >
                      jjjj
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
