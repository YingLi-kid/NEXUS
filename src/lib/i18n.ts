/**
 * Single source of truth for UI copy.
 *
 * Every visible string in the app funnels through this dictionary so the
 * language toggle never leaves a half-translated screen behind. Keys are flat
 * and namespaced by surface (`nav.*`, `explorer.*`, `control.*`, ...), and the
 * interpolation uses `{name}` placeholders resolved by `translate`.
 *
 * User content (site names, descriptions, bios) is deliberately NOT in here —
 * that is the visitor's own data, not chrome.
 */

export type Lang = "en" | "zh";

type Entry = { en: string; zh: string };

export const LANGS: readonly Lang[] = ["en", "zh"] as const;

export const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  zh: "中文",
};

export const DICT: Record<string, Entry> = {
  // ── document titles & meta ───────────────────────────────────────────────
  "title.app": { en: "NEXUS — Personal Digital Universe", zh: "NEXUS — 个人数字宇宙" },
  "title.universe": { en: "NEXUS — Universe", zh: "NEXUS — 宇宙" },
  "title.explorer": { en: "NEXUS — Explorer", zh: "NEXUS — 探索" },
  "title.control": { en: "NEXUS — Control Center", zh: "NEXUS — 控制中心" },
  "title.about": { en: "NEXUS — About", zh: "NEXUS — 关于" },
  "meta.description": {
    en: "A personal 3D universe for sites, projects, notes, and profiles.",
    zh: "一个用 3D 星图收纳站点、项目、笔记与身份的个人宇宙。",
  },

  // ── auth (only visible when sign-in is enabled) ──────────────────────────
  "auth.continueWith": { en: "Continue with {provider}", zh: "使用 {provider} 继续" },
  "auth.account": { en: "Account", zh: "账号" },
  "auth.signOut": { en: "Sign out", zh: "退出登录" },
  "auth.signingOut": { en: "Signing out…", zh: "正在退出…" },

  // ── shell ────────────────────────────────────────────────────────────────
  "nav.universe": { en: "Universe", zh: "宇宙" },
  "nav.explorer": { en: "Explorer", zh: "探索" },
  "nav.control": { en: "Control", zh: "控制" },
  "nav.about": { en: "About", zh: "关于" },
  "brand.tagline": { en: "Personal universe", zh: "个人宇宙" },
  "menu.open": { en: "Open menu", zh: "打开菜单" },
  "menu.close": { en: "Close menu", zh: "关闭菜单" },
  "lang.toEnglish": { en: "Switch to English", zh: "切换到英文" },
  "lang.toChinese": { en: "Switch to Chinese", zh: "切换到中文" },
  "boot.label": { en: "Aligning the personal universe…", zh: "正在校准个人宇宙…" },
  "error.unavailable.title": { en: "Universe data unavailable", zh: "宇宙数据不可用" },
  "error.retry": { en: "Try again", zh: "重试" },
  "webgl.title": { en: "3D view unavailable", zh: "3D 视图不可用" },
  "webgl.explorer": { en: "Open Explorer", zh: "打开探索" },
  "error.generic.title": { en: "Something went wrong", zh: "出了点问题" },
  "error.generic.body": {
    en: "An unexpected error occurred. Try reloading the page.",
    zh: "发生了一个意外错误，请尝试刷新页面。",
  },

  // ── about ────────────────────────────────────────────────────────────────
  "about.eyebrow": { en: "Personal identity", zh: "个人身份" },
  "about.featured": { en: "Featured work", zh: "精选作品" },
  "about.galaxies": { en: "Galaxies", zh: "星系" },
  "about.contact": { en: "Contact", zh: "联系方式" },
  "about.location": { en: "Location", zh: "位置" },
  "about.email": { en: "Email", zh: "邮箱" },
  "about.notSet": { en: "Not set", zh: "未设置" },

  // ── explorer ─────────────────────────────────────────────────────────────
  "explorer.title": { en: "Explorer", zh: "探索" },
  "explorer.subtitle": {
    en: "Every site in the universe, without the 3D scene. Bundled entries are examples.",
    zh: "宇宙里的所有站点，不需要 3D 场景。内置条目均为示例。",
  },
  "explorer.tab.all": { en: "All", zh: "全部" },
  "explorer.tab.favorites": { en: "Favorites", zh: "收藏" },
  "explorer.tab.recent": { en: "Recent", zh: "最近" },
  "explorer.searchPlaceholder": { en: "Search sites", zh: "搜索站点" },
  "explorer.filterGalaxy": { en: "Filter by galaxy", zh: "按星系筛选" },
  "explorer.filterTag": { en: "Filter by tag", zh: "按标签筛选" },
  "explorer.allGalaxies": { en: "All galaxies", zh: "全部星系" },
  "explorer.allTags": { en: "All tags", zh: "全部标签" },
  "explorer.empty": { en: "Nothing matches these filters.", zh: "没有符合当前筛选条件的站点。" },
  "explorer.selectHint": { en: "Select a site to see its details.", zh: "选择一个站点查看详情。" },

  // ── control ──────────────────────────────────────────────────────────────
  "control.title": { en: "Control Center", zh: "控制中心" },
  "control.subtitle": {
    en: "Add sites, shape galaxies, and draw the links between them. Changes show up in the universe and explorer immediately, and stay on this device.",
    zh: "添加站点、塑造星系，并连起它们之间的关系。改动会立即出现在宇宙与探索页，且只保存在这台设备上。",
  },
  "control.tab.sites": { en: "Sites", zh: "站点" },
  "control.tab.galaxies": { en: "Galaxies", zh: "星系" },
  "control.tab.links": { en: "Links", zh: "连接" },
  "control.tab.identity": { en: "Identity", zh: "身份" },
  "control.tab.data": { en: "Data", zh: "数据" },
  "control.add.site": { en: "Add site", zh: "添加站点" },
  "control.add.galaxy": { en: "Add galaxy", zh: "添加星系" },
  "control.add.link": { en: "Add link", zh: "添加连接" },
  "control.addSiteFirst": { en: "Add a site to begin.", zh: "先添加一个站点开始编辑。" },
  "control.noLinks": { en: "No links yet.", zh: "还没有连接。" },
  "control.linkNeedsTwo": {
    en: "Add at least two sites before linking them.",
    zh: "至少需要两个站点才能建立连接。",
  },
  "control.missing": { en: "Missing", zh: "缺失" },
  "control.sitesUnit": { en: "{count} sites", zh: "{count} 个站点" },
  "control.sitesUnitOne": { en: "1 site", zh: "1 个站点" },

  // ── editors ──────────────────────────────────────────────────────────────
  "editor.site.select": { en: "Select a site to edit.", zh: "选择一个站点进行编辑。" },
  "editor.galaxy.select": { en: "Select a galaxy to edit.", zh: "选择一个星系进行编辑。" },
  "editor.link.select": { en: "Select a link to edit.", zh: "选择一条连接进行编辑。" },
  "form.name": { en: "Name", zh: "名称" },
  "form.url": { en: "URL", zh: "链接" },
  "form.description": { en: "Description", zh: "描述" },
  "form.galaxy": { en: "Galaxy", zh: "星系" },
  "form.tags": { en: "Tags", zh: "标签" },
  "form.coverUrl": { en: "Cover URL", zh: "封面链接" },
  "form.icon": { en: "Icon", zh: "图标" },
  "form.localX": { en: "Local X", zh: "局部 X" },
  "form.localY": { en: "Local Y", zh: "局部 Y" },
  "form.localZ": { en: "Local Z", zh: "局部 Z" },
  "form.galaxyX": { en: "Galaxy X", zh: "星系 X" },
  "form.galaxyY": { en: "Galaxy Y", zh: "星系 Y" },
  "form.galaxyZ": { en: "Galaxy Z", zh: "星系 Z" },
  "form.color": { en: "Color", zh: "颜色" },
  "form.from": { en: "From", zh: "起点" },
  "form.to": { en: "To", zh: "终点" },
  "form.type": { en: "Type", zh: "类型" },
  "form.strength": { en: "Strength", zh: "强度" },
  "form.role": { en: "Role", zh: "角色" },
  "form.bio": { en: "Bio", zh: "简介" },
  "form.focus": { en: "Focus", zh: "关注领域" },
  "form.email": { en: "Email", zh: "邮箱" },
  "form.location": { en: "Location", zh: "位置" },
  "form.socialPages": { en: "Social pages", zh: "社交主页" },
  "section.englishCopy": { en: "English copy", zh: "英文原文" },
  "section.chineseCopy": { en: "Chinese copy", zh: "中文覆盖" },
  "form.nameZh": { en: "Chinese name", zh: "中文名称" },
  "form.descriptionZh": { en: "Chinese description", zh: "中文描述" },
  "form.tagsZh": { en: "Chinese tags", zh: "中文标签" },
  "form.roleZh": { en: "Chinese role", zh: "中文身份" },
  "form.bioZh": { en: "Chinese bio", zh: "中文简介" },
  "form.focusZh": { en: "Chinese focus", zh: "中文关注领域" },
  "form.locationZh": { en: "Chinese location", zh: "中文所在地" },
  "form.socialLabelZh": { en: "Chinese label", zh: "中文标签" },
  "hint.zhFallback": { en: "Leave empty to fall back to English.", zh: "留空时自动回退到英文原文。" },
  "placeholder.tagsZh": { en: "docs, reference", zh: "文档, 参考" },
  "placeholder.tags": { en: "notes, tools", zh: "笔记, 工具" },
  "placeholder.cover": { en: "Optional http(s) image", zh: "可选：http(s) 图片链接" },
  "placeholder.focus": { en: "systems, writing", zh: "系统, 写作" },
  "toggle.featured": { en: "Featured node", zh: "设为精选节点" },
  "toggle.visible": { en: "Visible in the universe", zh: "在宇宙中可见" },
  "action.deleteSite": { en: "Delete site", zh: "删除站点" },
  "action.deleteGalaxy": { en: "Delete galaxy", zh: "删除星系" },
  "action.deleteLink": { en: "Delete link", zh: "删除连接" },
  "action.remove": { en: "Remove", zh: "移除" },
  "action.addSocial": { en: "Add social link", zh: "添加社交链接" },
  "action.cancel": { en: "Cancel", zh: "取消" },
  "status.saved": { en: "Saved in this browser.", zh: "已保存在此浏览器中。" },
  "err.nameRequired": { en: "Name is required.", zh: "名称不能为空。" },
  "err.urlScheme": {
    en: "URL must start with http:// or https://.",
    zh: "链接必须以 http:// 或 https:// 开头。",
  },
  "err.coverUrl": {
    en: "Cover must be empty or an http(s) URL.",
    zh: "封面必须为空，或是一个 http(s) 链接。",
  },
  "err.chooseGalaxy": { en: "Choose a galaxy.", zh: "请选择一个星系。" },
  "err.colorHex": { en: "Color must be #rrggbb.", zh: "颜色必须是 #rrggbb 格式。" },
  "err.emailInvalid": { en: "Email is not valid.", zh: "邮箱格式不正确。" },
  "err.socialRow": {
    en: "Each social link needs a label and an http(s) URL.",
    zh: "每条社交链接都需要名称和 http(s) 链接。",
  },
  "social.example": { en: "Example", zh: "示例" },

  // ── data tools ───────────────────────────────────────────────────────────
  "data.intro": {
    en: "Edits stay in this browser. The bundled file is only the demo seed. Import replaces the current universe.",
    zh: "所有修改只保存在此浏览器中。内置文件只是演示种子数据。导入会替换当前宇宙。",
  },
  "data.export": { en: "Export JSON", zh: "导出 JSON" },
  "data.import": { en: "Import JSON", zh: "导入 JSON" },
  "data.imported": { en: "Imported.", zh: "已导入。" },
  "data.notJson": { en: "That file is not JSON.", zh: "这个文件不是 JSON。" },
  "data.demoRestored": { en: "Demo restored.", zh: "演示数据已恢复。" },
  "data.restoreFailed": { en: "Could not restore the demo.", zh: "无法恢复演示数据。" },
  "data.replaceDemo": { en: "Replace with demo", zh: "用演示数据替换" },
  "data.restoreDemo": { en: "Restore demo data", zh: "恢复演示数据" },

  // ── site detail ──────────────────────────────────────────────────────────
  "site.open": { en: "Open website", zh: "打开网站" },
  "site.blocked": {
    en: "This address is blocked. Only http and https links can be opened.",
    zh: "这个地址被拦截了，只能打开 http 与 https 链接。",
  },
  "site.example": { en: "Example link", zh: "示例链接" },
  "site.core": { en: "Core", zh: "核心" },
  "site.aboutIdentity": { en: "About this identity", zh: "关于这个身份" },
  "site.unassigned": { en: "Unassigned", zh: "未分类" },
  "site.hidden": { en: "Hidden in the universe until shown.", zh: "在宇宙中已隐藏，直到手动显示。" },
  "site.connections": { en: "Connections", zh: "连接" },
  "site.showInUniverse": { en: "Show in universe", zh: "在宇宙中显示" },
  "site.favoriteSave": { en: "Save favorite", zh: "收藏" },
  "site.favoriteRemove": { en: "Remove favorite", zh: "取消收藏" },

  // ── universe hud ─────────────────────────────────────────────────────────
  "universe.search": { en: "Search the universe", zh: "搜索宇宙" },
  "universe.searchSites": { en: "Search sites", zh: "搜索站点" },
  "universe.closeSearch": { en: "Close search", zh: "关闭搜索" },
  "universe.core": { en: "Core", zh: "核心" },
  "universe.galaxies": { en: "Galaxies", zh: "星系" },
  "universe.sites": { en: "{count} sites", zh: "{count} 个站点" },
  "universe.sitesOne": { en: "1 site", zh: "1 个站点" },
  "universe.show": { en: "Show {name}", zh: "显示 {name}" },
  "universe.hide": { en: "Hide {name}", zh: "隐藏 {name}" },
  "universe.closeDetails": { en: "Close details", zh: "关闭详情" },
  "universe.noNodes": { en: "No matching nodes.", zh: "没有匹配的节点。" },
  "universe.hint": {
    en: "Drag to orbit · Scroll to zoom · Double-click a node to open",
    zh: "拖动环绕 · 滚轮缩放 · 双击节点打开",
  },
  "universe.hintMobile": { en: "Drag to look around", zh: "拖动即可环视" },
  "universe.reset": { en: "Reset view", zh: "重置视角" },
  "universe.auto": { en: "Auto · {tier}", zh: "自动 · {tier}" },
  "universe.high": { en: "High", zh: "高" },
  "universe.low": { en: "Low", zh: "低" },
  "universe.fullscreenEnter": { en: "Enter full screen", zh: "进入全屏" },
  "universe.fullscreenExit": { en: "Exit full screen", zh: "退出全屏" },
  "universe.site": { en: "Site", zh: "站点" },
  "panel.detail": { en: "Details", zh: "详情" },
  "panel.shrink": { en: "Shrink panel", zh: "缩窄面板" },
  "panel.widen": { en: "Expand panel width", zh: "加宽面板" },
  "panel.hide": { en: "Hide panel", zh: "隐藏面板" },
  "panel.show": { en: "Show panel", zh: "显示面板" },

  // ── relation types ───────────────────────────────────────────────────────
  "relation.belongs-to": { en: "Belongs to", zh: "归属" },
  "relation.related-to": { en: "Related to", zh: "相关" },
  "relation.built-with": { en: "Built with", zh: "使用" },
};

