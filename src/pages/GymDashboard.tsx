import { Users, CreditCard, TrendingUp, UserPlus, Activity, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const membresiaData = [
  { mes: 'Ene', activos: 32, nuevos: 5 },
  { mes: 'Feb', activos: 35, nuevos: 4 },
  { mes: 'Mar', activos: 40, nuevos: 8 },
  { mes: 'Abr', activos: 47, nuevos: 10 },
];

const miembros = [
  { nombre: 'Lucas Martinez', plan: 'Premium', estado: 'activo', ultima: '06/04/2026' },
  { nombre: 'Sofia Lopez', plan: 'B\u00e1sico', estado: 'activo', ultima: '05/04/2026' },
  { nombre: 'Pedro Ruiz', plan: 'Premium', estado: 'activo', ultima: '06/04/2026' },
  { nombre: 'Mar\u00eda Gonzalez', plan: 'B\u00e1sico', estado: 'vencido', ultima: '28/03/2026' },
  { nombre: 'Juan Rodr\u00edguez', plan: 'Premium', estado: 'activo', ultima: '04/04/2026' },
];

export default function GymDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Panel <span className="text-electric">Iron Gym</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Administraci&oacute;n de suscripciones grupales</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Miembros activos', value: '47', color: 'from-electric to-neon' },
          { icon: UserPlus, label: 'Nuevos este mes', value: '10', color: 'from-emerald-500 to-green-400' },
          { icon: CreditCard, label: 'Facturaci\u00f3n mensual', value: '$423.000', color: 'from-purple-500 to-pink-500' },
          { icon: Activity, label: 'Tasa de retenci\u00f3n', value: '92%', color: 'from-amber-500 to-orange-500' },
        ].map(s => (
          <div key={s.label} className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electric" /> Crecimiento
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={membresiaData}>
              <XAxis dataKey="mes" stroke="#333" fontSize={12} />
              <YAxis stroke="#333" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="activos" fill="#0099ff" radius={[6, 6, 0, 0]} name="Activos" />
              <Bar dataKey="nuevos" fill="#00e5ff" radius={[6, 6, 0, 0]} name="Nuevos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Miembros Recientes
          </h3>
          <div className="space-y-3">
            {miembros.map(m => (
              <div key={m.nombre} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-dark-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {m.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{m.nombre}</p>
                    <p className="text-white/30 text-xs">&Uacute;lt. actividad: {m.ultima}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    m.plan === 'Premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/40'
                  }`}>
                    {m.plan === 'Premium' && <Crown className="w-3 h-3" />}{m.plan}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>{m.estado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
