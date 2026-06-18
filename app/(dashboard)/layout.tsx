"use client";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/Sidebar";
import { ReactNode, useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import AIChatWidget from "@/components/ChatWidget";

const DashboardContent = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }

    window.scrollTo(0, 0);

    const scrollContainers = document.querySelectorAll(
      "[data-scroll-container]",
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
           <AIChatWidget />
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
      const userData = localStorage.getItem("user");

      if (!userData) {
        // No user data found, redirect to signin
        window.location.replace("/signin");
        return false;
      }

      try {
        const parsedUser = JSON.parse(userData);
        // ✅ Allow both ACTIVE and PENDING status
        if (parsedUser.status !== "ACTIVE" && parsedUser.status !== "PENDING") {
          window.location.replace("/signin");
          return false;
        }
        return true;
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.replace("/signin");
        return false;
      }
    };

    // Initial auth check
    if (!checkAuth()) return;

    // Prevent back navigation after logout
    const handlePopState = () => {
      const currentUserData = localStorage.getItem("user");
      if (!currentUserData) {
        // User logged out, prevent navigation back
        window.history.pushState(null, "", window.location.href);
        window.location.replace("/signin");
      }
    };

    // Listen for browser back/forward button
    window.addEventListener("popstate", handlePopState);

    // Periodically check auth status (every 2 seconds)
    const authCheckInterval = setInterval(() => {
      const currentUserData = localStorage.getItem("user");
      if (!currentUserData) {
        window.location.replace("/signin");
      }
    }, 2000);

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && !e.newValue) {
        // User data was removed, user logged out
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