import { createFileRoute } from "@tanstack/react-router";
import { Crud, upsert } from "@/components/Crud";
import { diasHasta, fecha, uid, useStore, type Documento } from "@/lib/store";
import { Estado } from "@/components/Estado";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — AutoAlerta" },
      { name: "description", content: "Permiso de circulación, revisión técnica, SOAP y más." },
      { property: "og:title", content: "Documentos — AutoAlerta" },
      { property: "og:description", content: "Controla los vencimientos de tus documentos." },
    ],
  }),
  component: Pagina,
});

const tipos = ["Permiso de circulación", "Revisión técnica", "SOAP", "Seguro automotriz", "Licencia de conducir", "Análisis de gases", "Otro"];

function Pagina() {
  const { datos, set } = useStore();
  const items = [...datos.documentos].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  return (
    <Crud<Documento>
      titulo="Documentos"
      descripcion="Registra tus documentos y sus fechas de vencimiento."
      items={items}
      newId={uid}
      vacio={() => ({ tipo: tipos[0]!, vencimiento: new Date().toISOString().slice(0, 10) })}
      campos={[
        { key: "tipo", label: "Tipo de documento", type: "select", options: tipos },
        { key: "vencimiento", label: "Fecha de vencimiento", type: "date", required: true },
        { key: "archivo", label: "Archivo adjunto (imagen o PDF)", type: "file" },
      ]}
      render={(d) => (
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="font-semibold">{d.tipo}</p>
            <p className="text-sm text-muted-foreground">Vence: {fecha(d.vencimiento)}</p>
            {d.archivo && (
              <a href={d.archivo} download={d.archivoNombre} className="text-sm text-primary underline">
                📎 {d.archivoNombre}
              </a>
            )}
          </div>
          <Estado dias={diasHasta(d.vencimiento)} />
        </div>
      )}
      onSave={(it, n) => set((d) => ({ ...d, documentos: upsert(d.documentos, it, n) }))}
      onDelete={(id) => set((d) => ({ ...d, documentos: d.documentos.filter((x) => x.id !== id) }))}
    />
  );
}
