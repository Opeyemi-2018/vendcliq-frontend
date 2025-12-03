"use client";
import Navbar from "@/component/Navbar";
import { AppSidebar } from "@/component/Sidebar";
import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

// Create an inner component that uses the sidebar hook
const DashboardContent = ({ children }: { children: ReactNode }) => {
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <>
      <AppSidebar />
      <main className="w-full bg-background ">
        <Navbar />
        <div className=" px-3 lg:px-5 py-7">{children}</div>
      </main>
    </>
  );
};

// Wrap with SidebarProvider in the main component
const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
