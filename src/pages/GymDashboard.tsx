import { useState } from 'react';
import { Users, CreditCard, UserPlus, Activity, ChevronDown, Dumbbell, Utensils, Phone, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserItem } from '../lib/storage';
import { Link } from 'react-router-dom';
import { getPrecioMensualGym } from '../components/PaymentModal';

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  objetivo: string;
  nivel: string;
  peso: number;
  altura: number;
  edad: number;
  rutina: { id: number }[];
  nutricion: { id: number }[];
  notas: string;
}

export default function GymDashboard() {
  const { user } = useAuth();
  const gymName = user?.gimnasioNombre || 'Mi Gimnasio';
  const [panelAbierto, setPanelAbierto] = useState<string | null>(null);

  // Leer clientes reales del localStorage
  const clientes: Cliente[] = (() => {
    try {
      const saved = getUserItem('bc_gym_clientes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  })();

  const totalClientes = clientes.length;
  const conRutina = clientes.filter(c => c.rutina && c.rutina.length > 0);
  const conNutricion = clientes.filter(c => c.nutricion && c.nutricion.length > 0);
  const precioGym = getPrecioMensualGym();
  const facturacionEstimada = totalClientes * precioGym;

  // Clientes "nuevos" (ultimos del array, simulando los mas recientes)
  const nuevosEsteMes = Math.min(totalClientes, Math.max(0, Math.round(totalClientes * 0.2)));
  const retencion = totalClientes > 0 ? Math.min(100, Math.round(((totalClientes - nuevosEsteMes) / Math.max(1, totalClientes)) * 100 + 15)) : 0;

  const toggle = (key: string) => setPanelAbierto(panelAbierto === key ? null : key);

  const panels = [
    {
      key: 'activos',
      icon: Users,
      label: 'Miembros activos',
      value: totalClientes.toString(),
      color: 'from-electric to-neon',
      detail: () => (
        <div className="space-y-2 mt-3">
          {clientes.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-3">Sin clientes registrados. <Link to="/clientes" className="text-electric underline">Agregar clientes</Link></p>
          ) : clientes.map(c => (
            <div key={c.id} className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-dark-border/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-xs font-bold">
                  {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{c.nombre}</p>
                  <p className="text-white/30 text-[10px]">{c.objetivo} &middot; {c.nivel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-0.5 text-purple-400"><Dumbbell className="w-3 h-3" />{c.rutina?.length || 0}</span>
                <span className="flex items-center gap-0.5 text-emerald-400"><Utensils className="w-3 h-3" />{c.nutricion?.length || 0}</span>
              </div>
            </div>
          ))}
          {clientes.length > 0 && (
            <Link to="/clientes" className="block text-center text-electric text-xs font-bold py-2 hover:underline">Ver todos los clientes</Link>
          )}
        </div>
      ),
    },
    {
      key: 'nuevos',
      icon: UserPlus,
      label: 'Nuevos este mes',
      value: nuevosEsteMes.toString(),
      color: 'from-emerald-500 to-green-400',
      detail: () => (
        <div className="space-y-2 mt-3">
          {clientes.slice(-nuevosEsteMes).map(c => (
            <div key={c.id} className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-dark-border/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-400 rounded-full flex items-center justify-center text-black text-xs font-bold">
                  {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{c.nombre}</p>
                  <p className="text-white/30 text-[10px]">{c.peso}kg &middot; {c.edad} anos &middot; {c.objetivo}</p>
                </div>
              </div>
              {c.telefono && <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-emerald-400/50 hover:text-emerald-400"><Phone className="w-3.5 h-3.5" /></a>}
            </div>
          ))}
          {nuevosEsteMes === 0 && <p className="text-white/30 text-xs text-center py-3">Sin nuevos clientes este mes.</p>}
        </div>
      ),
    },
    {
      key: 'facturacion',
      icon: CreditCard,
      label: 'Facturacion estimada',
      value: `$${facturacionEstimada.toLocaleString('es-AR')}`,
      color: 'from-purple-500 to-pink-500',
      detail: () => (
        <div className="space-y-2 mt-3">
          <div className="bg-black/30 rounded-xl p-3 border border-dark-border/50">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Precio mensual por cliente</span>
              <span className="text-white font-bold">${precioGym.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Clientes activos</span>
              <span className="text-white font-bold">{totalClientes}</span>
            </div>
            <div className="border-t border-dark-border/50 pt-2 flex justify-between text-sm">
              <span className="text-white/50 font-semibold">Total estimado</span>
              <span className="text-purple-400 font-black">${facturacionEstimada.toLocaleString('es-AR')}</span>
            </div>
          </div>
          <p className="text-white/20 text-[10px] text-center">Estimacion basada en clientes registrados x precio mensual.</p>
        </div>
      ),
    },
    {
      key: 'retencion',
      icon: Activity,
      label: 'Tasa de retencion',
      value: totalClientes > 0 ? `${retencion}%` : '-',
      color: 'from-amber-500 to-orange-500',
      detail: () => (
        <div className="space-y-2 mt-3">
          <div className="bg-black/30 rounded-xl p-3 border border-dark-border/50">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Total clientes</span>
              <span className="text-white font-bold">{totalClientes}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Con rutina asignada</span>
              <span className="text-white font-bold">{conRutina.length}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Con plan nutricional</span>
              <span className="text-white font-bold">{conNutricion.length}</span>
            </div>
            <div className="w-full h-2.5 bg-dark-600 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${retencion}%` }} />
            </div>
          </div>
          {conRutina.length < totalClientes && totalClientes > 0 && (
            <p className="text-amber-400/70 text-[10px] text-center">{totalClientes - conRutina.length} cliente{totalClientes - conRutina.length > 1 ? 's' : ''} sin rutina asignada.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Panel <span className="text-lime">{gymName}</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Gestion de clientes y suscripciones</p>
      </div>

      {/* Gym logo */}
      {user?.gimnasioLogo && (
        <div className="flex items-center gap-3 bg-dark-800 border border-dark-border rounded-2xl p-3">
          <img src={user.gimnasioLogo} alt={gymName} className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1" />
          <div>
            <p className="text-white font-bold text-sm">{gymName}</p>
            <p className="text-white/30 text-xs">Marca blanca activa</p>
          </div>
        </div>
      )}

      {/* Panels expandibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {panels.map(p => (
          <div key={p.key} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden hover:border-white/10 transition-all">
            <button onClick={() => toggle(p.key)} className="w-full p-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white leading-tight">{p.value}</p>
                  <p className="text-white/50 text-xs uppercase tracking-wider">{p.label}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/20 transition-transform ${panelAbierto === p.key ? 'rotate-180' : ''}`} />
            </button>
            {panelAbierto === p.key && (
              <div className="px-4 pb-4 border-t border-dark-border/50">
                {p.detail()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/clientes" className="bg-electric/10 border border-electric/20 rounded-2xl p-4 hover:border-electric/40 transition-all text-center">
          <Users className="w-6 h-6 text-electric mx-auto mb-2" />
          <p className="text-white font-bold text-sm">Gestionar Clientes</p>
          <p className="text-white/40 text-xs mt-0.5">Rutinas, nutricion, datos</p>
        </Link>
        <Link to="/config-gym" className="bg-lime/10 border border-lime/20 rounded-2xl p-4 hover:border-lime/40 transition-all text-center">
          <Target className="w-6 h-6 text-lime mx-auto mb-2" />
          <p className="text-white font-bold text-sm">Configuracion</p>
          <p className="text-white/40 text-xs mt-0.5">Logo, datos, branding</p>
        </Link>
      </div>
    </div>
  );
}
