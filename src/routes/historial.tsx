import { createFileRoute } from "@tanstack/react-router";
import { clp, fecha, km, useStore } from "@/lib/store";

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
  const eventos = [
    ...datos.mantenciones.map((m) => ({ id: m.id, f: m.fecha, icon: "🔧", tipo: "Mantención", txt: `${m.trabajo} · ${km(m.km)}`, monto: m.costo })),
    ...datos.gastos.map((g) => ({ id: g.id, f: g.fecha, icon: "💸", tipo: g.categoria, txt: g.descripcion, monto: g.monto })),
    ...datos.documentos.map((d) => ({ id: d.id, f: d.vencimiento, icon: "📄", tipo: "Vencimiento", txt: d.tipo, monto: null as number | null })),
  ].sort((a, b) => b.f.localeCompare(a.f));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Historial</h1>
      <p className="mb-6 text-muted-foreground">Operaciones registradas, de la más reciente a la más antigua.</p>
      <ol className="relative space-y-4 border-l-2 border-border pl-6">
        {eventos.map((e) => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full bg-card text-sm shadow">{e.icon}</span>
            <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="text-xs text-muted-foreground">{fecha(e.f)} · {e.tipo}</p>
                <p className="font-medium">{e.txt || "—"}</p>
              </div>
              {e.monto !== null && <p className="font-display font-bold">{clp(e.monto)}</p>}
            </div>
          </li>
        ))}
        {eventos.length === 0 && <p className="text-muted-foreground">Sin registros.</p>}
      </ol>
    </div>
  );
}
