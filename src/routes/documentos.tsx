import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crud, upsert } from "@/components/Crud";
import { diasHasta, fecha, uid, useStore, type Documento } from "@/lib/store";
import { Estado } from "@/components/Estado";
import {
  Search,
  Eye,
  Download,
  X,
  FileText,
  AlertCircle,
  Paperclip,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

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

const tipos = [
  "Permiso de circulación",
  "Revisión técnica",
  "SOAP",
  "Seguro automotriz",
  "Licencia de conducir",
  "Análisis de gases",
  "Padrón vehicular",
  "Otro",
];

function Pagina() {
  const { datos, set } = useStore();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "proximos" | "vencidos" | "con_archivo">("todos");
  const [documentoVisor, setDocumentoVisor] = useState<Documento | null>(null);

  // Ordenar primero por fecha de vencimiento ascendente
  const todosDocs = [...datos.documentos].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));

  // Filtrado reactivo para búsqueda rápida en teléfono
  const itemsFiltrados = todosDocs.filter((d) => {
    const textoMatch =
      d.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (d.archivoNombre && d.archivoNombre.toLowerCase().includes(busqueda.toLowerCase()));

    if (!textoMatch) return false;

    const dias = diasHasta(d.vencimiento);
    if (filtro === "proximos") return dias >= 0 && dias <= 30;
    if (filtro === "vencidos") return dias < 0;
    if (filtro === "con_archivo") return Boolean(d.archivo);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda Rápida y Filtros Táctiles Móviles */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="input pl-10 pr-4"
            placeholder="Buscar por tipo de documento o archivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros rápidos estilo pastillas para teléfonos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors shrink-0 ${
              filtro === "todos"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({todosDocs.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("proximos")}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors shrink-0 ${
              filtro === "proximos"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Por vencer ({todosDocs.filter((d) => diasHasta(d.vencimiento) >= 0 && diasHasta(d.vencimiento) <= 30).length})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("vencidos")}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors shrink-0 ${
              filtro === "vencidos"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Vencidos ({todosDocs.filter((d) => diasHasta(d.vencimiento) < 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("con_archivo")}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors shrink-0 ${
              filtro === "con_archivo"
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Con archivo ({todosDocs.filter((d) => Boolean(d.archivo)).length})
          </button>
        </div>
      </div>

      <Crud<Documento>
        titulo="Documentos"
        descripcion="Administra tus documentos, fechas de vencimiento y respaldos digitales."
        items={itemsFiltrados}
        newId={uid}
        vacio={() => ({ tipo: tipos[0]!, vencimiento: new Date().toISOString().slice(0, 10) })}
        campos={[
          { key: "tipo", label: "Tipo de documento", type: "select", options: tipos },
          { key: "vencimiento", label: "Fecha de vencimiento", type: "date", required: true },
          { key: "archivo", label: "Archivo adjunto (imagen o PDF)", type: "file" },
        ]}
        render={(d) => (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground text-base">{d.tipo}</p>
                <Estado dias={diasHasta(d.vencimiento)} />
              </div>
              <p className="text-sm text-muted-foreground">Vence: {fecha(d.vencimiento)}</p>

              {d.archivo ? (
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDocumentoVisor(d)}
                    className="inline-flex items-center gap-1.5 rounded bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground hover:bg-accent/25 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>Ver documento</span>
                  </button>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={d.archivoNombre}>
                    📎 {d.archivoNombre || "Archivo guardado"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/75 italic">Sin archivo adjunto</p>
              )}
            </div>
          </div>
        )}
        onSave={(it, n) => set((d) => ({ ...d, documentos: upsert(d.documentos, it, n) }))}
        onDelete={(id) => set((d) => ({ ...d, documentos: d.documentos.filter((x) => x.id !== id) }))}
      />

      {/* Nota legal preventiva obligatoria */}
      <div className="rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Aviso informativo sobre fiscalizaciones</p>
          <p className="leading-relaxed">
            Portar una copia digital en la aplicación facilita tu consulta rápida y respaldo personal, pero no
            garantiza que sustituya un documento físico u oficial exigido por Carabineros de Chile o inspectores
            fiscales durante un control vehicular según la normativa vigente.
          </p>
        </div>
      </div>

      {/* Visor Modal de Documento */}
      {documentoVisor && documentoVisor.archivo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setDocumentoVisor(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-card shadow-2xl overflow-hidden border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Visor */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-card">
              <div className="min-w-0 pr-3">
                <h3 className="font-display font-bold text-foreground text-lg truncate">
                  {documentoVisor.tipo}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {documentoVisor.archivoNombre || "Documento adjunto"} · Vence {fecha(documentoVisor.vencimiento)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={documentoVisor.archivo}
                  download={documentoVisor.archivoNombre || `${documentoVisor.tipo}.dat`}
                  className="btn-ghost text-xs"
                  title="Descargar archivo"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setDocumentoVisor(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Visor */}
            <div className="flex-1 overflow-auto bg-neutral-900/5 p-4 flex items-center justify-center min-h-[300px]">
              {documentoVisor.archivo.startsWith("data:image/") ||
              /\.(jpe?g|png|webp|gif|svg)$/i.test(documentoVisor.archivoNombre || "") ? (
                <img
                  src={documentoVisor.archivo}
                  alt={documentoVisor.archivoNombre || documentoVisor.tipo}
                  className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-md"
                />
              ) : documentoVisor.archivo.startsWith("data:application/pdf") ||
                /\.pdf$/i.test(documentoVisor.archivoNombre || "") ? (
                <div className="w-full h-[65vh] flex flex-col items-center justify-center gap-3">
                  <iframe
                    src={documentoVisor.archivo}
                    title={documentoVisor.archivoNombre || documentoVisor.tipo}
                    className="w-full h-full rounded-lg border border-border bg-white"
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="font-medium text-foreground">Vista previa no disponible para este formato</p>
                  <a
                    href={documentoVisor.archivo}
                    download={documentoVisor.archivoNombre}
                    className="btn-primary text-xs inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar archivo ({documentoVisor.archivoNombre})
                  </a>
                </div>
              )}
            </div>

            {/* Pie del visor */}
            <div className="border-t border-border px-5 py-2.5 bg-card text-right">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setDocumentoVisor(null)}
              >
                Cerrar visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
