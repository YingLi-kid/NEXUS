import { Languages } from "lucide-react";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/utils/cn";

/**
 * The bilingual switch.
 *
 * Shows the language you would get by tapping it (`中文` while in English,
 * `EN` while in Chinese) so the control reads as an action, not a state.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle, t } = useI18n();
  const next = lang === "zh" ? "en" : "zh";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t(next === "en" ? "lang.toEnglish" : "lang.toChinese")}
      title={t(next === "en" ? "lang.toEnglish" : "lang.toChinese")}
      className={cn(
        "focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-elev px-3 text-sm font-semibold text-fg shadow-panel transition-colors hover:bg-elev-2",
        className,
      )}
    >
      <Languages className="size-4 text-cyan" aria-hidden="true" />
      <span className="tracking-tight">{lang === "zh" ? "EN" : "中文"}</span>
      <span className="sr-only">{next === "en" ? "English" : "中文"}</span>
    </button>
  );
}
