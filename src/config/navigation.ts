import type { Route } from "next";
import {
  Activity,
  CalendarDays,
  Cog,
  ContactRound,
  FileArchive,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  ReceiptText,
  Target,
  Users,
} from "lucide-react";

export const navigationItems: Array<{
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kunden", label: "Kunden", icon: Users },
  { href: "/kontakte", label: "Kontakte", icon: ContactRound },
  { href: "/pipeline", label: "Pipeline", icon: Target },
  { href: "/angebote", label: "Angebote", icon: FileText },
  { href: "/rechnungen", label: "Rechnungen", icon: ReceiptText },
  { href: "/projekte", label: "Projekte", icon: FolderKanban },
  { href: "/aufgaben", label: "Aufgaben", icon: ListTodo },
  { href: "/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/dokumente", label: "Dokumente", icon: FileArchive },
  { href: "/aktivitaeten", label: "Aktivitaeten", icon: Activity },
  { href: "/einstellungen", label: "Einstellungen", icon: Cog },
];
