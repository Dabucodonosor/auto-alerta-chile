import { createFileRoute } from "@tanstack/react-router";
import { Crud, upsert } from "@/components/Crud";
import { clp, fecha, uid, useStore, type Gasto } from "@/lib/store";
import { Receipt, TrendingUp, Tag, Fuel, Wrench, Shield, Car } from "lucide-react";

export const Route = createFileRoute("/gastos")({
  head: () => ({
    meta: [
      { title: "Gastos — AutoAlerta" },
      { name: "description", content: "Combustible, repuestos, reparaciones y otros gastos en CLP." },
      { property: "og:title", content: "Gastos — AutoAlerta" },
      { property: "og:description", content: "Controla cuánto gastas en tu auto." },
    ],
  }),
  component: Pagina,
});

const cats = ["Combustible", "Repuestos", "Reparaciones", "Peajes / TAG", "Estacionamiento", "Otros"];

function Pagina() {
  const { datos, set } = useStore();
  const items = [...datos.gastos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const totalGeneral = items.reduce((s, g) => s + g.monto, 0);

  const totales = cats
    .map((c) => ({ c, t: datos.gastos.filter((g) => g.categoria === c).reduce((s, g) => s + g.monto, 0) }))
    .filter((x) => x.t > 0);

  return (
    <div className="space-y-6">
      {/* Resumen de totales por categoría */}
      {totales.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distribución de gastos</p>
            <p className="text-xs font-semibold text-foreground">Total histórico: {clp(totalGeneral)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {totales.map((x) => (
              <div key={x.c} className="card p-3.5 hover:border-primary/30 transition-colors">
                <p className="text-xs text-muted-foreground truncate font-medium">{x.c}</p>
                <p className="font-display text-base font-bold text-foreground mt-1">{clp(x.t)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Crud<Gasto>
        titulo="Gastos"
        descripcion="Registra y controla todos los desembolsos asociados a tu automóvil en pesos chilenos."
        items={items}
        newId={uid}
        vacio={() => ({ categoria: cats[0]!, descripcion: "", fecha: new Date().toISOString().slice(0, 10), monto: 0 })}
        campos={[
          { key: "categoria", label: "Categoría del gasto", type: "select", options: cats },
          { key: "descripcion", label: "Descripción / Detalle", type: "text", placeholder: "Ej: Carga de 95 octanos Copec" },
          { key: "fecha", label: "Fecha del gasto", type: "date", required: true },
          { key: "monto", label: "Monto total (CLP)", type: "number", required: true, placeholder: "Ej: 35000" },
        ]}
        render={(g) => (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="badge-neutral font-semibold">{g.categoria}</span>
                {g.descripcion && <span className="font-medium text-foreground text-sm">{g.descripcion}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{fecha(g.fecha)}</p>
            </div>
            <p className="font-display font-bold text-foreground text-lg">{clp(g.monto)}</p>
          </div>
        )}
        onSave={(it, n) => set((d) => ({ ...d, gastos: upsert(d.gastos, it, n) }))}
        onDelete={(id) => set((d) => ({ ...d, gastos: d.gastos.filter((x) => x.id !== id) }))}
      />
    </div>
  );
}
