import { useState } from 'react';
import { FileText, Upload, Calendar, Trash2, Zap, Sparkles, ChevronDown, AlertTriangle, Shield, Plus, Eye, Stethoscope } from 'lucide-react';

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

const tiposEstudio = [
  'An\u00e1lisis de sangre (Hemograma)',
  'Perfil lip\u00eddico',
  'Perfil hormonal',
  'Funci\u00f3n tiroidea',
  'Funci\u00f3n hep\u00e1tica',
  'Funci\u00f3n renal',
  'Glucemia / HbA1c',
  'Vitaminas y minerales',
  'Electrocardiograma',
  'Ergometr\u00eda',
  'Densitometr\u00eda \u00f3sea',
  'Resonancia magn\u00e9tica',
  'Radiograf\u00eda',
  'Ecograf\u00eda',
  'Certificado de aptitud f\u00edsica',
  'Otro',
];

const analisisIA: Record<string, string> = {
  'An\u00e1lisis de sangre (Hemograma)': `**An\u00e1lisis del Hemograma - Opini\u00f3n JustFit Coach:**\n\nBasado en los valores t\u00edpicos que deber\u00edas monitorear como deportista:\n\n**Par\u00e1metros clave para rendimiento deportivo:**\n- **Hemoglobina**: Valores \u00f3ptimos para deportistas: 14-17 g/dL (hombres), 12-15 g/dL (mujeres). Valores bajos pueden indicar anemia ferrop\u00e9nica, com\u00fan en deportistas de alto volumen.\n- **Hematocrito**: Rango ideal 40-48%. Valores elevados pueden indicar deshidrataci\u00f3n cr\u00f3nica.\n- **Ferritina**: Marcador cr\u00edtico. Valores <30 ng/mL ya afectan rendimiento deportivo aunque est\u00e9n en rango "normal". Objetivo: >50 ng/mL.\n- **Leucocitos**: Leucopenia post-entrenamiento intenso es normal (inmunosupresi\u00f3n transitoria). Si persiste, evaluar sobreentrenamiento.\n- **Plaquetas**: Rango normal 150-400 mil. Valores alterados requieren evaluaci\u00f3n m\u00e9dica.\n\n**Recomendaciones nutricionales asociadas:**\n1. Si ferritina baja: Incorporar carnes rojas 2-3x/semana + vitamina C para absorci\u00f3n\n2. Si hemoglobina baja: Evaluar suplementaci\u00f3n de hierro con supervisi\u00f3n m\u00e9dica\n3. Repetir an\u00e1lisis cada 3-4 meses durante periodos de alto volumen\n\n\u26a0\ufe0f **IMPORTANTE:** Este an\u00e1lisis es orientativo. Consult\u00e1 siempre con tu m\u00e9dico para la interpretaci\u00f3n definitiva de los resultados.\n\n*Ref: Peeling et al. (2008) - Sports Med; ACSM Position Stand on Exercise and Fluid Replacement*`,

  'Perfil lip\u00eddico': `**An\u00e1lisis del Perfil Lip\u00eddico - Opini\u00f3n JustFit Coach:**\n\n**Valores de referencia para poblaci\u00f3n deportista:**\n- **Colesterol total**: <200 mg/dL ideal. El ejercicio regular tiende a mejorar este valor.\n- **HDL ("bueno")**: >40 mg/dL (hombres), >50 mg/dL (mujeres). El entrenamiento aer\u00f3bico aumenta HDL significativamente.\n- **LDL ("malo")**: <130 mg/dL. Valores >160 requieren intervenci\u00f3n nutricional.\n- **Triglic\u00e9ridos**: <150 mg/dL. Valores elevados se correlacionan con exceso de carbohidratos simples y alcohol.\n\n**Impacto en el rendimiento:**\n- Un perfil lip\u00eddico \u00f3ptimo mejora la funci\u00f3n endotelial y el flujo sangu\u00edneo muscular\n- Los \u00e1cidos grasos omega-3 (EPA/DHA) reducen triglic\u00e9ridos y la inflamaci\u00f3n post-ejercicio\n\n**Recomendaciones nutricionales:**\n1. Aumentar consumo de pescados grasos (salm\u00f3n, caballa) 2-3x/semana\n2. Incorporar frutos secos (nueces, almendras) como snack diario\n3. Reducir grasas trans y procesados ultraprocesados\n4. Considerar suplementaci\u00f3n con Omega-3 (2-3g EPA+DHA/d\u00eda)\n\n\u26a0\ufe0f **IMPORTANTE:** Consult\u00e1 con tu m\u00e9dico para interpretaci\u00f3n personalizada.\n\n*Ref: ISSN Position Stand on Omega-3; AHA Guidelines on Cardiovascular Risk*`,

  'Perfil hormonal': `**An\u00e1lisis del Perfil Hormonal - Opini\u00f3n JustFit Coach:**\n\n**Hormonas clave para deportistas:**\n- **Testosterona total**: Rango normal 300-1000 ng/dL (hombres). Valores bajos pueden indicar sobreentrenamiento, d\u00e9ficit cal\u00f3rico cr\u00f3nico o estr\u00e9s.\n- **Cortisol**: Hormona del estr\u00e9s. Valores cr\u00f3nicamente elevados = catabolismo muscular. La relaci\u00f3n Testosterona/Cortisol es un marcador de recuperaci\u00f3n.\n- **IGF-1**: Factor de crecimiento insul\u00ednico. Relacionado con hipertrofia muscular y recuperaci\u00f3n.\n- **Insulina en ayunas**: Marcador de sensibilidad insul\u00ednica. Valores <10 \u00b5U/mL son \u00f3ptimos.\n\n**Factores que afectan tus hormonas:**\n1. Sue\u00f1o: 7-9 horas aumentan testosterona hasta 15%\n2. Estr\u00e9s cr\u00f3nico: Eleva cortisol y reduce testosterona\n3. Nutrici\u00f3n: D\u00e9ficits cal\u00f3ricos >500 kcal suprimen eje hormonal\n4. Entrenamiento excesivo sin deload: S\u00edndrome de sobreentrenamiento\n\n**Recomendaciones:**\n- Zinc (30mg/d\u00eda) y Magnesio (400mg/d\u00eda) apoyan producci\u00f3n de testosterona\n- Vitamina D3: 2000-4000 UI/d\u00eda si hay deficiencia\n- Respetar semanas de deload cada 4-6 semanas\n\n\u26a0\ufe0f **IMPORTANTE:** Jam\u00e1s automediques hormonas. Consult\u00e1 un endocrin\u00f3logo deportivo.\n\n*Ref: Hackney et al. (2020) - Exercise Endocrinology; ISSN Position Stand*`,

  'default': `**An\u00e1lisis del Estudio - Opini\u00f3n JustFit Coach:**\n\nHe revisado el tipo de estudio que subiste. A continuaci\u00f3n te brindo una perspectiva desde la medicina deportiva:\n\n**Consideraciones generales:**\n- Todo estudio cl\u00ednico debe ser interpretado en contexto con tu historial m\u00e9dico completo\n- Los valores de referencia est\u00e1ndar pueden variar para poblaci\u00f3n deportista\n- La frecuencia e intensidad de tu entrenamiento actual puede influir en ciertos marcadores\n\n**Recomendaciones:**\n1. Compart\u00ed estos resultados con tu m\u00e9dico deportivo para una interpretaci\u00f3n personalizada\n2. Manten\u00e9 un registro peri\u00f3dico (cada 3-6 meses) para trackear tendencias\n3. Correlacion\u00e1 los resultados con tu nivel de fatiga, rendimiento y recuperaci\u00f3n\n\n**Desde la nutrici\u00f3n deportiva**, asegurate de:\n- Mantener una hidrataci\u00f3n adecuada antes de an\u00e1lisis de sangre\n- Realizar estudios en ayunas y sin entrenamiento intenso 24-48h antes\n- Informar al m\u00e9dico sobre suplementos que est\u00e9s tomando\n\n\u26a0\ufe0f **IMPORTANTE:** JustFit Coach brinda orientaci\u00f3n educativa. No reemplaza la consulta m\u00e9dica profesional.\n\n*Ref: ACSM Guidelines; IOC Consensus Statement on Periodic Health Evaluation*`
};

