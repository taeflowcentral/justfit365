import { useState, useEffect } from 'react';
import { Flame, Droplets, Dumbbell, TrendingUp, Target, Zap, Apple, Timer, ArrowUpRight, Edit3, Save, CheckCircle, AlertTriangle, XCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import HidratacionWidget from '../components/HidratacionWidget';
import FraseDelDia from '../components/FraseDelDia';
import { getUserItem, setUserItem } from '../lib/storage';

// Datos semanales por defecto (se reemplazan con datos reales del plan nutricional si existen)
function getWeekData(planKey: string): { dia: string; calorias: number }[] {
  const DIAS = ['Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b', 'Dom'];
  try {
    const saved = getUserItem(planKey + '_semanal');
    if (saved) {
      const plan = JSON.parse(saved);
      return DIAS.map((dia, i) => {
        const comidas = plan[i] || [];
        const cal = comidas.reduce((a: number, c: { items: { cal: number }[] }) =>
          a + c.items.reduce((b: number, it: { cal: number }) => b + (Number(it.cal) || 0), 0), 0);
        return { dia, calorias: cal };
      });
    }
  } catch { /* ignore */ }
  return DIAS.map(dia => ({ dia, calorias: 0 }));
}

function getPesoHistory(): { sem: string; peso: number }[] {
  try {
    const saved = getUserItem('jf365_peso_history');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function savePesoHistory(data: { sem: string; peso: number }[]) {
  setUserItem('jf365_peso_history', JSON.stringify(data));
}

export default function Dashboard() {
  const { user } = useAuth();
  const perfil = user?.perfil;

  // Datos reales del plan nutricional
  const weekData = getWeekData('bc_plan_nutricional');
  const calHoy = (() => {
    const jsDay = new Date().getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return weekData[idx]?.calorias || 0;
  })();
  const calSemana = weekData.reduce((a, d) => a + d.calorias, 0);
  const protHoy = (() => {
    try {
      const saved = getUserItem('bc_plan_nutricional_semanal');
      if (!saved) return 0;
      const plan = JSON.parse(saved);
      const jsDay = new Date().getDay();
      const idx = jsDay === 0 ? 6 : jsDay - 1;
      const comidas = plan[idx] || [];
      return comidas.reduce((a: number, c: { items: { prot: number }[] }) =>
        a + c.items.reduce((b: number, it: { prot: number }) => b + (Number(it.prot) || 0), 0), 0);
    } catch { return 0; }
  })();

  // Calculos metabolicos reales
  const peso = perfil?.peso || 75;
  const altura = perfil?.altura || 170;
  const edad = perfil?.edad || 30;
  const nivel = perfil?.nivelActividad || 'Intermedio';
  const tmb = Math.round(10 * peso + 6.25 * altura - 5 * edad + 5);
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = Math.round(tmb * (factores[nivel] || 1.55));

  // Objetivo calorico del plan nutricional
  const calObjetivo = (() => {
    const saved = getUserItem('bc_plan_nutricional_cal_objetivo');
    return saved ? parseInt(saved) : tdee;
  })();

  // Meta de peso y fecha
  const [pesoMeta, setPesoMeta] = useState(() => {
    const saved = getUserItem('jf365_peso_meta');
    return saved ? parseFloat(saved) : peso;
  });
  const [fechaMeta, setFechaMeta] = useState(() => {
    return getUserItem('jf365_fecha_meta') || '';
  });
  const [editandoMeta, setEditandoMeta] = useState(false);

  const guardarMeta = () => {
    setUserItem('jf365_peso_meta', pesoMeta.toString());
    if (fechaMeta) setUserItem('jf365_fecha_meta', fechaMeta);
    setEditandoMeta(false);
  };

  // Historial de peso
  const [pesoHistory, setPesoHistory] = useState(getPesoHistory);

  // Registrar peso actual si cambio (una vez por semana)
  useEffect(() => {
    if (!perfil?.peso) return;
    const hoy = new Date();
    const semana = `${hoy.getDate()}/${hoy.getMonth() + 1}`;
    const last = pesoHistory[pesoHistory.length - 1];
    if (!last || last.sem !== semana) {
      const updated = [...pesoHistory, { sem: semana, peso: perfil.peso }].slice(-12);
      setPesoHistory(updated);
      savePesoHistory(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.peso]);

  // Calculos de progreso hacia la meta
  const diferenciaPeso = peso - pesoMeta;
  const quiereBajar = diferenciaPeso > 0;
  const quiereSubir = diferenciaPeso < 0;
  const kgRestantes = Math.abs(diferenciaPeso);

  // Dias restantes para la meta
  const diasRestantes = fechaMeta ? Math.max(0, Math.round((new Date(fechaMeta).getTime() - Date.now()) / 86400000)) : 0;
  const semanasRestantes = Math.max(1, Math.round(diasRestantes / 7));

  // Ritmo necesario: se recomienda 0.5-1kg/semana para bajar, 0.25-0.5kg/semana para subir
  const kgPorSemana = kgRestantes / semanasRestantes;
  const ritmoSaludableMax = quiereBajar ? 1.0 : 0.5;
  const ritmoSaludableMin = quiereBajar ? 0.3 : 0.1;

  // Calorias min/max para llegar al objetivo
  // Deficit: 7700 kcal = 1kg grasa
  const deficitDiario = quiereBajar ? Math.round((kgPorSemana * 7700) / 7) : 0;
  const superavitDiario = quiereSubir ? Math.round((kgPorSemana * 7700) / 7) : 0;
  const calMinDiarias = quiereBajar ? Math.max(1200, tdee - 700) : (quiereSubir ? tdee + 200 : Math.round(tdee * 0.9));
  const calMaxDiarias = quiereBajar ? Math.max(1400, tdee - 300) : (quiereSubir ? tdee + 500 : tdee);

  // Indice de correccion: comparar calorias reales vs necesarias
  const calPromedioDiario = calSemana > 0 ? Math.round(calSemana / 7) : 0;
  const calNecesarias = quiereBajar ? (tdee - deficitDiario) : (quiereSubir ? (tdee + superavitDiario) : tdee);

  // Estado del progreso
  type EstadoProgreso = 'excelente' | 'bien' | 'corregir' | 'sin_datos';
  const estadoProgreso: EstadoProgreso = calPromedioDiario === 0 ? 'sin_datos'
    : (calPromedioDiario >= calMinDiarias && calPromedioDiario <= calMaxDiarias) ? 'excelente'
    : (Math.abs(calPromedioDiario - calNecesarias) < 300) ? 'bien'
    : 'corregir';

  const estadoConfig = {
    excelente: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Excelente ritmo', desc: 'Vas por buen camino para alcanzar tu objetivo.' },
    bien: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Casi en rango', desc: 'Ajust\u00e1 un poco tus calor\u00edas para mejorar el ritmo.' },
    corregir: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Necesita ajuste', desc: quiereBajar ? 'Est\u00e1s consumiendo m\u00e1s calor\u00edas de las recomendadas.' : 'Est\u00e1s consumiendo menos calor\u00edas de las necesarias.' },
    sin_datos: { icon: XCircle, color: 'text-white/30', bg: 'bg-white/5', border: 'border-dark-border', label: 'Sin datos', desc: 'Gener\u00e1 un plan nutricional para ver tu progreso.' },
  };
  const est = estadoConfig[estadoProgreso];

  // Entreno del dia
  const entrenoHoy = (() => {
    try {
      const saved = getUserItem('bc_rutina_semana');
      if (!saved) return 'Sin rutina';
      const rutina = JSON.parse(saved);
      const jsDay = new Date().getDay();
      const idx = jsDay === 0 ? 6 : jsDay - 1;
      return rutina[idx]?.tipo || 'Descanso';
    } catch { return 'Sin rutina'; }
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Hola, <span className="text-electric">{user?.nombre?.split(' ')[0]}</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Tu resumen de rendimiento</p>
      </div>

      {/* Frase del dia */}
      <FraseDelDia />

      {/* Stats - compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { icon: Flame, label: 'Cal hoy', value: calHoy > 0 ? calHoy.toLocaleString('es-AR') : '-', unit: 'kcal', color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/20' },
          { icon: Droplets, label: 'Prote\u00edna', value: protHoy > 0 ? protHoy.toString() : '-', unit: 'g', color: 'from-electric to-neon', glow: 'shadow-electric/20' },
          { icon: Dumbbell, label: 'Entreno', value: entrenoHoy, unit: '', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/20' },
          { icon: Target, label: 'Objetivo', value: perfil?.objetivo?.split(',')[0] || 'Definir', unit: '', color: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`bg-dark-800 border border-dark-border rounded-2xl p-3.5 hover:border-white/10 transition-all shadow-lg ${s.glow}`}>
            <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-black text-white leading-tight truncate">{s.value}<span className="text-white/40 text-xs ml-1 font-normal">{s.unit}</span></p>
            <p className="text-white/50 text-[11px] mt-0.5 uppercase tracking-wider font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hidratacion Widget */}
      <HidratacionWidget />

      {/* Calorias Semanales + Rango objetivo */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" /> Calor&iacute;as Semanales
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData}>
            <XAxis dataKey="dia" stroke="#555" fontSize={12} tick={{ fill: '#999' }} />
            <YAxis stroke="#555" fontSize={11} tick={{ fill: '#888' }} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
            {calMinDiarias > 0 && <ReferenceLine y={calMinDiarias} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />}
            {calMaxDiarias > 0 && <ReferenceLine y={calMaxDiarias} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />}
            <Bar dataKey="calorias" fill="#0099ff" fillOpacity={0.45} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Rango calorico */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-black/40 rounded-xl p-2.5 text-center border border-amber-500/10">
            <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">M&iacute;nimo</p>
            <p className="text-amber-400 font-black text-lg leading-tight">{calMinDiarias}</p>
            <p className="text-white/30 text-[10px]">kcal/d&iacute;a</p>
          </div>
          <div className="bg-black/40 rounded-xl p-2.5 text-center border border-electric/10">
            <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Necesario</p>
            <p className="text-electric font-black text-lg leading-tight">{calNecesarias}</p>
            <p className="text-white/30 text-[10px]">kcal/d&iacute;a</p>
          </div>
          <div className="bg-black/40 rounded-xl p-2.5 text-center border border-emerald-500/10">
            <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">M&aacute;ximo</p>
            <p className="text-emerald-400 font-black text-lg leading-tight">{calMaxDiarias}</p>
            <p className="text-white/30 text-[10px]">kcal/d&iacute;a</p>
          </div>
        </div>

        {/* Indicador de correccion */}
        <div className={`mt-3 ${est.bg} border ${est.border} rounded-xl p-3 flex items-start gap-3`}>
          <est.icon className={`w-5 h-5 ${est.color} shrink-0 mt-0.5`} />
          <div>
            <p className={`font-bold text-sm ${est.color}`}>{est.label}</p>
            <p className="text-white/50 text-xs mt-0.5">{est.desc}</p>
            {calPromedioDiario > 0 && (
              <p className="text-white/40 text-[11px] mt-1">
                Promedio actual: <strong className="text-white/70">{calPromedioDiario} kcal/d&iacute;a</strong>
                {calPromedioDiario !== calNecesarias && (
                  <span className={calPromedioDiario > calNecesarias ? 'text-red-400' : 'text-amber-400'}>
                    {' '}({calPromedioDiario > calNecesarias ? '+' : ''}{calPromedioDiario - calNecesarias} kcal)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meta de peso con indicador de progreso */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-neon" /> Meta de Peso
          </h3>
          {!editandoMeta ? (
            <button onClick={() => setEditandoMeta(true)} className="p-1.5 text-white/20 hover:text-electric transition-colors rounded-lg hover:bg-white/5">
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={guardarMeta} className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
              <Save className="w-3 h-3" /> Guardar
            </button>
          )}
        </div>

        {editandoMeta ? (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-1">Peso deseado (kg)</label>
              <input type="number" min="30" max="250" step="0.5" value={pesoMeta}
                onChange={e => setPesoMeta(parseFloat(e.target.value) || peso)}
                className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-1">Fecha objetivo</label>
              <input type="date" value={fechaMeta}
                onChange={e => setFechaMeta(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-black/40 rounded-xl p-2.5 text-center border border-dark-border">
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Actual</p>
              <p className="text-white font-black text-lg leading-tight">{peso}</p>
              <p className="text-white/30 text-[10px]">kg</p>
            </div>
            <div className="bg-black/40 rounded-xl p-2.5 text-center border border-electric/15">
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Meta</p>
              <p className="text-electric font-black text-lg leading-tight">{pesoMeta}</p>
              <p className="text-white/30 text-[10px]">kg</p>
            </div>
            <div className="bg-black/40 rounded-xl p-2.5 text-center border border-dark-border">
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Faltan</p>
              <p className={`font-black text-lg leading-tight ${quiereBajar ? 'text-red-400' : quiereSubir ? 'text-emerald-400' : 'text-white/50'}`}>
                {kgRestantes > 0 ? kgRestantes.toFixed(1) : '0'}
              </p>
              <p className="text-white/30 text-[10px] flex items-center justify-center gap-0.5">
                kg {quiereBajar ? <ArrowDown className="w-2.5 h-2.5" /> : quiereSubir ? <ArrowUp className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
              </p>
            </div>
          </div>
        )}

        {/* Barra de progreso visual */}
        {kgRestantes > 0 && !editandoMeta && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
              <span>{quiereBajar ? `${pesoMeta} kg` : `${peso} kg`}</span>
              <span>{quiereBajar ? `${peso} kg` : `${pesoMeta} kg`}</span>
            </div>
            <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-electric to-neon rounded-full transition-all"
                style={{ width: `${Math.max(5, Math.min(95, kgRestantes > 0 ? ((1 - kgRestantes / Math.max(kgRestantes, Math.abs(peso - pesoMeta) + 5)) * 100) : 100))}%` }} />
            </div>
          </div>
        )}

        {/* Analisis del ritmo */}
        {fechaMeta && kgRestantes > 0.1 && !editandoMeta && (
          <div className={`rounded-xl p-3 border ${
            kgPorSemana <= ritmoSaludableMax && kgPorSemana >= ritmoSaludableMin
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : kgPorSemana > ritmoSaludableMax
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <div className="flex items-start gap-2">
              {kgPorSemana <= ritmoSaludableMax && kgPorSemana >= ritmoSaludableMin ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : kgPorSemana > ritmoSaludableMax ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-bold text-xs ${
                  kgPorSemana <= ritmoSaludableMax && kgPorSemana >= ritmoSaludableMin ? 'text-emerald-400'
                  : kgPorSemana > ritmoSaludableMax ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {kgPorSemana <= ritmoSaludableMax && kgPorSemana >= ritmoSaludableMin
                    ? 'Ritmo saludable y alcanzable'
                    : kgPorSemana > ritmoSaludableMax
                    ? 'Ritmo demasiado agresivo'
                    : 'Ritmo muy lento'}
                </p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Necesit&aacute;s {quiereBajar ? 'bajar' : 'subir'} <strong className="text-white/70">{kgPorSemana.toFixed(2)} kg/semana</strong> en {semanasRestantes} semanas.
                  {kgPorSemana > ritmoSaludableMax && (
                    <span className="text-red-400"> Recomendado: m&aacute;x {ritmoSaludableMax} kg/sem. Consider&aacute; extender la fecha.</span>
                  )}
                </p>
                {diasRestantes > 0 && (
                  <p className="text-white/30 text-[10px] mt-1">Faltan {diasRestantes} d&iacute;as ({semanasRestantes} semanas) para tu fecha objetivo.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!fechaMeta && !editandoMeta && kgRestantes > 0 && (
          <p className="text-white/30 text-[11px] text-center">
            Configur&aacute; una fecha objetivo para ver el an&aacute;lisis de ritmo.
          </p>
        )}

        {kgRestantes <= 0.1 && !editandoMeta && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 font-bold text-sm">Est&aacute;s en tu peso objetivo. &iexcl;Excelente!</p>
          </div>
        )}
      </div>

      {/* Progreso de peso - chart */}
      {pesoHistory.length >= 2 && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electric" /> Progreso de Peso
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={pesoHistory}>
              <XAxis dataKey="sem" stroke="#555" fontSize={11} tick={{ fill: '#888' }} />
              <YAxis stroke="#555" fontSize={11} tick={{ fill: '#888' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
              {pesoMeta > 0 && <ReferenceLine y={pesoMeta} stroke="#00e5ff" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Meta', fill: '#00e5ff', fontSize: 10 }} />}
              <Area type="monotone" dataKey="peso" stroke="#0099ff" fill="#0099ff" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Link to="/nutricion" className="block bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between mb-1.5">
            <Apple className="w-5 h-5 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-white font-bold text-sm">Mi Plan Nutricional</h3>
          <p className="text-white/50 text-xs mt-0.5">{calHoy > 0 ? `${calHoy} kcal / ${calObjetivo} objetivo` : 'Ver plan'}</p>
        </Link>

        <Link to="/rutina" className="block bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between mb-1.5">
            <Dumbbell className="w-5 h-5 text-purple-400" />
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400/50 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-white font-bold text-sm">Mi Rutina de Hoy</h3>
          <p className="text-white/50 text-xs mt-0.5">{entrenoHoy}</p>
        </Link>

        <Link to="/bio-coach" className="block bg-gradient-to-br from-electric/20 to-neon/10 border border-electric/20 rounded-2xl p-4 hover:border-electric/40 transition-all group">
          <div className="flex items-center justify-between mb-1.5">
            <Zap className="w-5 h-5 text-electric" />
            <ArrowUpRight className="w-3.5 h-3.5 text-electric/50 group-hover:text-electric transition-colors" />
          </div>
          <h3 className="text-white font-bold text-sm">JustFit Coach</h3>
          <p className="text-white/50 text-xs mt-0.5">Preguntale lo que necesites</p>
        </Link>
      </div>

      {/* Perfil metabolico compacto */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Timer className="w-4 h-4 text-neon" /> Perfil Metab&oacute;lico
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'Peso', value: `${peso} kg` },
            { label: 'Altura', value: `${altura} cm` },
            { label: 'Edad', value: `${edad} a\u00f1os` },
            { label: 'Nivel', value: nivel },
            { label: 'TMB', value: `${tmb.toLocaleString('es-AR')}` },
            { label: 'TDEE', value: `${tdee.toLocaleString('es-AR')}` },
          ].map(item => (
            <div key={item.label} className="bg-black/40 border border-dark-border rounded-xl p-2.5 text-center">
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">{item.label}</p>
              <p className="text-white font-bold text-sm mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
