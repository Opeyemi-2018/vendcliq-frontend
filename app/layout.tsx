import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/userContext";
import TopLoader from "@/components/TopLoader";
import { AppErrorBoundary } from "@/components/ErrorBoundary";

const dmSans = localFont({
  src: "./fonts/DmSans-Regular.woff2",
  variable: "--font-dm-sans",
  weight: "400",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-white">
        {/* These are client components */}
        <TopLoader />
        <AppErrorBoundary>
          <UserProvider>{children}</UserProvider>
        </AppErrorBoundary>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
