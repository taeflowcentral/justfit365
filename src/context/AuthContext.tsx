import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  apellido: string;
  dni: string;
  role: 'usuario' | 'gimnasio' | 'admin';
  nombre: string;
  email?: string;
  gimnasioId?: string;
  gimnasioNombre?: string;
  gimnasioLogo?: string;
  consentimiento: boolean;
  suscripcionPagada: boolean;
  suscripcionActiva: boolean;
  fechaSuscripcion?: string;
  fechaUltimoPago?: string;
  mesesImpagos?: number;
  foto?: string;
  notas?: string;
  perfil?: {
    edad: number;
    peso: number;
    altura: number;
    objetivo: string;
    nivelActividad: string;
  };
}

interface RegisterData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  role: 'usuario' | 'gimnasio';
  gimnasioNombre?: string;
}

interface AuthContextType {
  user: User | null;
  login: (apellido: string, dni: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  acceptConsent: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CURRENT_USER_KEY = 'jf365_current_user';

function dbRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    apellido: row.apellido as string,
    dni: row.dni as string,
    role: row.role as 'usuario' | 'gimnasio' | 'admin',
    nombre: row.nombre as string,
    email: (row.email as string) || undefined,
    gimnasioId: (row.gimnasio_id as string) || undefined,
    gimnasioNombre: (row.gimnasio_nombre as string) || undefined,
    gimnasioLogo: (row.gimnasio_logo as string) || undefined,
    consentimiento: row.consentimiento as boolean,
    suscripcionPagada: row.suscripcion_pagada as boolean,
    suscripcionActiva: row.suscripcion_activa as boolean,
    fechaSuscripcion: (row.fecha_suscripcion as string) || undefined,
    fechaUltimoPago: (row.fecha_ultimo_pago as string) || undefined,
    mesesImpagos: (row.meses_impagos as number) || 0,
    foto: (row.foto as string) || undefined,
    notas: (row.notas as string) || undefined,
    perfil: (row.perfil_peso as number) ? {
      edad: (row.perfil_edad as number) || 0,
      peso: (row.perfil_peso as number) || 0,
      altura: (row.perfil_altura as number) || 0,
      objetivo: (row.perfil_objetivo as string) || '',
      nivelActividad: (row.perfil_nivel as string) || '',
    } : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // Refrescar datos del usuario desde Supabase al iniciar y cada 30 segundos
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    const refrescar = async () => {
      const { data } = await supabase.from('usuarios').select('*').eq('dni', user.dni).single();
      if (cancelado || !data) return;
      const u = dbRowToUser(data);
      setUser(u);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    };

    // Refrescar al cargar
    refrescar();
    // Y cada 30 segundos para detectar cambios desde otros dispositivos
    const interval = setInterval(refrescar, 30000);

    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.dni]);

  const login = async (apellido: string, dni: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .eq('password_hash', password)
      .single();

    if (error || !data) return false;

    const input = apellido.toLowerCase().trim().replace(/\s+/g, '');
    const dbApellido = (data.apellido as string).toLowerCase().trim().replace(/\s+/g, '');
    const dbNombre = (data.nombre as string).toLowerCase().trim().replace(/\s+/g, '');
    const dbNombreFull = (data.nombre as string).toLowerCase().trim();
    const matchApellido = dbApellido === input;
    const matchEnNombre = dbNombreFull.includes(apellido.toLowerCase().trim());
    const matchNombreCompleto = dbNombre === input || input === dbNombre;
    const matchParcial = dbApellido.includes(input) || input.includes(dbApellido);
    if (!matchApellido && !matchEnNombre && !matchNombreCompleto && !matchParcial) return false;

    const u = dbRowToUser(data);
    setUser(u);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    return true;
  };

  const register = async (regData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!/^\d{7,8}$/.test(regData.dni)) {
      return { success: false, error: 'El DNI debe tener 7 u 8 d\u00edgitos.' };
    }
    if (!regData.nombre.trim() || !regData.apellido.trim()) {
      return { success: false, error: 'Nombre y apellido son obligatorios.' };
    }
    if (!regData.email.trim() || !regData.email.includes('@')) {
      return { success: false, error: 'Ingres\u00e1 un email v\u00e1lido.' };
    }
    if (regData.password.length < 6) {
      return { success: false, error: 'La contrase\u00f1a debe tener al menos 6 caracteres.' };
    }

    // Verificar si ya existe
    const { data: existing } = await supabase.from('usuarios').select('dni').eq('dni', regData.dni).single();
    if (existing) {
      return { success: false, error: 'Ya existe un usuario con ese DNI.' };
    }

    const { data, error } = await supabase.from('usuarios').insert({
      dni: regData.dni,
      apellido: regData.apellido,
      nombre: `${regData.nombre} ${regData.apellido}`,
      email: regData.email,
      password_hash: regData.password,
      role: regData.role,
      gimnasio_id: regData.role === 'gimnasio' ? `gym-${Date.now()}` : null,
      gimnasio_nombre: regData.role === 'gimnasio' ? (regData.gimnasioNombre || regData.nombre) : null,
    }).select().single();

    if (error) {
      return { success: false, error: 'Error al registrar: ' + error.message };
    }

    const u = dbRowToUser(data);
    setUser(u);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const acceptConsent = () => {
    if (user) {
      const updated = { ...user, consentimiento: true };
      setUser(updated);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      supabase.from('usuarios').update({ consentimiento: true }).eq('dni', user.dni).then(() => {});
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data, perfil: data.perfil ? { ...user.perfil, ...data.perfil } : user.perfil };
      setUser(updated);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      // Sync to Supabase
      const dbUpdate: Record<string, unknown> = {};
      if (data.nombre !== undefined) dbUpdate.nombre = data.nombre;
      if (data.apellido !== undefined) dbUpdate.apellido = data.apellido;
      if (data.email !== undefined) dbUpdate.email = data.email;
      if (data.foto !== undefined) dbUpdate.foto = data.foto;
      if (data.notas !== undefined) dbUpdate.notas = data.notas;
      if (data.consentimiento !== undefined) dbUpdate.consentimiento = data.consentimiento;
      if (data.suscripcionPagada !== undefined) dbUpdate.suscripcion_pagada = data.suscripcionPagada;
      if (data.suscripcionActiva !== undefined) dbUpdate.suscripcion_activa = data.suscripcionActiva;
      if (data.fechaSuscripcion !== undefined) dbUpdate.fecha_suscripcion = data.fechaSuscripcion;
      if (data.fechaUltimoPago !== undefined) dbUpdate.fecha_ultimo_pago = data.fechaUltimoPago;
      if (data.mesesImpagos !== undefined) dbUpdate.meses_impagos = data.mesesImpagos;
      if (data.gimnasioNombre !== undefined) dbUpdate.gimnasio_nombre = data.gimnasioNombre;
      if (data.gimnasioLogo !== undefined) dbUpdate.gimnasio_logo = data.gimnasioLogo;
      if (data.perfil) {
        const p = { ...user.perfil, ...data.perfil };
        dbUpdate.perfil_edad = p.edad;
        dbUpdate.perfil_peso = p.peso;
        dbUpdate.perfil_altura = p.altura;
        dbUpdate.perfil_objetivo = p.objetivo;
        dbUpdate.perfil_nivel = p.nivelActividad;
      }
      if (Object.keys(dbUpdate).length > 0) {
        supabase.from('usuarios').update(dbUpdate).eq('dni', user.dni).then(() => {});
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, acceptConsent, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// Para Admin Panel
export async function getAllUsers(): Promise<User[]> {
  const { data } = await supabase.from('usuarios').select('*').neq('role', 'admin');
  if (!data) return [];
  return data.map(row => dbRowToUser(row as Record<string, unknown>));
}