/** Resolve one key with `{name}` placeholders filled in. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  const template = entry ? entry[lang] : key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = vars[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

/**
 * Messages raised outside React (the zustand store, the seed loader) arrive as
 * finished English sentences. Mapping them here keeps the store free of any
 * i18n import — no runtime cycle, and unknown messages fall back verbatim.
 */
const PHRASES_ZH: Record<string, string> = {
  "Keep at least one galaxy.": "至少要保留一个星系。",
  "Move or delete the sites in this galaxy first.": "请先移走或删除这个星系里的站点。",
  "Pick two different sites.": "请选择两个不同的站点。",
  "Both sites must exist.": "两个站点都必须存在。",
  "That link already exists.": "这条连接已经存在。",
  "Could not load universe data.": "无法加载宇宙数据。",
  "Could not read the universe seed.": "无法读取宇宙种子数据。",
  "The 3D universe failed to start. Explorer and Control Center still work.":
    "3D 宇宙启动失败，探索页与控制中心仍可正常使用。",
  "This browser cannot start WebGL. Explorer and Control Center still work.":
    "这个浏览器无法启动 WebGL，探索页与控制中心仍可正常使用。",
};

/**
 * Messages the zod schema raises. They carry values (ids, field paths), so
 * exact-string lookup is not enough — these patterns fill the same gap without
 * forcing the schema to speak in codes.
 */
