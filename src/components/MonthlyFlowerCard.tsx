import { flowerCopy, type FlowerPick } from "@/lib/seasonal-flowers";
import type { Language } from "@/lib/translations";
import type { MonthlyLucky } from '@/lib/monthly-lucky';

export default function MonthlyFlowerCard({ pick, language }: { pick: FlowerPick; language: Language }) {
  const c = flowerCopy[language];
  const value: MonthlyLucky = { target_name: pick.flower.name[language], description: `${c.reason(pick)}\n\n${c.action(pick)}` };
  const name = value.target_name;
  return (
    <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]" data-flower-id={pick.flower.id}>
      <p className="break-words text-2xl font-extrabold leading-snug text-primary sm:text-3xl">{name}</p>
      <p className="text-xs text-primary">{pick.group ? c.group : c.title} · {c.season}</p>
      <img src={pick.flower.image} alt={name} loading="lazy" width={1024} height={768} className="w-full rounded-md border border-primary/25 object-cover shadow-champagne" />
      <p className="text-sm text-muted-foreground">{c.meaning}：{pick.flower.meaning[language]}</p>
      <p className="whitespace-pre-line text-sm leading-7">{value.description}</p>
      <p className="text-[11px] text-muted-foreground">{c.rotation}</p>
    </div>
  );
}
