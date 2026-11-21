import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Lang } from "@/lib/i18n";
import { fetchSeed } from "@/services/seed";
import { CORE_ID, type CameraFocus, type Category, type Connection, type NexusData, type Profile, type QualitySetting, type RecentVisit, type Website } from "@/types/nexus";
import { HOME_VIEW, siteWorld, viewFor } from "@/utils/space";

const memory = new Map<string, string>();

const storage = createJSONStorage(() =>
  typeof window === "undefined"
    ? {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value);
        },
        removeItem: (key: string) => {
          memory.delete(key);
        },
      }
    : window.localStorage,
);

type Result = { ok: true } | { ok: false; reason: string };

/**
 * Side panels in the universe HUD. `expanded` is the default so a first visit
 * looks the way the design intends; the choice is persisted per panel.
 */
export type PanelMode = "expanded" | "compact" | "hidden";

interface NexusState {
  ready: boolean;
  loadError: string | null;
  hasUserData: boolean;
  /**
   * Fingerprint of the seed this browser last loaded. A newer seed in
   * `public/data/nexus.json` (i.e. a fresh deploy) replaces the cached copy
   * instead of leaving every visitor on stale data forever.
   */
  seedKey: string | null;
  profile: Profile;
  categories: Category[];
  websites: Website[];
  connections: Connection[];
  favorites: string[];
  recents: RecentVisit[];
  hiddenCategoryIds: string[];
  selectedId: string | null;
  activeCategoryId: string | null;
  query: string;
  quality: QualitySetting;
  lang: Lang;
  railMode: PanelMode;
  detailMode: PanelMode;
  focus: CameraFocus | null;
  applySeed: (data: NexusData) => void;
  importData: (data: NexusData) => void;
  setReady: () => void;
  setLoadError: (message: string) => void;
  select: (id: string | null) => void;
  focusOn: (id: string) => void;
  focusCategory: (id: string) => void;
  resetView: () => void;
  setQuery: (query: string) => void;
  setQuality: (quality: QualitySetting) => void;
  setLang: (lang: Lang) => void;
  setRailMode: (mode: PanelMode) => void;
  setDetailMode: (mode: PanelMode) => void;
  toggleCategoryVisibility: (id: string) => void;
  toggleFavorite: (id: string) => void;
  markVisited: (id: string) => void;
  upsertWebsite: (website: Website) => void;
  deleteWebsite: (id: string) => void;
  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => Result;
  upsertConnection: (connection: Connection) => Result;
  deleteConnection: (id: string) => void;
  updateProfile: (profile: Profile) => void;
}

const emptyProfile: Profile = {
  name: "Demo Operator",
  role: "",
  bio: "",
  focus: [],
  email: "",
  location: "",
  socials: [],
};

/**
 * Cheap stable fingerprint of a universe document.
 *
 * Identity-bearing fields go in — including the optional Chinese copy, so a
 * translation-only edit also reaches visitors who still hold an old cached
 * universe. Cosmetic reordering or JSON reformatting does not look like a new
 * deploy, while any real edit (name, url, galaxy, link, localized text) does.
 */
export function seedFingerprint(data: NexusData): string {
  const parts = [
    data.profile.name,
    data.profile.role,
    data.profile.roleZh ?? "",
    data.profile.bio,
    data.profile.bioZh ?? "",
    data.profile.focus.join("~"),
    (data.profile.focusZh ?? []).join("~"),
    data.profile.location,
    data.profile.locationZh ?? "",
    data.categories
      .map(
        (category) =>
          `${category.id}:${category.name}:${category.nameZh ?? ""}:${category.description}:${category.descriptionZh ?? ""}:${category.color}`,
      )
      .join(","),
    data.websites
      .map(
        (site) =>
          `${site.id}:${site.name}:${site.nameZh ?? ""}:${site.url}:${site.description}:${site.descriptionZh ?? ""}:${site.categoryId}:${site.tags.join("~")}:${(site.tagsZh ?? []).join("~")}`,
      )
      .join(","),
    data.connections.map((link) => `${link.sourceId}>${link.targetId}:${link.type}`).join(","),
  ];
  const text = parts.join("|");
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0;
  }
  return `v1-${data.websites.length}-${hash.toString(36)}`;
}