const SCHEMA_PATTERNS_ZH: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^Use an http or https URL\.$/, () => "必须使用 http 或 https 链接。"],
  [/^Email is not valid\.$/, () => "邮箱格式不正确。"],
  [/^Use a #rrggbb color\.$/, () => "颜色必须是 #rrggbb 格式。"],
  [/^Cover must be empty or http\(s\)\.$/, () => "封面必须为空，或是一个 http 或 https 链接。"],
  [/^Universe data is invalid\.$/, () => "宇宙数据格式不正确。"],
  [/^Duplicate galaxy id (.+)\.$/, (match) => `星系 ID 重复：${match[1]}。`],
  [/^Duplicate site id (.+)\.$/, (match) => `站点 ID 重复：${match[1]}。`],
  [/^(.+) points at a missing galaxy\.$/, (match) => `${match[1]} 指向了不存在的星系。`],
  [/^A link cannot point at itself\.$/, () => "连接的两端不能是同一个站点。"],
  [/^A link points at a missing site\.$/, () => "连接指向了不存在的站点。"],
  [/^Duplicate link\.$/, () => "这条连接重复了。"],
  [/^String must contain at least (\d+) character\(s\)\.$/, (match) => `至少需要 ${match[1]} 个字符。`],
  [/^Too (?:big|small): expected .*$/i, () => "数值超出允许范围。"],
  [/^Invalid input$/i, () => "输入无效。"],
  [/^Required$/i, () => "此项必填。"],
];

function translateSchemaMessage(text: string): string | null {
  for (const [pattern, format] of SCHEMA_PATTERNS_ZH) {
    const match = text.match(pattern);
    if (match) return format(match);
  }
  return null;
}

export function translatePhrase(lang: Lang, text: string): string {
  if (lang === "en") return text;
  const exact = PHRASES_ZH[text];
  if (exact) return exact;

  const direct = translateSchemaMessage(text);
  if (direct) return direct;

  // zod joins issues as "path: message" — translate the message half.
  const separator = text.indexOf(": ");
  if (separator > 0 && !text.slice(0, separator).includes(" ")) {
    const path = text.slice(0, separator);
    const rest = text.slice(separator + 2);
    const translated = PHRASES_ZH[rest] ?? translateSchemaMessage(rest);
    if (translated) return `${path}：${translated}`;
  }
  return text;
}

export function relationKey(type: string): string {
  return `relation.${type}`;
}
