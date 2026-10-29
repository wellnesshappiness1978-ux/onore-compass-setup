import type { ReactNode } from "react";

/**
 * One-line conclusion shared by all three monthly-lucky cards (action, item, flower).
 *
 * It is a paragraph, never a heading: `.design-canvas :is(h1..h6)` in styles.css forces
 * heading ink to the foreground colour, which would leave the action/item keywords a
 * different colour from the flower keyword.
 */
export function MonthlyLuckyKeyword({ name }: { name: string }) {
  return (
    <p className="break-words text-2xl font-extrabold leading-snug text-primary sm:text-3xl" data-monthly-lucky-keyword>
      {name}
    </p>
  );
}

/** Keyword on top, gold category label, optional media, then the reason prose. */
export default function MonthlyLuckyCard({
  label,
  name,
  description,
  children,
  footer,
}: {
  label?: string;
  name: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
      <MonthlyLuckyKeyword name={name} />
      {label ? <p className="font-serif text-xs text-primary">{label}</p> : null}
      {children}
      <p className="whitespace-pre-line break-words text-sm leading-7">{description}</p>
      {footer}
    </div>
  );
}
