import { useState, useEffect } from 'react';
import { Plus, Minus, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserItem, setUserItem } from '../lib/storage';

export default function HidratacionWidget() {
  const { user } = useAuth();
  const perfil = user?.perfil;
  const [vasosConsumidos, setVasosConsumidos] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Calcular vasos objetivo segun perfil (peso * 0.04 L * 4 vasos/L)
  const peso = perfil?.peso || 70;
  const nivelActividad = perfil?.nivelActividad || 'Intermedio';
  const factorActividad = nivelActividad === 'Sedentario' ? 0.033 : nivelActividad === 'Avanzado' || nivelActividad === 'Elite' ? 0.045 : 0.04;
  const litrosObjetivo = peso * factorActividad;
  const vasosObjetivo = Math.round(litrosObjetivo * 4); // vasos de 250ml

  // Cargar vasos del dia desde localStorage
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const saved = getUserItem(`hidratacion_${hoy}`);
    setVasosConsumidos(saved ? parseInt(saved) : 0);
  }, []);

  const guardarVasos = (cantidad: number) => {
    const hoy = new Date().toISOString().split('T')[0];
    const valor = Math.max(0, Math.min(vasosObjetivo + 4, cantidad));
    setVasosConsumidos(valor);
    setUserItem(`hidratacion_${hoy}`, valor.toString());
  };

  const porcentaje = vasosObjetivo > 0 ? (vasosConsumidos / vasosObjetivo) * 100 : 0;
  // Color: amarillo si <50%, naranja si 50-90%, verde si >=90%
  const colorEstado = porcentaje >= 90 ? 'verde' : porcentaje >= 50 ? 'naranja' : 'amarillo';
  const colorClase = {
    amarillo: { bg: 'bg-yellow-400', shadow: 'shadow-yellow-400/50', text: 'text-yellow-400', border: 'border-yellow-400/30', bgLight: 'bg-yellow-400/10' },
    naranja: { bg: 'bg-orange-400', shadow: 'shadow-orange-400/50', text: 'text-orange-400', border: 'border-orange-400/30', bgLight: 'bg-orange-400/10' },
    verde: { bg: 'bg-emerald-400', shadow: 'shadow-emerald-400/50', text: 'text-emerald-400', border: 'border-emerald-400/30', bgLight: 'bg-emerald-400/10' },
  }[colorEstado];

  const labelEstado = colorEstado === 'verde' ? 'Optimo' : colorEstado === 'naranja' ? 'Medio' : 'Falta';

  // Generar array de vasos para mostrar
  const vasos = Array.from({ length: vasosObjetivo }, (_, i) => i < vasosConsumidos);

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Circulo de estado */}
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
          <p className="text-white font-bold mb-1">\u00bfPor qu\u00e9 {vasosObjetivo} vasos?</p>
          <p>Para tu peso ({peso}kg) y nivel ({nivelActividad}) necesit\u00e1s ~{litrosObjetivo.toFixed(1)}L = {vasosObjetivo} vasos de 250ml. El agua regula temperatura, transporta nutrientes, lubrica articulaciones y es clave para la s\u00edntesis proteica muscular.</p>
        </div>
      )}

      {/* Vasos visuales */}
      <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
        {vasos.map((lleno, i) => (
          <button key={i} onClick={() => guardarVasos(i + 1)}
            className={`relative transition-all hover:scale-110 ${lleno ? 'opacity-100' : 'opacity-30'}`}
            title={`Vaso ${i + 1} de ${vasosObjetivo}`}>
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
              {/* Vaso outline */}
              <path d="M4 6 L6 28 L18 28 L20 6 Z" stroke={lleno ? (colorEstado === 'verde' ? '#34d399' : colorEstado === 'naranja' ? '#fb923c' : '#facc15') : '#444'} strokeWidth="1.5" fill="none"/>
              {/* Agua dentro */}
              {lleno && (
                <path d="M5.5 12 L6 27.5 L18 27.5 L18.5 12 Z" fill={colorEstado === 'verde' ? '#34d399' : colorEstado === 'naranja' ? '#fb923c' : '#facc15'} fillOpacity="0.5"/>
              )}
              {/* Brillo */}
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
          <p className="text-white/40 text-[10px] mt-1">vasos &middot; {(vasosConsumidos * 0.25).toFixed(2)}L de {litrosObjetivo.toFixed(1)}L</p>
        </div>
        <button onClick={() => guardarVasos(vasosConsumidos + 1)}
          className={`w-8 h-8 ${colorClase.bgLight} hover:${colorClase.bg} ${colorClase.text} rounded-lg flex items-center justify-center transition-all`}>
          <Plus className="w-4 h-4" />
        </button>
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
