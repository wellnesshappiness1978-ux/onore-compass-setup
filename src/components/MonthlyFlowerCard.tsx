import { flowerCopy, type FlowerPick } from "@/lib/seasonal-flowers";
import type { Language } from "@/lib/translations";

export default function MonthlyFlowerCard({ pick, language }: { pick: FlowerPick; language: Language }) {
  const c = flowerCopy[language];
  const name = pick.flower.name[language];
  return (
    <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]" data-flower-id={pick.flower.id}>
      <img src={pick.flower.image} alt={name} loading="lazy" width={1024} height={768} className="w-full rounded-md border border-primary/25 object-cover shadow-champagne" />
      <p className="text-xs text-primary">{pick.group ? c.group : c.title} · {c.season}</p>
      <p className="font-serif text-lg text-primary">{name}<span className="ml-2 text-sm text-muted-foreground">（{c.meaning}：{pick.flower.meaning[language]}）</span></p>
      <p className="text-sm leading-7">{c.reason(pick)}</p>
      <p className="text-sm leading-7">{c.action(pick)}</p>
      <p className="text-[11px] text-muted-foreground">{c.rotation}</p>
    </div>
  );
}
