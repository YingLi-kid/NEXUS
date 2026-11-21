import {
  Archive,
  BookOpen,
  Boxes,
  Compass,
  Cpu,
  FlaskConical,
  Gauge,
  Globe,
  Library,
  Mail,
  NotebookPen,
  Share2,
  StickyNote,
  Telescope,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const SITE_ICONS = {
  Archive,
  BookOpen,
  Boxes,
  Compass,
  Cpu,
  FlaskConical,
  Gauge,
  Globe,
  Library,
  Mail,
  NotebookPen,
  Share2,
  StickyNote,
  Telescope,
  UserRound,
  Wrench,
} as const satisfies Record<string, LucideIcon>;

export type SiteIconName = keyof typeof SITE_ICONS;

export const SITE_ICON_NAMES = Object.keys(SITE_ICONS) as SiteIconName[];

export function SiteIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SITE_ICONS[name as SiteIconName] ?? Globe;
  return <Icon className={className} aria-hidden="true" />;
}
