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
  const items = [...datos.mantenciones].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <Crud<Mantencion>
      titulo="Mantenciones"
      descripcion="Trabajos realizados a tu vehículo."
      items={items}
      newId={uid}
      vacio={() => ({ trabajo: "", fecha: new Date().toISOString().slice(0, 10), km: datos.vehiculo.km, costo: 0 })}
      campos={[
        { key: "trabajo", label: "Trabajo realizado", type: "text", required: true },
        { key: "fecha", label: "Fecha", type: "date", required: true },
        { key: "km", label: "Kilometraje", type: "number", required: true },
        { key: "costo", label: "Costo (CLP)", type: "number", required: true },
      ]}
      render={(m) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold">{m.trabajo}</p>
            <p className="text-sm text-muted-foreground">{fecha(m.fecha)} · {km(m.km)}</p>
          </div>
          <p className="font-display font-bold">{clp(m.costo)}</p>
        </div>
      )}
      onSave={(it, n) => set((d) => ({ ...d, mantenciones: upsert(d.mantenciones, it, n) }))}
      onDelete={(id) => set((d) => ({ ...d, mantenciones: d.mantenciones.filter((x) => x.id !== id) }))}
    />
  );
}
