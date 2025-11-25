"use client";

import localFont from "next/font/local";
import "./globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RequestProvider } from "@/components/dashboard/loadRequest/RequestContext";
import { Toaster } from "sonner";

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

// const metadata: Metadata = {
//   title: "vendcliq",
//   description: "",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <QueryClientProvider client={queryClient}>
          <RequestProvider>{children}</RequestProvider>
          {/* <ToastContainer /> */}
          <Toaster position="top-center" richColors />
        </QueryClientProvider>
      </body>
    </html>
  );
}
