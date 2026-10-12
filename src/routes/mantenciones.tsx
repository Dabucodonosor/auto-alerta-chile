import { createFileRoute } from "@tanstack/react-router";
import { Crud, upsert } from "@/components/Crud";
import { clp, fecha, km, uid, useStore, type Mantencion } from "@/lib/store";

export const Route = createFileRoute("/mantenciones")({
  head: () => ({
    meta: [
      { title: "Mantenciones — AutoAlerta" },
      { name: "description", content: "Registro de mantenciones con fecha, kilometraje y costo." },
      { property: "og:title", content: "Mantenciones — AutoAlerta" },
      { property: "og:description", content: "Lleva el control de las mantenciones de tu auto." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { datos, set } = useStore();
  const kmActual = datos.vehiculo.km || 0;
  const items = [...datos.mantenciones].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <Crud<Mantencion>
      titulo="Mantenciones"
      descripcion="Registro de servicios realizados y próximos cambios de tu vehículo."
      items={items}
      newId={uid}
      vacio={() => ({
        trabajo: "",
        fecha: new Date().toISOString().slice(0, 10),
        km: datos.vehiculo.km,
        costo: 0,
      })}
      campos={[
        { key: "trabajo", label: "Trabajo realizado", type: "text", required: true, placeholder: "Ej: Cambio de aceite y filtro" },
        { key: "fecha", label: "Fecha", type: "date", required: true },
        { key: "km", label: "Kilometraje realizado", type: "number", required: true, placeholder: "Ej: 65000" },
        { key: "costo", label: "Costo (CLP)", type: "number", required: true, placeholder: "Ej: 45000" },
        {
          key: "proximoKm",
          label: "Kilometraje de la próxima mantención",
          type: "number",
          required: false,
          placeholder: "Ej: 75000",
          helperText: "Opcional. Te notificará automáticamente en Inicio al acercarte o alcanzar este kilometraje.",
        },
      ]}
      render={(m) => {
        const tieneProximo = typeof m.proximoKm === "number" && m.proximoKm > 0;
        const diffKm = tieneProximo ? m.proximoKm! - kmActual : null;
        const estaVencida = diffKm !== null && diffKm <= 0;
        const estaProxima = diffKm !== null && diffKm > 0 && diffKm <= 500;

        return (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground text-base">{m.trabajo}</p>
                {tieneProximo && (
                  estaVencida ? (
                    <span className="badge-danger">
                      Próxima a los {km(m.proximoKm!)} (Vencida por {km(Math.abs(diffKm!))})
                    </span>
                  ) : estaProxima ? (
                    <span className="badge-warn">
                      Próxima a los {km(m.proximoKm!)} (Faltan {km(diffKm!)})
                    </span>
                  ) : (
                    <span className="badge-neutral">
                      Próxima: {km(m.proximoKm!)} (Faltan {km(diffKm!)})
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {fecha(m.fecha)} · Realizada a los {km(m.km)}
              </p>
            </div>
            <p className="font-display font-bold text-foreground text-lg">{clp(m.costo)}</p>
          </div>
        );
      }}
      onSave={(it, n) => set((d) => ({ ...d, mantenciones: upsert(d.mantenciones, it, n) }))}
      onDelete={(id) => set((d) => ({ ...d, mantenciones: d.mantenciones.filter((x) => x.id !== id) }))}
    />
  );
}
