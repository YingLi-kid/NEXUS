import { PageHeader } from "@/components/shell/chrome";
import { OpenWebsiteLink } from "@/components/site/site-detail";
import {
  categoryDescription,
  categoryName,
  pickText,
  profileBio,
  profileFocus,
  profileRole,
  siteDescription,
  siteName,
  siteTags,
  socialLabel,
} from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { useNexus } from "@/stores/nexus-store";
import { cssColor } from "@/utils/space";
import { safeHttpUrl, validEmail } from "@/utils/url";

export function AboutPage() {
  const profile = useNexus((state) => state.profile);
  const websites = useNexus((state) => state.websites);
  const categories = useNexus((state) => state.categories);
  const { t, lang } = useI18n();
  const featured = websites.filter((site) => site.featured);
  const emailOk = profile.email.trim() !== "" && validEmail(profile.email);

  return (
    <div className="page-sky min-h-dvh">
      <PageHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 pb-16">
        <p className="text-sm text-cyan">{t("about.eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="mt-2 text-lg text-muted">{profileRole(lang, profile)}</p>
        <p className="mt-6 text-base leading-relaxed">{profileBio(lang, profile)}</p>
        {profileFocus(lang, profile).length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {profileFocus(lang, profile).map((item) => (
              <li key={item} className="rounded-full bg-elev-2 px-3 py-2 text-sm text-fg">
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">{t("about.featured")}</h2>
          <ul className="mt-4 grid gap-3">
            {featured.map((site) => {
              const category = categories.find((item) => item.id === site.categoryId);
              return (
                <li key={site.id} className="glass rounded-3xl p-4">
                  <p className="text-xs" style={{ color: cssColor(category?.color ?? "#00d9ff") }}>
                    {category ? categoryName(lang, category) : null}
                  </p>
                  <h3 className="mt-1 font-display text-xl">{siteName(lang, site)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{siteDescription(lang, site)}</p>
                  <div className="mt-4">
                    <OpenWebsiteLink url={site.url} siteId={site.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">{t("about.galaxies")}</h2>
          <div className="mt-4 grid gap-6">
            {categories.map((category) => (
              <section key={category.id}>
                <h3 className="text-sm" style={{ color: cssColor(category.color) }}>
                  {categoryName(lang, category)}
                </h3>
                <p className="mt-1 text-sm text-muted">{categoryDescription(lang, category)}</p>
                <ul className="mt-3 grid gap-2">
                  {websites
                    .filter((site) => site.categoryId === category.id)
                    .map((site) => {
                      const safe = safeHttpUrl(site.url);
                      return (
                        <li key={site.id} className="flex flex-wrap items-center justify-between gap-2">
                          {safe ? (
                            <a href={safe} target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-fg hover:text-cyan">
                              {siteName(lang, site)}
                            </a>
                          ) : (
                            <span className="text-sm text-muted">{siteName(lang, site)}</span>
                          )}
                          <span className="text-xs text-muted">{siteTags(lang, site).join(" · ")}</span>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">{t("about.contact")}</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-muted">{t("about.location")}</dt>
              <dd>{pickText(lang, profile.location.trim(), profile.locationZh) || t("about.notSet")}</dd>
            </div>
            {emailOk ? (
              <div>
                <dt className="text-muted">{t("about.email")}</dt>
                <dd>
                  <a className="focus-ring text-cyan" href={`mailto:${profile.email.trim()}`}>
                    {profile.email.trim()}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {profile.socials.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.socials.map((social) => {
                const safe = safeHttpUrl(social.url);
                if (!safe) return null;
                return (
                  <li key={social.id}>
                    <a
                      href={safe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring inline-flex h-11 items-center rounded-full bg-elev-2 px-4 text-sm"
                    >
                      {socialLabel(lang, social)}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
