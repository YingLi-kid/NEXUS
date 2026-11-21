import { lazy, Suspense, useEffect, useState } from "react";
import { UniverseHud } from "@/features/universe/UniverseHud";

const UniverseScene = lazy(() => import("@/universe/UniverseScene"));

export function UniversePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative h-dvh overflow-hidden bg-bg text-fg">
      <div className="absolute inset-0">
        {mounted ? (
          <Suspense fallback={null}>
            <UniverseScene />
          </Suspense>
        ) : null}
      </div>
      <UniverseHud />
    </main>
  );
}
