import { supabase } from './supabase';

export interface ComprobanteData {
  dni: string;
  nombre: string;
  email: string;
  plan: string;
  monto: number;
  comprobanteBase64: string;
  comprobanteNombre: string;
}

export async function guardarComprobante(data: ComprobanteData): Promise<{ success: boolean; error?: string }> {
  try {
    // Insertar en la tabla pagos de Supabase
    const { error } = await supabase.from('pagos').insert({
      dni: data.dni,
      nombre: data.nombre,
      email: data.email,
      plan: data.plan,
      monto: data.monto,
      comprobante_base64: data.comprobanteBase64,
      comprobante_nombre: data.comprobanteNombre,
      fecha: new Date().toISOString(),
      estado: 'pendiente_revision',
    });

    if (error) {
      console.error('Error guardando pago:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
  }
}

export async function getPagos() {
  const { data, error } = await supabase.from('pagos').select('*').order('fecha', { ascending: false });
  if (error) return [];
  return data || [];
}
