export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" className={light ? "fill-white/10" : "fill-navy-900"} />
        <circle cx="17" cy="17" r="7.5" fill="none" strokeWidth="2.6" className="stroke-gold-400" />
        <ellipse cx="17" cy="17" rx="13" ry="4.6" fill="none" strokeWidth="1.4" transform="rotate(-28 17 17)" className={light ? "stroke-white/70" : "stroke-white/80"} />
        <circle cx="27.4" cy="11.4" r="1.9" className="fill-gold-300" />
      </svg>
      <span className="leading-none">
        <span className={`block text-[17px] font-bold tracking-tight ${light ? "text-white" : "text-navy-950"}`}>Orbitech</span>
        <span className={`mt-0.5 block text-[10.5px] font-medium tracking-[0.14em] uppercase ${light ? "text-white/60" : "text-slate-500"}`}>Tax & Compliance</span>
      </span>
    </span>
  );
}
