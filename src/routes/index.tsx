import { createFileRoute, Link } from "@tanstack/react-router";
import { clp, diasHasta, fecha, km, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — AutoAlerta" },
      { name: "description", content: "Resumen de tu vehículo, vencimientos y gastos en Chile." },
      { property: "og:title", content: "AutoAlerta" },
      { property: "og:description", content: "Gestiona documentos, mantenciones y gastos de tu auto." },
    ],
  }),
  component: Inicio,
});

export function Estado({ dias }: { dias: number }) {
  const cls = dias < 0 ? "badge-danger" : dias <= 30 ? "badge-warn" : "badge-ok";
  const txt = dias < 0 ? `Vencido hace ${-dias} días` : dias === 0 ? "Vence hoy" : `En ${dias} días`;
  return <span className={cls}>{txt}</span>;
}

function Inicio() {
  const { datos } = useStore();
  const v = datos.vehiculo;
  const docs = [...datos.documentos].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  const mes = new Date().toISOString().slice(0, 7);
  const anio = mes.slice(0, 4);
  const todos = [
    ...datos.gastos.map((g) => ({ f: g.fecha, m: g.monto })),
    ...datos.mantenciones.map((m) => ({ f: m.fecha, m: m.costo })),
  ];
  const gMes = todos.filter((x) => x.f.startsWith(mes)).reduce((s, x) => s + x.m, 0);
  const gAnio = todos.filter((x) => x.f.startsWith(anio)).reduce((s, x) => s + x.m, 0);
  const alertas = docs.filter((d) => diasHasta(d.vencimiento) <= 30).length;

  return (
    <div className="space-y-6">
      <section className="hero-card">
        <p className="text-sm uppercase tracking-widest opacity-70">Mi vehículo</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {v.marca} {v.modelo} <span className="opacity-60">{v.anio}</span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="plate">{v.patente}</span>
          <span className="rounded-md bg-background/15 px-3 py-1">{km(v.km)}</span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Alertas (≤ 30 días)</p>
          <p className="font-display text-3xl font-bold text-primary">{alertas}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Gastos este mes</p>
          <p className="font-display text-3xl font-bold">{clp(gMes)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Gastos {anio}</p>
          <p className="font-display text-3xl font-bold">{clp(gAnio)}</p>
        </div>
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Próximas fechas importantes</h2>
          <Link to="/documentos" className="text-sm text-primary">Ver todo →</Link>
        </div>
        {docs.length === 0 && <p className="text-muted-foreground">Sin documentos registrados.</p>}
        <ul className="divide-y">
          {docs.slice(0, 5).map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{d.tipo}</p>
                <p className="text-sm text-muted-foreground">{fecha(d.vencimiento)}</p>
              </div>
              <Estado dias={diasHasta(d.vencimiento)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
