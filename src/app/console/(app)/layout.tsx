import type { Metadata } from "next";
import { CircleAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { ConsoleNav } from "@/components/console/ConsoleNav";

export const metadata: Metadata = { title: { default: "Console", template: "%s · Orbitech Console" }, robots: { index: false, follow: false } };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const store = getStore();
  const open = await store.listEnquiries({ status: "open", limit: 1000 });
  const now = new Date().getTime();
  const due = open.filter((e) => e.nextFollowUpAt && new Date(e.nextFollowUpAt).getTime() <= now).length;
  const fresh = open.filter((e) => e.status === "new").length;

  return (
    <div className="min-h-dvh bg-slate-50 lg:flex">
      <ConsoleNav user={session.user} due={due} fresh={fresh} />
      <div className="min-w-0 flex-1">
        {store.kind === "file" && (
          <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 sm:px-8">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <p>
              Using temporary file storage. {process.env.VERCEL ? "Data will be lost when the server restarts. " : ""}Set <code className="font-mono">DATABASE_URL</code> to a
              Postgres database (for example Neon or Vercel Postgres) to keep enquiries and visitors permanently.
            </p>
          </div>
        )}
        <div className="px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
