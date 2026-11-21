import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { BootScreen, LoadError } from "@/components/shell/chrome";
import { translate, type Lang } from "@/lib/i18n";
import { bootstrapNexus } from "@/stores/nexus-store";
import { useNexus } from "@/stores/nexus-store";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NEXUS — Personal Digital Universe" },
      {
        name: "description",
        content: "A personal 3D universe for sites, projects, notes, and profiles.",
      },
      { name: "theme-color", content: "#050812" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootComponent,
});

const ROUTE_TITLES: Array<[string, string]> = [
  ["/explorer", "title.explorer"],
  ["/control", "title.control"],
  ["/about", "title.about"],
];

function titleFor(pathname: string, lang: Lang): string {
  const route = ROUTE_TITLES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return translate(lang, route ? route[1] : "title.app");
}

function RootComponent() {
  useEffect(() => {
    void bootstrapNexus();
  }, []);
  const ready = useNexus((state) => state.ready);
  const loadError = useNexus((state) => state.loadError);
  const lang = useNexus((state) => state.lang);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = titleFor(pathname, lang);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", translate(lang, "meta.description"));
  }, [lang, pathname]);

  return (
    <html lang={lang === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          {loadError ? <LoadError message={loadError} /> : ready ? <Outlet /> : <BootScreen />}
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
