import { createFileRoute } from "@tanstack/react-router";
import { UniversePage } from "@/features/universe/UniversePage";

/**
 * Titles are owned by the root route's language-aware effect, so every page
 * renders its title in the current language instead of a hard-coded English one.
 */
export const Route = createFileRoute("/")({
  component: UniversePage,
});
