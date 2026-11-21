import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/shell/chrome";
import {
  blankCategory,
  blankConnection,
  blankWebsite,
  CategoryEditor,
  ConnectionEditor,
  DataTools,
  IdentityEditor,
  WebsiteEditor,
} from "@/features/control/editors";
import { relationKey } from "@/lib/i18n";
import { categoryName, siteName } from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { useNexus } from "@/stores/nexus-store";
import { cn } from "@/utils/cn";

const TABS = [
  ["Sites", "control.tab.sites"],
  ["Galaxies", "control.tab.galaxies"],
  ["Links", "control.tab.links"],
  ["Identity", "control.tab.identity"],
  ["Data", "control.tab.data"],
] as const;

type Tab = (typeof TABS)[number][0];

export function ControlPage() {
  const websites = useNexus((state) => state.websites);
  const categories = useNexus((state) => state.categories);
  const connections = useNexus((state) => state.connections);
  const upsertWebsite = useNexus((state) => state.upsertWebsite);
  const upsertCategory = useNexus((state) => state.upsertCategory);
  const upsertConnection = useNexus((state) => state.upsertConnection);
  const { t, tp, lang } = useI18n();
  const [tab, setTab] = useState<Tab>("Sites");
  const [websiteId, setWebsiteId] = useState(websites[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [connectionId, setConnectionId] = useState(connections[0]?.id ?? "");
  const [linkError, setLinkError] = useState<string | null>(null);

  return (
    <div className="page-sky min-h-dvh">
      <PageHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("control.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t("control.subtitle")}</p>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {TABS.map(([id, key]) => (
            <button
              key={id}
              type="button"
              className={cn("focus-ring h-11 shrink-0 rounded-full px-4 text-sm", tab === id ? "bg-cyan text-bg" : "glass text-fg")}
              onClick={() => setTab(id)}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {tab === "Sites" ? (
          <EditorLayout
            items={websites.map((site) => ({
              id: site.id,
              title: siteName(lang, site),
              meta: (() => {
                const category = categories.find((item) => item.id === site.categoryId);
                return category ? categoryName(lang, category) : "";
              })(),
            }))}
            selectedId={websiteId}
            onSelect={setWebsiteId}
            onAdd={() => {
              const categoryIdValue = categories[0]?.id;
              if (!categoryIdValue) return;
              const site = blankWebsite(
                categoryIdValue,
                websites.filter((item) => item.categoryId === categoryIdValue).length,
              );
              upsertWebsite(site);
              setWebsiteId(site.id);
            }}
            addLabel={t("control.add.site")}
          >
            {websiteId ? <WebsiteEditor siteId={websiteId} /> : <p className="text-sm text-muted">{t("control.addSiteFirst")}</p>}
          </EditorLayout>
        ) : null}

        {tab === "Galaxies" ? (
          <EditorLayout
            items={categories.map((category) => ({
              id: category.id,
              title: categoryName(lang, category),
              meta: (() => {
                const count = websites.filter((site) => site.categoryId === category.id).length;
                return count === 1 ? t("control.sitesUnitOne") : t("control.sitesUnit", { count });
              })(),
            }))}
            selectedId={categoryId}
            onSelect={setCategoryId}
            onAdd={() => {
              const category = blankCategory(categories.length);
              upsertCategory(category);
              setCategoryId(category.id);
            }}
            addLabel={t("control.add.galaxy")}
          >
            {categoryId ? <CategoryEditor categoryId={categoryId} /> : null}
          </EditorLayout>
        ) : null}

        {tab === "Links" ? (
          <EditorLayout
            items={connections.map((link) => ({
              id: link.id,
              title: `${(() => { const site = websites.find((item) => item.id === link.sourceId); return site ? siteName(lang, site) : t("control.missing"); })()} → ${(() => { const site = websites.find((item) => item.id === link.targetId); return site ? siteName(lang, site) : t("control.missing"); })()}`,
              meta: t(relationKey(link.type)),
            }))}
            selectedId={connectionId}
            onSelect={setConnectionId}
            onAdd={() => {
              const first = websites[0];
              const second = websites.find((site) => site.id !== first?.id);
              if (!first || !second) {
                setLinkError(t("control.linkNeedsTwo"));
                return;
              }
              const link = blankConnection(first.id, second.id);
              const result = upsertConnection(link);
              if (!result.ok) {
                setLinkError(tp(result.reason));
                return;
              }
              setLinkError(null);
              setConnectionId(link.id);
            }}
            addLabel={t("control.add.link")}
          >
            {linkError ? <p className="mb-3 text-sm text-mint">{linkError}</p> : null}
            {connectionId ? <ConnectionEditor connectionId={connectionId} /> : <p className="text-sm text-muted">{t("control.noLinks")}</p>}
          </EditorLayout>
        ) : null}

        {tab === "Identity" ? (
          <section className="glass mt-6 rounded-3xl p-4 sm:p-6">
            <IdentityEditor />
          </section>
        ) : null}

        {tab === "Data" ? (
          <section className="glass mt-6 rounded-3xl p-4 sm:p-6">
            <DataTools />
          </section>
        ) : null}
      </main>
    </div>
  );
}

function EditorLayout({
  items,
  selectedId,
  onSelect,
  onAdd,
  addLabel,
  children,
}: {
  items: Array<{ id: string; title: string; meta: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="glass rounded-3xl p-3">
        <button
          type="button"
          className="focus-ring mb-2 flex h-11 w-full items-center justify-center rounded-full bg-cyan text-sm font-semibold text-bg"
          onClick={onAdd}
        >
          {addLabel}
        </button>
        <ul className="grid max-h-[28rem] gap-1 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "focus-ring flex min-h-11 w-full flex-col items-start justify-center rounded-2xl px-3 py-2 text-left",
                  selectedId === item.id ? "bg-elev-2" : "hover:bg-elev-2",
                )}
                onClick={() => onSelect(item.id)}
              >
                <span className="text-sm">{item.title}</span>
                <span className="text-xs text-muted">{item.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <section className="glass rounded-3xl p-4 sm:p-6">{children}</section>
    </div>
  );
}
