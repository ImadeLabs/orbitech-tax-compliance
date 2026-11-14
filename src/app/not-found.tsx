import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-navy-950 px-4 text-center text-white">
      <p className="text-sm font-semibold tracking-widest text-gold-300 uppercase">404</p>
      <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-white/70">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-gold">Go home</Link>
        <Link href="/readiness" className="btn-ghost-light">Take the readiness check</Link>
      </div>
    </div>
  );
}
