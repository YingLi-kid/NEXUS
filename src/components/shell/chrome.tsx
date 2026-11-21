import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Menu, Orbit, SlidersHorizontal, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LanguageToggle } from "@/components/shell/language-toggle";
import { useI18n } from "@/lib/use-i18n";
import { retryBootstrap } from "@/stores/nexus-store";
import { cn } from "@/utils/cn";

const LINKS = [
  { to: "/", key: "nav.universe", icon: Orbit, exact: true },
  { to: "/explorer", key: "nav.explorer", icon: Compass, exact: false },
  { to: "/control", key: "nav.control", icon: SlidersHorizontal, exact: false },
  { to: "/about", key: "nav.about", icon: UserRound, exact: false },
] as const;

export function Brand() {
  const { t } = useI18n();
  return (
    <Link to="/" className="focus-ring flex items-center gap-3 rounded-2xl pr-2">
      <span className="grid size-9 place-items-center rounded-full bg-cyan text-sm font-semibold text-bg">N</span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight">NEXUS</span>
        <span className="hidden text-xs text-muted sm:block">{t("brand.tagline")}</span>
      </span>
    </Link>
  );
}

export function PrimaryNav({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { t } = useI18n();
  return (
    <nav className={cn(vertical ? "grid gap-1" : "flex items-center gap-1")}>
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.to : pathname === link.to || pathname.startsWith(`${link.to}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={cn(
              "focus-ring inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm",
              active ? "bg-elev-2 text-cyan" : "text-muted hover:text-fg",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="focus-ring grid size-11 place-items-center rounded-full text-fg"
        aria-expanded={open}
        aria-label={t(open ? "menu.close" : "menu.open")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div className="glass fixed inset-x-3 top-16 z-40 rounded-3xl p-3">
          <PrimaryNav vertical onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

export function PageHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Brand />
        <div className="ml-auto hidden lg:block">
          <PrimaryNav />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <LanguageToggle />
          <MobileNav />
        </div>
        {children}
      </div>
    </header>
  );
}

export function BootScreen() {
  const { t } = useI18n();
  return (
    <main className="page-sky grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-4xl font-semibold tracking-tight">NEXUS</p>
        <p className="mt-3 text-sm text-muted">{t("boot.label")}</p>
      </div>
    </main>
  );
}

export function LoadError({ message }: { message: string }) {
  const { t, tp } = useI18n();
  return (
    <main className="page-sky grid min-h-dvh place-items-center px-6">
      <div className="glass max-w-md rounded-3xl p-6 text-center">
        <h1 className="font-display text-2xl">{t("error.unavailable.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{tp(message)}</p>
        <button
          type="button"
          className="focus-ring mt-5 inline-flex h-11 items-center rounded-full bg-cyan px-4 text-sm font-semibold text-bg"
          onClick={() => void retryBootstrap()}
        >
          {t("error.retry")}
        </button>
      </div>
    </main>
  );
}

export function WebGLFallback({ message }: { message: string }) {
  const { t, tp } = useI18n();
  return (
    <div className="absolute inset-0 grid place-items-center px-6">
      <div className="glass max-w-md rounded-3xl p-6 text-center">
        <h2 className="font-display text-2xl">{t("webgl.title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{tp(message)}</p>
        <Link
          to="/explorer"
          className="focus-ring mt-5 inline-flex h-11 items-center rounded-full bg-cyan px-4 text-sm font-semibold text-bg"
        >
          {t("webgl.explorer")}
        </Link>
      </div>
    </div>
  );
}
