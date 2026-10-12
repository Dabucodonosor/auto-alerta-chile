import { useState, type ReactNode } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export type Campo = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "file";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helperText?: string;
};

type Props<T extends { id: string }> = {
  titulo: string;
  descripcion: string;
  items: T[];
  campos: Campo[];
  vacio: () => Omit<T, "id">;
  render: (item: T) => ReactNode;
  onSave: (item: T, nuevo: boolean) => void;
  onDelete: (id: string) => void;
  newId: () => string;
};

export function Crud<T extends { id: string }>(p: Props<T>) {
  const [edit, setEdit] = useState<{ item: Record<string, unknown>; nuevo: boolean } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    
    // Clean up empty optional numbers
    const cleanItem = { ...edit.item };
    p.campos.forEach((c) => {
      if (c.type === "number" && !c.required && (cleanItem[c.key] === "" || cleanItem[c.key] === undefined)) {
        delete cleanItem[c.key];
      }
    });

    p.onSave(cleanItem as T, edit.nuevo);
    setEdit(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{p.titulo}</h1>
          <p className="text-sm text-muted-foreground mt-1">{p.descripcion}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setEdit({ item: { ...p.vacio(), id: p.newId() }, nuevo: true })}
        >
          <Plus className="h-4 w-4" />
          <span>Agregar</span>
        </button>
      </div>

      {p.items.length === 0 ? (
        <div className="card p-10 text-center text-muted-foreground border-dashed">
          Aún no hay registros en esta sección.
        </div>
      ) : (
        <ul className="space-y-3">
          {p.items.map((it) => (
            <li
              key={it.id}
              className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-sidebar-ring/40 transition-colors"
            >
              <div className="min-w-0 flex-1">{p.render(it)}</div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  className="btn-ghost"
                  onClick={() => setEdit({ item: { ...it }, nuevo: false })}
                  title="Editar registro"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  className="btn-danger"
                  onClick={() => confirm("¿Eliminar este registro?") && p.onDelete(it.id)}
                  title="Eliminar registro"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {edit && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
          onClick={() => setEdit(null)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg space-y-4 rounded-t-2xl bg-card p-6 shadow-2xl sm:rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="font-display text-xl font-bold text-foreground">
                {edit.nuevo ? "Nuevo registro" : "Editar registro"}
              </h2>
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              {p.campos.map((c) => (
                <label key={c.key} className="block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {c.label} {c.required && <span className="text-destructive">*</span>}
                    </span>
                    {!c.required && <span className="text-xs text-muted-foreground">(opcional)</span>}
                  </div>

                  {c.type === "select" ? (
                    <select
                      className="input"
                      value={String(edit.item[c.key] ?? "")}
                      onChange={(e) => setEdit({ ...edit, item: { ...edit.item, [c.key]: e.target.value } })}
                    >
                      {c.options!.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : c.type === "file" ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="input cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 1_500_000) return alert("El archivo debe pesar menos de 1,5 MB.");
                          const r = new FileReader();
                          r.onload = () =>
                            setEdit({ ...edit, item: { ...edit.item, archivo: r.result, archivoNombre: f.name } });
                          r.readAsDataURL(f);
                        }}
                      />
                      {edit.item["archivoNombre"] ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Archivo actual: <span className="font-medium text-foreground">{String(edit.item["archivoNombre"])}</span>
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <input
                      className="input"
                      type={c.type}
                      required={c.required}
                      placeholder={c.placeholder}
                      min={c.type === "number" ? 0 : undefined}
                      value={
                        edit.item[c.key] === undefined || edit.item[c.key] === null
                          ? ""
                          : String(edit.item[c.key])
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setEdit({
                          ...edit,
                          item: {
                            ...edit.item,
                            [c.key]:
                              c.type === "number"
                                ? val === ""
                                  ? (c.required ? 0 : "")
                                  : Number(val)
                                : val,
                          },
                        });
                      }}
                    />
                  )}
                  {c.helperText && <p className="mt-1 text-xs text-muted-foreground">{c.helperText}</p>}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button type="button" className="btn-ghost" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function upsert<T extends { id: string }>(list: T[], item: T, nuevo: boolean) {
  return nuevo ? [item, ...list] : list.map((x) => (x.id === item.id ? item : x));
}
