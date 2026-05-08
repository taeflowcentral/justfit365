// Estimacion de gasto calorico por disciplina deportiva.
// Valores base para sesion completa (~45-60 min) y peso de referencia 75 kg.
// Basado en METs del Compendium of Physical Activities (Ainsworth 2011),
// ajustado por peso del usuario.

export const KCAL_DISCIPLINA: Record<string, number> = {
  // Fuerza
  'Push': 280,
  'Pull': 280,
  'Piernas': 330,
  'Upper': 280,
  'Lower': 330,
  'Full Body': 360,
  // Cardio
  'Cardio': 280,
  'Running': 360,
  'Caminata Activa': 180,
  'Spinning': 360,
  'Ciclismo': 300,
  // Otros
  'HIIT': 330,
  'Funcional': 280,
  'Yoga': 160,
  'Calistenia': 300,
  'Escalada Indoor': 380,
};

export const TOPE_KCAL_DIARIO = 800;
export const FACTOR_DESCANSO = 0.9;

export interface DesgloseDiaria {
  actividad: string;
  kcal: number;
}

export interface GastoDiario {
  extra: number; // kcal extra a sumar al objetivo base
  esDescanso: boolean;
  desglose: DesgloseDiaria[];
  topeAplicado: boolean; // true si se aplico el tope
}

/**
 * Calcula el gasto extra de un dia segun las actividades, ajustado por peso.
 * Devuelve 0 extra (y esDescanso=true) si no hay actividades validas.
 */
export function kcalExtraPorEntreno(actividades: string[], peso: number): GastoDiario {
  const factor = (peso || 75) / 75;
  const validas = actividades.filter(a => a !== 'Descanso' && a !== '');
  if (validas.length === 0) return { extra: 0, esDescanso: true, desglose: [], topeAplicado: false };

  const desglose: DesgloseDiaria[] = validas.map(act => {
    const base = KCAL_DISCIPLINA[act] ?? 0;
    return { actividad: act, kcal: Math.round(base * factor) };
  });
  const sumaCruda = desglose.reduce((s, d) => s + d.kcal, 0);
  const topeAplicado = sumaCruda > TOPE_KCAL_DIARIO;
  const extra = topeAplicado ? TOPE_KCAL_DIARIO : sumaCruda;
  return { extra, esDescanso: false, desglose, topeAplicado };
}

/**
 * Aplica el ajuste a unas calorias base. Dia de descanso = -10%.
 */
export function ajustarCaloriasDia(base: number, actividades: string[], peso: number): number {
  const { extra, esDescanso } = kcalExtraPorEntreno(actividades, peso);
  if (esDescanso) return Math.round(base * FACTOR_DESCANSO);
  return Math.round(base + extra);
}

/**
 * Lee la rutina de la semana desde localStorage y devuelve el tipo del dia HOY.
 * Devuelve string vacio si no hay rutina cargada.
 */
export function tipoEntrenoHoy(getItem: (key: string) => string | null): string {
  try {
    const saved = getItem('bc_rutina_semana');
    if (!saved) return '';
    const rutina = JSON.parse(saved) as { tipo: string }[];
    const jsDay = new Date().getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return rutina[idx]?.tipo || '';
  } catch {
    return '';
  }
}
