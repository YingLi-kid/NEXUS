import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/chrome";
import { SiteIcon } from "@/components/site/icons";
import { ExampleBadge, FavoriteButton, SiteDetail } from "@/components/site/site-detail";
import { categoryName, siteDescription, siteName } from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { useNexus } from "@/stores/nexus-store";
import { cn } from "@/utils/cn";
import { cssColor } from "@/utils/space";
import { textMatches } from "@/utils/search";

type Tab = "all" | "favorites" | "recent";

export function ExplorerPage() {
  const websites = useNexus((state) => state.websites);
  const categories = useNexus((state) => state.categories);
  const favorites = useNexus((state) => state.favorites);
  const recents = useNexus((state) => state.recents);
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [tag, setTag] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(websites[0]?.id ?? null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const site of websites) for (const item of site.tags) set.add(item);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [websites]);

  /** Base tag → Chinese label, taken from whichever site supplies one. */
  const tagLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const site of websites) {
      site.tags.forEach((tag, index) => {
        const zh = site.tagsZh?.[index]?.trim();
        if (zh && !map.has(tag)) map.set(tag, zh);
      });
    }
    return map;
  }, [websites]);

  const tagText = (tag: string) => (lang === "zh" ? tagLabels.get(tag) ?? tag : tag);

  const visible = useMemo(() => {
    let list = websites.filter((site) => {
      const category = categories.find((item) => item.id === site.categoryId);
      const matchesQuery = textMatches(
        [
          site.name,
          site.nameZh ?? "",
          site.description,
          site.descriptionZh ?? "",
          site.tags.join(" "),
          site.url,
          category?.name,
          category?.nameZh ?? "",
        ],
        query,
      );
      const matchesCategory = categoryId === "all" || site.categoryId === categoryId;
      const matchesTag = tag === "all" || site.tags.includes(tag);
      const matchesTab = tab === "all" || (tab === "favorites" && favorites.includes(site.id));
      return matchesQuery && matchesCategory && matchesTag && matchesTab;
    });
    if (tab === "recent") {
      const order = new Map(recents.map((visit, index) => [visit.id, index]));
      list = list.filter((site) => order.has(site.id)).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    } else {
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || siteName(lang, a).localeCompare(siteName(lang, b)));
    }
    return list;
  }, [websites, categories, query, categoryId, tag, tab, favorites, recents, lang]);

  const selected = visible.find((site) => site.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="page-sky min-h-dvh">
      <PageHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{t("explorer.title")}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("explorer.subtitle")}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ["all", "explorer.tab.all"],
                ["favorites", "explorer.tab.favorites"],
                ["recent", "explorer.tab.recent"],
              ] as const
            ).map(([id, key]) => (
              <button
                key={id}
                type="button"
                className={cn(
                  "focus-ring h-11 rounded-full px-4 text-sm",
                  tab === id ? "bg-cyan text-bg" : "glass text-fg",
                )}
                onClick={() => setTab(id)}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              className="field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("explorer.searchPlaceholder")}
              aria-label={t("explorer.searchPlaceholder")}
            />
            <select
              className="field"
              value={categoryId}
              aria-label={t("explorer.filterGalaxy")}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="all">{t("explorer.allGalaxies")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryName(lang, category)}
                </option>
              ))}
            </select>
            <select className="field" value={tag} aria-label={t("explorer.filterTag")} onChange={(event) => setTag(event.target.value)}>
              <option value="all">{t("explorer.allTags")}</option>
              {tags.map((item) => (
                <option key={item} value={item}>
                  {tagText(item)}
                </option>
              ))}
            </select>
          </div>
          {visible.length === 0 ? (
            <p className="glass mt-6 rounded-3xl p-6 text-sm text-muted">{t("explorer.empty")}</p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {visible.map((site) => {
                const category = categories.find((item) => item.id === site.categoryId);
                const active = selected?.id === site.id;
                return (
                  <li key={site.id}>
                    <article className={cn("glass rounded-3xl p-3", active && "shadow-panel")}>
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="focus-ring flex min-w-0 flex-1 items-start gap-3 rounded-2xl text-left"
                          onClick={() => setSelectedId(site.id)}
                        >
                          <span
                            className="grid size-11 shrink-0 place-items-center rounded-2xl text-bg"
                            style={{ background: cssColor(category?.color ?? "#00d9ff") }}
                          >
                            <SiteIcon name={site.icon} className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-lg font-semibold">{siteName(lang, site)}</span>
                              <ExampleBadge url={site.url} />
                            </span>
                            <span className="mt-1 block text-sm text-muted">{category ? categoryName(lang, category) : null}</span>
                            <span className="mt-2 block text-sm leading-relaxed">{siteDescription(lang, site)}</span>
                          </span>
                        </button>
                        <FavoriteButton id={site.id} />
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-3xl p-4">
            {selected ? <SiteDetail site={selected} /> : <p className="text-sm text-muted">{t("explorer.selectHint")}</p>}
          </div>
        </aside>
      </main>
    </div>
  );
}
