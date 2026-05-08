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
  esClienteGym?: boolean;
  clientesMax?: number;
  perfil?: {
    edad: number;
    peso: number;
    altura: number;
    objetivo: string;
    nivelActividad: string;
    genero?: string;
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

export interface PendingGoogle {
  email: string;
  nombre: string;
  foto?: string;
}

interface CompleteGoogleData {
  dni: string;
  apellido: string;
  nombre: string;
  role: 'usuario' | 'gimnasio';
  gimnasioNombre?: string;
}

interface AuthContextType {
  user: User | null;
  pendingGoogle: PendingGoogle | null;
  login: (apellido: string, dni: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  loginGymClient: (gimnasio: string, dni: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  completeGoogleRegistration: (data: CompleteGoogleData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  acceptConsent: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CURRENT_USER_KEY = 'jf365_current_user';
const PENDING_GOOGLE_KEY = 'jf365_pending_google';

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
    esClienteGym: !!row.es_cliente_gym,
    clientesMax: typeof row.clientes_max === 'number' ? row.clientes_max : undefined,
    perfil: (row.perfil_peso as number) ? {
      edad: (row.perfil_edad as number) || 0,
      peso: (row.perfil_peso as number) || 0,
      altura: (row.perfil_altura as number) || 0,
      objetivo: (row.perfil_objetivo as string) || '',
      nivelActividad: (row.perfil_nivel as string) || '',
      genero: (row.perfil_genero as string) || '',
    } : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [pendingGoogle, setPendingGoogle] = useState<PendingGoogle | null>(() => {
    const saved = localStorage.getItem(PENDING_GOOGLE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // Listener de Supabase Auth (Google OAuth)
  useEffect(() => {
    const handleSession = async (session: { user: { email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user?.email) return;
      const email = session.user.email;
      const meta = (session.user.user_metadata || {}) as Record<string, string>;
      const fullName = meta.full_name || meta.name || email.split('@')[0];
      const foto = meta.picture || meta.avatar_url;

      // Buscar fila en usuarios por email
      const { data } = await supabase.from('usuarios').select('*').eq('email', email).maybeSingle();
      if (data) {
        const u = dbRowToUser(data);
        setUser(u);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
        setPendingGoogle(null);
        localStorage.removeItem(PENDING_GOOGLE_KEY);
      } else {
        // Usuario nuevo de Google - debe completar perfil con DNI + role
        const pending = { email, nombre: fullName, foto };
        setPendingGoogle(pending);
        localStorage.setItem(PENDING_GOOGLE_KEY, JSON.stringify(pending));
      }
    };

    // Procesar sesion existente al cargar
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

    // Verificar si hay promocion FREE activa
    const promoUntil = localStorage.getItem('jf365_promo_free_until');
    const promoActiva = !!(promoUntil && new Date(promoUntil) > new Date());

    const { data, error } = await supabase.from('usuarios').insert({
      dni: regData.dni,
      apellido: regData.apellido,
      nombre: `${regData.nombre} ${regData.apellido}`,
      email: regData.email,
      password_hash: regData.password,
      role: regData.role,
      gimnasio_id: regData.role === 'gimnasio' ? `gym-${Date.now()}` : null,
      gimnasio_nombre: regData.role === 'gimnasio' ? (regData.gimnasioNombre || regData.nombre) : null,
      // Si hay promo FREE activa, dar acceso completo hasta el fin de la promo
      suscripcion_pagada: promoActiva ? true : false,
      suscripcion_activa: promoActiva ? true : false,
      fecha_suscripcion: promoActiva ? new Date().toISOString().split('T')[0] : null,
      fecha_ultimo_pago: promoActiva ? new Date().toISOString().split('T')[0] : null,
    }).select().single();

    if (error) {
      return { success: false, error: 'Error al registrar: ' + error.message };
    }

    const u = dbRowToUser(data);
    setUser(u);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    return { success: true };
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // Login para clientes de gym: ingresan nombre del gimnasio + DNI
  const loginGymClient = async (gimnasio: string, dni: string): Promise<{ success: boolean; error?: string }> => {
    if (!/^\d{7,8}$/.test(dni)) return { success: false, error: 'El DNI debe tener 7 u 8 dígitos.' };
    if (!gimnasio.trim()) return { success: false, error: 'Ingresá el nombre de tu gimnasio.' };
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .eq('es_cliente_gym', true)
      .maybeSingle();
    if (error || !data) return { success: false, error: 'No encontramos un cliente de gimnasio con ese DNI.' };
    // Match flexible del nombre del gimnasio
    const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '');
    const inputGym = norm(gimnasio);
    const dbGym = norm((data.gimnasio_nombre as string) || '');
    const match = inputGym === dbGym || dbGym.includes(inputGym) || inputGym.includes(dbGym);
    if (!match) {
      return { success: false, error: 'El nombre del gimnasio no coincide. Verificá con tu entrenador.' };
    }
    const u = dbRowToUser(data);
    setUser(u);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    return { success: true };
  };

  const completeGoogleRegistration = async (cgData: CompleteGoogleData): Promise<{ success: boolean; error?: string }> => {
    if (!pendingGoogle) return { success: false, error: 'No hay sesion pendiente.' };
    if (!/^\d{7,8}$/.test(cgData.dni)) {
      return { success: false, error: 'El DNI debe tener 7 u 8 dígitos.' };
    }
    if (!cgData.apellido.trim() || !cgData.nombre.trim()) {
      return { success: false, error: 'Nombre y apellido son obligatorios.' };
    }

    // Verificar si ya existe alguien con ese DNI
    const { data: existing } = await supabase.from('usuarios').select('dni').eq('dni', cgData.dni).maybeSingle();
    if (existing) {
      return { success: false, error: 'Ya existe un usuario con ese DNI.' };
    }

    // Promo FREE
    const promoUntil = localStorage.getItem('jf365_promo_free_until');
    const promoActiva = !!(promoUntil && new Date(promoUntil) > new Date());

    const { data, error } = await supabase.from('usuarios').insert({
      dni: cgData.dni,
      apellido: cgData.apellido,
      nombre: `${cgData.nombre} ${cgData.apellido}`,
      email: pendingGoogle.email,
      password_hash: '__google_oauth__',
      role: cgData.role,
      foto: pendingGoogle.foto || null,
      gimnasio_id: cgData.role === 'gimnasio' ? `gym-${Date.now()}` : null,
      gimnasio_nombre: cgData.role === 'gimnasio' ? (cgData.gimnasioNombre || cgData.nombre) : null,
      suscripcion_pagada: promoActiva ? true : false,
      suscripcion_activa: promoActiva ? true : false,
      fecha_suscripcion: promoActiva ? new Date().toISOString().split('T')[0] : null,
      fecha_ultimo_pago: promoActiva ? new Date().toISOString().split('T')[0] : null,
    }).select().single();

    if (error) {
      return { success: false, error: 'Error al completar registro: ' + error.message };
    }

    const u = dbRowToUser(data);
    setUser(u);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    setPendingGoogle(null);
    localStorage.removeItem(PENDING_GOOGLE_KEY);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setPendingGoogle(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(PENDING_GOOGLE_KEY);
    // Cerrar sesion de Supabase Auth si la habia (Google OAuth)
    supabase.auth.signOut().catch(() => {});
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
        if (p.genero !== undefined) dbUpdate.perfil_genero = p.genero;
      }
      if (Object.keys(dbUpdate).length > 0) {
        supabase.from('usuarios').update(dbUpdate).eq('dni', user.dni).then(() => {});
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, pendingGoogle, login, loginWithGoogle, loginGymClient, register, completeGoogleRegistration, logout, acceptConsent, updateUser, isAuthenticated: !!user }}>
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
