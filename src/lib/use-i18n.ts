import { useCallback } from "react";
import { translate, translatePhrase } from "@/lib/i18n";
import { useNexus } from "@/stores/nexus-store";

/**
 * Language access for components.
 *
 * The preference lives in the persisted store rather than a separate context so
 * it survives reloads the same way `quality` does, and every subtree re-reads it
 * from the same selector — one toggle updates the whole app.
 */
export function useI18n() {
  const lang = useNexus((state) => state.lang);
  const setLang = useNexus((state) => state.setLang);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const tp = useCallback((text: string) => translatePhrase(lang, text), [lang]);

  const toggle = useCallback(() => {
    setLang(lang === "zh" ? "en" : "zh");
  }, [lang, setLang]);

  return { lang, setLang, toggle, t, tp };
}
