import { Flame, Droplets, Dumbbell, TrendingUp, Target, Zap, Apple, Timer, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import HidratacionWidget from '../components/HidratacionWidget';

const weekData = [
  { dia: 'Lun', calorias: 2200, proteina: 140, entrenamiento: 75 },
  { dia: 'Mar', calorias: 2350, proteina: 155, entrenamiento: 60 },
  { dia: 'Mi\u00e9', calorias: 2100, proteina: 130, entrenamiento: 0 },
  { dia: 'Jue', calorias: 2400, proteina: 160, entrenamiento: 90 },
  { dia: 'Vie', calorias: 2300, proteina: 150, entrenamiento: 45 },
  { dia: 'S\u00e1b', calorias: 2500, proteina: 145, entrenamiento: 80 },
  { dia: 'Dom', calorias: 1900, proteina: 120, entrenamiento: 0 },
];

const pesoData = [
  { sem: 'Sem 1', peso: 80 }, { sem: 'Sem 2', peso: 79.5 }, { sem: 'Sem 3', peso: 79.2 },
  { sem: 'Sem 4', peso: 78.8 }, { sem: 'Sem 5', peso: 78.3 }, { sem: 'Sem 6', peso: 78 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const perfil = user?.perfil;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Hola, <span className="text-electric">{user?.nombre?.split(' ')[0]}</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Tu resumen de rendimiento semanal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Calor\u00edas hoy', value: '2.300', unit: 'kcal', color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/20' },
          { icon: Droplets, label: 'Prote\u00edna', value: '150', unit: 'g', color: 'from-electric to-neon', glow: 'shadow-electric/20' },
          { icon: Dumbbell, label: 'Entrenamiento', value: '75', unit: 'min', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/20' },
          { icon: Target, label: 'Objetivo', value: perfil?.objetivo || 'Definir', unit: '', color: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`bg-dark-800 border border-dark-border rounded-2xl p-5 hover:border-white/10 transition-all shadow-lg ${s.glow}`}>
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-white">{s.value}<span className="text-white/30 text-sm ml-1 font-normal">{s.unit}</span></p>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hidratacion Widget */}
      <HidratacionWidget />

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cal chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Calor\u00edas Semanales
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData}>
              <XAxis dataKey="dia" stroke="#333" fontSize={12} />
              <YAxis stroke="#333" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="calorias" fill="#0099ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Link to="/nutricion" className="block bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20 rounded-2xl p-5 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Apple className="w-6 h-6 text-emerald-400" />
              <ArrowUpRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-white font-bold text-sm">Mi Plan Nutricional</h3>
            <p className="text-white/40 text-xs mt-1">2.300 kcal / 2.500 objetivo</p>
            <div className="w-full h-1.5 bg-dark-700 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '92%' }} />
            </div>
          </Link>

          <Link to="/rutina" className="block bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Dumbbell className="w-6 h-6 text-purple-400" />
              <ArrowUpRight className="w-4 h-4 text-purple-400/50 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-white font-bold text-sm">Mi Rutina de Hoy</h3>
            <p className="text-white/40 text-xs mt-1">Tren Superior - Push</p>
            <div className="flex gap-1 mt-3">
              {['Pecho', 'Hombro', 'Tr\u00edceps'].map(m => (
                <span key={m} className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">{m}</span>
              ))}
            </div>
          </Link>

          <Link to="/bio-coach" className="block bg-gradient-to-br from-electric/20 to-neon/10 border border-electric/20 rounded-2xl p-5 hover:border-electric/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-electric" />
              <ArrowUpRight className="w-4 h-4 text-electric/50 group-hover:text-electric transition-colors" />
            </div>
            <h3 className="text-white font-bold text-sm">JustFit Coach</h3>
            <p className="text-white/40 text-xs mt-1">Preguntale lo que necesites</p>
          </Link>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peso */}
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electric" /> Progreso de Peso
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={pesoData}>
              <XAxis dataKey="sem" stroke="#333" fontSize={11} />
              <YAxis stroke="#333" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="peso" stroke="#0099ff" fill="#0099ff" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Perfil metab\u00f3lico */}
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Timer className="w-4 h-4 text-neon" /> Perfil Metab&oacute;lico
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Peso', value: `${perfil?.peso || '-'} kg` },
              { label: 'Altura', value: `${perfil?.altura || '-'} cm` },
              { label: 'Edad', value: `${perfil?.edad || '-'} a\u00f1os` },
              { label: 'Nivel', value: perfil?.nivelActividad || '-' },
              { label: 'TMB estimada', value: '1.820 kcal' },
              { label: 'TDEE', value: '2.500 kcal' },
            ].map(item => (
              <div key={item.label} className="bg-black/40 border border-dark-border rounded-xl p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-white font-bold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
