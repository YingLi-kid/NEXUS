import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Star } from "lucide-react";
import { useState } from "react";
import { SiteIcon } from "@/components/site/icons";
import { relationKey } from "@/lib/i18n";
import { categoryName, profileBio, profileRole, siteDescription, siteName } from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { useNexus } from "@/stores/nexus-store";
import type { Website } from "@/types/nexus";
import { cn } from "@/utils/cn";
import { cssColor } from "@/utils/space";
import { isExampleUrl, safeHttpUrl } from "@/utils/url";

export function OpenWebsiteLink({
  url,
  siteId,
  label,
}: {
  url: string;
  siteId: string;
  label?: string;
}) {
  const markVisited = useNexus((state) => state.markVisited);
  const { t } = useI18n();
  const safe = safeHttpUrl(url);
  if (!safe) {
    return <p className="text-sm text-muted">{t("site.blocked")}</p>;
  }
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => markVisited(siteId)}
      className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-cyan px-4 text-sm font-semibold text-bg"
    >
      {label ?? t("site.open")}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}

export function FavoriteButton({ id }: { id: string }) {
  const active = useNexus((state) => state.favorites.includes(id));
  const toggle = useNexus((state) => state.toggleFavorite);
  const { t } = useI18n();
  return (
    <button
      type="button"
      className={cn(
        "focus-ring grid size-11 place-items-center rounded-full",
        active ? "text-mint" : "text-muted hover:text-fg",
      )}
      aria-pressed={active}
      aria-label={t(active ? "site.favoriteRemove" : "site.favoriteSave")}
      onClick={() => toggle(id)}
    >
      <Star className="size-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function ExampleBadge({ url }: { url: string }) {
  const { t } = useI18n();
  if (!isExampleUrl(url)) return null;
  return (
    <span className="rounded-full px-2 py-1 text-xs text-cyan shadow-panel">{t("site.example")}</span>
  );
}

export function CoreCard() {
  const profile = useNexus((state) => state.profile);
  const { t, lang } = useI18n();
  return (
    <div className="grid gap-3">
      <p className="text-xs text-cyan">{t("site.core")}</p>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{profile.name}</h2>
        <p className="mt-1 text-sm text-muted">{profileRole(lang, profile)}</p>
      </div>
      <p className="text-sm leading-relaxed text-fg/90">{profileBio(lang, profile)}</p>
      <Link to="/about" className="focus-ring inline-flex h-11 items-center text-sm text-cyan">
        {t("site.aboutIdentity")}
      </Link>
    </div>
  );
}

export function SiteDetail({
  site,
  compact = false,
  showUniverseLink = true,
}: {
  site: Website;
  compact?: boolean;
  showUniverseLink?: boolean;
}) {
  const category = useNexus((state) => state.categories.find((item) => item.id === site.categoryId));
  const connections = useNexus((state) => state.connections);
  const websites = useNexus((state) => state.websites);
  const focusOn = useNexus((state) => state.focusOn);
  const { t, lang } = useI18n();
  const color = cssColor(category?.color ?? "#00d9ff");
  const [coverBroken, setCoverBroken] = useState(false);
  const cover = safeHttpUrl(site.cover);
  const related = connections
    .filter((link) => link.sourceId === site.id || link.targetId === site.id)
    .map((link) => {
      const otherId = link.sourceId === site.id ? link.targetId : link.sourceId;
      const other = websites.find((item) => item.id === otherId);
      return other ? { link, other } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-2xl text-bg"
          style={{ background: color }}
        >
          <SiteIcon name={site.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight">{siteName(lang, site)}</h2>
            <ExampleBadge url={site.url} />
          </div>
          <p className="mt-1 text-sm text-muted">{category ? categoryName(lang, category) : t("site.unassigned")}</p>
        </div>
        <FavoriteButton id={site.id} />
      </div>
      {cover && !coverBroken ? (
        <img
          src={cover}
          alt=""
          crossOrigin="anonymous"
          className="h-28 w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          onError={() => setCoverBroken(true)}
        />
      ) : null}
      <p className="text-sm leading-relaxed">{siteDescription(lang, site)}</p>
      {site.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {site.tags.map((tag, index) => (
            <li key={tag} className="rounded-full bg-elev-2 px-2.5 py-1 text-xs text-muted">
              {lang === "zh" && site.tagsZh?.[index]?.trim() ? site.tagsZh[index] : tag}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="truncate text-sm text-muted">{site.url}</p>
      {!site.visible ? <p className="text-xs text-muted">{t("site.hidden")}</p> : null}
      {related.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-xs text-muted">{t("site.connections")}</p>
          <ul className="grid gap-1">
            {related.map(({ link, other }) => (
              <li key={link.id}>
                <button
                  type="button"
                  className="focus-ring flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-2 text-left text-sm hover:bg-elev-2"
                  onClick={() => focusOn(other.id)}
                >
                  <span>{siteName(lang, other)}</span>
                  <span className="text-xs text-muted">{t(relationKey(link.type))}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className={cn("flex flex-wrap gap-2", compact && "pb-1")}>
        <OpenWebsiteLink url={site.url} siteId={site.id} />
        {showUniverseLink ? (
          <Link
            to="/"
            className="focus-ring inline-flex h-11 items-center rounded-full px-3 text-sm text-cyan"
            onClick={() => focusOn(site.id)}
          >
            {t("site.showInUniverse")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
