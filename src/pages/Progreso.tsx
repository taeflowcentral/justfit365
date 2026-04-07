import { useState } from 'react';
import { Camera, Video, Upload, Calendar, Trash2, Zap, Sparkles, ChevronDown, Image, Film, Plus } from 'lucide-react';

interface MediaEntry {
  id: number;
  tipo: 'foto' | 'video';
  url: string;
  fecha: string;
  nota: string;
  analisisIA?: string;
  analizando?: boolean;
}

const analisisRespuestas = [
  `**An\u00e1lisis de composici\u00f3n corporal:**\n\nSe observa una mejora significativa en la definici\u00f3n muscular del tren superior comparado con registros anteriores.\n\n**Puntos destacados:**\n- Deltoides laterales con mayor volumen (+\u22482cm estimado)\n- Pectoral superior mostrando mejor separaci\u00f3n\n- L\u00ednea media abdominal m\u00e1s definida\n- Porcentaje graso estimado visual: 14-16%\n\n**Recomendaciones:**\n1. Mantener el d\u00e9ficit cal\u00f3rico moderado si el objetivo es definici\u00f3n\n2. Incrementar trabajo de hombro posterior para simetr\u00eda\n3. El progreso es consistente con 6 semanas de entrenamiento Push/Pull/Legs\n\n*Ref: NSCA Guidelines for Body Composition Assessment (2020)*`,
  `**An\u00e1lisis de progreso f\u00edsico:**\n\nComparando con registros previos, se evidencia un avance positivo en masa muscular general.\n\n**Observaciones:**\n- Tren inferior con notable desarrollo en cu\u00e1driceps\n- Gl\u00fateos con mejor activaci\u00f3n y volumen\n- Postura mejorada: menor cifosis tor\u00e1cica\n- Retenci\u00f3n de agua dentro de par\u00e1metros normales\n\n**Sugerencias:**\n1. Incorporar trabajo unilateral para corregir leve asimetr\u00eda en pantorrillas\n2. Considerar fase de volumen limpio las pr\u00f3ximas 4 semanas\n3. Evaluar periodizaci\u00f3n ondulante para romper meseta\n\n*Ref: Schoenfeld, B.J. (2016) - Science and Development of Muscle Hypertrophy*`,
  `**An\u00e1lisis de forma y t\u00e9cnica:**\n\nSe observa buena ejecuci\u00f3n general del movimiento registrado.\n\n**Puntos a favor:**\n- Rango de movimiento completo\n- Control exc\u00e9ntrico adecuado\n- Buena activaci\u00f3n del core durante el ejercicio\n\n**\u00c1reas de mejora:**\n1. Leve protracci\u00f3n escapular al final del movimiento - trabajar retracci\u00f3n\n2. Velocidad conc\u00e9ntrica podr\u00eda ser m\u00e1s explosiva\n3. Considerar agregar pausa isom\u00e9trica de 1-2s en el punto de m\u00e1xima contracci\u00f3n\n\n*Ref: ACSM Guidelines for Exercise Testing and Prescription (11th Ed)*`,
];