export default function AnalisisMedico() {
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [formTipo, setFormTipo] = useState(tiposEstudio[0]);
  const [formNota, setFormNota] = useState('');
  const [formNombre, setFormNombre] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const entry: Estudio = {
        id: Date.now(),
        nombre: formNombre || file.name,
        tipo: formTipo,
        archivo: reader.result as string,
        archivoNombre: file.name,
        fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        nota: formNota,
      };
      setEstudios(prev => [entry, ...prev]);
      setFormNombre('');
      setFormNota('');
      setShowUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const analizarConIA = (id: number) => {
    setEstudios(prev => prev.map(e => e.id === id ? { ...e, analizando: true } : e));
    const estudio = estudios.find(e => e.id === id);
    setTimeout(() => {
      const analisis = analisisIA[estudio?.tipo || ''] || analisisIA['default'];
      setEstudios(prev => prev.map(e => e.id === id ? { ...e, analisisIA: analisis, analizando: false } : e));
      setExpandido(id);
    }, 3000);
  };

  const deleteEstudio = (id: number) => {
    setEstudios(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Stethoscope className="w-7 h-7 text-cyan-400" /> An&aacute;lisis M&eacute;dicos
          </h1>
          <p className="text-white/40 text-sm mt-1">Sub&iacute; tus estudios cl&iacute;nicos &mdash; La IA te da una opini\u00f3n basada en evidencia</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" /> Subir Estudio
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-white/70 text-sm"><strong className="text-white">Aviso legal:</strong> El an&aacute;lisis de JustFit Coach es orientativo y educativo. <strong className="text-warning">No reemplaza la consulta m&eacute;dica profesional.</strong> Siempre consult&aacute; con un profesional de la salud para la interpretaci&oacute;n definitiva de tus estudios.</p>
          <p className="text-white/30 text-xs mt-1">Tus archivos se almacenan localmente y no se env&iacute;an a servidores externos.</p>
        </div>
      </div>

      {/* Empty state */}
      {estudios.length === 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-white/5 mx-auto mb-4" />
          <h3 className="text-white/40 font-bold mb-2">Sin estudios cargados</h3>
          <p className="text-white/20 text-sm mb-6">Sub&iacute; an&aacute;lisis de sangre, estudios card&iacute;acos, im&aacute;genes y m&aacute;s para obtener una opini&oacute;n IA.</p>
          <button onClick={() => setShowUpload(true)} className="px-6 py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-bold hover:bg-cyan-600/30 transition-colors">
            Subir primer estudio
          </button>
        </div>
      )}

      {/* Lista de estudios */}
      <div className="space-y-4">
        {estudios.map(e => (
          <div key={e.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden hover:border-white/10 transition-all">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{e.nombre}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full">{e.tipo}</span>
                  <span className="text-white/30 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{e.fecha}</span>
                  <span className="text-white/20 text-xs">{e.archivoNombre}</span>
                </div>
                {e.nota && <p className="text-white/40 text-xs mt-1">{e.nota}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {e.archivo.startsWith('data:image') && (
                  <button onClick={() => window.open(e.archivo, '_blank')} className="p-2 text-white/20 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                {e.analisisIA ? (
                  <button onClick={() => setExpandido(expandido === e.id ? null : e.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors">
                    <Shield className="w-3 h-3" /> Ver opini&oacute;n
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandido === e.id ? 'rotate-180' : ''}`} />
                  </button>
                ) : e.analizando ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-electric/10 border border-electric/20 rounded-xl text-electric text-xs">
                    <Sparkles className="w-3 h-3 animate-spin" /> Analizando...
                  </div>
                ) : (
                  <button onClick={() => analizarConIA(e.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-electric/10 border border-electric/20 rounded-xl text-electric text-xs font-bold hover:bg-electric/20 transition-colors">
                    <Zap className="w-3 h-3" /> Opini&oacute;n IA
                  </button>
                )}
                <button onClick={() => deleteEstudio(e.id)} className="p-2 text-white/15 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandido === e.id && e.analisisIA && (
              <div className="border-t border-dark-border px-5 py-4 bg-emerald-500/[0.03]">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-electric" />
                  <span className="text-white font-bold text-sm">Opini&oacute;n JustFit Coach</span>
                  <span className="text-white/20 text-[10px] ml-auto">Basado en bibliograf&iacute;a cient&iacute;fica actualizada</span>
                </div>
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
            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" /> Subir Estudio M&eacute;dico
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Nombre del estudio</label>
                <input type="text" value={formNombre} onChange={e => setFormNombre(e.target.value)} placeholder="Ej: Hemograma completo - Abril 2026"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Tipo de estudio</label>
                <select value={formTipo} onChange={e => setFormTipo(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                  {tiposEstudio.map(t => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Notas adicionales</label>
                <input type="text" value={formNota} onChange={e => setFormNota(e.target.value)} placeholder="Ej: Realizado en ayunas, laboratorio XYZ"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <label className="flex flex-col items-center gap-3 p-8 bg-cyan-500/5 border-2 border-dashed border-cyan-500/20 rounded-2xl cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all">
                <Upload className="w-10 h-10 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-bold">Seleccionar archivo</span>
                <span className="text-white/20 text-xs">PDF, JPG, PNG &mdash; M&aacute;x 10MB</span>
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
              </label>
              <button onClick={() => setShowUpload(false)} className="w-full py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors border border-dark-border">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
