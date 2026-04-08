import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, LayoutDashboard, Utensils, Dumbbell, MessageSquare,
  Settings, LogOut, Building2, Users, CreditCard, ChevronLeft, ChevronRight, UserCog,
  Camera, Stethoscope, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

const userLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nutricion', icon: Utensils, label: 'Mi Nutrici\u00f3n' },
  { to: '/rutina', icon: Dumbbell, label: 'Mi Rutina' },
  { to: '/bio-coach', icon: MessageSquare, label: 'JustFit Coach' },
  { to: '/progreso', icon: Camera, label: 'Mi Progreso' },
  { to: '/analisis', icon: Stethoscope, label: 'An\u00e1lisis M\u00e9dicos' },
  { to: '/perfil', icon: UserCog, label: 'Mi Perfil' },
  { to: '/suscripcion', icon: CreditCard, label: 'Suscripci\u00f3n' },
];

const gymLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Panel Gym' },
  { to: '/clientes', icon: Users, label: 'Mis Clientes' },
  { to: '/nutricion', icon: Utensils, label: 'Nutrici\u00f3n' },
  { to: '/rutina', icon: Dumbbell, label: 'Rutinas' },
  { to: '/bio-coach', icon: MessageSquare, label: 'JustFit Coach' },
  { to: '/progreso', icon: Camera, label: 'Progreso' },
  { to: '/analisis', icon: Stethoscope, label: 'An\u00e1lisis M\u00e9dicos' },
  { to: '/config-gym', icon: Settings, label: 'Configuraci\u00f3n' },
  { to: '/perfil', icon: UserCog, label: 'Mi Perfil' },
  { to: '/suscripcion', icon: CreditCard, label: 'Suscripci\u00f3n' },
];

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
  { to: '/nutricion', icon: Utensils, label: 'Nutrici\u00f3n' },
  { to: '/rutina', icon: Dumbbell, label: 'Rutinas' },
  { to: '/bio-coach', icon: MessageSquare, label: 'JustFit Coach' },
  { to: '/progreso', icon: Camera, label: 'Progreso' },
  { to: '/analisis', icon: Stethoscope, label: 'An\u00e1lisis M\u00e9dicos' },
  { to: '/clientes', icon: Users, label: 'Clientes Gym' },
  { to: '/config-gym', icon: Settings, label: 'Config Gym' },
  { to: '/perfil', icon: UserCog, label: 'Mi Perfil' },
  { to: '/suscripcion', icon: CreditCard, label: 'Suscripciones' },
];

export default function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'gimnasio' ? gymLinks : userLinks;

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-dark-900 border-r border-dark-border flex flex-col transition-all duration-300 min-h-screen`}>
      {/* Logo */}
      <div className="p-4 border-b border-dark-border flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-electric to-neon rounded-xl flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-white font-black text-lg leading-tight tracking-tighter">Just<span className="text-electric">Fit</span><span className="text-white">365</span></h1>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">v1.0</p>
          </div>
        )}
      </div>

      {/* Partner logo */}
      {!collapsed && user?.gimnasioNombre && user.role !== 'gimnasio' && (
        <div className="px-4 py-3 border-b border-dark-border">
          <div className="flex items-center gap-2 px-3 py-2 bg-electric/5 border border-electric/10 rounded-xl">
            <Building2 className="w-4 h-4 text-electric/60" />
            <span className="text-xs text-white/50">{user.gimnasioNombre}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            end={link.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-electric/10 text-electric border border-electric/20'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70'
              }`
            }
          >
            <link.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-dark-border">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 mb-2`}>
          {user?.foto ? (
            <img src={user.foto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-xs font-black shrink-0">
              {user?.nombre?.charAt(0)}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.nombre}</p>
              <p className="text-white/30 text-xs capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger/70 hover:bg-danger/10 transition-all">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Cerrar Sesi&oacute;n</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center mt-2 py-2 text-white/20 hover:text-white/50 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
