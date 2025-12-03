"use client";

import localFont from "next/font/local";
import "./globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { RequestProvider } from "@/components/dashboard/loadRequest/RequestContext";
import { Toaster } from "sonner";
import { DM_Sans } from "next/font/google";
import { UserProvider } from "@/context/userContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable}`}
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </Head>

      <body className="antialiased bg-white">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <RequestProvider>{children}</RequestProvider>
          </UserProvider>
          <Toaster position="top-center" richColors />
        </QueryClientProvider>
      </body>
    </html>
  );
}
