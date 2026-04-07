import { createContext, useContext, useState, type ReactNode } from 'react';

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
  login: (apellido: string, dni: string, password: string) => boolean;
  register: (data: RegisterData) => { success: boolean; error?: string };
  logout: () => void;
  acceptConsent: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_DB_KEY = 'jf365_users_db';
const CURRENT_USER_KEY = 'bc_user';

// Admin siempre existe
const ADMIN_USER = {
  password: 'admin123',
  user: {
    id: '0', apellido: 'Cuevas', dni: '99999999', role: 'admin' as const,
    nombre: 'Carlos Federico Cuevas', email: 'carloscuevaslaplata@gmail.com',
    consentimiento: true, suscripcionPagada: true, suscripcionActiva: true
  }
};

function getUsersDB(): Record<string, { password: string; user: User }> {
  const saved = localStorage.getItem(USERS_DB_KEY);
  if (saved) return JSON.parse(saved);
  // Seed con admin
  const initial: Record<string, { password: string; user: User }> = {
    '99999999': ADMIN_USER,
  };
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(initial));
  return initial;
}

function saveUsersDB(db: Record<string, { password: string; user: User }>) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = (apellido: string, dni: string, password: string): boolean => {
    const db = getUsersDB();
    const entry = db[dni];
    if (entry && entry.password === password && entry.user.apellido.toLowerCase() === apellido.toLowerCase()) {
      // Cargar datos mas recientes del DB
      setUser(entry.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(entry.user));
      return true;
    }
    return false;
  };

  const register = (data: RegisterData): { success: boolean; error?: string } => {
    const db = getUsersDB();

    if (!/^\d{7,8}$/.test(data.dni)) {
      return { success: false, error: 'El DNI debe tener 7 u 8 d\u00edgitos num\u00e9ricos.' };
    }
    if (db[data.dni]) {
      return { success: false, error: 'Ya existe un usuario registrado con ese DNI.' };
    }
    if (!data.nombre.trim() || !data.apellido.trim()) {
      return { success: false, error: 'Nombre y apellido son obligatorios.' };
    }
    if (!data.email.trim() || !data.email.includes('@')) {
      return { success: false, error: 'Ingres\u00e1 un email v\u00e1lido.' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'La contrase\u00f1a debe tener al menos 6 caracteres.' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      nombre: `${data.nombre} ${data.apellido}`,
      apellido: data.apellido,
      dni: data.dni,
      email: data.email,
      role: data.role,
      consentimiento: false,
      suscripcionPagada: false,
      suscripcionActiva: false,
      ...(data.role === 'gimnasio' ? { gimnasioId: `gym-${Date.now()}`, gimnasioNombre: data.gimnasioNombre || data.nombre } : {}),
    };

    db[data.dni] = { password: data.password, user: newUser };
    saveUsersDB(db);

    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
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
      // Actualizar en DB
      const db = getUsersDB();
      if (db[user.dni]) { db[user.dni].user = updated; saveUsersDB(db); }
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data, perfil: data.perfil ? { ...user.perfil, ...data.perfil } : user.perfil };
      setUser(updated);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      // Actualizar en DB
      const db = getUsersDB();
      if (db[user.dni]) { db[user.dni].user = updated; saveUsersDB(db); }
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

// Exportar para que el Admin pueda ver todos los usuarios
export function getAllUsers(): User[] {
  const db = getUsersDB();
  return Object.values(db).map(entry => entry.user);
}
