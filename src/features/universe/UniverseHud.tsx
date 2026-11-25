import {
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { LanguageToggle } from "@/components/shell/language-toggle";
import { Brand, MobileNav, PrimaryNav } from "@/components/shell/chrome";
import { CoreCard, SiteDetail } from "@/components/site/site-detail";
import { cycleQuality, useFullscreen, useQualityTier } from "@/hooks/use-nexus-ready";
import { categoryName, siteName } from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { useNexus } from "@/stores/nexus-store";
import { CORE_ID } from "@/types/nexus";
import { cn } from "@/utils/cn";
import { cssColor } from "@/utils/space";
import { textMatches } from "@/utils/search";

export function UniverseHud() {
  const query = useNexus((state) => state.query);
  const setQuery = useNexus((state) => state.setQuery);
  const websites = useNexus((state) => state.websites);
  const categories = useNexus((state) => state.categories);
  const hidden = useNexus((state) => state.hiddenCategoryIds);
  const selectedId = useNexus((state) => state.selectedId);
  const activeCategoryId = useNexus((state) => state.activeCategoryId);
  const profile = useNexus((state) => state.profile);
  const quality = useNexus((state) => state.quality);
  const setQuality = useNexus((state) => state.setQuality);
  const focusOn = useNexus((state) => state.focusOn);
  const focusCategory = useNexus((state) => state.focusCategory);
  const toggleCategory = useNexus((state) => state.toggleCategoryVisibility);
  const resetView = useNexus((state) => state.resetView);
  const select = useNexus((state) => state.select);
  const railMode = useNexus((state) => state.railMode);
  const detailMode = useNexus((state) => state.detailMode);
  const setRailMode = useNexus((state) => state.setRailMode);
  const setDetailMode = useNexus((state) => state.setDetailMode);
  const { t, lang } = useI18n();
  const tier = useQualityTier();
  const fullscreen = useFullscreen();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const selected = websites.find((site) => site.id === selectedId) ?? null;

  const results = useMemo(() => {
    const needle = query.trim();
    if (!needle) return [];
    const sites = websites
      .filter((site) => {
        if (hidden.includes(site.categoryId)) return false;
        const category = categories.find((item) => item.id === site.categoryId);
        return textMatches(
          [site.name, site.nameZh ?? "", site.description, site.descriptionZh ?? "", site.tags.join(" "), site.url, category?.name, category?.nameZh ?? ""],
          needle,
        );
      })
      .slice(0, 7)
      .map((site) => {
        const category = categories.find((item) => item.id === site.categoryId);
        return {
          id: site.id,
          name: siteName(lang, site),
          meta: category ? categoryName(lang, category) : t("universe.site"),
        };
      });
    const core = textMatches([profile.name, profile.role, profile.roleZh ?? "", profile.bio, profile.bioZh ?? "", profile.focus.join(" ")], needle)
      ? [{ id: CORE_ID, name: profile.name, meta: t("universe.core") }]
      : [];
    return [...core, ...sites].slice(0, 8);
  }, [query, websites, categories, hidden, profile, t, lang]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) {
        if (event.key === "Escape") target.blur();
        return;
      }
      if (event.key === "Escape") select(null);
      if (event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
      }
      if (event.key === "0") resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetView, select]);

  const tierLabel = t(tier === "high" ? "universe.high" : "universe.low");
  const qualityLabel = quality === "auto" ? t("universe.auto", { tier: tierLabel }) : t(quality === "high" ? "universe.high" : "universe.low");

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-center gap-2 px-3 py-3 sm:px-4">
        <Brand />
        <div className="ml-2 hidden lg:block">
          <PrimaryNav />
        </div>
        <div className="relative ml-auto hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm">
          <SearchField
            inputRef={searchRef}
            query={query}
            setQuery={setQuery}
            results={results}
            onPick={(id) => focusOn(id)}
          />
        </div>
        <button
          type="button"
          className="focus-ring pointer-events-auto grid size-11 place-items-center rounded-full text-fg md:hidden"
          aria-label={t(searchOpen ? "universe.closeSearch" : "universe.searchSites")}
          onClick={() => setSearchOpen((value) => !value)}
        >
          {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
        </button>
        <div className="pointer-events-auto">
          <LanguageToggle />
        </div>
        <div className="pointer-events-auto">
          <MobileNav />
        </div>
      </header>

      {searchOpen ? (
        <div className="pointer-events-auto absolute inset-x-3 top-16 z-30 md:hidden">
          <SearchField
            inputRef={searchRef}
            query={query}
            setQuery={setQuery}
            results={results}
            onPick={(id) => {
              focusOn(id);
              setSearchOpen(false);
            }}
          />
        </div>
      ) : null}

      <div className="pointer-events-auto absolute inset-x-0 top-16 z-10 flex gap-2 overflow-x-auto px-3 pb-2 lg:hidden">
        <Chip active={activeCategoryId === null && selectedId === CORE_ID} onClick={() => focusOn(CORE_ID)}>
          {t("universe.core")}
        </Chip>
        {categories.map((category) => {
          const concealed = hidden.includes(category.id);
          return (
            <Chip key={category.id} active={activeCategoryId === category.id} onClick={() => focusCategory(category.id)}>
              <span className="size-2 rounded-full" style={{ background: cssColor(category.color) }} />
              <span className={cn(concealed && "opacity-50")}>{categoryName(lang, category)}</span>
            </Chip>
          );
        })}
      </div>

      {railMode === "hidden" ? (
        <button
          type="button"
          className="focus-ring glass pointer-events-auto absolute top-1/2 left-1.5 z-30 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-fg lg:grid"
          aria-label={t("panel.show")}
          title={t("panel.show")}
          onClick={() => setRailMode("expanded")}
        >
          <PanelLeftOpen className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <aside
          className={cn(
            "pointer-events-auto absolute top-24 bottom-20 left-4 hidden flex-col lg:flex",
            railMode === "compact" ? "w-52" : "w-rail",
          )}
        >
          <div className="glass scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-3xl p-3">
            <div className="flex items-center gap-0.5 pl-2">
              <p className="flex-1 pb-1 text-xs text-muted">{t("universe.galaxies")}</p>
              <button
                type="button"
                className="focus-ring grid size-8 place-items-center rounded-xl text-muted hover:bg-elev-2 hover:text-fg"
                aria-label={t(railMode === "compact" ? "panel.widen" : "panel.shrink")}
                title={t(railMode === "compact" ? "panel.widen" : "panel.shrink")}
                onClick={() => setRailMode(railMode === "compact" ? "expanded" : "compact")}
              >
                {railMode === "compact" ? (
                  <ChevronsRight className="size-4" aria-hidden="true" />
                ) : (
                  <ChevronsLeft className="size-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="focus-ring grid size-8 place-items-center rounded-xl text-muted hover:bg-elev-2 hover:text-fg"
                aria-label={t("panel.hide")}
                title={t("panel.hide")}
                onClick={() => setRailMode("hidden")}
              >
                <PanelLeftClose className="size-4" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              className="focus-ring flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm hover:bg-elev-2"
              onClick={() => focusOn(CORE_ID)}
            >
              <span className="size-2.5 rounded-full bg-cyan" />
              {t("universe.core")}
            </button>
            {categories.map((category) => {
              const count = websites.filter((site) => site.categoryId === category.id).length;
              const concealed = hidden.includes(category.id);
              const active = activeCategoryId === category.id;
              return (
                <div key={category.id} className={cn("flex items-center gap-1 rounded-2xl", active && "bg-elev-2")}>
                  <button
                    type="button"
                    className="focus-ring flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 text-left"
                    onClick={() => focusCategory(category.id)}
                  >
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: cssColor(category.color) }} />
                    <span className={cn("min-w-0", concealed && "opacity-50")}>
                      <span className="block truncate text-sm">{categoryName(lang, category)}</span>
                      <span className="block text-xs text-muted">
                        {count === 1 ? t("universe.sitesOne") : t("universe.sites", { count })}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="focus-ring grid size-11 place-items-center text-muted hover:text-fg"
                    aria-label={t(concealed ? "universe.show" : "universe.hide", { name: categoryName(lang, category) })}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {concealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {detailMode === "hidden" ? (
        <button
          type="button"
          className="focus-ring glass pointer-events-auto absolute top-1/2 right-1.5 z-30 hidden size-11 -translate-y-1/2 place-items-center rounded-full text-fg lg:grid"
          aria-label={t("panel.show")}
          title={t("panel.show")}
          onClick={() => setDetailMode("expanded")}
        >
          <PanelRightOpen className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <aside
          className={cn(
            "detail-reveal pointer-events-auto absolute top-24 right-4 bottom-20 hidden lg:block",
            detailMode === "compact" ? "w-60" : "w-detail",
          )}
        >
          <div className="glass flex h-full flex-col rounded-3xl p-4">
            <div className="mb-2 flex items-center gap-0.5">
              <p className="flex-1 text-xs text-muted">{t("panel.detail")}</p>
              <button
                type="button"
                className="focus-ring grid size-8 place-items-center rounded-xl text-muted hover:bg-elev-2 hover:text-fg"
                aria-label={t(detailMode === "compact" ? "panel.widen" : "panel.shrink")}
                title={t(detailMode === "compact" ? "panel.widen" : "panel.shrink")}
                onClick={() => setDetailMode(detailMode === "compact" ? "expanded" : "compact")}
              >
                {detailMode === "compact" ? (
                  <ChevronsLeft className="size-4" aria-hidden="true" />
                ) : (
                  <ChevronsRight className="size-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="focus-ring grid size-8 place-items-center rounded-xl text-muted hover:bg-elev-2 hover:text-fg"
                aria-label={t("panel.hide")}
                title={t("panel.hide")}
                onClick={() => setDetailMode("hidden")}
              >
                <PanelRightClose className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="scroll-thin -mx-1 min-h-0 flex-1 overflow-y-auto px-1">
              {selected ? <SiteDetail site={selected} showUniverseLink={false} /> : <CoreCard />}
            </div>
          </div>
        </aside>
      )}

      {selected ? (
        <div className="pointer-events-auto absolute inset-x-3 bottom-16 z-30 max-h-sheet overflow-y-auto lg:hidden">
          <div className="glass scroll-thin rounded-3xl p-4">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                className="focus-ring grid size-11 place-items-center"
                aria-label={t("universe.closeDetails")}
                onClick={() => select(null)}
              >
                <X className="size-4" />
              </button>
            </div>
            <SiteDetail site={selected} compact showUniverseLink={false} />
          </div>
        </div>
      ) : null}

      <footer className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 py-3 sm:px-4">
        <p className="hidden min-w-0 flex-1 truncate text-xs text-muted md:block">
          {t("universe.hint")}
          {selected ? ` · ${siteName(lang, selected)}` : ` · ${profile.name}`}
        </p>
        <p className="min-w-0 flex-1 truncate text-xs text-muted md:hidden">
          {selected ? siteName(lang, selected) : t("universe.hintMobile")}
        </p>
        <button type="button" className="focus-ring inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-fg" onClick={resetView}>
          <RotateCcw className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("universe.reset")}</span>
        </button>
        <button
          type="button"
          className="focus-ring inline-flex h-11 items-center rounded-full px-3 text-sm text-fg"
          onClick={() => setQuality(cycleQuality(quality))}
        >
          {qualityLabel}
        </button>
        <button
          type="button"
          className="focus-ring grid size-11 place-items-center rounded-full text-fg"
          aria-label={t(fullscreen.active ? "universe.fullscreenExit" : "universe.fullscreenEnter")}
          onClick={fullscreen.toggle}
        >
          {fullscreen.active ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </footer>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm",
        active ? "bg-elev-2 text-cyan" : "glass text-fg",
      )}
    >
      {children}
    </button>
  );
}

function SearchField({
  query,
  setQuery,
  results,
  onPick,
  inputRef,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: Array<{ id: string; name: string; meta: string }>;
  onPick: (id: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t("universe.search")}
        aria-label={t("universe.search")}
        className="field h-11 pr-10 pl-10"
      />
      {query ? (
        <button
          type="button"
          className="focus-ring absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center text-muted"
          aria-label={t("universe.closeSearch")}
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
      {open && query.trim() && results.length > 0 ? (
        <ul className="glass absolute inset-x-0 top-12 z-40 max-h-80 overflow-y-auto rounded-2xl p-1">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="focus-ring flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm hover:bg-elev-2"
                onClick={() => {
                  onPick(result.id);
                  setOpen(false);
                }}
              >
                <span className="truncate">{result.name}</span>
                <span className="shrink-0 text-xs text-muted">{result.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && results.length === 0 ? (
        <p className="glass absolute inset-x-0 top-12 rounded-2xl px-3 py-3 text-sm text-muted">{t("universe.noNodes")}</p>
      ) : null}
    </div>
  );
}
