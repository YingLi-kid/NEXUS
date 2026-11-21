import { parseNexus } from "@/services/nexus-schema";
import type { NexusData } from "@/types/nexus";

export async function fetchSeed(): Promise<NexusData> {
  const response = await fetch("/data/nexus.json");
  if (!response.ok) throw new Error("Could not read the universe seed.");
  const json: unknown = await response.json();
  const parsed = parseNexus(json);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.data;
}
