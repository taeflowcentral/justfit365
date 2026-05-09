// Sistema de comunicados / anuncios de admin a usuarios.
// Storage en Supabase (tabla comunicados).
// Audiencias: 'todos' | 'usuario' | 'gimnasio' | 'cliente_gym'.

import { supabase } from './supabase';

export type Audiencia = 'todos' | 'usuario' | 'gimnasio' | 'cliente_gym';

export interface Comunicado {
  id: number;
  titulo: string;
  mensaje: string;
  ctaLabel?: string;
  ctaUrl?: string;
  audiencia: Audiencia;
  activo: boolean;
  creado: string;
  expira?: string;
}

export const AUDIENCIA_LABEL: Record<Audiencia, string> = {
  'todos': 'Todos',
  'usuario': 'Usuarios individuales',
  'gimnasio': 'Dueños de gimnasio',
  'cliente_gym': 'Clientes de gimnasio',
};

function rowToComunicado(r: Record<string, unknown>): Comunicado {
  return {
    id: r.id as number,
    titulo: (r.titulo as string) || '',
    mensaje: (r.mensaje as string) || '',
    ctaLabel: (r.cta_label as string) || undefined,
    ctaUrl: (r.cta_url as string) || undefined,
    audiencia: ((r.audiencia as string) || 'todos') as Audiencia,
    activo: !!r.activo,
    creado: (r.creado as string) || '',
    expira: (r.expira as string) || undefined,
  };
}

export async function listarComunicados(): Promise<Comunicado[]> {
  const { data } = await supabase.from('comunicados').select('*').order('creado', { ascending: false });
  return (data || []).map(r => rowToComunicado(r as Record<string, unknown>));
}

// Devuelve el comunicado mas reciente que aplique al rol/contexto del usuario,
// que este activo y no haya expirado.
export async function comunicadoActivoParaUsuario(rol: 'usuario' | 'gimnasio' | 'admin', esClienteGym: boolean): Promise<Comunicado | null> {
  const audienciaUsuario: Audiencia = esClienteGym ? 'cliente_gym' : (rol === 'gimnasio' ? 'gimnasio' : 'usuario');
  const ahora = new Date().toISOString();
  const { data } = await supabase
    .from('comunicados')
    .select('*')
    .eq('activo', true)
    .in('audiencia', ['todos', audienciaUsuario])
    .or(`expira.is.null,expira.gt.${ahora}`)
    .order('creado', { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return null;
  return rowToComunicado(data[0] as Record<string, unknown>);
}

export async function crearComunicado(c: Omit<Comunicado, 'id' | 'creado'>): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('comunicados').insert({
    titulo: c.titulo,
    mensaje: c.mensaje,
    cta_label: c.ctaLabel || null,
    cta_url: c.ctaUrl || null,
    audiencia: c.audiencia,
    activo: c.activo,
    expira: c.expira || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function actualizarComunicado(id: number, c: Partial<Comunicado>): Promise<boolean> {
  const update: Record<string, unknown> = {};
  if (c.titulo !== undefined) update.titulo = c.titulo;
  if (c.mensaje !== undefined) update.mensaje = c.mensaje;
  if (c.ctaLabel !== undefined) update.cta_label = c.ctaLabel || null;
  if (c.ctaUrl !== undefined) update.cta_url = c.ctaUrl || null;
  if (c.audiencia !== undefined) update.audiencia = c.audiencia;
  if (c.activo !== undefined) update.activo = c.activo;
  if (c.expira !== undefined) update.expira = c.expira || null;
  const { error } = await supabase.from('comunicados').update(update).eq('id', id);
  return !error;
}

export async function eliminarComunicado(id: number): Promise<boolean> {
  const { error } = await supabase.from('comunicados').delete().eq('id', id);
  return !error;
}

// Telefonos para el helper de WhatsApp
export interface DestinatarioWA {
  dni: string;
  nombre: string;
  telefono: string;
  audiencia: Audiencia;
}

export async function destinatariosWhatsApp(audiencia: Audiencia): Promise<DestinatarioWA[]> {
  // 'todos': trae todos los que tengan telefono (partner_telefono o desde otra fuente)
  // Por ahora usamos partner_telefono como unico campo de telefono en la DB.
  const { data } = await supabase
    .from('usuarios')
    .select('dni, nombre, role, es_cliente_gym, partner_telefono')
    .neq('role', 'admin')
    .not('partner_telefono', 'is', null);
  if (!data) return [];
  return data
    .filter((u: Record<string, unknown>) => {
      if (audiencia === 'todos') return true;
      if (audiencia === 'cliente_gym') return !!u.es_cliente_gym;
      if (audiencia === 'gimnasio') return u.role === 'gimnasio';
      if (audiencia === 'usuario') return u.role === 'usuario' && !u.es_cliente_gym;
      return false;
    })
    .map((u: Record<string, unknown>) => ({
      dni: u.dni as string,
      nombre: (u.nombre as string) || '',
      telefono: (u.partner_telefono as string) || '',
      audiencia,
    }));
}
