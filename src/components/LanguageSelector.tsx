import { Check, ChevronDown, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages, type Language } from "@/lib/translations";

type Props = { language: Language; onChange: (language: Language) => void };

export default function LanguageSelector({ language, onChange }: Props) {
  const active = languages.find((item) => item.code === language) ?? languages[0];

  return (
    <div className="language-controls fixed right-4 z-50 flex items-center sm:right-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label={`Language / 言語: ${active.label}`} className="h-10 gap-2 rounded-lg border-primary/30 bg-card/70 px-3 text-foreground shadow-lg backdrop-blur-md hover:border-primary/60 hover:bg-card focus-visible:ring-primary">
            <Globe2 className="size-4 text-primary" aria-hidden="true" />
            <span className="text-xs">{active.flag} {active.short}</span>
            <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56 max-h-[min(26rem,calc(100dvh-5rem))] overflow-y-auto rounded-lg border border-primary/30 bg-popover p-1.5 text-popover-foreground shadow-2xl backdrop-blur-xl">
          {languages.map((item) => (
            <DropdownMenuItem
              key={item.code}
              onSelect={() => onChange(item.code)}
              aria-current={language === item.code ? "true" : undefined}
              className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm transition-colors focus:bg-primary/15 focus:text-foreground data-[highlighted]:bg-primary/15"
            >
              <span className="text-base" aria-hidden="true">{item.flag}</span>
              <span className="flex-1">{item.label}</span>
              {language === item.code && <Check className="size-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}