function nextFocus(previous: CameraFocus | null, view: { cam: CameraFocus["cam"]; target: CameraFocus["target"] }): CameraFocus {
  return { ...view, nonce: (previous?.nonce ?? 0) + 1 };
}

export const useNexus = create<NexusState>()(
  persist(
    (set, get) => ({
      ready: false,
      loadError: null,
      hasUserData: false,
      seedKey: null,
      profile: emptyProfile,
      categories: [],
      websites: [],
      connections: [],
      favorites: [],
      recents: [],
      hiddenCategoryIds: [],
      selectedId: null,
      activeCategoryId: null,
      query: "",
      quality: "auto",
      lang: "en",
      railMode: "expanded",
      detailMode: "expanded",
      focus: null,
      applySeed: (data) =>
        set({
          profile: data.profile,
          categories: data.categories,
          websites: data.websites,
          connections: data.connections,
          favorites: [],
          recents: [],
          hiddenCategoryIds: [],
          selectedId: null,
          activeCategoryId: null,
          hasUserData: true,
          seedKey: seedFingerprint(data),
          ready: true,
          loadError: null,
          focus: null,
        }),
      importData: (data) =>
        set((state) => ({
          profile: data.profile,
          categories: data.categories,
          websites: data.websites,
          connections: data.connections,
          favorites: state.favorites.filter((id) => data.websites.some((site) => site.id === id)),
          recents: state.recents.filter((visit) => data.websites.some((site) => site.id === visit.id)),
          hiddenCategoryIds: state.hiddenCategoryIds.filter((id) => data.categories.some((category) => category.id === id)),
          selectedId: null,
          activeCategoryId: null,
          hasUserData: true,
          ready: true,
          loadError: null,
        })),
      setReady: () => set({ ready: true, loadError: null }),
      setLoadError: (message) => set({ loadError: message, ready: false }),
      select: (id) => set({ selectedId: id }),
      focusOn: (id) => {
        const state = get();
        if (id === CORE_ID) {
          set({
            selectedId: CORE_ID,
            activeCategoryId: null,
            focus: nextFocus(state.focus, viewFor([0, 0, 0])),
          });
          return;
        }
        const site = state.websites.find((item) => item.id === id);
        if (!site) return;
        set({
          websites: state.websites.map((item) => (item.id === id ? { ...item, visible: true } : item)),
          hiddenCategoryIds: state.hiddenCategoryIds.filter((categoryId) => categoryId !== site.categoryId),
          selectedId: id,
          activeCategoryId: site.categoryId,
          focus: nextFocus(state.focus, viewFor(siteWorld(site, state.categories))),
        });
      },
      focusCategory: (id) => {
        const state = get();
        const category = state.categories.find((item) => item.id === id);
        if (!category) return;
        set({
          activeCategoryId: id,
          hiddenCategoryIds: state.hiddenCategoryIds.filter((categoryId) => categoryId !== id),
          focus: nextFocus(state.focus, viewFor(category.position)),
        });
      },
      resetView: () => set((state) => ({ focus: nextFocus(state.focus, HOME_VIEW), activeCategoryId: null })),
      setQuery: (query) => set({ query }),
      setQuality: (quality) => set({ quality }),
      setLang: (lang) => set({ lang }),
      setRailMode: (mode) => set({ railMode: mode }),
      setDetailMode: (mode) => set({ detailMode: mode }),
      toggleCategoryVisibility: (id) =>
        set((state) => ({
          hiddenCategoryIds: state.hiddenCategoryIds.includes(id)
            ? state.hiddenCategoryIds.filter((categoryId) => categoryId !== id)
            : [...state.hiddenCategoryIds, id],
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [...state.favorites, id],
        })),
      markVisited: (id) =>
        set((state) => ({
          recents: [{ id, at: new Date().toISOString() }, ...state.recents.filter((visit) => visit.id !== id)].slice(0, 12),
        })),
      upsertWebsite: (website) =>
        set((state) => ({
          websites: state.websites.some((item) => item.id === website.id)
            ? state.websites.map((item) => (item.id === website.id ? website : item))
            : [...state.websites, website],
        })),
      deleteWebsite: (id) =>
        set((state) => ({
          websites: state.websites.filter((item) => item.id !== id),
          connections: state.connections.filter((link) => link.sourceId !== id && link.targetId !== id),
          favorites: state.favorites.filter((item) => item !== id),
          recents: state.recents.filter((visit) => visit.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),
      upsertCategory: (category) =>
        set((state) => ({
          categories: state.categories.some((item) => item.id === category.id)
            ? state.categories.map((item) => (item.id === category.id ? category : item))
            : [...state.categories, category],
        })),
      deleteCategory: (id) => {
        const state = get();
        if (state.categories.length <= 1) return { ok: false, reason: "Keep at least one galaxy." };
        if (state.websites.some((site) => site.categoryId === id)) {
          return { ok: false, reason: "Move or delete the sites in this galaxy first." };
        }
        set({
          categories: state.categories.filter((item) => item.id !== id),
          hiddenCategoryIds: state.hiddenCategoryIds.filter((item) => item !== id),
          activeCategoryId: state.activeCategoryId === id ? null : state.activeCategoryId,
        });
        return { ok: true };
      },
      upsertConnection: (connection) => {
        const state = get();
        if (connection.sourceId === connection.targetId) return { ok: false, reason: "Pick two different sites." };
        const ids = new Set(state.websites.map((site) => site.id));
        if (!ids.has(connection.sourceId) || !ids.has(connection.targetId)) {
          return { ok: false, reason: "Both sites must exist." };
        }
        const duplicate = state.connections.some(
          (link) =>
            link.id !== connection.id &&
            link.sourceId === connection.sourceId &&
            link.targetId === connection.targetId &&
            link.type === connection.type,
        );
        if (duplicate) return { ok: false, reason: "That link already exists." };
        const next = { ...connection, strength: Math.min(1, Math.max(0.05, connection.strength)) };
        set({
          connections: state.connections.some((link) => link.id === connection.id)
            ? state.connections.map((link) => (link.id === connection.id ? next : link))
            : [...state.connections, next],
        });
        return { ok: true };
      },
      deleteConnection: (id) => set((state) => ({ connections: state.connections.filter((link) => link.id !== id) })),
      updateProfile: (profile) => set({ profile }),
    }),
    {
      name: "nexus-universe-v1",
      version: 1,
      skipHydration: true,
      storage,
      partialize: (state) => ({
        hasUserData: state.hasUserData,
        seedKey: state.seedKey,
        profile: state.profile,
        categories: state.categories,
        websites: state.websites,
        connections: state.connections,
        favorites: state.favorites,
        recents: state.recents,
        hiddenCategoryIds: state.hiddenCategoryIds,
        quality: state.quality,
        lang: state.lang,
        railMode: state.railMode,
        detailMode: state.detailMode,
      }),
    },
  ),
);

let boot: Promise<void> | null = null;

export function bootstrapNexus(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!boot) boot = runBootstrap();
  return boot;
}

export function retryBootstrap(): Promise<void> {
  boot = null;
  return bootstrapNexus();
}

async function runBootstrap(): Promise<void> {
  const store = useNexus;
  try {
    await store.persist.rehydrate();
  } catch {
    // Fall through and load the seed if storage is unreadable.
  }
  const state = store.getState();
  const cached = state.hasUserData && state.categories.length > 0;
  if (cached) {
    // A cached universe still has to notice a redeploy: compare the shipped
    // seed against the one this browser last applied. If it changed, the file
    // wins; if the fetch fails (offline) the cached copy keeps working.
    try {
      const data = await fetchSeed();
      if (seedFingerprint(data) === state.seedKey) {
        store.getState().setReady();
        return;
      }
      store.getState().applySeed(data);
      return;
    } catch {
      store.getState().setReady();
      return;
    }
  }
  try {
    const data = await fetchSeed();
    store.getState().applySeed(data);
  } catch (error) {
    store.getState().setLoadError(error instanceof Error ? error.message : "Could not load universe data.");
  }
}
