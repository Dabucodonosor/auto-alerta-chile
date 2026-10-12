import { createFileRoute, Link } from "@tanstack/react-router";
import { Estado } from "@/components/Estado";
import { clp, diasHasta, fecha, km, useStore } from "@/lib/store";
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Calendar,
  Wrench,
  FileText,
  CheckCircle2,
} from "lucide-react";

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

function Inicio() {
  const { datos } = useStore();
  const v = datos.vehiculo;
  const kmActual = v.km || 0;

  // Documentos ordenados por fecha de vencimiento
  const docs = [...datos.documentos].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  const docsAlertas = docs.filter((d) => diasHasta(d.vencimiento) <= 30);

  // Mantenciones con próximo kilometraje definido
  const mantencionesConProximo = datos.mantenciones.filter(
    (m) => typeof m.proximoKm === "number" && m.proximoKm > 0
  );

  // Mantención vencida: kilometraje actual alcanza o supera el previsto
  const mantencionesVencidas = mantencionesConProximo.filter(
    (m) => kmActual >= m.proximoKm!
  );

  // Próxima mantención: faltan 500 km o menos
  const mantencionesProximas = mantencionesConProximo.filter(
    (m) => m.proximoKm! > kmActual && m.proximoKm! - kmActual <= 500
  );

  const mes = new Date().toISOString().slice(0, 7);
  const anio = mes.slice(0, 4);
  const todos = [
    ...datos.gastos.map((g) => ({ f: g.fecha, m: g.monto })),
    ...datos.mantenciones.map((m) => ({ f: m.fecha, m: m.costo })),
  ];
  const gMes = todos.filter((x) => x.f.startsWith(mes)).reduce((s, x) => s + x.m, 0);
  const gAnio = todos.filter((x) => x.f.startsWith(anio)).reduce((s, x) => s + x.m, 0);

  const totalAlertas = docsAlertas.length + mantencionesVencidas.length + mantencionesProximas.length;

  return (
    <div className="space-y-6">
      {/* Resumen del Vehículo (Hero Card en Azul Petróleo) */}
      <section className="hero-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              Vehículo en seguimiento
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {v.marca} {v.modelo} <span className="text-white/60 font-normal">{v.anio}</span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="plate">{v.patente}</span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 backdrop-blur-sm px-3 py-1 text-sm font-medium text-white border border-white/10">
                {km(kmActual)}
              </span>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between border-t border-white/10 pt-3 md:border-0 md:pt-0">
            <Link
              to="/vehiculo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              Actualizar kilometraje →
            </Link>
          </div>
        </div>
      </section>

      {/* Alertas Críticas o Próximas de Mantención */}
      {(mantencionesVencidas.length > 0 || mantencionesProximas.length > 0) && (
        <section className="space-y-3">
          {/* Mantención Vencida (Alcanzó o superó el kilometraje) */}
          {mantencionesVencidas.map((m) => {
            const excedido = kmActual - m.proximoKm!;
            return (
              <div
                key={`vencida-${m.id}`}
                className="card flex items-start justify-between gap-4 p-4 border-l-4 border-l-destructive bg-destructive/5"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-destructive/15 p-2 text-destructive shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-danger">Mantención Vencida</span>
                      <span className="text-xs text-muted-foreground">Excedida por {km(excedido)}</span>
                    </div>
                    <p className="font-semibold text-foreground mt-1">{m.trabajo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Programada a los {km(m.proximoKm!)} (kilometraje actual del vehículo: {km(kmActual)})
                    </p>
                  </div>
                </div>
                <Link
                  to="/mantenciones"
                  className="btn-ghost shrink-0 text-xs text-foreground font-medium"
                >
                  Ver mantención
                </Link>
              </div>
            );
          })}

          {/* Próxima Mantención (≤ 500 km restantes) */}
          {mantencionesProximas.map((m) => {
            const restante = m.proximoKm! - kmActual;
            return (
              <div
                key={`proxima-${m.id}`}
                className="card flex items-start justify-between gap-4 p-4 border-l-4 border-l-warning bg-warning/5"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-warning/20 p-2 text-warning shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-warn">Próxima Mantención</span>
                      <span className="text-xs font-semibold text-foreground">Faltan {km(restante)}</span>
                    </div>
                    <p className="font-semibold text-foreground mt-1">{m.trabajo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prevista para los {km(m.proximoKm!)} (actual: {km(kmActual)})
                    </p>
                  </div>
                </div>
                <Link
                  to="/mantenciones"
                  className="btn-ghost shrink-0 text-xs text-foreground font-medium"
                >
                  Ver mantención
                </Link>
              </div>
            );
          })}
        </section>
      )}

      {/* Tarjetas de Métricas Clave */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Alertas activas
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-primary">{totalAlertas}</p>
            {totalAlertas === 0 ? (
              <span className="badge-ok inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Al día
              </span>
            ) : (
              <span className="badge-warn">{totalAlertas} pendientes</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {docsAlertas.length} en documentos · {mantencionesVencidas.length + mantencionesProximas.length} en mantenciones
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Gastos este mes
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{clp(gMes)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Combustible, mantenciones y otros</p>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Gastos acumulados {anio}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{clp(gAnio)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Total anual registrado</p>
        </div>
      </div>

      {/* Próximas Fechas Importantes (Documentos) */}
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Próximos vencimientos de documentos
            </h2>
          </div>
          <Link
            to="/documentos"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos ({docs.length})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {docs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
            No tienes documentos registrados todavía.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {docs.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="font-semibold text-foreground text-sm">{d.tipo}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    Vence el {fecha(d.vencimiento)}
                  </p>
                </div>
                <Estado dias={diasHasta(d.vencimiento)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Próximas Mantenciones Programadas */}
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Control de mantenciones por kilometraje
            </h2>
          </div>
          <Link
            to="/mantenciones"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {mantencionesConProximo.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
            No has configurado un próximo kilometraje en tus mantenciones todavía.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {mantencionesConProximo.map((m) => {
              const diffKm = m.proximoKm! - kmActual;
              const vencida = diffKm <= 0;
              const proxima = diffKm > 0 && diffKm <= 500;

              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{m.trabajo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prevista a los {km(m.proximoKm!)} · Realizada en {fecha(m.fecha)}
                    </p>
                  </div>
                  <div>
                    {vencida ? (
                      <span className="badge-danger">Vencida (+{km(Math.abs(diffKm))})</span>
                    ) : proxima ? (
                      <span className="badge-warn">Próxima (-{km(diffKm)})</span>
                    ) : (
                      <span className="badge-neutral">En {km(diffKm)}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
