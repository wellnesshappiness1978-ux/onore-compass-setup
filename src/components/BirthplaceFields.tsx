import { useEffect, useId, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';
import { addressCountry, addressRegion, birthAddressCopy, countries, countryLabel, japaneseCities, japaneseRegions, storedBirthRegion, type AddressRegions } from '@/lib/birth-address';
import { localizePrefecture } from '@/lib/profile-ui-copy';
import { prefecturesRomanized, type Language } from '@/lib/translations';

/** Country selection is explicit: changing language never changes stored birth information. */
export default function BirthplaceFields({ language, birthPlace, birthCity, onChange, className = '' }: { language: Language; birthPlace: string; birthCity: string; onChange: (place: string, city: string) => void; className?: string }) {
  const id = useId();
  const country = addressCountry(birthPlace), region = addressRegion(birthPlace);
  const t = birthAddressCopy[language];
  const [regions, setRegions] = useState<AddressRegions>({});
  const [loading, setLoading] = useState(false), [failed, setFailed] = useState(false);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (country === 'JP') { setRegions({}); setLoading(false); setFailed(false); return; }
    let active = true;
    setRegions({}); setLoading(true); setFailed(false);
    fetch(`/birth-address/${country}.json`).then(r => { if (!r.ok) throw new Error('locations'); return r.json(); }).then((v: AddressRegions) => { if (active) setRegions(v); }).catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [country]);
  const options = country === 'JP' ? japaneseRegions.map(name => ({ value: name, label: localizePrefecture(language, japaneseRegions.indexOf(name), name, prefecturesRomanized[japaneseRegions.indexOf(name)] ?? name) })) : Object.entries(regions).map(([key, r]) => ({ value: r.name, label: r.name, key }));
  const cities = country === 'JP' ? japaneseCities(region) : Object.values(regions).find(r => r.name === region)?.cities ?? [];
  const known = options.some(o => o.value === region);
  const field = className || 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground';
  return <div className="grid min-w-0 gap-3 sm:col-span-2 sm:grid-cols-2">
    <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-primary" htmlFor={`${id}-country`}>{t.country}</label><select id={`${id}-country`} className={field} value={country} onChange={e => { setManual(false); onChange(storedBirthRegion(e.target.value, ''), ''); }}>{countries.map(c => <option key={c.code} value={c.code}>{countryLabel(c.code, language)}</option>)}</select></div>
    <div><label className="mb-1 block text-xs font-semibold text-primary" htmlFor={`${id}-region`}>{t.region}</label><select id={`${id}-region`} className={field} value={region} onChange={e => onChange(storedBirthRegion(country, e.target.value), '')} disabled={loading}><option value="">—</option>{!known && region && <option value={region}>{region}</option>}{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
    <div><label className="mb-1 block text-xs font-semibold text-primary" htmlFor={`${id}-city`}>{t.city}</label><Input id={`${id}-city`} list={`${id}-cities`} className={field} maxLength={80} value={birthCity} onChange={e => onChange(birthPlace, e.target.value)} /><datalist id={`${id}-cities`}>{cities.map(city => <option key={city} value={city} />)}</datalist></div>
    <Button type="button" variant="link" size="sm" className="justify-self-start" aria-expanded={manual} onClick={() => setManual(v => !v)}><Pencil className="size-3.5" />{t.manual}</Button>
    {loading && <p role="status" className="text-xs text-muted-foreground">{t.loading}</p>}{failed && <p role="status" className="text-xs text-muted-foreground">{t.unavailable}</p>}
    {manual && <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2"><Input aria-label={`${t.region} · ${t.manual}`} maxLength={70} className={field} value={region} onChange={e => onChange(storedBirthRegion(country, e.target.value), birthCity)} /><Input aria-label={`${t.city} · ${t.manual}`} maxLength={80} className={field} value={birthCity} onChange={e => onChange(birthPlace, e.target.value)} /></div>}
    <a href="/birth-address/NOTICE.txt" target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground underline sm:col-span-2">{country === 'JP' ? 'Geolonia' : 'GeoNames'} · CC BY 4.0</a>
  </div>;
}