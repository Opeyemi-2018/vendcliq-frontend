import Image from "next/image";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/siteLinks";

export default function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get Vendcliq on Google Play"
        className="transition-transform hover:-translate-y-0.5"
      >
        <Image
          src="/google-play.svg"
          alt="Get it on Google Play"
          width={190}
          height={58}
          className="h-10 w-auto"
        />
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Vendcliq on the App Store"
        className="transition-transform hover:-translate-y-0.5"
      >
        <Image
          src="/app-store.svg"
          alt="Download on the App Store"
          width={190}
          height={58}
          className="h-10 w-auto"
        />
      </a>
    </div>
  );
}
