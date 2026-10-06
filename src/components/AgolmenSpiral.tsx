import logoAsset from "@/assets/agolmen-v10-compass-final.png.asset.json";

const logo = logoAsset.url;

const points = Array.from({ length: 230 }, (_, i) => {
  const angle = i * 0.12;
  const radius = 2.5 * Math.exp(0.107 * angle);
  return `${(160 + Math.cos(angle) * radius).toFixed(4)},${(160 + Math.sin(angle) * radius).toFixed(4)}`;
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
      <span className="agolmen-lotus absolute inset-[8%]" />
      <SpiralLines className="agolmen-loading-orbit absolute inset-0 size-full text-primary" />
      <SpiralLines className="agolmen-loading-orbit-reverse absolute inset-[9%] size-[82%] text-primary" />
      {particles.map(i => <span key={i} className="agolmen-particle" style={{ "--i": i } as React.CSSProperties} />)}
      {particles.slice(0, 8).map(i => <span key={`inner-${i}`} className="agolmen-particle agolmen-particle-inner" style={{ "--i": i } as React.CSSProperties} />)}
      <span className="agolmen-loading-aura absolute inset-[19%] rounded-full" />
      <span className="agolmen-loading-core absolute inset-[34%] rounded-full" />
      <img src={logo} alt="" width={512} height={512} className="agolmen-loading-logo absolute inset-[16%] size-[68%] object-contain" />
    </div>
    <p className="mt-3 px-4 font-serif text-sm text-primary">{label}</p>
    <span className="mt-2 h-px w-24 overflow-hidden bg-primary/20" aria-hidden="true"><span className="agolmen-loading-progress block h-full bg-primary" /></span>
  </div>;
}

export function AgolmenLogo({ className = "" }: { className?: string }) {
  return <span className={`agolmen-logo-aura relative inline-grid place-items-center ${className}`}><span className="agolmen-logo-lotus absolute inset-[-18%]" aria-hidden="true" /><img src={logo} alt="" width={512} height={512} className="agolmen-brand-logo relative size-full object-contain" /></span>;
}