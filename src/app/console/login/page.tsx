import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/site/Logo";
import { configuredUsers } from "@/lib/auth-token";

export const metadata: Metadata = { title: "Console sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const users = configuredUsers();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo light />
        </div>
        <div className="rounded-2xl bg-white p-7 shadow-xl">
          <h1 className="text-xl font-bold text-navy-950">Orbitech Console</h1>
          <p className="mt-1 text-sm text-slate-500">Visitors, enquiries and follow-ups</p>
          {users.length === 0 ? (
            <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              The console is locked until an admin password is configured. Set <code className="font-mono">ADMIN_PASSWORD</code> (and ideally{" "}
              <code className="font-mono">ADMIN_SESSION_SECRET</code>) in your environment, then redeploy.
            </p>
          ) : (
            <LoginForm next={next ?? ""} askName={users.length > 1} />
          )}
        </div>
      </div>
    </div>
  );
}
