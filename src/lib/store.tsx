import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Vehiculo = { marca: string; modelo: string; anio: number; patente: string; km: number };
export type Documento = { id: string; tipo: string; vencimiento: string; archivo?: string; archivoNombre?: string };
export type Mantencion = { id: string; trabajo: string; fecha: string; km: number; costo: number; proximoKm?: number };
export type Gasto = { id: string; categoria: string; descripcion: string; fecha: string; monto: number };

export type Datos = { vehiculo: Vehiculo; documentos: Documento[]; mantenciones: Mantencion[]; gastos: Gasto[] };

const hoy = new Date();
const rel = (d: number) => {
  const x = new Date(hoy);
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};

export const demo = (): Datos => ({
  vehiculo: { marca: "Toyota", modelo: "Yaris", anio: 2019, patente: "KTRS-42", km: 68450 },
  documentos: [
    { id: "d1", tipo: "Permiso de circulación", vencimiento: rel(20) },
    { id: "d2", tipo: "Revisión técnica", vencimiento: rel(55) },
    { id: "d3", tipo: "SOAP", vencimiento: rel(170) },
    { id: "d4", tipo: "Licencia de conducir", vencimiento: rel(-5) },
  ],
  mantenciones: [
    { id: "m1", trabajo: "Cambio de aceite y filtro", fecha: rel(-40), km: 66000, costo: 45990, proximoKm: 68800 },
    { id: "m2", trabajo: "Cambio de pastillas de freno", fecha: rel(-120), km: 61200, costo: 78000, proximoKm: 75000 },
  ],
  gastos: [
    { id: "g1", categoria: "Combustible", descripcion: "Bencina 95", fecha: rel(-3), monto: 42000 },
    { id: "g2", categoria: "Combustible", descripcion: "Bencina 95", fecha: rel(-15), monto: 38500 },
    { id: "g3", categoria: "Repuestos", descripcion: "Plumillas", fecha: rel(-22), monto: 12990 },
    { id: "g4", categoria: "Otros", descripcion: "Lavado", fecha: rel(-9), monto: 8000 },
  ],
});

const KEY = "autoalerta-datos";
type Ctx = { datos: Datos; set: (f: (d: Datos) => Datos) => void; reset: () => void; listo: boolean };
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<Datos>(demo);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY);
      if (r) setDatos(JSON.parse(r));
    } catch {}
    setListo(true);
  }, []);
  const set = (f: (d: Datos) => Datos) =>
    setDatos((d) => {
      const n = f(d);
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch {
        alert("No hay espacio suficiente en el navegador (archivo muy grande).");
        return d;
      }
      return n;
    });
  const reset = () => set(() => demo());
  return <C.Provider value={{ datos, set, reset, listo }}>{children}</C.Provider>;
}

export const useStore = () => {
  const c = useContext(C);
  if (!c) throw new Error("StoreProvider faltante");
  return c;
};

export const uid = () => Math.random().toString(36).slice(2, 10);
export const clp = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n || 0);
export const fecha = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
export const km = (n: number) => `${new Intl.NumberFormat("es-CL").format(n || 0)} km`;
export const diasHasta = (iso: string) => {
  const t = new Date(iso + "T00:00:00").getTime();
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return Math.round((t - h.getTime()) / 86400000);
};
