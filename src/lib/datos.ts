import { supabase } from './supabase';

// Helper para obtener el DNI del usuario actual
function getCurrentDni(): string {
  try {
    const user = JSON.parse(localStorage.getItem('bc_user') || 'null');
    return user?.dni || '';
  } catch {
    return '';
  }
}

// ============================
// PROGRESO (fotos y videos)
// ============================
export interface MediaEntryDB {
  id: string;
  dni: string;
  tipo: 'foto' | 'video';
  url: string;
  fecha: string;
  nota: string;
  peso?: number;
  grasa_corporal?: number;
  cintura?: number;
  cadera?: number;
  brazo?: number;
  analisis_ia?: string;
}

export async function getProgreso(): Promise<MediaEntryDB[]> {
  const dni = getCurrentDni();
  if (!dni) return [];
  const { data } = await supabase
    .from('progreso')
    .select('*')
    .eq('dni', dni)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addProgreso(entry: Omit<MediaEntryDB, 'id' | 'dni'>): Promise<{ success: boolean; error?: string; data?: MediaEntryDB }> {
  const dni = getCurrentDni();
  if (!dni) return { success: false, error: 'No hay usuario logueado' };
  const { data, error } = await supabase.from('progreso').insert({
    dni,
    tipo: entry.tipo,
    url: entry.url,
    fecha: entry.fecha,
    nota: entry.nota,
    peso: entry.peso,
    grasa_corporal: entry.grasa_corporal,
    cintura: entry.cintura,
    cadera: entry.cadera,
    brazo: entry.brazo,
    analisis_ia: entry.analisis_ia,
  }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateProgresoIA(id: string, analisisIA: string): Promise<boolean> {
  const { error } = await supabase.from('progreso').update({ analisis_ia: analisisIA }).eq('id', id);
  return !error;
}

export async function deleteProgreso(id: string): Promise<boolean> {
  const { error } = await supabase.from('progreso').delete().eq('id', id);
  return !error;
}

// ============================
// ESTUDIOS MEDICOS
// ============================
export interface EstudioDB {
  id: string;
  dni: string;
  nombre: string;
  tipo: string;
  archivo: string;
  archivo_nombre: string;
  fecha: string;
  nota: string;
  analisis_ia?: string;
}

export async function getEstudios(): Promise<EstudioDB[]> {
  const dni = getCurrentDni();
  if (!dni) return [];
  const { data } = await supabase
    .from('estudios_medicos')
    .select('*')
    .eq('dni', dni)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addEstudio(entry: Omit<EstudioDB, 'id' | 'dni'>): Promise<{ success: boolean; error?: string; data?: EstudioDB }> {
  const dni = getCurrentDni();
  if (!dni) return { success: false, error: 'No hay usuario logueado' };
  const { data, error } = await supabase.from('estudios_medicos').insert({
    dni,
    nombre: entry.nombre,
    tipo: entry.tipo,
    archivo: entry.archivo,
    archivo_nombre: entry.archivo_nombre,
    fecha: entry.fecha,
    nota: entry.nota,
    analisis_ia: entry.analisis_ia,
  }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateEstudioIA(id: string, analisisIA: string): Promise<boolean> {
  const { error } = await supabase.from('estudios_medicos').update({ analisis_ia: analisisIA }).eq('id', id);
  return !error;
}

export async function deleteEstudio(id: string): Promise<boolean> {
  const { error } = await supabase.from('estudios_medicos').delete().eq('id', id);
  return !error;
}
