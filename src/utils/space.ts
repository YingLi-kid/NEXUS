import type { Category, Vec3, Website } from "@/types/nexus";

export function suggestOffset(index: number): Vec3 {
  const angle = index * 2.399963229728653;
  const radius = 3.15 + (index % 3) * 0.45;
  const y = ((index % 5) - 2) * 0.28;
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
}

export function galaxySlot(index: number): Vec3 {
  const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
  const radius = 15 + (index % 2) * 2;
  return [Math.cos(angle) * radius, index % 2 === 0 ? 1.2 : -0.6, Math.sin(angle) * radius];
}

export function siteWorld(site: Website, categories: Category[]): Vec3 {
  const category = categories.find((item) => item.id === site.categoryId);
  const [ox, oy, oz] = site.position;
  if (!category) return [ox, oy, oz];
  const [cx, cy, cz] = category.position;
  return [cx + ox, cy + oy, cz + oz];
}

export function viewFor(target: Vec3): { cam: Vec3; target: Vec3 } {
  const [x, y, z] = target;
  if (Math.hypot(x, y, z) < 0.8) {
    return { cam: [0, 8.5, 24], target: [0, 0, 0] };
  }
  return { cam: [x + 4.2, y + 3.2, z + 11.5], target };
}

export const HOME_VIEW: { cam: Vec3; target: Vec3 } = {
  cam: [0, 9, 30],
  target: [0, 0.4, 0],
};

export function cssColor(input: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(input) ? input : "#00d9ff";
}

export function clampVec(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-80, Math.min(80, value));
}
