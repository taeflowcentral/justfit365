// Configuracion global de la app guardada en Supabase (tabla app_config).
// Por ej: fecha hasta la cual la promo gratis esta activa.
//
// Estrategia: la fuente de verdad es la DB, pero cacheamos en localStorage
// para lecturas sincronas rapidas. Refresca en cada carga de app.

import { supabase } from './supabase';

const CACHE_PREFIX = 'jf365_app_config_';

export async function getConfig(key: string): Promise<string | null> {
  const { data } = await supabase.from('app_config').select('value').eq('key', key).maybeSingle();
  const valor = (data?.value as string) || null;
  // Actualizar cache local
  if (valor) localStorage.setItem(CACHE_PREFIX + key, valor);
  else localStorage.removeItem(CACHE_PREFIX + key);
  return valor;
}

export function getConfigCached(key: string): string | null {
  // Fallback a la key vieja (compat con localStorage anterior)
  const v = localStorage.getItem(CACHE_PREFIX + key);
  if (v) return v;
  if (key === 'promo_free_until') return localStorage.getItem('jf365_promo_free_until');
  return null;
}

export async function setConfig(key: string, value: string | null): Promise<void> {
  if (value === null) {
    await supabase.from('app_config').delete().eq('key', key);
    localStorage.removeItem(CACHE_PREFIX + key);
    // Limpiar key vieja si quedo
    if (key === 'promo_free_until') localStorage.removeItem('jf365_promo_free_until');
  } else {
    await supabase.from('app_config').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    localStorage.setItem(CACHE_PREFIX + key, value);
    if (key === 'promo_free_until') localStorage.setItem('jf365_promo_free_until', value);
  }
}

// Helpers especificos para la promo
export async function getPromoUntilFresh(): Promise<Date | null> {
  const v = await getConfig('promo_free_until');
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function isPromoActivaCached(): { activa: boolean; until?: Date } {
  const v = getConfigCached('promo_free_until');
  if (!v) return { activa: false };
  const d = new Date(v);
  if (isNaN(d.getTime())) return { activa: false };
  return { activa: d > new Date(), until: d };
}

// Refresca el cache de todas las configs relevantes al cargar la app
export async function refreshConfigCache(): Promise<void> {
  try {
    await getConfig('promo_free_until');
  } catch { /* ignore */ }
}
