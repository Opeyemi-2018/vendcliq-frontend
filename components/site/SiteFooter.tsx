import Image from "next/image";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import StoreBadges from "@/components/site/StoreBadges";
import { siteUrl } from "@/lib/siteLinks";

// Mirrors the footer on vendcliq.com; every link points back to the public site.
const footerColumns = [
  {
    title: "Marketplace",
    links: [
      { label: "Shop all drinks", href: "/market-place" },
      {
        label: "Carbonated Drink",
        href: "/market-place?category=Carbonated%20Drink",
      },
      { label: "Water", href: "/market-place?category=Water" },
      { label: "Malt", href: "/market-place?category=Malt" },
      { label: "Energy Drink", href: "/market-place?category=Energy%20Drink" },
    ],
  },
  {
    title: "For Sellers",
    links: [
      { label: "Inventory Management", href: "/inventory" },
      { label: "Cliq Credit", href: "/credit" },
      { label: "Payments", href: "/payment" },
      { label: "Sell on Vendcliq", href: "/products" },
      { label: "Sell without a shop", href: "/drop-shipping" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Partner with us",
    links: [
      { label: "Manufacturers", href: "/manufacturers" },
      { label: "Financial Institutions", href: "/financial-institutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Sign up", href: "/sign-up" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "", isSoon: true },
    ],
  },
];

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/vendcliq/",
    icon: FaLinkedin,
  },
  { name: "YouTube", href: "https://youtube.com/@vendcliq", icon: FaYoutube },
  { name: "X (Twitter)", href: "https://x.com/vendcliq", icon: FaXTwitter },
  {
    name: "Instagram",
    href: "https://www.instagram.com/vendcliq",
    icon: FaInstagram,
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Request Account Deletion", href: "/account-deletion" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#0A2540] py-12 text-white md:py-16">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          <div>
            <Image
              src="/logo-wordmark-light.png"
              alt="Vendcliq"
              width={150}
              height={37}
              className="h-auto w-[150px]"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              The biggest market for drinks in Africa. Powered by the technology
              layer that moves stock, finances inventory, and tells you
              what&apos;s selling.
            </p>
            <div className="mt-6 flex gap-2">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:-translate-y-0.5 hover:bg-[#0A6DC0] hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <StoreBadges className="mt-6" />
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-4 text-sm font-bold">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.isSoon ? (
                      <span className="inline-flex items-center gap-2 text-sm text-white/50">
                        {link.label}
                        <span className="rounded-full border border-[#FAC136]/30 bg-[#FAC136]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#FAC136]">
                          Coming soon
                        </span>
                      </span>
                    ) : (
                      <a
                        href={siteUrl(link.href)}
                        className="text-sm text-white/70 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/50 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Vendcliq. All rights reserved.</span>
          <span className="text-sm">Lagos · Ogun, and growing across Africa.</span>
          <nav className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={siteUrl(link.href)}
                className="transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
