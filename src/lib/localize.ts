import type { Lang } from "@/lib/i18n";
import type { Category, Profile, SocialLink, Website } from "@/types/nexus";

/**
 * Content-level localisation.
 *
 * The seed ships English copy plus optional `…Zh` twins. Chrome strings live in
 * `i18n.ts`; this module only decides which *data* string to show, so a
 * universe without translations simply falls back to the base language.
 */
export function pickText(lang: Lang, base: string, zh?: string): string {
  const localized = zh?.trim();
  return lang === "zh" && localized ? localized : base;
}

export function siteName(lang: Lang, site: Website): string {
  return pickText(lang, site.name, site.nameZh);
}

export function siteDescription(lang: Lang, site: Website): string {
  return pickText(lang, site.description, site.descriptionZh);
}

export function categoryName(lang: Lang, category: Category): string {
  return pickText(lang, category.name, category.nameZh);
}

export function categoryDescription(lang: Lang, category: Category): string {
  return pickText(lang, category.description, category.descriptionZh);
}

export function socialLabel(lang: Lang, social: SocialLink): string {
  return pickText(lang, social.label, social.labelZh);
}

/** Tags pair up by index; a shorter translated list falls back per item. */
export function siteTags(lang: Lang, site: Website): string[] {
  if (lang !== "zh" || !site.tagsZh?.length) return site.tags;
  return site.tags.map((tag, index) => site.tagsZh?.[index]?.trim() || tag);
}

export function profileRole(lang: Lang, profile: Profile): string {
  return pickText(lang, profile.role, profile.roleZh);
}

export function profileBio(lang: Lang, profile: Profile): string {
  return pickText(lang, profile.bio, profile.bioZh);
}

/** Focus chips keep their order; a shorter translated list falls back per item. */
export function profileFocus(lang: Lang, profile: Profile): string[] {
  if (lang !== "zh" || !profile.focusZh?.length) return profile.focus;
  return profile.focus.map((item, index) => profile.focusZh?.[index]?.trim() || item);
}
