import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { useI18n } from "@/lib/use-i18n";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "";
}

/**
 * Router-level crash screen. Titles and the empty-state body come from the
 * dictionary; a thrown exception keeps its own text because that line is the
 * only useful debugging hint.
 */
export function AppErrorComponent({ error }: ErrorComponentProps) {
  const { t } = useI18n();
  const detail = errorMessage(error);

  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">{t("error.generic.title")}</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        {detail || t("error.generic.body")}
      </p>
    </main>
  );
}
