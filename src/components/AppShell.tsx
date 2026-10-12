import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  Car,
  FileText,
  Wrench,
  Receipt,
  History,
  RotateCcw,
} from "lucide-react";

const nav = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/vehiculo", label: "Vehículo", icon: Car },
  { to: "/documentos", label: "Documentos", icon: FileText },
  { to: "/mantenciones", label: "Mantención", icon: Wrench },
  { to: "/gastos", label: "Gastos", icon: Receipt },
  { to: "/historial", label: "Historial", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { datos, reset } = useStore();
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-6 text-sidebar-foreground md:flex border-r border-sidebar-border">
        <div className="mb-8">
          <div className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Auto<span className="text-accent">Alerta</span></span>
            <span className="h-2 w-2 rounded-full bg-accent inline-block animate-pulse" />
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-sidebar-accent px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-accent-foreground/90">
            {datos.vehiculo.patente}
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-all duration-150 hover:bg-sidebar-accent hover:text-white"
                activeProps={{ className: "bg-sidebar-accent !text-white font-semibold shadow-sm border-l-2 border-accent" }}
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 mt-auto border-t border-sidebar-border/60">
          <button
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground/90"
            onClick={() => confirm("¿Restaurar datos de demostración? Se perderán tus cambios locales.") && reset()}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar demo</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden shadow-sm">
        <div className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
          <span>Auto<span className="text-accent">Alerta</span></span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block" />
        </div>
        <span className="rounded bg-sidebar-accent px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-accent-foreground/90">
          {datos.vehiculo.patente}
        </span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-4 pb-28 md:p-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-card/95 backdrop-blur-md md:hidden shadow-lg safe-bottom">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "!text-primary !font-bold relative after:absolute after:top-0 after:h-0.5 after:w-8 after:bg-accent after:rounded-full" }}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[54px]">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
