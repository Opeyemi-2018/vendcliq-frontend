import Image from "next/image";
import StoreBadges from "@/components/site/StoreBadges";
import { BUY_DRINKS_URL, SITE_URL } from "@/lib/siteLinks";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 md:h-20 md:px-10">
        <a href={SITE_URL} aria-label="Vendcliq home" className="shrink-0">
          <Image
            src="/assets/logo/logo.png"
            alt="Vendcliq"
            width={1488}
            height={363}
            priority
            className="h-6 w-auto md:h-7"
          />
        </a>

        <div className="flex items-center gap-3">
          <StoreBadges className="hidden md:flex" />
          <a
            href={BUY_DRINKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            // Same height and corner radius as the store badges beside it.
            className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-[#0A6DC0]/15 bg-[#E8F2FB] px-3 text-sm font-semibold text-[#0A6DC0] transition-colors hover:bg-[#D6E8F8] md:px-4"
          >
            <Image
              src="/drinks-dey-icon.png"
              alt=""
              width={57}
              height={96}
              className="h-6 w-auto"
            />
            Buy drinks
          </a>
        </div>
      </div>
    </header>
  );
}
