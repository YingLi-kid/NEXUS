import { z } from "zod";
import { RELATION_TYPES, type NexusData } from "@/types/nexus";
import { safeHttpUrl, validEmail } from "@/utils/url";

const vec3 = z.tuple([z.number(), z.number(), z.number()]);

const httpUrl = z.string().refine((value) => safeHttpUrl(value) !== null, "Use an http or https URL.");

export const nexusSchema = z.object({
  version: z.literal(1),
  profile: z.object({
    name: z.string().trim().min(1).max(80),
    role: z.string().max(120),
    roleZh: z.string().max(120).optional(),
    bio: z.string().max(2000),
    bioZh: z.string().max(2000).optional(),
    focus: z.array(z.string().trim().min(1).max(48)).max(12),
    focusZh: z.array(z.string().trim().min(1).max(48)).max(12).optional(),
    email: z.string().max(120).refine(validEmail, "Email is not valid."),
    location: z.string().max(80),
    locationZh: z.string().max(80).optional(),
    socials: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().trim().min(1).max(40),
          labelZh: z.string().trim().min(1).max(40).optional(),
          url: httpUrl,
        }),
      )
      .max(12),
  }),
  categories: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(40),
        nameZh: z.string().trim().min(1).max(40).optional(),
        description: z.string().max(400),
        descriptionZh: z.string().max(400).optional(),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a #rrggbb color."),
        position: vec3,
      }),
    )
    .min(1)
    .max(24),
  websites: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(80),
        nameZh: z.string().trim().min(1).max(80).optional(),
        url: httpUrl,
        description: z.string().max(800),
        descriptionZh: z.string().max(800).optional(),
        categoryId: z.string().min(1),
        tags: z.array(z.string().trim().min(1).max(32)).max(12),
        tagsZh: z.array(z.string().trim().min(1).max(32)).max(12).optional(),
        icon: z.string().min(1).max(40),
        cover: z.string().refine((value) => value === "" || safeHttpUrl(value) !== null, "Cover must be empty or http(s)."),
        featured: z.boolean(),
        visible: z.boolean(),
        createdAt: z.string().min(4),
        position: vec3,
      }),
    )
    .max(200),
  connections: z
    .array(
      z.object({
        id: z.string().min(1),
        sourceId: z.string().min(1),
        targetId: z.string().min(1),
        type: z.enum(RELATION_TYPES),
        strength: z.number().min(0).max(1),
      }),
    )
    .max(400),
});

export function parseNexus(input: unknown): { ok: true; data: NexusData } | { ok: false; error: string } {
  const result = nexusSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "data"}: ${issue.message}`)
      .join(" ");
    return { ok: false, error: message || "Universe data is invalid." };
  }

  const data = result.data;
  const categoryIds = new Set<string>();
  for (const category of data.categories) {
    if (categoryIds.has(category.id)) return { ok: false, error: `Duplicate galaxy id ${category.id}.` };
    categoryIds.add(category.id);
  }

  const siteIds = new Set<string>();
  for (const site of data.websites) {
    if (siteIds.has(site.id)) return { ok: false, error: `Duplicate site id ${site.id}.` };
    if (!categoryIds.has(site.categoryId)) {
      return { ok: false, error: `${site.name} points at a missing galaxy.` };
    }
    siteIds.add(site.id);
  }

  const linkKeys = new Set<string>();
  for (const link of data.connections) {
    if (link.sourceId === link.targetId) return { ok: false, error: "A link cannot point at itself." };
    if (!siteIds.has(link.sourceId) || !siteIds.has(link.targetId)) {
      return { ok: false, error: "A link points at a missing site." };
    }
    const key = `${link.sourceId}|${link.targetId}|${link.type}`;
    if (linkKeys.has(key)) return { ok: false, error: "Duplicate link." };
    linkKeys.add(key);
  }

  return { ok: true, data };
}
