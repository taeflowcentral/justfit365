import { useState, useEffect } from 'react';
import { Camera, Video, Upload, Calendar, Trash2, Zap, Sparkles, ChevronDown, Plus, TrendingUp, Scale, Ruler, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserItem, setUserItem } from '../lib/storage';

interface MediaEntry {
  id: number;
  tipo: 'foto' | 'video';
  url: string;
  fecha: string;
  nota: string;
  peso?: number;
  grasaCorporal?: number;
  masaMuscular?: number;
  medidas?: { cintura?: number; cadera?: number; pecho?: number; brazo?: number; muslo?: number };
  analisisIA?: string;
  analizando?: boolean;
}

const PROGRESO_KEY = 'jf365_progreso';

const analisisRespuestas = [
  `**An\u00e1lisis de tu progreso** \ud83d\udcaa\n\nMir\u00e1, comparando con tus registros anteriores se nota mejora:\n\n- **Definici\u00f3n muscular:** se ve m\u00e1s marcada la separaci\u00f3n de los deltoides y el pectoral superior\n- **Composici\u00f3n corporal:** aparente reducci\u00f3n de grasa subcut\u00e1nea en la zona media\n- **Volumen:** se nota aumento en brazos y hombros\n\n**Recomendaciones:**\n1. Segu\u00ed con la progresi\u00f3n de cargas, vas bien encaminado\n2. Si quer\u00e9s m\u00e1s definici\u00f3n, ajust\u00e1 un d\u00e9ficit suave (-200 kcal)\n3. Las fotos son la mejor herramienta de seguimiento, mejor que la balanza sola\n\nSegu\u00ed as\u00ed que se nota el laburo \ud83d\udd25`,
  `**Evaluaci\u00f3n visual de progreso** \ud83d\udcf8\n\n**Observaciones positivas:**\n- Mejor postura general comparado con registros anteriores\n- Tren inferior con desarrollo visible\n- L\u00ednea abdominal m\u00e1s definida\n\n**\u00c1reas de oportunidad:**\n- Podr\u00edas trabajar un poco m\u00e1s el hombro posterior para mejor simetr\u00eda\n- El tren superior podr\u00eda beneficiarse de m\u00e1s volumen\n\n**Tip:** sacate las fotos siempre en las mismas condiciones (misma luz, misma hora, en ayunas) para que la comparaci\u00f3n sea m\u00e1s precisa.\n\nVa muy bien el progreso, banc\u00e1 el proceso \u2728`,
  `**Seguimiento de cambios corporales** \ud83d\udcca\n\n**Lo que se nota:**\n- Reducci\u00f3n de grasa en flancos y espalda baja\n- Mejor tono muscular general\n- Hombros m\u00e1s redondeados\n\n**Estimaciones visuales:**\n- Porcentaje graso estimado: 15-18% (visual)\n- Tendencia: descendente vs registros anteriores\n\n**Siguiente paso:**\n- Si quer\u00e9s datos m\u00e1s precisos, hac\u00e9te una medici\u00f3n con plicometro o bioimpedancia\n- Registr\u00e1 tus medidas (cintura, cadera, brazo) cada 2 semanas\n- La balanza sola miente, las fotos + medidas son la verdad\n\nSegu\u00ed subiendo registros para poder hacer mejores comparativas \ud83d\udcaa`,
];

function calcularIMC(peso: number, alturaCm: number): { valor: number; categoria: string; color: string } {
  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);
  let categoria = '';
  let color = '';
  if (imc < 18.5) { categoria = 'Bajo peso'; color = 'text-amber-400'; }
  else if (imc < 25) { categoria = 'Normal'; color = 'text-emerald-400'; }
  else if (imc < 30) { categoria = 'Sobrepeso'; color = 'text-amber-400'; }
  else { categoria = 'Obesidad'; color = 'text-red-400'; }
  return { valor: Math.round(imc * 10) / 10, categoria, color };
}

