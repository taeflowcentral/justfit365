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

interface AuthContextType {
  user: User | null;
  login: (apellido: string, dni: string, password: string) => boolean;
  logout: () => void;
  acceptConsent: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  '30123456': {
    password: 'user123',
    user: {
      id: '1', apellido: 'Martinez', dni: '30123456', role: 'usuario',
      nombre: 'Lucas Martinez', email: 'lucas.martinez@email.com', consentimiento: false, suscripcionPagada: false, suscripcionActiva: false,
      perfil: { edad: 28, peso: 78, altura: 175, objetivo: 'Hipertrofia', nivelActividad: 'Intermedio' }
    }
  },
  '25987654': {
    password: 'gym123',
    user: {
      id: '2', apellido: 'Fernandez', dni: '25987654', role: 'gimnasio',
      nombre: 'Iron Gym', email: 'info@irongym.com', gimnasioId: 'gym-1', gimnasioNombre: 'Iron Gym',
      consentimiento: true, suscripcionPagada: false, suscripcionActiva: false, mesesImpagos: 0
    }
  },
  '35456789': {
    password: 'user123',
    user: {
      id: '3', apellido: 'Lopez', dni: '35456789', role: 'usuario',
      nombre: 'Sofia Lopez', email: 'sofia.lopez@email.com', gimnasioId: 'gym-1', gimnasioNombre: 'Iron Gym',
      consentimiento: false, suscripcionPagada: false, suscripcionActiva: false,
      perfil: { edad: 24, peso: 58, altura: 163, objetivo: 'Tonificacion', nivelActividad: 'Avanzado' }
    }
  },
  '99999999': {
    password: 'admin123',
    user: {
      id: '0', apellido: 'Cuevas', dni: '99999999', role: 'admin',
      nombre: 'Carlos Federico Cuevas', email: 'carloscuevaslaplata@gmail.com',
      consentimiento: true, suscripcionPagada: true, suscripcionActiva: true
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (apellido: string, dni: string, password: string): boolean => {
    const entry = DEMO_USERS[dni];
    if (entry && entry.password === password && entry.user.apellido.toLowerCase() === apellido.toLowerCase()) {
      setUser(entry.user);
      localStorage.setItem('bc_user', JSON.stringify(entry.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bc_user');
  };

  const acceptConsent = () => {
    if (user) {
      const updated = { ...user, consentimiento: true };
      setUser(updated);
      localStorage.setItem('bc_user', JSON.stringify(updated));
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data, perfil: data.perfil ? { ...user.perfil, ...data.perfil } : user.perfil };
      setUser(updated);
      localStorage.setItem('bc_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, acceptConsent, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
