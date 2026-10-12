import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useStore, type Vehiculo, km } from "@/lib/store";
import { obtenerImagenVehiculo, comprimirImagen } from "@/lib/vehiculo-fotos";
import {
  Car,
  Check,
  Gauge,
  Camera,
  Trash2,
  Upload,
  Palette,
  Sparkles,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/vehiculo")({
  head: () => ({
    meta: [
      { title: "Mi vehículo — AutoAlerta" },
      { name: "description", content: "Marca, modelo, año, patente, color y kilometraje de tu auto." },
      { property: "og:title", content: "Mi vehículo — AutoAlerta" },
      { property: "og:description", content: "Datos y fotografía de tu vehículo." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { datos, set } = useStore();
  const [v, setV] = useState<Vehiculo>(datos.vehiculo);
  const [ok, setOk] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setV(datos.vehiculo);
  }, [datos.vehiculo]);

  const infoImg = obtenerImagenVehiculo(v);

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendoFoto(true);
      // Comprimir imagen automáticamente para garantizar espacio en LocalStorage
      const imagenComprimida = await comprimirImagen(file);
      setV((prev) => ({ ...prev, foto: imagenComprimida }));
    } catch (err) {
      alert("No se pudo procesar la imagen seleccionada. Por favor intenta con otra.");
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEliminarFoto = () => {
    setV((prev) => {
      const actual = { ...prev };
      delete actual.foto;
      return actual;
    });
  };

  const campo = (
    k: keyof Vehiculo,
    label: string,
    type = "text",
    placeholder = "",
    required = true
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        className="input"
        type={type}
        required={required}
        placeholder={placeholder}
        value={v[k] !== undefined && v[k] !== null ? String(v[k]) : ""}
        onChange={(e) =>
          setV({
            ...v,
            [k]:
              type === "number"
                ? e.target.value === ""
                  ? 0
                  : Number(e.target.value)
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
          Ficha técnica, fotografía y odómetro de tu automóvil.
        </p>
      </div>

      {/* Tarjeta de visualización fotográfica del vehículo */}
      <div className="card overflow-hidden border border-border shadow-sm">
        <div className="grid md:grid-cols-12 gap-0">
          {/* Contenedor de la fotografía */}
          <div className="md:col-span-5 relative bg-secondary/50 flex items-center justify-center min-h-[220px] md:min-h-[260px] p-4">
            <img
              src={infoImg.url}
              alt={`${v.marca || "Vehículo"} ${v.modelo || ""}`}
              className="max-h-[220px] w-full object-contain rounded-lg drop-shadow-md"
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

          {/* Información y acciones de la fotografía */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Car className="h-4 w-4 text-primary" />
                <span>Identificación visual</span>
              </div>

              <h2 className="font-display text-2xl font-bold text-foreground mt-1">
                {v.marca || "Vehículo"} {v.modelo || ""} <span className="font-normal text-muted-foreground">({v.anio || "—"})</span>
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="plate">{v.patente || "SIN-PAT"}</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  {km(v.km)}
                </span>
                {v.color && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                    <Palette className="h-3.5 w-3.5 text-accent" />
                    Color: {v.color}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                {infoImg.tipo === "propia"
                  ? "Esta fotografía personalizada se muestra en tu panel de Inicio."
                  : infoImg.tipo === "modelo"
                  ? `Se muestra una foto representativa oficial del modelo ${v.marca} ${v.modelo}. También puedes subir tu propia foto.`
                  : "Se muestra una ilustración genérica profesional ya que no hay una foto oficial verificada para este modelo. Puedes subir tu propia fotografía cuando desees."}
              </p>
            </div>

            {/* Controles para subir o eliminar fotografía propia */}
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSubirFoto}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoFoto}
                className="btn-primary text-xs"
              >
                <Camera className="h-4 w-4" />
                <span>{v.foto ? "Cambiar mi foto" : "Subir foto propia"}</span>
              </button>

              {v.foto && (
                <button
                  type="button"
                  onClick={handleEliminarFoto}
                  className="btn-danger text-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar foto</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de edición de datos */}
      <form
        className="card grid gap-5 p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          set((d) => ({ ...d, vehiculo: v }));
          setOk(true);
          setTimeout(() => setOk(false), 3000);
        }}
      >
        <div className="sm:col-span-2 pb-1 border-b border-border">
          <h3 className="font-display font-bold text-lg text-foreground">Datos del vehículo</h3>
          <p className="text-xs text-muted-foreground">
            Actualiza las especificaciones técnicas para mantener al día tus registros y recordatorios.
          </p>
        </div>

        {campo("marca", "Marca del fabricante", "text", "Ej: Changan o Toyota")}
        {campo("modelo", "Modelo del vehículo", "text", "Ej: CS15 o Yaris")}
        {campo("anio", "Año de fabricación", "number", "Ej: 2020")}
        {campo("patente", "Patente vehicular (Chile)", "text", "Ej: KTRS-42")}
        {campo("color", "Color de carrocería", "text", "Ej: Gris Plata, Blanco, Rojo", false)}
        {campo("km", "Kilometraje actual (Odómetro)", "number", "Ej: 68450")}

        <div className="sm:col-span-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            Al modificar el kilometraje actual, las alertas de mantención en la pantalla Inicio se recalculan y actualizan automáticamente.
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2 sm:col-span-2">
          <button type="submit" className="btn-primary">
            Guardar cambios
          </button>
          {ok && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success animate-in fade-in">
              <Check className="h-4 w-4" /> ¡Datos guardados correctamente!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
