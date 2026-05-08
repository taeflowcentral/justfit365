// Partner Match: emparejamiento de companeros de entrenamiento.
// Sistema de scoring basado en la propuesta de Gemini:
// Zona 40 + Horario 30 + Intensidad 20 + Objetivo 10 = 100 maximo.

export type Horario = 'Mañana' | 'Tarde' | 'Noche' | 'Flexible';
export type PrefGenero = 'Cualquiera' | 'Hombre' | 'Mujer';

export interface PartnerData {
  activo: boolean;
  zona: string;
  horario: Horario;
  nivel: number;       // 1-5
  objetivo: string;
  telefono: string;    // con codigo de pais, ej. +54 9 221 6806000
  disciplinas: string[]; // ej: ["Push", "Running", "Yoga"]
  dias: string[];      // ej: ["Lun", "Mié", "Vie"]
  prefGenero: PrefGenero;
  prefEdadMin?: number;
  prefEdadMax?: number;
  mensajeTemplate?: string;
}

export interface PartnerEvento {
  id: number;
  creadorDni: string;
  creadorNombre: string;
  creadorFoto?: string;
  titulo: string;
  descripcion?: string;
  zona: string;
  puntoEncuentro?: string;
  disciplina?: string;
  fechaHora: string;     // ISO
  duracionMin: number;
  cupo: number;
  participantes: string[];        // DNIs
  participantesNombres: string[];
  creado?: string;
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
export const PREF_GENERO_OPCIONES: PrefGenero[] = ['Cualquiera', 'Hombre', 'Mujer'];
export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const DISCIPLINAS = [
  'Push', 'Pull', 'Piernas', 'Upper', 'Lower', 'Full Body',
  'Cardio', 'Running', 'Caminata Activa', 'Spinning', 'Ciclismo',
  'HIIT', 'Funcional', 'Yoga', 'Calistenia', 'Escalada Indoor',
];

export const MENSAJE_DEFAULT = (nombreReceptor: string, nombreEmisor: string) =>
  nombreReceptor
    ? `Hola ${nombreReceptor}, te vi en JustFit365, soy ${nombreEmisor}. ¿Te sumás a entrenar?`
    : `Hola, te vi en JustFit365, soy ${nombreEmisor}. ¿Te sumás a entrenar?`;

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

export function whatsappLink(telefono: string, mensaje: string): string {
  const cleaned = (telefono || '').replace(/[^\d]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(mensaje)}`;
}

// Mensaje final aplicando template del usuario o el default
export function armarMensaje(template: string | undefined, nombreReceptor: string, nombreEmisor: string): string {
  const r = (nombreReceptor || '').trim().split(/\s+/)[0] || '';
  const e = (nombreEmisor || '').trim().split(/\s+/)[0] || '';
  if (template?.trim()) {
    return template.replace(/\{nombre\}/g, r).replace(/\{yo\}/g, e);
  }
  return MENSAJE_DEFAULT(r, e);
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
    dias: ((row.partner_dias as string) || '').split(',').map(s => s.trim()).filter(Boolean),
    prefGenero: ((row.partner_pref_genero as string) || 'Cualquiera') as PrefGenero,
    prefEdadMin: typeof row.partner_pref_edad_min === 'number' ? row.partner_pref_edad_min : undefined,
    prefEdadMax: typeof row.partner_pref_edad_max === 'number' ? row.partner_pref_edad_max : undefined,
    mensajeTemplate: (row.partner_mensaje_template as string) || undefined,
    actualizado: (row.partner_actualizado as string) || undefined,
  };
}

// Tiempo desde la ultima actividad
export function ultimaActividadLabel(iso?: string): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'Activo hoy';
  const dias = Math.floor(ms / 86400000);
  if (dias === 0) return 'Activo hoy';
  if (dias === 1) return 'Activo ayer';
  if (dias < 7) return `Activo hace ${dias} días`;
  if (dias < 30) {
    const sem = Math.floor(dias / 7);
    return `Activo hace ${sem} semana${sem > 1 ? 's' : ''}`;
  }
  if (dias < 365) {
    const m = Math.floor(dias / 30);
    return `Activo hace ${m} mes${m > 1 ? 'es' : ''}`;
  }
  return 'Inactivo hace tiempo';
}

export function frescuraColor(iso?: string): string {
  if (!iso) return 'text-white/40';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 7) return 'text-emerald-400';
  if (dias <= 30) return 'text-amber-400';
  return 'text-white/40';
}

// Verificacion: foto + Google OAuth (proxy razonable de identidad real)
export function esVerificado(row: { foto?: unknown; password_hash?: unknown }): boolean {
  return !!(row.foto && row.password_hash === '__google_oauth__');
}

// Filtro por preferencias del usuario actual (genero/edad)
export function pasaPreferencias(propio: PartnerData, otro: PartnerUsuario): boolean {
  if (propio.prefGenero !== 'Cualquiera' && otro.genero && otro.genero !== propio.prefGenero) return false;
  if (otro.edad !== undefined) {
    if (typeof propio.prefEdadMin === 'number' && otro.edad < propio.prefEdadMin) return false;
    if (typeof propio.prefEdadMax === 'number' && otro.edad > propio.prefEdadMax) return false;
  }
  return true;
}

// Heatmap: cuenta personas por zona
export function contarPorZona(usuarios: PartnerUsuario[]): { zona: string; cantidad: number }[] {
  const map = new Map<string, number>();
  for (const u of usuarios) {
    if (!u.zona) continue;
    const k = u.zona.trim();
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()]
    .map(([zona, cantidad]) => ({ zona, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}
