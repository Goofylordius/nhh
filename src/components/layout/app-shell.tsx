"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Command,
  FolderKanban,
  MoonStar,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { navigationItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

const themeOptions: Array<{
  label: string;
  value: "deep" | "midnight" | "contrast";
}> = [
  { label: "Deep", value: "deep" },
  { label: "Midnight", value: "midnight" },
  { label: "Contrast", value: "contrast" },
];

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const { actorLabel, bootstrap, bootstrapLoading, themeMode, setThemeMode } = useAppContext();

  const filteredNavigation = useMemo(() => {
    if (!navQuery.trim()) {
      return navigationItems;
    }

    return navigationItems.filter((item) =>
      item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
    );
  }, [navQuery]);

  const workspaceStats = [
    {
      label: "Kunden",
      value: bootstrap?.customers.length ?? 0,
      icon: Users,
    },
    {
      label: "Projekte",
      value: bootstrap?.projects.length ?? 0,
      icon: FolderKanban,
    },
    {
      label: "Pipeline",
      value: bootstrap?.opportunities.length ?? 0,
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1780px] gap-4 p-3 sm:p-5 lg:gap-6">
        <aside
          className={cn(
            "glass-panel fixed inset-y-3 left-3 z-40 w-[320px] overflow-hidden lg:static lg:block xl:w-[348px]",
            open ? "block" : "hidden lg:block",
          )}
        >
          <div className="grid-paper flex h-full flex-col p-5">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint-300">
                  WerkstattCRM V2
                </p>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Demo
                </div>
              </div>
              <h1 className="mt-4 break-words font-display text-[clamp(2.4rem,3vw,3.35rem)] leading-[0.92] text-white">
                Deep Dark Operations Suite
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Ein kompakter CRM-Workspace für Vertrieb, Projekte, Dokumente und revisionssichere Nachvollziehbarkeit.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {workspaceStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
                      key={item.label}
                    >
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {bootstrapLoading ? "..." : item.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-mint-400/15 bg-mint-500/10 p-4 text-sm text-mint-100">
                <div className="flex items-center gap-2 font-semibold text-mint-200">
                  <ShieldCheck className="h-4 w-4" />
                  Aktiver Bearbeiter
                </div>
                <p className="mt-1">{actorLabel}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-white/10 bg-black/10 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Navigation suchen
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  className="pl-11"
                  onChange={(event) => setNavQuery(event.target.value)}
                  placeholder="Module, Seiten, Bereiche"
                  value={navQuery}
                />
              </div>
            </div>

            <nav aria-label="Hauptnavigation" className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredNavigation.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    className={cn(
                      "focus-ring flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-to-r from-mint-500 to-cyan-400 text-slate-950 shadow-[0_16px_44px_-18px_rgba(61,231,184,0.75)]"
                        : "border border-white/8 bg-white/[0.03] text-slate-200 hover:border-white/14 hover:bg-white/[0.06]",
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {active ? <Sparkles className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4 opacity-40" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <MoonStar className="h-4 w-4" />
                Appearance
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <button
                    className={cn(
                      "focus-ring rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                      themeMode === option.value
                        ? "border-mint-400/30 bg-mint-500/14 text-mint-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]",
                    )}
                    key={option.value}
                    onClick={() => setThemeMode(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Command className="h-4 w-4 text-cyan-300" />
                  Workspace-Hinweis
                </div>
                <p className="mt-1">
                  Nutze die Suche links für schnelle Modulwechsel und die Theme-Profile für unterschiedliche Lichtverhältnisse.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col gap-4">
          <header className="glass-panel overflow-hidden px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  className="lg:hidden"
                  onClick={() => setOpen((current) => !current)}
                  variant="ghost"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      CRM Suite V2
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Deep Darkmode
                    </span>
                  </div>
                  <h2 className="mt-3 break-words font-display text-[2.2rem] leading-tight text-white sm:text-[2.7rem]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{description}</p>
                </div>
              </div>

              <div className="xl:max-w-[42%]">
                {actions ? <div className="flex flex-wrap gap-2 xl:justify-end">{actions}</div> : null}
              </div>
            </div>
          </header>

          <main className="pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
