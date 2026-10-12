import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const nav = [
  { to: "/", label: "Inicio", icon: "◉" },
  { to: "/vehiculo", label: "Vehículo", icon: "🚗" },
  { to: "/documentos", label: "Documentos", icon: "📄" },
  { to: "/mantenciones", label: "Mantención", icon: "🔧" },
  { to: "/gastos", label: "Gastos", icon: "💸" },
  { to: "/historial", label: "Historial", icon: "🕑" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { datos, reset } = useStore();
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-6 text-sidebar-foreground md:flex">
        <div className="mb-8">
          <div className="font-display text-2xl font-bold">
            Auto<span className="text-primary">Alerta</span>
          </div>
          <div className="text-sm opacity-70">{datos.vehiculo.patente}</div>
        </div>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 opacity-80 hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent !opacity-100 font-semibold" }}
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          className="mt-auto text-left text-xs opacity-60 hover:opacity-100"
          onClick={() => confirm("¿Restaurar datos de demostración? Se perderán tus cambios.") && reset()}
        >
          Restaurar datos de demostración
        </button>
      </aside>

      <header className="flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <div className="font-display text-xl font-bold">
          Auto<span className="text-primary">Alerta</span>
        </div>
        <span className="rounded bg-sidebar-accent px-2 py-1 text-xs font-mono">{datos.vehiculo.patente}</span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-4 pb-28 md:p-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t bg-card md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold" }}
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
