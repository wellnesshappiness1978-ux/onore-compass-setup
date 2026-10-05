import logo from "@/assets/agolmen-logo-orbit.png";

const points = Array.from({ length: 230 }, (_, i) => {
  const angle = i * 0.12;
  const radius = 2.5 * Math.exp(0.107 * angle);
  return `${160 + Math.cos(angle) * radius},${160 + Math.sin(angle) * radius}`;
}).join(" ");

export function SpiralLines({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 320 320" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <circle cx="160" cy="160" r="145" stroke="currentColor" strokeWidth=".35" opacity=".38" />
    <circle cx="160" cy="160" r="119" stroke="currentColor" strokeWidth=".35" opacity=".26" />
    <path d="M160 8v304M8 160h304M54 54l212 212M266 54 54 266" stroke="currentColor" strokeWidth=".35" opacity=".23" />
    <polyline points={points} stroke="currentColor" strokeWidth="1.1" opacity=".75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const particles = Array.from({ length: 16 }, (_, i) => i);

export function AgolmenLoading({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={`agolmen-loading flex flex-col items-center justify-center text-center ${compact ? "min-h-36" : "min-h-screen"}`} role="status" aria-live="polite">
    <div className={`agolmen-loading-art relative ${compact ? "size-24" : "size-48"}`} aria-hidden="true">
      <SpiralLines className="agolmen-loading-orbit absolute inset-0 size-full text-primary" />
      {particles.map(i => <span key={i} className="agolmen-particle" style={{ "--i": i } as React.CSSProperties} />)}
      <img src={logo} alt="" width={1024} height={1024} className="agolmen-loading-logo absolute inset-[20%] size-[60%] object-contain" />
    </div>
    <p className="mt-3 px-4 font-serif text-sm text-primary">{label}</p>
  </div>;
}

export function AgolmenLogo({ className = "" }: { className?: string }) {
  return <img src={logo} alt="" width={1024} height={1024} className={className} />;
}