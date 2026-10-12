import { createFileRoute, Link } from "@tanstack/react-router";
import { Estado } from "@/components/Estado";
import { clp, diasHasta, fecha, km, useStore } from "@/lib/store";
import { obtenerImagenVehiculo } from "@/lib/vehiculo-fotos";
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Calendar,
  Wrench,
  FileText,
  CheckCircle2,
  Gauge,
  Palette,
  Camera,
  Plus,
  Receipt,
  Car,
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
  const infoImg = obtenerImagenVehiculo(v);

  // Documentos ordenados por fecha de vencimiento
  const docs = [...datos.documentos].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  const docsVencidos = docs.filter((d) => diasHasta(d.vencimiento) < 0);
  const docsProximos = docs.filter((d) => diasHasta(d.vencimiento) >= 0 && diasHasta(d.vencimiento) <= 30);

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

  const mesActual = new Date().toISOString().slice(0, 7);
  const gastosMes = datos.gastos
    .filter((g) => g.fecha.startsWith(mesActual))
    .reduce((s, g) => s + g.monto, 0);

  const totalAlertasCriticas = docsVencidos.length + mantencionesVencidas.length;
  const totalAvisosPreventivos = docsProximos.length + mantencionesProximas.length;

  return (
    <div className="space-y-6">
      {/* 1. Tarjeta Principal del Vehículo con su Fotografía */}
      <section className="card overflow-hidden border border-border shadow-md bg-card">
        <div className="grid md:grid-cols-12 gap-0 items-center">
          {/* Fotografía o ilustración del vehículo */}
          <div className="md:col-span-5 relative bg-secondary/40 flex items-center justify-center min-h-[200px] md:min-h-[240px] p-4 border-b md:border-b-0 md:border-r border-border">
            <img
              src={infoImg.url}
              alt={`${v.marca || "Vehículo"} ${v.modelo || ""}`}
              className="max-h-[200px] w-auto max-w-full object-contain rounded-lg drop-shadow-md"
            />
            <div className="absolute top-3 left-3">
              {infoImg.tipo === "propia" ? (
                <span className="badge-ok font-semibold text-[11px] shadow-sm">
                  ✓ Foto propia
                </span>
              ) : infoImg.tipo === "modelo" ? (
                <span className="badge-neutral font-semibold text-[11px] shadow-sm">
                  Modelo representativo
                </span>
              ) : (
                <span className="badge-neutral text-[11px] shadow-sm">
                  Ilustración genérica
                </span>
              )}
            </div>
          </div>

          {/* Información principal del vehículo */}
          <div className="md:col-span-7 p-5 md:p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                Mi vehículo
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-0.5">
                {v.marca || "Vehículo"} {v.modelo || ""} <span className="font-normal text-muted-foreground text-xl">({v.anio || "—"})</span>
              </h1>

              {/* Fila de especificaciones y placa */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                <span className="plate">{v.patente || "SIN-PAT"}</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  {km(kmActual)}
                </span>
                {v.color && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                    <Palette className="h-3.5 w-3.5 text-accent" />
                    Color: {v.color}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
              <Link
                to="/vehiculo"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Editar vehículo o foto →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sección de Alertas Prioritarias (Vencidas y Próximas) */}
      {(totalAlertasCriticas > 0 || totalAvisosPreventivos > 0) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span>Avisos y recordatorios activos</span>
            </h2>
          </div>

          {/* Documentos Vencidos (Alerta más visible) */}
          {docsVencidos.map((d) => (
            <div
              key={`doc-vencido-${d.id}`}
              className="card flex flex-wrap items-center justify-between gap-3 p-4 border-l-4 border-l-destructive bg-destructive/5"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/15 p-2 text-destructive shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-danger">Documento Vencido</span>
                    <span className="text-xs font-semibold text-destructive">
                      Venció hace {-diasHasta(d.vencimiento)} días
                    </span>
                  </div>
                  <p className="font-semibold text-foreground mt-0.5 text-sm">{d.tipo}</p>
                </div>
              </div>
              <Link to="/documentos" className="btn-ghost text-xs">
                Ver documento
              </Link>
            </div>
          ))}

          {/* Mantenciones Vencidas por Kilometraje */}
          {mantencionesVencidas.map((m) => {
            const excedido = kmActual - m.proximoKm!;
            return (
              <div
                key={`mant-vencida-${m.id}`}
                className="card flex flex-wrap items-center justify-between gap-3 p-4 border-l-4 border-l-destructive bg-destructive/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-destructive/15 p-2 text-destructive shrink-0">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-danger">Mantención Vencida</span>
                      <span className="text-xs font-semibold text-destructive">
                        Excedida por {km(excedido)}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground mt-0.5 text-sm">{m.trabajo}</p>
                    <p className="text-xs text-muted-foreground">
                      Prevista a los {km(m.proximoKm!)} (kilometraje actual: {km(kmActual)})
                    </p>
                  </div>
                </div>
                <Link to="/mantenciones" className="btn-ghost text-xs">
                  Ver mantención
                </Link>
              </div>
            );
          })}

          {/* Mantenciones Próximas (Faltan ≤ 500 km) */}
          {mantencionesProximas.map((m) => {
            const faltan = m.proximoKm! - kmActual;
            return (
              <div
                key={`mant-proxima-${m.id}`}
                className="card flex flex-wrap items-center justify-between gap-3 p-4 border-l-4 border-l-warning bg-warning/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-warning/20 p-2 text-warning shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-warn">Próxima Mantención</span>
                      <span className="text-xs font-semibold text-foreground">
                        Faltan {km(faltan)}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground mt-0.5 text-sm">{m.trabajo}</p>
                    <p className="text-xs text-muted-foreground">
                      Prevista a los {km(m.proximoKm!)} (actual: {km(kmActual)})
                    </p>
                  </div>
                </div>
                <Link to="/mantenciones" className="btn-ghost text-xs">
                  Ver mantención
                </Link>
              </div>
            );
          })}

          {/* Documentos Próximos a Vencer (Aviso preventivo discreto) */}
          {docsProximos.map((d) => (
            <div
              key={`doc-proximo-${d.id}`}
              className="card flex flex-wrap items-center justify-between gap-3 p-3.5 border-l-4 border-l-warning/70 bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-warning/15 p-1.5 text-warning shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-warn text-[10px]">Por Vencer</span>
                    <span className="text-xs text-muted-foreground">Vence el {fecha(d.vencimiento)}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{d.tipo}</p>
                </div>
              </div>
              <Estado dias={diasHasta(d.vencimiento)} />
            </div>
          ))}
        </section>
      )}

      {/* 3. Panel de Resumen de Gastos del Mes */}
      <section className="card p-5 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Gastos de este mes</h2>
          </div>
          <Link
            to="/gastos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Ver todos los gastos
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="font-display text-3xl font-bold text-foreground">{clp(gastosMes)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {gastosMes > 0
                ? "Total acumulado en combustible, mantenciones y otros este mes."
                : "No has registrado gastos durante el mes actual."}
            </p>
          </div>
          {gastosMes === 0 && (
            <Link to="/gastos" className="btn-ghost text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Registrar gasto</span>
            </Link>
          )}
        </div>
      </section>

      {/* 4. Lista de Documentos Registrados */}
      <section className="card p-5 border border-border">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Documentos del vehículo
            </h2>
          </div>
          <Link
            to="/documentos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Ver todos ({docs.length})
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {docs.length === 0 ? (
          <div className="py-6 text-center space-y-2 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">No tienes documentos registrados todavía.</p>
            <Link to="/documentos" className="btn-primary text-xs inline-flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Agregar permiso, SOAP o revisión técnica
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {docs.slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
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

      {/* 5. Próximas Mantenciones Programadas */}
      <section className="card p-5 border border-border">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Mantenciones y servicios
            </h2>
          </div>
          <Link
            to="/mantenciones"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Ver todas ({datos.mantenciones.length})
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {datos.mantenciones.length === 0 ? (
          <div className="py-6 text-center space-y-2 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">Sin mantenciones registradas aún.</p>
            <Link to="/mantenciones" className="btn-primary text-xs inline-flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Registrar cambio de aceite o revisión
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {datos.mantenciones.slice(0, 4).map((m) => {
              const tieneProximo = typeof m.proximoKm === "number" && m.proximoKm > 0;
              const diffKm = tieneProximo ? m.proximoKm! - kmActual : null;
              const vencida = diffKm !== null && diffKm <= 0;
              const proxima = diffKm !== null && diffKm > 0 && diffKm <= 500;

              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{m.trabajo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fecha(m.fecha)} · Realizada a los {km(m.km)}
                    </p>
                  </div>
                  <div>
                    {tieneProximo ? (
                      vencida ? (
                        <span className="badge-danger text-xs">Vencida (+{km(Math.abs(diffKm!))})</span>
                      ) : proxima ? (
                        <span className="badge-warn text-xs">Próxima (-{km(diffKm!)})</span>
                      ) : (
                        <span className="badge-neutral text-xs">En {km(diffKm!)}</span>
                      )
                    ) : (
                      <span className="text-xs font-bold text-foreground">{clp(m.costo)}</span>
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
