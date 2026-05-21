// Historial diario de planes nutricionales por fecha (YYYY-MM-DD).
// El plan activo (semana recurrente con tabs Lun..Dom) sigue viviendo en
// bc_plan_nutricional_semanal. Este archivo guarda snapshots dia-por-dia
// para poder revisar el pasado y calcular acumulados semanales reales.

import { getUserItem, setUserItem } from './storage';

const KEY = 'bc_plan_nutricional_historico';

export interface ItemPlan {
  id: number;
  alimento: string;
  porcion: string;
  cal: number;
  prot: number;
  carb: number;
  grasa: number;
}

export interface ComidaPlan {
  id: number;
  nombre: string;
  hora: string;
  items: ItemPlan[];
}

export interface Totales {
  cal: number;
  prot: number;
  carb: number;
  grasa: number;
}

export interface DiaHistorico {
  comidas: ComidaPlan[];
  totales: Totales;
  guardadoEn: number;
}

export type Historico = Record<string, DiaHistorico>;

export function fechaISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function diaSemanaJS(d: Date = new Date()): number {
  // 0=Lun, 1=Mar, ..., 6=Dom (mismo formato que planSemanal del proyecto)
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

export function calcularTotales(comidas: ComidaPlan[]): Totales {
  const tot = comidas.reduce<Totales>((acc, c) => {
    c.items.forEach(it => {
      acc.cal += Number(it.cal) || 0;
      acc.prot += Number(it.prot) || 0;
      acc.carb += Number(it.carb) || 0;
      acc.grasa += Number(it.grasa) || 0;
    });
    return acc;
  }, { cal: 0, prot: 0, carb: 0, grasa: 0 });
  // Redondear para evitar bugs de precision flotante (20.6999999... -> 21)
  return {
    cal: Math.round(tot.cal),
    prot: Math.round(tot.prot),
    carb: Math.round(tot.carb),
    grasa: Math.round(tot.grasa),
  };
}

export function getHistorico(): Historico {
  try {
    const saved = getUserItem(KEY);
    return saved ? JSON.parse(saved) as Historico : {};
  } catch {
    return {};
  }
}

export function setHistorico(h: Historico): void {
  setUserItem(KEY, JSON.stringify(h));
}

export function archivarDia(fecha: string, comidas: ComidaPlan[]): void {
  const h = getHistorico();
  h[fecha] = {
    comidas,
    totales: calcularTotales(comidas),
    guardadoEn: Date.now(),
  };
  setHistorico(h);
}

// Saca un dia del historico (para deshacer un archivo accidental)
export function eliminarDia(fecha: string): void {
  const h = getHistorico();
  delete h[fecha];
  setHistorico(h);
}

// Devuelve los ultimos N dias en orden cronologico (mas viejo -> mas nuevo).
// Cada entrada incluye la fecha incluso si no hay datos (entry = null).
export function getUltimosNDias(n: number): { fecha: string; entry: DiaHistorico | null }[] {
  const h = getHistorico();
  const out: { fecha: string; entry: DiaHistorico | null }[] = [];
  const hoy = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const f = fechaISO(d);
    out.push({ fecha: f, entry: h[f] || null });
  }
  return out;
}

// Garantiza que los dias pasados que no esten archivados se snapshoteen
// usando el plan recurrente (planSemanal) que estaba activo. Llamar al
// cargar Nutricion / Dashboard para "cerrar" dias pasados sin perder data.
export function archivarDiasPasados(planSemanal: Record<number, ComidaPlan[]>, diasAtras = 7): void {
  const h = getHistorico();
  const hoy = new Date();
  let cambio = false;
  // i=1 -> ayer; i=2 -> antes de ayer; ... no archivamos hoy aca
  for (let i = 1; i <= diasAtras; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const f = fechaISO(d);
    if (h[f]) continue; // ya archivado, no pisar
    const dia = diaSemanaJS(d);
    const comidas = planSemanal[dia];
    if (!comidas || comidas.length === 0) continue;
    h[f] = {
      comidas,
      totales: calcularTotales(comidas),
      guardadoEn: Date.now(),
    };
    cambio = true;
  }
  if (cambio) setHistorico(h);
}

// Suma totales de los ultimos N dias archivados (ignora dias sin data)
export function sumarUltimosNDias(n: number): { totales: Totales; diasConDatos: number } {
  const dias = getUltimosNDias(n);
  let diasConDatos = 0;
  const totales = dias.reduce<Totales>((acc, d) => {
    if (!d.entry) return acc;
    diasConDatos++;
    acc.cal += d.entry.totales.cal;
    acc.prot += d.entry.totales.prot;
    acc.carb += d.entry.totales.carb;
    acc.grasa += d.entry.totales.grasa;
    return acc;
  }, { cal: 0, prot: 0, carb: 0, grasa: 0 });
  return { totales, diasConDatos };
}
