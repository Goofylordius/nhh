"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftOpen, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { navigationItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

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
  const { actorLabel } = useAppContext();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1720px] gap-4 p-3 sm:p-5 lg:gap-6">
        <aside
          className={cn(
            "glass-panel fixed inset-y-3 left-3 z-40 w-[300px] overflow-hidden lg:static lg:block xl:w-[320px]",
            open ? "block" : "hidden lg:block",
          )}
        >
          <div className="grid-paper h-full p-5">
            <div className="overflow-visible rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint-300">
                Sicherheitsmodus
              </p>
              <h1 className="mt-3 break-words font-display text-[clamp(2.2rem,3vw,3.1rem)] leading-[0.95] text-white">
                WerkstattCRM
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Demo ohne Login, vorbereitet für Supabase RLS, Audit-Trail und Vercel-Deployment.
              </p>
              <div className="mt-4 rounded-2xl border border-mint-400/15 bg-mint-500/10 p-3 text-sm text-mint-100">
                <div className="flex items-center gap-2 font-semibold text-mint-200">
                  <ShieldCheck className="h-4 w-4" />
                  Aktiver Bearbeiter
                </div>
                <p className="mt-1">{actorLabel}</p>
              </div>
            </div>
            <nav aria-label="Hauptnavigation" className="mt-4 space-y-2">
              {navigationItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    className={cn(
                      "focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-to-r from-mint-500 to-emerald-400 text-slate-950 shadow-[0_14px_40px_-16px_rgba(61,231,184,0.65)]"
                        : "bg-white/5 text-slate-200 hover:bg-white/10",
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col gap-4">
          <header className="glass-panel flex flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  className="lg:hidden"
                  onClick={() => setOpen((current) => !current)}
                  variant="ghost"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-300">
                    CRM Suite
                  </p>
                  <h2 className="mt-2 break-words font-display text-3xl leading-tight text-white sm:text-4xl">
                    {title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
                </div>
              </div>
              {actions ? <div className="flex flex-wrap gap-2 xl:justify-end">{actions}</div> : null}
            </div>
          </header>
          <main className="pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
