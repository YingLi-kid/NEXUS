export const RELATION_TYPES = ["belongs-to", "related-to", "built-with"] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

export type Vec3 = [number, number, number];

export interface SocialLink {
  id: string;
  label: string;
  /** Optional Chinese label; falls back to `label`. */
  labelZh?: string;
  url: string;
}

export interface Profile {
  name: string;
  role: string;
  roleZh?: string;
  bio: string;
  bioZh?: string;
  focus: string[];
  focusZh?: string[];
  email: string;
  location: string;
  locationZh?: string;
  socials: SocialLink[];
}

export interface Category {
  id: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionZh?: string;
  color: string;
  position: Vec3;
}

export interface Website {
  id: string;
  name: string;
  nameZh?: string;
  url: string;
  description: string;
  descriptionZh?: string;
  categoryId: string;
  tags: string[];
  /** Optional Chinese labels for the same tags, matched by index. */
  tagsZh?: string[];
  icon: string;
  cover: string;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  position: Vec3;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  strength: number;
}

export interface NexusData {
  version: 1;
  profile: Profile;
  categories: Category[];
  websites: Website[];
  connections: Connection[];
}

export interface RecentVisit {
  id: string;
  at: string;
}

export type QualitySetting = "auto" | "high" | "low";

export interface CameraFocus {
  nonce: number;
  cam: Vec3;
  target: Vec3;
}

export const RELATION_LABEL: Record<RelationType, string> = {
  "belongs-to": "Belongs to",
  "related-to": "Related to",
  "built-with": "Built with",
};

export const CORE_ID = "core";
