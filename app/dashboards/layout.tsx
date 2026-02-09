"use client";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/Sidebar";
import { ReactNode, useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";

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
          className="px-4 lg:px-5 py-7 overflow-auto mt-16"
          data-scroll-container
        >
          {children}
        </div>
      </main>
    </>
  );
};

// Wrap with SidebarProvider and add auth protection
const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount and route changes
    const checkAuth = () => {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      if (!token) {
        // No token found, redirect to signin
        window.location.replace("/signin");
        return false;
      }
      return true;
    };

    // Initial auth check
    if (!checkAuth()) return;

    // Prevent back navigation after logout
    const handlePopState = () => {
      const currentToken =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!currentToken) {
        // User logged out, prevent navigation back
        window.history.pushState(null, "", window.location.href);
        window.location.replace("/signin");
      }
    };

    // Listen for browser back/forward button
    window.addEventListener("popstate", handlePopState);

    // Periodically check auth status (every 2 seconds)
    const authCheckInterval = setInterval(() => {
      const currentToken =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!currentToken) {
        window.location.replace("/signin");
      }
    }, 2000);

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === "accessToken" || e.key === "authToken") && !e.newValue) {
        // Token was removed, user logged out
        window.location.replace("/signin");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, [router]);

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
