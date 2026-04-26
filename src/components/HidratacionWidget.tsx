import { useState, useEffect } from 'react';
import { Plus, Minus, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserItem, setUserItem } from '../lib/storage';

export default function HidratacionWidget() {
  const { user } = useAuth();
  const perfil = user?.perfil;
  const [vasosConsumidos, setVasosConsumidos] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Parametros del usuario
  const peso = perfil?.peso || 70;
  const nivelActividad = perfil?.nivelActividad || 'Intermedio';

  // Detectar si hoy es dia de entreno leyendo la rutina semanal
  const esEntrenoDia = (() => {
    try {
      const saved = getUserItem('bc_rutina_semana');
      if (!saved) return true; // asumir entreno si no hay rutina
      const rutina = JSON.parse(saved);
      const jsDay = new Date().getDay();
      const diaIdx = jsDay === 0 ? 6 : jsDay - 1;
      const tipoDia = rutina[diaIdx]?.tipo || '';
      return tipoDia !== 'Descanso' && tipoDia !== '';
    } catch { return true; }
  })();

  // Calcular agua segun peso, nivel de actividad y si entrena hoy
  // Sedentario sin entreno: 30ml/kg, con entreno: 35ml/kg
  // Intermedio sin entreno: 35ml/kg, con entreno: 40ml/kg
  // Avanzado/Elite sin entreno: 40ml/kg, con entreno: 45ml/kg
  const factorBase = nivelActividad === 'Sedentario' ? 0.030
    : nivelActividad === 'Avanzado' || nivelActividad === 'Elite' ? 0.040
    : 0.035;
  const factorEntreno = esEntrenoDia ? 0.005 : 0;
  const litrosObjetivo = Math.round((peso * (factorBase + factorEntreno)) * 10) / 10;
  const vasosObjetivo = Math.max(6, Math.round(litrosObjetivo * 4)); // vasos de 250ml, minimo 6

  // Clave persistente para hoy
  const hoy = new Date().toISOString().split('T')[0];
  const STORAGE_KEY = `hidratacion_${hoy}`;

  // Cargar vasos al montar Y cuando cambia el usuario (para evitar leer 'anon')
  useEffect(() => {
    const saved = getUserItem(STORAGE_KEY);
    if (saved) setVasosConsumidos(parseInt(saved) || 0);
  }, [user?.dni, STORAGE_KEY]);

  // Tambien re-cargar cuando la ventana recupera foco (por si se cerro y abrio)
  useEffect(() => {
    const onFocus = () => {
      const saved = getUserItem(STORAGE_KEY);
      if (saved) setVasosConsumidos(parseInt(saved) || 0);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [STORAGE_KEY]);

  const guardarVasos = (cantidad: number) => {
    const valor = Math.max(0, Math.min(vasosObjetivo + 4, cantidad));
    setVasosConsumidos(valor);
    setUserItem(STORAGE_KEY, valor.toString());
  };

  const porcentaje = vasosObjetivo > 0 ? (vasosConsumidos / vasosObjetivo) * 100 : 0;
  const colorEstado = porcentaje >= 90 ? 'verde' : porcentaje >= 50 ? 'naranja' : 'amarillo';
  const colorClase = {
    amarillo: { bg: 'bg-yellow-400', shadow: 'shadow-yellow-400/50', text: 'text-yellow-400', border: 'border-yellow-400/30', bgLight: 'bg-yellow-400/10' },
    naranja: { bg: 'bg-orange-400', shadow: 'shadow-orange-400/50', text: 'text-orange-400', border: 'border-orange-400/30', bgLight: 'bg-orange-400/10' },
    verde: { bg: 'bg-emerald-400', shadow: 'shadow-emerald-400/50', text: 'text-emerald-400', border: 'border-emerald-400/30', bgLight: 'bg-emerald-400/10' },
  }[colorEstado];

  const labelEstado = colorEstado === 'verde' ? 'Optimo' : colorEstado === 'naranja' ? 'Medio' : 'Falta';

  const vasos = Array.from({ length: vasosObjetivo }, (_, i) => i < vasosConsumidos);

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-4 h-4 rounded-full ${colorClase.bg} shadow-lg ${colorClase.shadow} animate-pulse`} />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Hidrataci&oacute;n</h3>
            <p className={`text-[10px] ${colorClase.text} font-bold uppercase`}>{labelEstado} &middot; {Math.round(porcentaje)}%</p>
          </div>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="p-1.5 text-white/30 hover:text-electric transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info expandible */}
      {showInfo && (
        <div className="mb-3 bg-electric/5 border border-electric/10 rounded-xl p-3 text-[11px] text-white/60 leading-relaxed">
          <p className="text-white font-bold mb-1">&iquest;Por qu&eacute; {vasosObjetivo} vasos?</p>
          <p className="mb-1">Para tu peso (<strong>{peso}kg</strong>) y nivel (<strong>{nivelActividad}</strong>) necesit&aacute;s ~<strong>{litrosObjetivo}L</strong> = {vasosObjetivo} vasos de 250ml.</p>
          <p className="mb-1">{esEntrenoDia
            ? '&iexcl;Hoy entren&aacute;s! Se sum&oacute; agua extra por el gasto del ejercicio.'
            : 'Hoy es d&iacute;a de descanso, el c&aacute;lculo es menor.'}</p>
          <p className="text-white/40 text-[10px] mt-1">El agua regula temperatura, transporta nutrientes, lubrica articulaciones y es clave para la s&iacute;ntesis proteica muscular. Una persona de {peso}kg necesita m&aacute;s agua que una de {Math.round(peso * 0.7)}kg.</p>
        </div>
      )}

      {/* Vasos visuales */}
      <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
        {vasos.map((lleno, i) => (
          <button key={i} onClick={() => guardarVasos(i + 1)}
            className={`relative transition-all hover:scale-110 ${lleno ? 'opacity-100' : 'opacity-30'}`}
            title={`Vaso ${i + 1} de ${vasosObjetivo}`}>
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
              <path d="M4 6 L6 28 L18 28 L20 6 Z" stroke={lleno ? (colorEstado === 'verde' ? '#34d399' : colorEstado === 'naranja' ? '#fb923c' : '#facc15') : '#444'} strokeWidth="1.5" fill="none"/>
              {lleno && (
                <path d="M5.5 12 L6 27.5 L18 27.5 L18.5 12 Z" fill={colorEstado === 'verde' ? '#34d399' : colorEstado === 'naranja' ? '#fb923c' : '#facc15'} fillOpacity="0.5"/>
              )}
              {lleno && <line x1="7" y1="14" x2="7" y2="22" stroke="white" strokeOpacity="0.4" strokeWidth="0.5"/>}
            </svg>
          </button>
        ))}
      </div>

      {/* Contador y controles */}
      <div className="flex items-center justify-between bg-black/40 rounded-xl p-2">
        <button onClick={() => guardarVasos(vasosConsumidos - 1)} disabled={vasosConsumidos <= 0}
          className="w-8 h-8 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-white font-black text-2xl leading-none">
            {vasosConsumidos}<span className="text-white/30 text-sm font-normal">/{vasosObjetivo}</span>
          </p>
          <p className="text-white/40 text-[10px] mt-1">vasos &middot; {(vasosConsumidos * 0.25).toFixed(2)}L de {litrosObjetivo}L</p>
        </div>
        <button onClick={() => guardarVasos(vasosConsumidos + 1)}
          className={`w-8 h-8 ${colorClase.bgLight} hover:${colorClase.bg} ${colorClase.text} rounded-lg flex items-center justify-center transition-all`}>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tag dia entreno/descanso */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${esEntrenoDia ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-dark-border'}`}>
          {esEntrenoDia ? 'Dia de entreno' : 'Dia de descanso'}
        </span>
      </div>

      {/* Mensaje motivacional */}
      <p className="text-center text-[10px] text-white/30 mt-2">
        {colorEstado === 'verde' ? '\u00a1Excelente! Hidrataci\u00f3n \u00f3ptima \ud83d\udcaa' :
         colorEstado === 'naranja' ? 'Vas bien, segu\u00ed tomando agua \ud83d\udca7' :
         'Tom\u00e1 m\u00e1s agua, tu cuerpo lo necesita \ud83d\udca7'}
      </p>
    </div>
  );
}
