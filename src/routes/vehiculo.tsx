import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, type Vehiculo, km } from "@/lib/store";
import { Car, Check, Gauge, Sparkles } from "lucide-react";

export const Route = createFileRoute("/vehiculo")({
  head: () => ({
    meta: [
      { title: "Mi vehículo — AutoAlerta" },
      { name: "description", content: "Marca, modelo, año, patente y kilometraje de tu auto." },
      { property: "og:title", content: "Mi vehículo — AutoAlerta" },
      { property: "og:description", content: "Datos de tu vehículo." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { datos, set } = useStore();
  const [v, setV] = useState<Vehiculo>(datos.vehiculo);
  const [ok, setOk] = useState(false);

  useEffect(() => setV(datos.vehiculo), [datos.vehiculo]);

  const campo = (k: keyof Vehiculo, label: string, type = "text", placeholder = "") => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        className="input"
        type={type}
        required
        placeholder={placeholder}
        value={v[k]}
        onChange={(e) =>
          setV({
            ...v,
            [k]:
              type === "number"
                ? Number(e.target.value)
                : k === "patente"
                ? e.target.value.toUpperCase()
                : e.target.value,
          })
        }
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Mi vehículo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mantén al día la información técnica y el odómetro de tu automóvil.
        </p>
      </div>

      {/* Tarjeta de previsualización activa */}
      <div className="card p-5 bg-gradient-to-r from-card to-secondary/30 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-accent">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ficha activa</p>
            <h2 className="font-display text-xl font-bold text-foreground">
              {v.marca || "Vehículo"} {v.modelo} <span className="font-normal text-muted-foreground">({v.anio || "—"})</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="plate">{v.patente || "SIN-PAT"}</span>
          <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{km(v.km)}</span>
          </div>
        </div>
      </div>

      <form
        className="card grid gap-5 p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          set((d) => ({ ...d, vehiculo: v }));
          setOk(true);
          setTimeout(() => setOk(false), 3000);
        }}
      >
        {campo("marca", "Marca del fabricante", "text", "Ej: Toyota")}
        {campo("modelo", "Modelo", "text", "Ej: Yaris")}
        {campo("anio", "Año de fabricación", "number", "Ej: 2019")}
        {campo("patente", "Patente vehicular (Chile)", "text", "Ej: KTRS-42")}
        <div className="sm:col-span-2">
          {campo("km", "Kilometraje actual (Odómetro)", "number", "Ej: 68450")}
          <p className="mt-1.5 text-xs text-muted-foreground">
            💡 Al modificar el kilometraje actual, las alertas de mantención en Inicio se recalculan y actualizan automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2 sm:col-span-2">
          <button type="submit" className="btn-primary">
            Guardar cambios
          </button>
          {ok && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success animate-in fade-in">
              <Check className="h-4 w-4" /> ¡Guardado correctamente!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
