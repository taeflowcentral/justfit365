// Partner Match: emparejamiento de companeros de entrenamiento.
// Sistema de scoring basado en la propuesta de Gemini:
// Zona 40 + Horario 30 + Intensidad 20 + Objetivo 10 = 100 maximo.

export type Horario = 'Mañana' | 'Tarde' | 'Noche' | 'Flexible';

export interface PartnerData {
  activo: boolean;
  zona: string;
  horario: Horario;
  nivel: number;       // 1-5
  objetivo: string;
  telefono: string;    // con codigo de pais, ej. +54 9 221 6806000
  disciplinas: string[]; // ej: ["Push", "Running", "Yoga"]
}

export interface PartnerUsuario extends PartnerData {
  dni: string;
  nombre: string;     // solo primer nombre
  foto?: string;
  genero?: string;
  edad?: number;
  actualizado?: string;
}

export interface MatchResult {
  user: PartnerUsuario;
  score: number;
  detalle: { zona: number; horario: number; nivel: number; objetivo: number };
}

export const HORARIOS: Horario[] = ['Mañana', 'Tarde', 'Noche', 'Flexible'];

export const DISCIPLINAS = [
  'Push', 'Pull', 'Piernas', 'Upper', 'Lower', 'Full Body',
  'Cardio', 'Running', 'Caminata Activa', 'Spinning', 'Ciclismo',
  'HIIT', 'Funcional', 'Yoga', 'Calistenia', 'Escalada Indoor',
];

export const OBJETIVOS = [
  'Perder peso',
  'Ganar masa muscular',
  'Mejorar salud general',
  'Mejorar resistencia',
  'Solo social',
];

export const NIVELES = [
  { v: 1, label: 'Principiante absoluto' },
  { v: 2, label: 'Principiante con experiencia' },
  { v: 3, label: 'Intermedio' },
  { v: 4, label: 'Avanzado' },
  { v: 5, label: 'Atleta' },
];

function normaliza(s: string): string {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function calcularMatch(a: PartnerData, b: PartnerData): MatchResult['detalle'] & { score: number } {
  const det = { zona: 0, horario: 0, nivel: 0, objetivo: 0 };
  if (a.zona && b.zona && normaliza(a.zona) === normaliza(b.zona)) det.zona = 40;
  const hMatch = a.horario === b.horario || a.horario === 'Flexible' || b.horario === 'Flexible';
  if (hMatch) det.horario = 30;
  if (typeof a.nivel === 'number' && typeof b.nivel === 'number' && Math.abs(a.nivel - b.nivel) <= 1) det.nivel = 20;
  if (a.objetivo && b.objetivo && a.objetivo === b.objetivo) det.objetivo = 10;
  const score = det.zona + det.horario + det.nivel + det.objetivo;
  return { ...det, score };
}

export function disciplinasCompartidas(a: string[], b: string[]): string[] {
  if (!a?.length || !b?.length) return [];
  const setA = new Set(a);
  return b.filter(d => setA.has(d));
}

export function rankear(propio: PartnerData, otros: PartnerUsuario[]): MatchResult[] {
  return otros
    .map(u => {
      const calc = calcularMatch(propio, u);
      return { user: u, score: calc.score, detalle: { zona: calc.zona, horario: calc.horario, nivel: calc.nivel, objetivo: calc.objetivo } };
    })
    .sort((a, b) => b.score - a.score);
}

export function whatsappLink(telefono: string, nombreReceptor: string, nombreEmisor: string): string {
  const cleaned = (telefono || '').replace(/[^\d]/g, '');
  const primero = (nombreReceptor || '').trim().split(/\s+/)[0] || '';
  const yo = (nombreEmisor || '').trim().split(/\s+/)[0] || '';
  const msg = primero
    ? `Hola ${primero}, te vi en JustFit365, soy ${yo}. ¿Te sumás a entrenar?`
    : `Hola, te vi en JustFit365, soy ${yo}. ¿Te sumás a entrenar?`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`;
}

// Lee de una row de Supabase los campos partner_*. Devuelve null si no opto-in.
export function rowToPartner(row: Record<string, unknown>): PartnerUsuario | null {
  if (!row.partner_activo) return null;
  return {
    dni: String(row.dni || ''),
    nombre: (row.nombre as string) || '',
    foto: (row.foto as string) || undefined,
    genero: (row.perfil_genero as string) || undefined,
    edad: (row.perfil_edad as number) || undefined,
    activo: true,
    zona: (row.partner_zona as string) || '',
    horario: ((row.partner_horario as string) || 'Flexible') as Horario,
    nivel: (row.partner_nivel as number) || 3,
    objetivo: (row.partner_objetivo as string) || '',
    telefono: (row.partner_telefono as string) || '',
    disciplinas: ((row.partner_disciplinas as string) || '').split(',').map(s => s.trim()).filter(Boolean),
    actualizado: (row.partner_actualizado as string) || undefined,
  };
}