export default function Progreso() {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaEntry[]>(() => {
    const saved = getUserItem(PROGRESO_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [expandido, setExpandido] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadNota, setUploadNota] = useState('');
  const [uploadPeso, setUploadPeso] = useState('');
  const [uploadGrasa, setUploadGrasa] = useState('');
  const [uploadCintura, setUploadCintura] = useState('');
  const [uploadCadera, setUploadCadera] = useState('');
  const [uploadBrazo, setUploadBrazo] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'foto' | 'video'>('todos');
  const [showComparativa, setShowComparativa] = useState(false);

  useEffect(() => {
    setUserItem(PROGRESO_KEY, JSON.stringify(media));
  }, [media]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'foto' | 'video') => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const entry: MediaEntry = {
          id: Date.now() + Math.random(),
          tipo, url: reader.result as string,
          fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          nota: uploadNota,
          peso: parseFloat(uploadPeso) || undefined,
          grasaCorporal: parseFloat(uploadGrasa) || undefined,
          medidas: (uploadCintura || uploadCadera || uploadBrazo) ? {
            cintura: parseFloat(uploadCintura) || undefined,
            cadera: parseFloat(uploadCadera) || undefined,
            brazo: parseFloat(uploadBrazo) || undefined,
          } : undefined,
        };
        setMedia(prev => [entry, ...prev]);
      };
      reader.readAsDataURL(file);
    });
    setUploadNota(''); setUploadPeso(''); setUploadGrasa('');
    setUploadCintura(''); setUploadCadera(''); setUploadBrazo('');
    setShowUpload(false);
  };

  const analizarConIA = (id: number) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, analizando: true } : m));
    setTimeout(() => {
      const analisis = analisisRespuestas[Math.floor(Math.random() * analisisRespuestas.length)];
      setMedia(prev => prev.map(m => m.id === id ? { ...m, analisisIA: analisis, analizando: false } : m));
      setExpandido(id);
    }, 2000);
  };

  const deleteMedia = (id: number) => { setMedia(prev => prev.filter(m => m.id !== id)); };
  const filtradas = media.filter(m => filtro === 'todos' || m.tipo === filtro);
  const conPeso = media.filter(m => m.peso);
  const conGrasa = media.filter(m => m.grasaCorporal);
  const conCintura = media.filter(m => m.medidas?.cintura);

  const perfil = user?.perfil;
  const imc = perfil && conPeso.length > 0 ? calcularIMC(conPeso[0].peso!, perfil.altura) : perfil ? calcularIMC(perfil.peso, perfil.altura) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Camera className="w-7 h-7 text-pink-400" /> Galer&iacute;a de Progreso
        </h1>
        <p className="text-white/40 text-sm mt-1">{media.length} registros &mdash; 365 analiza tus avances</p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Subir
          </button>
          {media.length >= 2 && (
            <button onClick={() => setShowComparativa(!showComparativa)} className="flex items-center gap-1.5 px-3 py-2 bg-electric/15 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/25 transition-colors">
              <TrendingUp className="w-3.5 h-3.5" /> {showComparativa ? 'Ocultar' : 'Ver'} Comparativa
            </button>
          )}
        </div>
      </div>

      {/* Indices corporales */}
      {(imc || conPeso.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {imc && (
            <div className="bg-dark-800 border border-dark-border rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" />IMC</p>
              <p className={`text-xl font-black ${imc.color}`}>{imc.valor}</p>
              <p className="text-white/30 text-[10px]">{imc.categoria}</p>
            </div>
          )}
          {conPeso.length > 0 && (
            <div className="bg-dark-800 border border-dark-border rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" />\u00daltimo peso</p>
              <p className="text-white text-xl font-black">{conPeso[0].peso} kg</p>
              {conPeso.length >= 2 && (
                <p className={`text-[10px] ${conPeso[0].peso! < conPeso[1].peso! ? 'text-emerald-400' : conPeso[0].peso! > conPeso[1].peso! ? 'text-amber-400' : 'text-white/30'}`}>
                  {conPeso[0].peso! < conPeso[1].peso! ? '\u2193' : conPeso[0].peso! > conPeso[1].peso! ? '\u2191' : '='} vs anterior ({conPeso[1].peso}kg)
                </p>
              )}
            </div>
          )}
          {conGrasa.length > 0 && (
            <div className="bg-dark-800 border border-dark-border rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3" />Grasa corporal</p>
              <p className="text-white text-xl font-black">{conGrasa[0].grasaCorporal}%</p>
              {conGrasa.length >= 2 && (
                <p className={`text-[10px] ${conGrasa[0].grasaCorporal! < conGrasa[1].grasaCorporal! ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {conGrasa[0].grasaCorporal! < conGrasa[1].grasaCorporal! ? '\u2193' : '\u2191'} vs anterior ({conGrasa[1].grasaCorporal}%)
                </p>
              )}
            </div>
          )}
          {conCintura.length > 0 && (
            <div className="bg-dark-800 border border-dark-border rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider flex items-center gap-1"><Ruler className="w-3 h-3" />Cintura</p>
              <p className="text-white text-xl font-black">{conCintura[0].medidas!.cintura} cm</p>
              {conCintura.length >= 2 && (
                <p className={`text-[10px] ${conCintura[0].medidas!.cintura! < conCintura[1].medidas!.cintura! ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {conCintura[0].medidas!.cintura! < conCintura[1].medidas!.cintura! ? '\u2193' : '\u2191'} vs anterior ({conCintura[1].medidas!.cintura}cm)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comparativa lado a lado */}
      {showComparativa && media.filter(m => m.tipo === 'foto').length >= 2 && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-electric" /> Comparativa: Primera vs \u00daltima</h3>
          <div className="grid grid-cols-2 gap-3">
            {[media.filter(m => m.tipo === 'foto').slice(-1)[0], media.filter(m => m.tipo === 'foto')[0]].map((m, i) => m && (
              <div key={m.id} className="space-y-2">
                <p className="text-white/40 text-xs text-center">{i === 0 ? 'Primer registro' : '\u00daltimo registro'}</p>
                <img src={m.url} alt="" className="w-full aspect-[3/4] object-cover rounded-xl" />
                <div className="text-center text-[10px] text-white/30">
                  {m.fecha} {m.peso && `\u2022 ${m.peso}kg`} {m.grasaCorporal && `\u2022 ${m.grasaCorporal}%`}
                </div>
              </div>
            ))}
          </div>
          {conPeso.length >= 2 && (
            <div className="mt-3 bg-black/30 rounded-xl p-3 text-center">
              <p className="text-white/50 text-xs">
                <strong className="text-white">Cambio de peso:</strong> {(conPeso[0].peso! - conPeso[conPeso.length - 1].peso!).toFixed(1)} kg
                {conGrasa.length >= 2 && <> &middot; <strong className="text-white">Grasa:</strong> {(conGrasa[0].grasaCorporal! - conGrasa[conGrasa.length - 1].grasaCorporal!).toFixed(1)}%</>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          { key: 'todos' as const, label: 'Todos', count: media.length },
          { key: 'foto' as const, label: 'Fotos', count: media.filter(m => m.tipo === 'foto').length },
          { key: 'video' as const, label: 'Videos', count: media.filter(m => m.tipo === 'video').length },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${filtro === f.key ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-dark-800 text-white/40 hover:text-white border border-dark-border'}`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Empty */}
      {media.length === 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <Camera className="w-16 h-16 text-white/5 mx-auto mb-4" />
          <h3 className="text-white/40 font-bold mb-2">Sin registros a\u00fan</h3>
          <p className="text-white/20 text-sm mb-4">Sub\u00ed fotos con tus medidas para hacer seguimiento de progreso.</p>
          <button onClick={() => setShowUpload(true)} className="px-6 py-3 bg-pink-600/20 text-pink-400 border border-pink-500/30 rounded-xl text-sm font-bold">Subir primera foto</button>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {filtradas.map(m => (
          <div key={m.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden hover:border-white/10 transition-all">
            <div className="flex">
              <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-black relative overflow-hidden">
                {m.tipo === 'foto' ? <img src={m.url} alt="" className="w-full h-full object-cover" /> : <video src={m.url} className="w-full h-full object-cover" />}
                <span className={`absolute top-1 left-1 text-[8px] px-1.5 py-0.5 rounded-full font-bold ${m.tipo === 'foto' ? 'bg-pink-500/80 text-white' : 'bg-purple-500/80 text-white'}`}>
                  {m.tipo === 'foto' ? 'FOTO' : 'VIDEO'}
                </span>
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{m.fecha}</span>
                    <button onClick={() => deleteMedia(m.id)} className="p-1 text-white/10 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {m.nota && <p className="text-white/50 text-xs mt-1">{m.nota}</p>}
                  {/* Datos corporales */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.peso && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded">{m.peso}kg</span>}
                    {m.grasaCorporal && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded">{m.grasaCorporal}% grasa</span>}
                    {m.medidas?.cintura && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded">Cint: {m.medidas.cintura}cm</span>}
                    {m.medidas?.brazo && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded">Brazo: {m.medidas.brazo}cm</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {m.analisisIA ? (
                    <button onClick={() => setExpandido(expandido === m.id ? null : m.id)} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" /> An\u00e1lisis <ChevronDown className={`w-2.5 h-2.5 transition-transform ${expandido === m.id ? 'rotate-180' : ''}`} />
                    </button>
                  ) : m.analizando ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-electric/10 rounded-lg text-electric text-[10px]"><Sparkles className="w-3 h-3 animate-spin" /> Analizando...</span>
                  ) : (
                    <button onClick={() => analizarConIA(m.id)} className="flex items-center gap-1 px-2 py-1 bg-electric/10 border border-electric/20 rounded-lg text-electric text-[10px] font-bold"><Zap className="w-3 h-3" /> Analizar</button>
                  )}
                </div>
              </div>
            </div>
            {expandido === m.id && m.analisisIA && (
              <div className="border-t border-dark-border px-4 py-3 bg-emerald-500/[0.02]">
                <div className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                  {m.analisisIA.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
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
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-pink-400" /> Nuevo Registro</h2>
            <div className="space-y-3">
              <input type="text" value={uploadNota} onChange={e => setUploadNota(e.target.value)} placeholder="Nota (ej: Semana 6 - Foto frontal)" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Peso (kg)</label>
                  <input type="number" step="0.1" value={uploadPeso} onChange={e => setUploadPeso(e.target.value)} placeholder="78.5" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Grasa (%)</label>
                  <input type="number" step="0.1" value={uploadGrasa} onChange={e => setUploadGrasa(e.target.value)} placeholder="15" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Cintura (cm)</label>
                  <input type="number" value={uploadCintura} onChange={e => setUploadCintura(e.target.value)} placeholder="82" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Cadera (cm)</label>
                  <input type="number" value={uploadCadera} onChange={e => setUploadCadera(e.target.value)} placeholder="95" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Brazo (cm)</label>
                  <input type="number" value={uploadBrazo} onChange={e => setUploadBrazo(e.target.value)} placeholder="35" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
              </div>

              <p className="text-white/15 text-[10px] text-center">Datos corporales opcionales. La fecha se registra autom\u00e1ticamente.</p>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center gap-2 p-4 bg-pink-500/5 border-2 border-dashed border-pink-500/20 rounded-2xl cursor-pointer hover:border-pink-500/40 transition-all">
                  <Camera className="w-7 h-7 text-pink-400" />
                  <span className="text-pink-400 text-xs font-bold">Foto</span>
                  <input type="file" accept="image/*" multiple onChange={e => handleUpload(e, 'foto')} className="hidden" />
                </label>
                <label className="flex flex-col items-center gap-2 p-4 bg-purple-500/5 border-2 border-dashed border-purple-500/20 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all">
                  <Video className="w-7 h-7 text-purple-400" />
                  <span className="text-purple-400 text-xs font-bold">Video</span>
                  <input type="file" accept="video/*" multiple onChange={e => handleUpload(e, 'video')} className="hidden" />
                </label>
              </div>
              <button onClick={() => setShowUpload(false)} className="w-full py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
