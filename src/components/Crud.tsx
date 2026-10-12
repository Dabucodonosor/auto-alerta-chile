import { useState, type ReactNode } from "react";

export type Campo = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "file";
  options?: string[];
  required?: boolean;
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
    p.onSave(edit.item as T, edit.nuevo);
    setEdit(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{p.titulo}</h1>
          <p className="text-muted-foreground">{p.descripcion}</p>
        </div>
        <button className="btn-primary" onClick={() => setEdit({ item: { ...p.vacio(), id: p.newId() }, nuevo: true })}>
          + Agregar
        </button>
      </div>

      {p.items.length === 0 ? (
        <div className="card p-10 text-center text-muted-foreground">Aún no hay registros.</div>
      ) : (
        <ul className="space-y-3">
          {p.items.map((it) => (
            <li key={it.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">{p.render(it)}</div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setEdit({ item: { ...it }, nuevo: false })}>
                  Editar
                </button>
                <button
                  className="btn-danger"
                  onClick={() => confirm("¿Eliminar este registro?") && p.onDelete(it.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" onClick={() => setEdit(null)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl"
          >
            <h2 className="font-display text-xl font-bold">{edit.nuevo ? "Nuevo registro" : "Editar registro"}</h2>
            {p.campos.map((c) => (
              <label key={c.key} className="block">
                <span className="mb-1 block text-sm font-medium">{c.label}</span>
                {c.type === "select" ? (
                  <select
                    className="input"
                    value={String(edit.item[c.key] ?? "")}
                    onChange={(e) => setEdit({ ...edit, item: { ...edit.item, [c.key]: e.target.value } })}
                  >
                    {c.options!.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : c.type === "file" ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="input"
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
                      <p className="mt-1 text-xs text-muted-foreground">Actual: {String(edit.item["archivoNombre"])}</p>
                    ) : null}
                  </div>
                ) : (
                  <input
                    className="input"
                    type={c.type}
                    required={c.required}
                    min={c.type === "number" ? 0 : undefined}
                    value={String(edit.item[c.key] ?? "")}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        item: { ...edit.item, [c.key]: c.type === "number" ? Number(e.target.value) : e.target.value },
                      })
                    }
                  />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button className="btn-primary">Guardar</button>
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
