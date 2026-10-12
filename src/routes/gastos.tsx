import { createFileRoute } from "@tanstack/react-router";
import { Crud, upsert } from "@/components/Crud";
import { clp, fecha, uid, useStore, type Gasto } from "@/lib/store";

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
  const totales = cats
    .map((c) => ({ c, t: datos.gastos.filter((g) => g.categoria === c).reduce((s, g) => s + g.monto, 0) }))
    .filter((x) => x.t > 0);
  return (
    <div className="space-y-6">
      {totales.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {totales.map((x) => (
            <div key={x.c} className="card p-4">
              <p className="text-xs text-muted-foreground">{x.c}</p>
              <p className="font-display text-lg font-bold">{clp(x.t)}</p>
            </div>
          ))}
        </div>
      )}
      <Crud<Gasto>
        titulo="Gastos"
        descripcion="Todos los costos asociados a tu vehículo."
        items={items}
        newId={uid}
        vacio={() => ({ categoria: cats[0]!, descripcion: "", fecha: new Date().toISOString().slice(0, 10), monto: 0 })}
        campos={[
          { key: "categoria", label: "Categoría", type: "select", options: cats },
          { key: "descripcion", label: "Descripción", type: "text" },
          { key: "fecha", label: "Fecha", type: "date", required: true },
          { key: "monto", label: "Monto (CLP)", type: "number", required: true },
        ]}
        render={(g) => (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{g.categoria}{g.descripcion && <span className="font-normal text-muted-foreground"> · {g.descripcion}</span>}</p>
              <p className="text-sm text-muted-foreground">{fecha(g.fecha)}</p>
            </div>
            <p className="font-display font-bold">{clp(g.monto)}</p>
          </div>
        )}
        onSave={(it, n) => set((d) => ({ ...d, gastos: upsert(d.gastos, it, n) }))}
        onDelete={(id) => set((d) => ({ ...d, gastos: d.gastos.filter((x) => x.id !== id) }))}
      />
    </div>
  );
}
