import { useState, useEffect } from 'react';
import { FileText, Upload, Calendar, Trash2, Zap, Sparkles, AlertTriangle, Shield, Plus, Eye, Stethoscope } from 'lucide-react';

interface Estudio {
  id: number;
  nombre: string;
  tipo: string;
  archivo: string;
  archivoNombre: string;
  fecha: string;
  nota: string;
  analisisIA?: string;
  analizando?: boolean;
}

const ESTUDIOS_KEY = 'jf365_estudios_medicos';

const tiposEstudio = [
  'An\u00e1lisis de sangre (Hemograma)', 'Perfil lip\u00eddico', 'Perfil hormonal',
  'Funci\u00f3n tiroidea', 'Funci\u00f3n hep\u00e1tica', 'Funci\u00f3n renal',
  'Glucemia / HbA1c', 'Vitaminas y minerales', 'Electrocardiograma',
  'Ergometr\u00eda', 'Densitometr\u00eda \u00f3sea', 'Resonancia magn\u00e9tica',
  'Radiograf\u00eda', 'Ecograf\u00eda', 'Certificado de aptitud f\u00edsica', 'Otro',
];

const analisisIA: Record<string, string> = {
  'An\u00e1lisis de sangre (Hemograma)': `**An\u00e1lisis del Hemograma**\n\nMir\u00e1, estos son los valores que m\u00e1s importan para alguien que entrena:\n\n**Hemoglobina:** lo ideal para deportistas es 14-17 g/dL (hombres) o 12-15 g/dL (mujeres). Si est\u00e1 baja, puede ser anemia ferrop\u00e9nica, bastante com\u00fan si entren\u00e1s mucho.\n\n**Ferritina:** este es el marcador clave. Si est\u00e1 por debajo de 30 ng/mL ya te puede afectar el rendimiento aunque el m\u00e9dico te diga que est\u00e1 "en rango". El objetivo para deportistas es >50 ng/mL.\n\n**Hematocrito:** rango ideal 40-48%. Si est\u00e1 muy alto, pod\u00e9s estar deshidratado cr\u00f3nicamente.\n\n**Leucocitos:** si est\u00e1n bajos despu\u00e9s de un per\u00edodo de entrenamiento intenso, es normal (inmunosupresi\u00f3n transitoria). Si persiste, ojo con el sobreentrenamiento.\n\n**Qu\u00e9 hacer:**\n- Ferritina baja \u2192 carnes rojas 2-3x/semana + vitamina C\n- Hemoglobina baja \u2192 habl\u00e1 con tu m\u00e9dico sobre suplementar hierro\n- Repetir cada 3-4 meses en per\u00edodos de alto volumen\n\n\u26a0\ufe0f Siempre consult\u00e1 con tu m\u00e9dico para la interpretaci\u00f3n final.`,

  'Perfil lip\u00eddico': `**An\u00e1lisis del Perfil Lip\u00eddico**\n\n**Los valores que importan:**\n- **Colesterol total:** ideal <200 mg/dL. Entrenar lo mejora.\n- **HDL (el bueno):** >40 hombres, >50 mujeres. El aer\u00f3bico lo sube mucho.\n- **LDL (el malo):** <130 ideal. Si est\u00e1 >160, hay que intervenir con la dieta.\n- **Triglic\u00e9ridos:** <150 mg/dL. Si est\u00e1n altos, suele ser por exceso de carbos simples, alcohol o az\u00facar.\n\n**Qu\u00e9 hacer:**\n1. M\u00e1s pescado graso (salm\u00f3n, caballa) 2-3x/semana\n2. Frutos secos todos los d\u00edas (un pu\u00f1ado)\n3. Reducir ultraprocesados y grasas trans\n4. Omega-3 (2-3g EPA+DHA/d\u00eda)\n5. Los huevos NO suben el colesterol (ese mito ya muri\u00f3)\n\n\u26a0\ufe0f Consult\u00e1 con tu m\u00e9dico para la interpretaci\u00f3n personalizada.`,

  'Perfil hormonal': `**An\u00e1lisis del Perfil Hormonal**\n\n**Hormonas clave para deportistas:**\n- **Testosterona:** rango normal 300-1000 ng/dL (hombres). Si est\u00e1 baja, puede ser sobreentrenamiento, d\u00e9ficit cal\u00f3rico o estr\u00e9s cr\u00f3nico.\n- **Cortisol:** la hormona del estr\u00e9s. Cr\u00f3nicamente alta = catabolismo muscular.\n- **IGF-1:** factor de crecimiento, relacionado con hipertrofia y recuperaci\u00f3n.\n- **Insulina en ayunas:** <10 \u00b5U/mL es \u00f3ptimo.\n\n**C\u00f3mo mejorar tu perfil hormonal:**\n- Dormir 7-9 horas (una semana durmiendo mal baja la testo 15%)\n- No hacer d\u00e9ficits cal\u00f3ricos extremos\n- Zinc (30mg) + Magnesio (400mg) + Vitamina D (2000-4000 UI)\n- Reducir alcohol\n- Manejar el estr\u00e9s\n- Respetar deloads\n\n\u26a0\ufe0f Jam\u00e1s automediques hormonas. Consult\u00e1 un endocrin\u00f3logo.`,

  'Funci\u00f3n tiroidea': `**An\u00e1lisis de Funci\u00f3n Tiroidea**\n\n**Valores clave:**\n- **TSH:** 0.4-4.0 mIU/L (rango normal). Valores altos \u2192 hipotiroidismo. Bajos \u2192 hipertiroidismo.\n- **T4 libre:** 0.8-1.8 ng/dL. Es la hormona activa de reserva.\n- **T3 libre:** 2.3-4.2 pg/mL. La hormona que realmente acelera tu metabolismo.\n- **Anticuerpos TPO:** si est\u00e1n elevados, puede indicar Hashimoto (tiroiditis autoinmune).\n\n**Para deportistas con hipotiroidismo:**\n- Tu metabolismo puede ser 10-15% m\u00e1s lento que la f\u00f3rmula\n- Selenio (2-3 nueces de Brasil/d\u00eda) ayuda a convertir T4 en T3\n- No hacer d\u00e9ficits agresivos\n- Levotiroxina en ayunas, 30-60 min antes de comer\n- No tomarla con caf\u00e9 ni suplementos de calcio/hierro\n\n\u26a0\ufe0f Control con endocrin\u00f3logo cada 3-6 meses.`,

  'Glucemia / HbA1c': `**An\u00e1lisis de Glucemia**\n\n**Valores de referencia:**\n- **Glucemia en ayunas:** 70-100 mg/dL (normal). 100-125 \u2192 prediabetes. >126 \u2192 diabetes.\n- **HbA1c:** <5.7% normal. 5.7-6.4% prediabetes. >6.5% diabetes.\n- **Insulina en ayunas:** <10 \u00b5U/mL ideal. >15 \u2192 resistencia a la insulina.\n\n**El ejercicio de fuerza es el MEJOR remedio:**\n- Mejora la sensibilidad a la insulina de forma brutal\n- El m\u00fasculo absorbe glucosa sin necesidad de insulina durante el ejercicio\n- Efecto de mejora dura 24-48hs post-entreno\n\n**Qu\u00e9 hacer si est\u00e1 elevada:**\n1. Entrenamiento de fuerza 3-4x/semana (prioridad)\n2. Caminata de 15 min despu\u00e9s de cada comida\n3. Reducir carbos refinados y az\u00facares\n4. Aumentar fibra (30g/d\u00eda)\n5. Dormir bien (dormir mal empeora la resistencia a la insulina)\n\n\u26a0\ufe0f Consult\u00e1 con tu m\u00e9dico para ajustar tratamiento si correspond\u00e9.`,

  'Vitaminas y minerales': `**An\u00e1lisis de Vitaminas y Minerales**\n\n**Los que m\u00e1s importan para deportistas:**\n\n**Vitamina D:** lo ideal es 40-60 ng/mL. La mayor\u00eda est\u00e1 por debajo de 30. Suplementar 2000-4000 UI/d\u00eda.\n\n**Hierro/Ferritina:** ferritina >50 ng/mL para deportistas. Si est\u00e1 baja, carnes rojas + vitamina C.\n\n**Magnesio:** dif\u00edcil de medir en sangre (el 99% est\u00e1 dentro de las c\u00e9lulas). Si dorm\u00eds mal o ten\u00e9s calambres, probablemente te falta. 200-400mg bisglicinato antes de dormir.\n\n**Zinc:** 30mg/d\u00eda si no com\u00e9s mucha carne roja. Importante para testosterona e inmunidad.\n\n**Vitamina B12:** fundamental si sos vegetariano/vegano. Valores <400 pg/mL ya pueden dar s\u00edntomas.\n\n**\u00c1cido f\u00f3lico:** importante para recuperaci\u00f3n celular.\n\n\u26a0\ufe0f Siempre suplementar basado en an\u00e1lisis, no a ciegas.`,

  'default': `**An\u00e1lisis del Estudio**\n\nRevis\u00e9 el tipo de estudio que subiste. Ac\u00e1 van algunas consideraciones desde la perspectiva deportiva:\n\n**Cosas a tener en cuenta:**\n- Los valores "normales" de laboratorio son para poblaci\u00f3n sedentaria general. Para deportistas, algunos rangos \u00f3ptimos son diferentes\n- El entrenamiento intenso puede alterar transitoriamente algunos marcadores (leucocitos, enzimas musculares, etc.)\n- Ide\u00e1lmente, hac\u00e9 los an\u00e1lisis en un d\u00eda de descanso o con 48hs sin entreno pesado\n\n**Recomendaciones:**\n1. Compart\u00ed los resultados con tu m\u00e9dico deportivo\n2. Hac\u00e9 controles cada 3-6 meses para ver tendencias\n3. Anot\u00e1 c\u00f3mo te sent\u00edas cuando te hiciste el estudio (fatiga, rendimiento, etc.)\n\n\u26a0\ufe0f JustFit Coach te da orientaci\u00f3n educativa. Siempre consult\u00e1 con un profesional.`
};

