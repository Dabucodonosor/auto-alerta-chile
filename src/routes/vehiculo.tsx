import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, type Vehiculo } from "@/lib/store";

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
  const campo = (k: keyof Vehiculo, label: string, type = "text") => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        className="input"
        type={type}
        required
        value={v[k]}
        onChange={(e) => setV({ ...v, [k]: type === "number" ? Number(e.target.value) : k === "patente" ? e.target.value.toUpperCase() : e.target.value })}
      />
    </label>
  );
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Mi vehículo</h1>
      <p className="mb-6 text-muted-foreground">Mantén actualizados los datos de tu auto.</p>
      <form
        className="card grid gap-4 p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          set((d) => ({ ...d, vehiculo: v }));
          setOk(true);
          setTimeout(() => setOk(false), 2000);
        }}
      >
        {campo("marca", "Marca")}
        {campo("modelo", "Modelo")}
        {campo("anio", "Año", "number")}
        {campo("patente", "Patente (ej: ABCD-12)")}
        {campo("km", "Kilometraje actual", "number")}
        <div className="flex items-end gap-3 sm:col-span-2">
          <button className="btn-primary">Guardar cambios</button>
          {ok && <span className="text-sm text-success">✓ Guardado</span>}
        </div>
      </form>
    </div>
  );
}
