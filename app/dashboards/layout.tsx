"use client";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/Sidebar";
import { ReactNode, useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

// Create an inner component that uses the sidebar hook
const DashboardContent = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when route changes
  useEffect(() => {
    // Try scrolling the content div first
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // Also try the main element
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }

    // And window as fallback
    window.scrollTo(0, 0);

    // Also try to find any element with overflow
    const scrollContainers = document.querySelectorAll(
      "[data-scroll-container]"
    );
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return (
    <>
      <AppSidebar />
      <main
        ref={mainRef}
        className="w-full md:bg-[#FAFAFA] overflow-auto"
        data-scroll-container
      >
        <Navbar />
        <div
          ref={contentRef}
          className="px-4 lg:px-5 py-7 overflow-auto"
          data-scroll-container
        >
          {children}
        </div>
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