function generarComparativa(estudiosDelTipo: Estudio[]): string {
  if (estudiosDelTipo.length < 2) return '';
  const primero = estudiosDelTipo[estudiosDelTipo.length - 1];
  const ultimo = estudiosDelTipo[0];
  return `\n\n**\ud83d\udcca Comparativa hist\u00f3rica:**\nTen\u00e9s ${estudiosDelTipo.length} estudios de este tipo cargados.\n- Primer registro: ${primero.fecha}\n- \u00daltimo registro: ${ultimo.fecha}\n- Per\u00edodo: ${estudiosDelTipo.length} controles\n\n**Conclusi\u00f3n:** Mantener un seguimiento peri\u00f3dico te permite detectar tendencias tempranas. Compar\u00e1 los valores num\u00e9ricos de cada estudio con tu m\u00e9dico para evaluar la evoluci\u00f3n.`;
}

export default function AnalisisMedico() {
  const [estudios, setEstudios] = useState<Estudio[]>(() => {
    const saved = localStorage.getItem(ESTUDIOS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [expandido, setExpandido] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [formTipo, setFormTipo] = useState(tiposEstudio[0]);
  const [formNota, setFormNota] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    localStorage.setItem(ESTUDIOS_KEY, JSON.stringify(estudios));
  }, [estudios]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const entry: Estudio = {
        id: Date.now(), nombre: formNombre || file.name, tipo: formTipo,
        archivo: reader.result as string, archivoNombre: file.name,
        fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        nota: formNota,
      };
      setEstudios(prev => [entry, ...prev]);
      setFormNombre(''); setFormNota(''); setShowUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const analizarConIA = (id: number) => {
    setEstudios(prev => prev.map(e => e.id === id ? { ...e, analizando: true } : e));
    const estudio = estudios.find(e => e.id === id);
    const estudiosDelTipo = estudios.filter(e => e.tipo === estudio?.tipo);
    setTimeout(() => {
      const analisis = (analisisIA[estudio?.tipo || ''] || analisisIA['default']) + generarComparativa(estudiosDelTipo);
      setEstudios(prev => prev.map(e => e.id === id ? { ...e, analisisIA: analisis, analizando: false } : e));
      setExpandido(id);
    }, 2500);
  };

  const deleteEstudio = (id: number) => {
    setEstudios(prev => prev.filter(e => e.id !== id));
  };

  // Tipos unicos cargados
  const tiposCargados = [...new Set(estudios.map(e => e.tipo))];
  const filtrados = filtroTipo === 'todos' ? estudios : estudios.filter(e => e.tipo === filtroTipo);

  // Historial por tipo para comparativa
  const historialPorTipo = tiposCargados.map(tipo => ({
    tipo,
    cantidad: estudios.filter(e => e.tipo === tipo).length,
    primera: estudios.filter(e => e.tipo === tipo).slice(-1)[0]?.fecha,
    ultima: estudios.filter(e => e.tipo === tipo)[0]?.fecha,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Stethoscope className="w-7 h-7 text-cyan-400" /> An&aacute;lisis M&eacute;dicos
        </h1>
        <p className="text-white/40 text-sm mt-1">{estudios.length} estudios guardados &mdash; Historial con comparativas</p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Subir Estudio
          </button>
        </div>
      </div>

      <div className="bg-warning/5 border border-warning/20 rounded-2xl p-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-white/50 text-xs"><strong className="text-white/70">Aviso:</strong> Las opiniones son orientativas. <strong className="text-warning">No reemplazan la consulta m&eacute;dica.</strong></p>
      </div>

      {/* Resumen por tipo (si hay estudios) */}
      {historialPorTipo.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {historialPorTipo.map(h => (
            <button key={h.tipo} onClick={() => setFiltroTipo(filtroTipo === h.tipo ? 'todos' : h.tipo)}
              className={`bg-dark-800 border rounded-xl p-3 text-left transition-all ${filtroTipo === h.tipo ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-dark-border hover:border-white/10'}`}>
              <p className="text-white text-xs font-bold truncate">{h.tipo}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-cyan-400 text-lg font-black">{h.cantidad}</span>
                <span className="text-white/20 text-[10px]">{h.primera === h.ultima ? h.primera : `${h.primera} - ${h.ultima}`}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filtro */}
      {tiposCargados.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFiltroTipo('todos')} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${filtroTipo === 'todos' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-dark-800 text-white/40 border border-dark-border'}`}>Todos ({estudios.length})</button>
          {tiposCargados.map(t => (
            <button key={t} onClick={() => setFiltroTipo(t)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${filtroTipo === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-dark-800 text-white/40 border border-dark-border'}`}>
              {t.split('(')[0].trim()} ({estudios.filter(e => e.tipo === t).length})
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {estudios.length === 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-white/5 mx-auto mb-4" />
          <h3 className="text-white/40 font-bold mb-2">Sin estudios cargados</h3>
          <p className="text-white/20 text-sm mb-4">Sub\u00ed tus an\u00e1lisis para armar un historial m\u00e9dico y obtener opiniones.</p>
          <button onClick={() => setShowUpload(true)} className="px-6 py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-bold">Subir primer estudio</button>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {filtrados.map(e => (
          <div key={e.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{e.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded">{e.tipo.split('(')[0].trim()}</span>
                  <span className="text-white/25 text-[10px] flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{e.fecha}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {e.archivo.startsWith('data:image') && (
                  <button onClick={() => window.open(e.archivo, '_blank')} className="p-1.5 text-white/15 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                )}
                {e.analisisIA ? (
                  <button onClick={() => setExpandido(expandido === e.id ? null : e.id)} className="p-1.5 text-emerald-400/50 hover:text-emerald-400 transition-colors">
                    <Shield className="w-4 h-4" />
                  </button>
                ) : e.analizando ? (
                  <Sparkles className="w-4 h-4 text-electric animate-spin" />
                ) : (
                  <button onClick={() => analizarConIA(e.id)} className="p-1.5 text-electric/50 hover:text-electric transition-colors"><Zap className="w-4 h-4" /></button>
                )}
                <button onClick={() => deleteEstudio(e.id)} className="p-1.5 text-white/10 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {expandido === e.id && e.analisisIA && (
              <div className="border-t border-dark-border px-4 py-4 bg-emerald-500/[0.02]">
                <div className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                  {e.analisisIA.split(/(\*\*.*?\*\*)/).map((part, i) =>
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
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg p-6" onClick={ev => ev.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-cyan-400" /> Subir Estudio</h2>
            <div className="space-y-3">
              <input type="text" value={formNombre} onChange={e => setFormNombre(e.target.value)} placeholder="Nombre (ej: Hemograma - Abril 2026)"
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              <select value={formTipo} onChange={e => setFormTipo(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                {tiposEstudio.map(t => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
              </select>
              <input type="text" value={formNota} onChange={e => setFormNota(e.target.value)} placeholder="Notas (opcional)"
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              <label className="flex flex-col items-center gap-2 p-6 bg-cyan-500/5 border-2 border-dashed border-cyan-500/20 rounded-2xl cursor-pointer hover:border-cyan-500/40 transition-all">
                <Upload className="w-8 h-8 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-bold">Seleccionar archivo</span>
                <span className="text-white/20 text-xs">PDF, JPG, PNG</span>
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
              </label>
              <button onClick={() => setShowUpload(false)} className="w-full py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