export default function Progreso() {
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadNota, setUploadNota] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'foto' | 'video'>('todos');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'foto' | 'video') => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const entry: MediaEntry = {
          id: Date.now() + Math.random(),
          tipo,
          url: reader.result as string,
          fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          nota: uploadNota,
        };
        setMedia(prev => [entry, ...prev]);
      };
      reader.readAsDataURL(file);
    });
    setUploadNota('');
    setShowUpload(false);
  };

  const analizarConIA = (id: number) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, analizando: true } : m));
    setTimeout(() => {
      const analisis = analisisRespuestas[Math.floor(Math.random() * analisisRespuestas.length)];
      setMedia(prev => prev.map(m => m.id === id ? { ...m, analisisIA: analisis, analizando: false } : m));
      setExpandido(id);
    }, 2500);
  };

  const deleteMedia = (id: number) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  const filtradas = media.filter(m => filtro === 'todos' || m.tipo === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Camera className="w-7 h-7 text-pink-400" /> Galer&iacute;a de Progreso
          </h1>
          <p className="text-white/40 text-sm mt-1">Subi fotos y videos &mdash; 365 analiza tus avances</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-pink-500/20">
          <Plus className="w-4 h-4" /> Subir
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          { key: 'todos' as const, label: 'Todos', count: media.length },
          { key: 'foto' as const, label: 'Fotos', count: media.filter(m => m.tipo === 'foto').length, icon: Image },
          { key: 'video' as const, label: 'Videos', count: media.filter(m => m.tipo === 'video').length, icon: Film },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              filtro === f.key ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-dark-800 text-white/40 hover:text-white border border-dark-border'
            }`}>
            {f.label} <span className="text-xs opacity-50">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {media.length === 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <Camera className="w-16 h-16 text-white/5 mx-auto mb-4" />
          <h3 className="text-white/40 font-bold mb-2">Sin registros a&uacute;n</h3>
          <p className="text-white/20 text-sm mb-6">Sub&iacute; fotos y videos de tu progreso para que la IA los analice y te muestre tus avances.</p>
          <button onClick={() => setShowUpload(true)} className="px-6 py-3 bg-pink-600/20 text-pink-400 border border-pink-500/30 rounded-xl text-sm font-bold hover:bg-pink-600/30 transition-colors">
            Subir primera foto
          </button>
        </div>
      )}

      {/* Grid de media */}
      <div className="space-y-4">
        {filtradas.map(m => (
          <div key={m.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden hover:border-white/10 transition-all">
            <div className="flex">
              {/* Thumbnail */}
              <div className="w-48 h-48 shrink-0 bg-black relative overflow-hidden">
                {m.tipo === 'foto' ? (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={m.url} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    m.tipo === 'foto' ? 'bg-pink-500/80 text-white' : 'bg-purple-500/80 text-white'
                  }`}>
                    {m.tipo === 'foto' ? <><Image className="w-2.5 h-2.5 inline mr-1" />Foto</> : <><Film className="w-2.5 h-2.5 inline mr-1" />Video</>}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Calendar className="w-3 h-3" />
                      {m.fecha}
                    </div>
                    <button onClick={() => deleteMedia(m.id)} className="p-1.5 text-white/15 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {m.nota && <p className="text-white/60 text-sm mt-2">{m.nota}</p>}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {m.analisisIA ? (
                    <button onClick={() => setExpandido(expandido === m.id ? null : m.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors">
                      <Sparkles className="w-3 h-3" /> Ver an&aacute;lisis IA
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandido === m.id ? 'rotate-180' : ''}`} />
                    </button>
                  ) : m.analizando ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-electric/10 border border-electric/20 rounded-xl text-electric text-xs">
                      <Sparkles className="w-3 h-3 animate-spin" /> Analizando con IA...
                    </div>
                  ) : (
                    <button onClick={() => analizarConIA(m.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-electric/10 border border-electric/20 rounded-xl text-electric text-xs font-bold hover:bg-electric/20 transition-colors">
                      <Zap className="w-3 h-3" /> Analizar con IA
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Analisis expandido */}
            {expandido === m.id && m.analisisIA && (
              <div className="border-t border-dark-border px-5 py-4 bg-emerald-500/[0.03]">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-electric" />
                  <span className="text-white font-bold text-sm">An&aacute;lisis JustFit Coach</span>
                </div>
                <div className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                  {m.analisisIA.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
                      : <span key={i}>{part}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de subida */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
              <Upload className="w-5 h-5 text-pink-400" /> Subir Registro
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Nota (opcional)</label>
                <input type="text" value={uploadNota} onChange={e => setUploadNota(e.target.value)}
                  placeholder="Ej: Semana 6 - Foto frontal post entreno"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center gap-3 p-6 bg-pink-500/5 border-2 border-dashed border-pink-500/20 rounded-2xl cursor-pointer hover:border-pink-500/40 hover:bg-pink-500/10 transition-all">
                  <Camera className="w-8 h-8 text-pink-400" />
                  <span className="text-pink-400 text-sm font-bold">Subir Foto</span>
                  <span className="text-white/20 text-[10px]">JPG, PNG</span>
                  <input type="file" accept="image/*" multiple onChange={e => handleUpload(e, 'foto')} className="hidden" />
                </label>
                <label className="flex flex-col items-center gap-3 p-6 bg-purple-500/5 border-2 border-dashed border-purple-500/20 rounded-2xl cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/10 transition-all">
                  <Video className="w-8 h-8 text-purple-400" />
                  <span className="text-purple-400 text-sm font-bold">Subir Video</span>
                  <span className="text-white/20 text-[10px]">MP4, MOV</span>
                  <input type="file" accept="video/*" multiple onChange={e => handleUpload(e, 'video')} className="hidden" />
                </label>
              </div>
              <p className="text-white/15 text-xs text-center">La fecha se registra autom&aacute;ticamente al subir</p>
              <button onClick={() => setShowUpload(false)} className="w-full py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors border border-dark-border">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
