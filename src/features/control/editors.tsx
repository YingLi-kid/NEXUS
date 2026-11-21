import { useEffect, useState, type ReactNode } from "react";
import { SITE_ICON_NAMES, SiteIcon } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import { relationKey } from "@/lib/i18n";
import { categoryName, siteName } from "@/lib/localize";
import { useI18n } from "@/lib/use-i18n";
import { useNexus } from "@/stores/nexus-store";
import { RELATION_TYPES, type Category, type Connection, type Profile, type RelationType, type Website } from "@/types/nexus";
import { createId } from "@/utils/id";
import { clampVec, cssColor, galaxySlot, suggestOffset } from "@/utils/space";
import { safeHttpUrl, validEmail } from "@/utils/url";
import { cn } from "@/utils/cn";

const PRESETS = ["#00d9ff", "#8b5cf6", "#00ffa3", "#93a0b8"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

export function WebsiteEditor({ siteId }: { siteId: string }) {
  const site = useNexus((state) => state.websites.find((item) => item.id === siteId));
  const categories = useNexus((state) => state.categories);
  const upsert = useNexus((state) => state.upsertWebsite);
  const remove = useNexus((state) => state.deleteWebsite);
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState<Website | null>(site ?? null);
  const [tagText, setTagText] = useState(site?.tags.join(", ") ?? "");
  const [zhTagText, setZhTagText] = useState(site?.tagsZh?.join(", ") ?? "");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!site) return;
    setDraft(site);
    setTagText(site.tags.join(", "));
    setZhTagText(site.tagsZh?.join(", ") ?? "");
    setConfirm(false);
    setErrorKey(null);
  }, [siteId]);

  useEffect(() => {
    if (!draft) return;
    const safe = safeHttpUrl(draft.url);
    const coverOk = draft.cover.trim() === "" || safeHttpUrl(draft.cover) !== null;
    if (!draft.name.trim()) {
      setErrorKey("err.nameRequired");
      return;
    }
    if (!safe) {
      setErrorKey("err.urlScheme");
      return;
    }
    if (!coverOk) {
      setErrorKey("err.coverUrl");
      return;
    }
    if (!categories.some((category) => category.id === draft.categoryId)) {
      setErrorKey("err.chooseGalaxy");
      return;
    }
    setErrorKey(null);
    const tags = tagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 12);
    const tagsZh = zhTagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 12);
    // Editing the base tags invalidates index-matched Chinese labels.
    const tagsChanged = tags.join("\u0000") !== draft.tags.join("\u0000");
    const next: Website = {
      ...draft,
      name: draft.name.trim(),
      url: safe,
      cover: draft.cover.trim() === "" ? "" : (safeHttpUrl(draft.cover) ?? ""),
      tags,
      tagsZh: tagsChanged ? undefined : tagsZh.length > 0 ? tagsZh : undefined,
    };
    const timer = window.setTimeout(() => upsert(next), 280);
    return () => window.clearTimeout(timer);
  }, [draft, tagText, zhTagText, categories, upsert]);

  if (!site || !draft) return <p className="text-sm text-muted">{t("editor.site.select")}</p>;

  const setPosition = (axis: 0 | 1 | 2, raw: string) => {
    const position = [...draft.position] as Website["position"];
    position[axis] = clampVec(Number(raw));
    setDraft({ ...draft, position });
  };

  return (
    <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
      {lang === "zh" ? <p className="text-xs font-semibold tracking-[0.18em] text-muted">{t("section.englishCopy")}</p> : null}
      <Field label={t("form.name")}>
        <input className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </Field>
      <Field label={t("form.url")}>
        <input className="field" value={draft.url} inputMode="url" onChange={(event) => setDraft({ ...draft, url: event.target.value })} />
      </Field>
      <Field label={t("form.description")}>
        <textarea className="field" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </Field>
      <Field label={t("form.galaxy")}>
        <select className="field" value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {categoryName(lang, category)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("form.tags")}>
        <input className="field" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder={t("placeholder.tags")} />
      </Field>
      <Field label={t("form.coverUrl")}>
        <input className="field" value={draft.cover} onChange={(event) => setDraft({ ...draft, cover: event.target.value })} placeholder={t("placeholder.cover")} />
      </Field>
      <div>
        <p className="text-sm text-muted">{t("form.icon")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SITE_ICON_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={draft.icon === name}
              className={cn(
                "focus-ring grid size-11 place-items-center rounded-2xl",
                draft.icon === name ? "bg-cyan text-bg" : "bg-elev-2 text-fg",
              )}
              onClick={() => setDraft({ ...draft, icon: name })}
            >
              <SiteIcon name={name} className="size-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {([0, 1, 2] as const).map((axis) => (
          <Field key={axis} label={t(axis === 0 ? "form.localX" : axis === 1 ? "form.localY" : "form.localZ")}>
            <input className="field" type="number" step="0.1" value={draft.position[axis]} onChange={(event) => setPosition(axis, event.target.value)} />
          </Field>
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" className="size-4 accent-cyan" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} />
        {t("toggle.featured")}
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" className="size-4 accent-cyan" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} />
        {t("toggle.visible")}
      </label>
      {lang === "zh" ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-elev-2/40 p-4">
          <div>
            <p className="text-sm font-semibold text-cyan">{t("section.chineseCopy")}</p>
            <p className="mt-1 text-xs text-muted">{t("hint.zhFallback")}</p>
          </div>
          <Field label={t("form.nameZh")}>
            <input
              className="field"
              value={draft.nameZh ?? ""}
              onChange={(event) => setDraft({ ...draft, nameZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
          <Field label={t("form.descriptionZh")}>
            <textarea
              className="field"
              value={draft.descriptionZh ?? ""}
              onChange={(event) => setDraft({ ...draft, descriptionZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
          <Field label={t("form.tagsZh")}>
            <input className="field" value={zhTagText} onChange={(event) => setZhTagText(event.target.value)} placeholder={t("placeholder.tagsZh")} />
          </Field>
        </div>
      ) : null}
      {errorKey ? <p className="text-sm text-mint">{t(errorKey)}</p> : <p className="text-xs text-muted">{t("status.saved")}</p>}
      {confirm ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" onClick={() => remove(site.id)}>
            {t("action.deleteSite")}
          </Button>
          <Button variant="quiet" onClick={() => setConfirm(false)}>
            {t("action.cancel")}
          </Button>
        </div>
      ) : (
        <Button variant="quiet" className="justify-self-start px-0" onClick={() => setConfirm(true)}>
          {t("action.deleteSite")}
        </Button>
      )}
    </form>
  );
}

export function CategoryEditor({ categoryId }: { categoryId: string }) {
  const category = useNexus((state) => state.categories.find((item) => item.id === categoryId));
  const upsert = useNexus((state) => state.upsertCategory);
  const remove = useNexus((state) => state.deleteCategory);
  const { t, tp, lang } = useI18n();
  const [draft, setDraft] = useState<Category | null>(category ?? null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!category) return;
    setDraft(category);
    setErrorKey(null);
    setErrorText(null);
    setConfirm(false);
  }, [categoryId]);

  useEffect(() => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setErrorKey("err.nameRequired");
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(draft.color)) {
      setErrorKey("err.colorHex");
      return;
    }
    setErrorKey(null);
    const timer = window.setTimeout(() => upsert({ ...draft, name: draft.name.trim(), color: draft.color.toLowerCase() }), 280);
    return () => window.clearTimeout(timer);
  }, [draft, upsert]);

  if (!category || !draft) return <p className="text-sm text-muted">{t("editor.galaxy.select")}</p>;

  const setPosition = (axis: 0 | 1 | 2, raw: string) => {
    const position = [...draft.position] as Category["position"];
    position[axis] = clampVec(Number(raw));
    setDraft({ ...draft, position });
  };

  return (
    <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
      {lang === "zh" ? <p className="text-xs font-semibold tracking-[0.18em] text-muted">{t("section.englishCopy")}</p> : null}
      <Field label={t("form.name")}>
        <input className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </Field>
      <Field label={t("form.description")}>
        <textarea className="field" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </Field>
      <Field label={t("form.color")}>
        <input className="field" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
      </Field>
      <div className="flex gap-2">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            className="focus-ring size-11 rounded-full"
            style={{ background: cssColor(color), boxShadow: draft.color.toLowerCase() === color ? "0 0 0 2px #e7eef8" : undefined }}
            onClick={() => setDraft({ ...draft, color })}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {([0, 1, 2] as const).map((axis) => (
          <Field key={axis} label={t(axis === 0 ? "form.galaxyX" : axis === 1 ? "form.galaxyY" : "form.galaxyZ")}>
            <input className="field" type="number" step="0.1" value={draft.position[axis]} onChange={(event) => setPosition(axis, event.target.value)} />
          </Field>
        ))}
      </div>
      {lang === "zh" ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-elev-2/40 p-4">
          <div>
            <p className="text-sm font-semibold text-cyan">{t("section.chineseCopy")}</p>
            <p className="mt-1 text-xs text-muted">{t("hint.zhFallback")}</p>
          </div>
          <Field label={t("form.nameZh")}>
            <input
              className="field"
              value={draft.nameZh ?? ""}
              onChange={(event) => setDraft({ ...draft, nameZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
          <Field label={t("form.descriptionZh")}>
            <textarea
              className="field"
              value={draft.descriptionZh ?? ""}
              onChange={(event) => setDraft({ ...draft, descriptionZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
        </div>
      ) : null}
      {errorText ? (
        <p className="text-sm text-mint">{errorText}</p>
      ) : errorKey ? (
        <p className="text-sm text-mint">{t(errorKey)}</p>
      ) : (
        <p className="text-xs text-muted">{t("status.saved")}</p>
      )}
      {confirm ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            onClick={() => {
              const result = remove(category.id);
              if (!result.ok) setErrorText(tp(result.reason));
            }}
          >
            {t("action.deleteGalaxy")}
          </Button>
          <Button variant="quiet" onClick={() => setConfirm(false)}>
            {t("action.cancel")}
          </Button>
        </div>
      ) : (
        <Button variant="quiet" className="justify-self-start px-0" onClick={() => setConfirm(true)}>
          {t("action.deleteGalaxy")}
        </Button>
      )}
    </form>
  );
}

export function ConnectionEditor({ connectionId }: { connectionId: string }) {
  const connection = useNexus((state) => state.connections.find((item) => item.id === connectionId));
  const websites = useNexus((state) => state.websites);
  const upsert = useNexus((state) => state.upsertConnection);
  const remove = useNexus((state) => state.deleteConnection);
  const { t, tp, lang } = useI18n();
  const [draft, setDraft] = useState<Connection | null>(connection ?? null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;
    setDraft(connection);
    setErrorText(null);
  }, [connectionId]);

  useEffect(() => {
    if (!draft) return;
    const timer = window.setTimeout(() => {
      const result = upsert(draft);
      setErrorText(result.ok ? null : tp(result.reason));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [draft, upsert, tp]);

  if (!connection || !draft) return <p className="text-sm text-muted">{t("editor.link.select")}</p>;

  return (
    <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
      <Field label={t("form.from")}>
        <select className="field" value={draft.sourceId} onChange={(event) => setDraft({ ...draft, sourceId: event.target.value })}>
          {websites.map((site) => (
            <option key={site.id} value={site.id}>
              {siteName(lang, site)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("form.to")}>
        <select className="field" value={draft.targetId} onChange={(event) => setDraft({ ...draft, targetId: event.target.value })}>
          {websites.map((site) => (
            <option key={site.id} value={site.id}>
              {siteName(lang, site)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("form.type")}>
        <select
          className="field"
          value={draft.type}
          onChange={(event) => setDraft({ ...draft, type: event.target.value as RelationType })}
        >
          {RELATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(relationKey(type))}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("form.strength")}>
        <input
          type="range"
          min={0.15}
          max={1}
          step={0.05}
          value={draft.strength}
          className="accent-cyan"
          onChange={(event) => setDraft({ ...draft, strength: Number(event.target.value) })}
        />
      </Field>
      {errorText ? <p className="text-sm text-mint">{errorText}</p> : <p className="text-xs text-muted">{t("status.saved")}</p>}
      <Button variant="quiet" className="justify-self-start px-0" onClick={() => remove(connection.id)}>
        {t("action.deleteLink")}
      </Button>
    </form>
  );
}

export function IdentityEditor() {
  const profile = useNexus((state) => state.profile);
  const update = useNexus((state) => state.updateProfile);
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState<Profile>(profile);
  const [focusText, setFocusText] = useState(profile.focus.join(", "));
  const [zhFocusText, setZhFocusText] = useState(profile.focusZh?.join(", ") ?? "");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!draft.name.trim()) {
      setErrorKey("err.nameRequired");
      return;
    }
    if (!validEmail(draft.email)) {
      setErrorKey("err.emailInvalid");
      return;
    }
    if (draft.socials.some((social) => safeHttpUrl(social.url) === null || !social.label.trim())) {
      setErrorKey("err.socialRow");
      return;
    }
    setErrorKey(null);
    const focusZh = zhFocusText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
    const next: Profile = {
      ...draft,
      name: draft.name.trim(),
      focus: focusText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12),
      focusZh: focusZh.length > 0 ? focusZh : undefined,
      socials: draft.socials.map((social) => ({ ...social, label: social.label.trim(), url: safeHttpUrl(social.url) ?? social.url })),
    };
    const timer = window.setTimeout(() => update(next), 280);
    return () => window.clearTimeout(timer);
  }, [draft, focusText, zhFocusText, update]);

  return (
    <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
      {lang === "zh" ? <p className="text-xs font-semibold tracking-[0.18em] text-muted">{t("section.englishCopy")}</p> : null}
      <Field label={t("form.name")}>
        <input className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </Field>
      <Field label={t("form.role")}>
        <input className="field" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} />
      </Field>
      <Field label={t("form.bio")}>
        <textarea className="field" value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} />
      </Field>
      <Field label={t("form.focus")}>
        <input className="field" value={focusText} onChange={(event) => setFocusText(event.target.value)} placeholder={t("placeholder.focus")} />
      </Field>
      <Field label={t("form.email")}>
        <input className="field" value={draft.email} inputMode="email" onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
      </Field>
      <Field label={t("form.location")}>
        <input className="field" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
      </Field>
      {lang === "zh" ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-elev-2/40 p-4">
          <div>
            <p className="text-sm font-semibold text-cyan">{t("section.chineseCopy")}</p>
            <p className="mt-1 text-xs text-muted">{t("hint.zhFallback")}</p>
          </div>
          <Field label={t("form.roleZh")}>
            <input
              className="field"
              value={draft.roleZh ?? ""}
              onChange={(event) => setDraft({ ...draft, roleZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
          <Field label={t("form.bioZh")}>
            <textarea
              className="field"
              value={draft.bioZh ?? ""}
              onChange={(event) => setDraft({ ...draft, bioZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
          <Field label={t("form.focusZh")}>
            <input className="field" value={zhFocusText} onChange={(event) => setZhFocusText(event.target.value)} placeholder={t("placeholder.focus")} />
          </Field>
          <Field label={t("form.locationZh")}>
            <input
              className="field"
              value={draft.locationZh ?? ""}
              onChange={(event) => setDraft({ ...draft, locationZh: event.target.value.trim() === "" ? undefined : event.target.value })}
            />
          </Field>
        </div>
      ) : null}
      <div className="grid gap-3">
        <p className="text-sm text-muted">{t("form.socialPages")}</p>
        {draft.socials.map((social, index) => (
          <div key={social.id} className={cn("grid gap-2", lang === "zh" ? "sm:grid-cols-[1fr_1fr_1.4fr_auto]" : "sm:grid-cols-[1fr_1.4fr_auto]")}>
            <input
              className="field"
              aria-label={t("form.name")}
              value={social.label}
              onChange={(event) => {
                const socials = draft.socials.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item));
                setDraft({ ...draft, socials });
              }}
            />
            {lang === "zh" ? (
              <input
                className="field"
                aria-label={t("form.socialLabelZh")}
                placeholder={t("form.socialLabelZh")}
                value={social.labelZh ?? ""}
                onChange={(event) => {
                  const socials = draft.socials.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, labelZh: event.target.value.trim() === "" ? undefined : event.target.value } : item,
                  );
                  setDraft({ ...draft, socials });
                }}
              />
            ) : null}
            <input
              className="field"
              aria-label={t("form.url")}
              value={social.url}
              onChange={(event) => {
                const socials = draft.socials.map((item, itemIndex) => (itemIndex === index ? { ...item, url: event.target.value } : item));
                setDraft({ ...draft, socials });
              }}
            />
            <Button variant="quiet" onClick={() => setDraft({ ...draft, socials: draft.socials.filter((item) => item.id !== social.id) })}>
              {t("action.remove")}
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          className="justify-self-start"
          onClick={() =>
            setDraft({
              ...draft,
              socials: [...draft.socials, { id: createId("soc"), label: t("social.example"), url: "https://example.com/nexus-demo" }],
            })
          }
        >
          {t("action.addSocial")}
        </Button>
      </div>
      {errorKey ? <p className="text-sm text-mint">{t(errorKey)}</p> : <p className="text-xs text-muted">{t("status.saved")}</p>}
    </form>
  );
}

export function DataTools() {
  const profile = useNexus((state) => state.profile);
  const categories = useNexus((state) => state.categories);
  const websites = useNexus((state) => state.websites);
  const connections = useNexus((state) => state.connections);
  const importData = useNexus((state) => state.importData);
  const applySeed = useNexus((state) => state.applySeed);
  const { t, tp } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const exportData = () => {
    const payload = { version: 1 as const, profile, categories, websites, connections };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nexus-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-relaxed text-muted">{t("data.intro")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={exportData}>
          {t("data.export")}
        </Button>
        <label className="focus-ring inline-flex h-11 cursor-pointer items-center rounded-full bg-elev px-4 text-sm font-semibold shadow-panel">
          {t("data.import")}
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void file.text().then((text) => {
                try {
                  const parsed = JSON.parse(text) as unknown;
                  void import("@/services/nexus-schema").then(({ parseNexus }) => {
                    const result = parseNexus(parsed);
                    if (!result.ok) {
                      setMessage(tp(result.error));
                      return;
                    }
                    importData(result.data);
                    setMessage(t("data.imported"));
                  });
                } catch {
                  setMessage(t("data.notJson"));
                }
              });
            }}
          />
        </label>
      </div>
      {confirm ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            onClick={() => {
              void import("@/services/seed").then(async ({ fetchSeed }) => {
                try {
                  applySeed(await fetchSeed());
                  setMessage(t("data.demoRestored"));
                  setConfirm(false);
                } catch (error) {
                  setMessage(error instanceof Error ? tp(error.message) : t("data.restoreFailed"));
                }
              });
            }}
          >
            {t("data.replaceDemo")}
          </Button>
          <Button variant="quiet" onClick={() => setConfirm(false)}>
            {t("action.cancel")}
          </Button>
        </div>
      ) : (
        <Button variant="quiet" className="justify-self-start px-0" onClick={() => setConfirm(true)}>
          {t("data.restoreDemo")}
        </Button>
      )}
      {message ? <p className="text-sm text-muted">{tp(message)}</p> : null}
    </div>
  );
}

export function blankWebsite(categoryId: string, index: number): Website {
  return {
    id: createId("site"),
    name: "New example site",
    url: "https://example.com/nexus-demo/new",
    description: "Example entry. Replace this description and URL.",
    categoryId,
    tags: ["example"],
    icon: "Globe",
    cover: "",
    featured: false,
    visible: true,
    createdAt: new Date().toISOString(),
    position: suggestOffset(index),
  };
}

export function blankCategory(index: number): Category {
  return {
    id: createId("galaxy"),
    name: "New galaxy",
    description: "A new group of sites.",
    color: PRESETS[index % PRESETS.length] ?? "#00d9ff",
    position: galaxySlot(index),
  };
}

export function blankConnection(sourceId: string, targetId: string): Connection {
  return {
    id: createId("link"),
    sourceId,
    targetId,
    type: "related-to",
    strength: 0.6,
  };
}
