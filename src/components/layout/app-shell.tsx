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
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 p-3 sm:p-5 lg:gap-6">
        <aside
          className={cn(
            "glass-panel fixed inset-y-3 left-3 z-40 w-[280px] overflow-hidden lg:static lg:block",
            open ? "block" : "hidden lg:block",
          )}
        >
          <div className="grid-paper h-full p-5">
            <div className="rounded-[28px] border border-ink-100 bg-white/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint-700">
                Sicherheitsmodus
              </p>
              <h1 className="mt-3 font-display text-4xl text-ink-900">WerkstattCRM</h1>
              <p className="mt-3 text-sm text-ink-700">
                Demo ohne Login, vorbereitet fuer Supabase RLS, Audit-Trail und Vercel-Deployment.
              </p>
              <div className="mt-4 rounded-2xl bg-mint-50 p-3 text-sm text-mint-900">
                <div className="flex items-center gap-2 font-semibold">
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
                        ? "bg-ink-900 text-white shadow-lg"
                        : "bg-white/70 text-ink-800 hover:bg-white",
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Button className="lg:hidden" onClick={() => setOpen((current) => !current)} variant="ghost">
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">
                    CRM Suite
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">{title}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-ink-700">{description}</p>
                </div>
              </div>
              {actions ? <div className="flex flex-wrap justify-end gap-2">{actions}</div> : null}
            </div>
          </header>
          <main className="pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
