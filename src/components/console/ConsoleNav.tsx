"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, ExternalLink, Eye, Inbox, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { logout } from "@/app/console/actions";

export function ConsoleNav({ user, due, fresh }: { user: string; due: number; fresh: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/console", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/console/enquiries", label: "Enquiries", icon: Inbox, badge: fresh, badgeTone: "bg-gold-400 text-navy-950" },
    { href: "/console/follow-ups", label: "Follow-ups", icon: Bell, badge: due, badgeTone: "bg-red-500 text-white" },
    { href: "/console/visitors", label: "Visitors", icon: Eye },
  ];

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
          >
            <i.icon size={18} />
            <span className="flex-1">{i.label}</span>
            {!!i.badge && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${i.badgeTone}`}>{i.badge}</span>}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:text-white">
          <ExternalLink size={18} /> View website
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:text-white">
            <LogOut size={18} /> Sign out <span className="ml-auto truncate text-xs text-white/40">{user}</span>
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between bg-navy-950 px-4 py-3 lg:hidden">
        <Logo light />
        <button onClick={() => setOpen((o) => !o)} className="p-1 text-white" aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <div className="flex flex-col bg-navy-950 lg:hidden">{nav}</div>}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-navy-950 lg:flex">
        <div className="px-5 py-5">
          <Logo light />
          <p className="mt-2 text-xs font-semibold tracking-widest text-gold-300/80 uppercase">Console</p>
        </div>
        {nav}
      </aside>
    </>
  );
}
