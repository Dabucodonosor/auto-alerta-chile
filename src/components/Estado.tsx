export function Estado({ dias }: { dias: number }) {
  const cls = dias < 0 ? "badge-danger" : dias <= 30 ? "badge-warn" : "badge-ok";
  const txt = dias < 0 ? `Vencido hace ${-dias} días` : dias === 0 ? "Vence hoy" : `En ${dias} días`;
  return <span className={cls}>{txt}</span>;
}

