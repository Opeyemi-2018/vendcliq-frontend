import { ReactNode } from "react";
import Image from "next/image";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import StoreBadges from "@/components/site/StoreBadges";
import RotatingHeroCopy from "@/components/RotatingHeroCopy";

// Full-screen frame for the sign-in, sign-up and forgot-password screens: the
// site header and footer around the form, with a photo panel beside it on
// desktop.
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F8FC]">
      <SiteHeader />

      <main className="grid flex-1 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        {/* FORM */}
        <section className="flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
          <div className="w-full max-w-[28rem]">
            {children}

            <div className="mt-10 flex flex-col items-center gap-3 md:hidden">
              <p className="text-xs text-gray-500">Get the Vendcliq app</p>
              <StoreBadges />
            </div>
          </div>
        </section>

        {/* IMAGE */}
        {/* Sticks to the viewport so the copy stays in view while a long
            form (the sign-up steps) scrolls past it. */}
        <section className="hidden bg-[#0A2540] lg:block">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden">
            <Image
              src="/wom.webp"
              alt="A drinks seller standing in front of her shop"
              fill
              priority
              sizes="50vw"
              className="scale-105 object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
              <RotatingHeroCopy />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
