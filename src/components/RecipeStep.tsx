import { highlightStep } from "@/lib/recipe-presentation";

const BOILERPLATE = /分量は2人前です。?\s*材料を量り、手と調理器具を清潔にします。?/g;
/** Drops the repeated serving/hygiene preface from cooking steps. */
export const cleanRecipeSteps = (steps: string[]) => steps.map(s => s.replace(BOILERPLATE, "").trim()).filter(Boolean);

/** One cooking step with heat, time and timing points emphasised in the accent color. */
export default function RecipeStep({ text }: { text: string }) {
  return <>{highlightStep(text).map((seg, i) => seg.key
    ? <strong key={i} className="rounded-sm bg-primary/15 px-0.5 font-semibold text-primary">{seg.text}</strong>
    : <span key={i}>{seg.text}</span>)}</>;
}
