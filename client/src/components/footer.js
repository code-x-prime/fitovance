"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

const TEXT_DARK = "#111111";
const TEXT_MED = "#444444";
const TEXT_MUTED = "#777777";
const ACCENT = "#111111";
const BG_WHITE = "#ffffff";
const BORDER = "#E8E8E8";

const FooterLink = ({ href, children }) => (
  <li>
    <Link
      href={href}
      className="text-[13px] leading-relaxed block py-[2px] transition-colors duration-200 hover:text-black"
      style={{ color: TEXT_MED, fontFamily: "var(--font-roboto, sans-serif)" }}
    >
      {children}
    </Link>
  </li>
);

const FooterHeading = ({ children }) => (
  <h3
    className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-5"
    style={{ color: TEXT_DARK, fontFamily: "var(--font-jost, sans-serif)" }}
  >
    {children}
  </h3>
);

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/checkout") {
    return (
      <footer
        className="py-8 border-t"
        style={{ backgroundColor: BG_WHITE, borderColor: BORDER, fontFamily: "var(--font-jost, sans-serif)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 text-center space-y-4">
          <p
            className="text-xs tracking-wide leading-relaxed max-w-3xl mx-auto"
            style={{ color: TEXT_MUTED, fontFamily: "var(--font-roboto, sans-serif)" }}
          >
            Your privacy matters to us. FITOVANCE collects only the information necessary to process
            orders, improve customer experience, and comply with legal requirements. We never sell
            customer data and take reasonable measures to protect your information in accordance with
            privacy standards.
          </p>
          <p
            className="text-xs tracking-widest leading-relaxed uppercase"
            style={{ color: TEXT_MED }}
          >
            By using this website, you agree to our{" "}
            <Link href="/terms-conditions" className="underline hover:text-black transition-colors">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy-policy" className="underline hover:text-black transition-colors">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/refund-policy" className="underline hover:text-black transition-colors">
              Return Policy
            </Link>
            .
          </p>
          <p className="text-xs mt-2 tracking-wider" style={{ color: TEXT_MUTED }}>
            &copy; {new Date().getFullYear()} FITOVANCE. All Rights Reserved. | Designed by{" "}
            <a
              href="https://groxmedia.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-semibold transition-colors text-black"
            >
              Grox Media LLP
            </a>
          </p>
        </div>
      </footer>
    );
  }

  const shopLinks = [
    { label: "All Supplements", href: "/products" },
    { label: "Protein Bars", href: "/products?category=protein-bars" },
    { label: "Pre-Workout Shots", href: "/products?category=pre-workout" },
    { label: "New Arrivals", href: "/products?productType=new" },
    { label: "Sale", href: "/products?sale=true" },
  ];

  const policyLinks = [
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping & Delivery", href: "/shipping-policy" },
    { label: "Return Policy", href: "/refund-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
  ];

  const serviceLinks = [
    // { label: "Gym Partner Program", href: "/partner-with-us" },
    // { label: "Distributor Inquiry", href: "/partner-with-us" },
    { label: "Track Order", href: "/account/orders" },
    { label: "Contact Support", href: "/contact" },
    { label: "About Us", href: "/about" },
  ];

  const socials = [
    { icon: <Instagram size={14} />, href: "https://www.instagram.com/fitovancemart?igsh=eXFmdDY3cWQ5anc5&utm_source=qr", label: "Instagram" },
  ];

  return (
    <footer style={{ backgroundColor: BG_WHITE, fontFamily: "var(--font-jost, sans-serif)" }}>
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-8">

        {/* ── TOP BAR: Brand + Mission ── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 pb-10 border-b" style={{ borderColor: BORDER }}>
          <div className="max-w-sm">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-2.png"
                alt="Fitovance Co"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-[13px] leading-relaxed" style={{ color: TEXT_MUTED, fontFamily: "var(--font-roboto, sans-serif)" }}>
              Clean, premium athletic nutrition — manufactured fresh in India to power your daily
              workout goals.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center border transition-all duration-200 hover:bg-black hover:border-black hover:text-white"
                style={{ borderColor: BORDER, color: TEXT_MED }}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-8 py-10 border-b" style={{ borderColor: BORDER }}>

          {/* COL 1: About */}
          <div>
            <FooterHeading>About Us</FooterHeading>
            <ul className="space-y-0.5">
              {[{ label: "Our Story", href: "/about" }, { label: "Careers", href: "/contact" }].map((l) => (
                <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* COL 2: Shop */}
          <div>
            <FooterHeading>Shop</FooterHeading>
            <ul className="space-y-0.5">
              {shopLinks.map((l) => (
                <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* COL 3: Guides & Policies */}
          <div>
            <FooterHeading>Help</FooterHeading>
            <ul className="space-y-0.5">
              {policyLinks.map((l) => (
                <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
              ))}
            </ul>
            <div className="mt-6">
              <FooterHeading>Partnership</FooterHeading>
              <ul className="space-y-0.5">
                {serviceLinks.map((l) => (
                  <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
                ))}
              </ul>
            </div>
          </div>

          {/* COL 4: Contact */}
          <div>
            <FooterHeading>Contact Us</FooterHeading>
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                <p className="text-[13px] leading-snug" style={{ color: TEXT_MED, fontFamily: "var(--font-roboto, sans-serif)" }}>
                  Plot No. 45, Sector 18,<br />Gurugram, Haryana
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={13} className="shrink-0" style={{ color: ACCENT }} />
                <a
                  href="tel:+919625839083"
                  className="text-[13px] hover:text-black transition-colors"
                  style={{ color: TEXT_MED, fontFamily: "var(--font-roboto, sans-serif)" }}
                >
                  +91 96258 39083
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail size={13} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                <a
                  href="mailto:support@fitovance.com"
                  className="text-[13px] break-all hover:text-black transition-colors"
                  style={{ color: TEXT_MED, fontFamily: "var(--font-roboto, sans-serif)" }}
                >
                  support@fitovance.com
                </a>
              </div>
              <p className="text-[11px]" style={{ color: TEXT_MUTED, fontFamily: "var(--font-roboto, sans-serif)" }}>
                Mon – Sat / 10 AM – 7 PM IST
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 hover:gap-2.5"
              style={{ color: ACCENT }}
            >
              Get in Touch <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* ── PAYMENT + COPYRIGHT ── */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3"
              style={{ color: TEXT_MUTED }}
            >
              Secure Payments
            </p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {[
                { name: "Visa", src: "/visa.svg" },
                { name: "Mastercard", src: "/mastercard.svg" },
                { name: "G Pay", src: "/gpay.png" },
                { name: "PhonePe", src: "/phonepe.svg" },
                { name: "Paytm", src: "/paytm.svg" },
                { name: "PayPal", src: "/paypal.svg" },
                { name: "Payoneer", src: "/payoneer.svg" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="px-2.5 py-1.5 flex items-center justify-center bg-white border h-9 min-w-[50px]"
                  style={{ borderColor: BORDER }}
                  title={p.name}
                >
                  <img
                    src={p.src}
                    alt={p.name}
                    className="h-4 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <div className="flex items-center gap-4">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms", href: "/terms-conditions" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[11px] transition-colors hover:text-black"
                  style={{ color: TEXT_MUTED, fontFamily: "var(--font-roboto, sans-serif)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: TEXT_MUTED, fontFamily: "var(--font-roboto, sans-serif)" }}>
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-semibold" style={{ color: TEXT_DARK }}>FITOVANCE</span>. All
              Rights Reserved. Designed &amp; Developed by{" "}
              <a
                href="https://groxmedia.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-semibold transition-colors text-black"
              >
                Grox Media LLP
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile spacer for bottom nav bar */}
      <div className="lg:hidden h-14 bg-white" />
    </footer>
  );
}
