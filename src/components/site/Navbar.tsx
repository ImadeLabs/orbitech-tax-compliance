"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/government-contracts", label: "Federal Contracts" },
  { href: "/tax-reform", label: "2026 Tax Reform" },
  { href: "/tools", label: "Calculators" },
  { href: "/calendar", label: "Deadlines" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" aria-label="Orbitech Tax & Compliance home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${active ? "text-navy-900 bg-navy-50" : "text-slate-600 hover:text-navy-900"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/readiness" className="btn-gold hidden px-4 py-2.5 sm:inline-flex">
            Free 2027 readiness check
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-navy-900 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-2 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                {n.label}
              </Link>
            ))}
            <Link href="/readiness" className="btn-gold mt-2">
              Free 2027 readiness check
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
