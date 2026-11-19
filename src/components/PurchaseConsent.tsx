import { Link } from '@tanstack/react-router';
import { Checkbox } from '@/components/ui/checkbox';
import { billingCopy } from '@/lib/billing-copy';
import { legalContentByLanguage } from '@/lib/legal-content';
import { purchaseConsentCopy } from '@/lib/purchase-consent';
import type { Language } from '@/lib/translations';

export function PurchaseConsent({ id, language, checked, error, onChange }: {
  id: string;
  language: Language;
  checked: boolean;
  error: boolean;
  onChange: (checked: boolean) => void;
}) {
  const copy = purchaseConsentCopy[language];
  return <div className={`min-w-0 rounded-md border p-3 ${error ? 'border-destructive bg-destructive/10 ring-2 ring-destructive/30' : 'border-primary/30 bg-primary/5'}`}>
    <p className="mb-1 text-sm font-semibold text-primary">{copy.required}</p>
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-base leading-relaxed">
      <Checkbox id={id} checked={checked} onCheckedChange={value => onChange(value === true)} aria-required="true" aria-invalid={error} aria-describedby={error ? `${id}-error` : undefined} className="mt-0.5 size-6 shrink-0" />
      <span className="min-w-0 break-words">{billingCopy[language].terms}</span>
    </label>
    <div className="flex min-w-0 flex-wrap gap-x-4 text-sm leading-relaxed text-primary">
      {(['terms', 'commerce'] as const).map(document => <Link key={document} to="/legal/$document" params={{ document }} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-words underline underline-offset-4">{legalContentByLanguage[language][document].title}</Link>)}
    </div>
    {error && <p id={`${id}-error`} role="alert" className="mt-2 break-words text-sm font-medium leading-relaxed text-destructive">{copy.error}</p>}
  </div>;
}