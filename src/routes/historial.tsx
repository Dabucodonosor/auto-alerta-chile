import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { clp, fecha, km, useStore } from "@/lib/store";
import { Wrench, Receipt, FileText, History, Calendar } from "lucide-react";

export const Route = createFileRoute("/historial")({
  head: () => ({
    meta: [
      { title: "Historial — AutoAlerta" },
      { name: "description", content: "Lista cronológica de todas las operaciones registradas." },
      { property: "og:title", content: "Historial — AutoAlerta" },
      { property: "og:description", content: "Todo lo que ha pasado con tu auto." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { datos } = useStore();
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "mantencion" | "gasto" | "documento">("todos");

  const eventos = [
    ...datos.mantenciones.map((m) => ({
      id: m.id,
      f: m.fecha,
      iconType: "mantencion" as const,
      tipo: "Mantención",
      txt: `${m.trabajo} · ${km(m.km)}`,
      monto: m.costo,
    })),
    ...datos.gastos.map((g) => ({
      id: g.id,
      f: g.fecha,
      iconType: "gasto" as const,
      tipo: g.categoria,
      txt: g.descripcion,
      monto: g.monto,
    })),
    ...datos.documentos.map((d) => ({
      id: d.id,
      f: d.vencimiento,
      iconType: "documento" as const,
      tipo: "Vencimiento",
      txt: d.tipo,
      monto: null as number | null,
    })),
  ].sort((a, b) => b.f.localeCompare(a.f));

  const filtrados = eventos.filter((e) => {
    if (filtroTipo === "mantencion") return e.iconType === "mantencion";
    if (filtroTipo === "gasto") return e.iconType === "gasto";
    if (filtroTipo === "documento") return e.iconType === "documento";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Historial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Línea de tiempo cronológica de operaciones, servicios y vencimientos de tu auto.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFiltroTipo("todos")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filtroTipo === "todos"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({eventos.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo("mantencion")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filtroTipo === "mantencion"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Mantenciones
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo("gasto")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filtroTipo === "gasto"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Gastos
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo("documento")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filtroTipo === "documento"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Vencimientos
          </button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="card p-10 text-center text-muted-foreground border-dashed">
          No hay registros en esta categoría de historial.
        </div>
      ) : (
        <ol className="relative space-y-4 border-l-2 border-border/80 pl-6 ml-3">
          {filtrados.map((e) => (
            <li key={e.id} className="relative group">
              <span className="absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-sm group-hover:border-primary transition-colors">
                {e.iconType === "mantencion" ? (
                  <Wrench className="h-4 w-4 text-primary" />
                ) : e.iconType === "gasto" ? (
                  <Receipt className="h-4 w-4 text-accent" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </span>

              <div className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-primary/40 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="badge-neutral text-[11px] font-semibold">{e.tipo}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {fecha(e.f)}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm mt-1">{e.txt || "—"}</p>
                </div>
                {e.monto !== null && (
                  <p className="font-display font-bold text-foreground text-base">{clp(e.monto)}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
