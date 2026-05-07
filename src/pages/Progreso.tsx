import { useState, useEffect } from 'react';
import { Camera, Video, Upload, Calendar, Trash2, Zap, Sparkles, ChevronDown, Plus, TrendingUp, Scale, Ruler, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProgreso, addProgreso, updateProgresoIA, deleteProgreso } from '../lib/datos';
import { compressImage, base64SizeKB } from '../lib/imageCompress';
import MedidasCorporalesSection from '../components/MedidasCorporalesSection';
import { type MedidaCorporal } from '../lib/medidasCorporales';
import { getUserItem, setUserItem } from '../lib/storage';

const MEDIDAS_KEY = 'jf365_medidas_corporales';

interface MediaEntry {
  id: string;
  tipo: 'foto' | 'video';
  url: string;
  fecha: string;
  nota: string;
  peso?: number;
  grasaCorporal?: number;
  medidas?: { cintura?: number; cadera?: number; brazo?: number };
  analisisIA?: string;
  analizando?: boolean;
}

// Parse "dd/mm/yyyy HH:mm" o "dd/mm/yyyy" a timestamp
function parseAlFecha(f: string): number {
  const m = f.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[, ]+(\d{1,2}):(\d{1,2}))?/);
  if (!m) return 0;
  return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)).getTime();
}

function generarAnalisisPersonalizado(
  actual: MediaEntry,
  anterior: MediaEntry | null,
  perfil?: { peso: number; altura: number; objetivo: string },
): string {
  const objetivo = (perfil?.objetivo || '').toLowerCase();
  const esCut = objetivo.includes('grasa');
  const esBulk = objetivo.includes('hipertrofia') || objetivo.includes('fuerza');
  const objetivoLabel = esCut ? 'p\u00e9rdida de grasa' : esBulk ? 'ganancia muscular' : 'mantenimiento';
  const partes: string[] = [];

  partes.push(`**\ud83d\udcf8 An\u00e1lisis de tu registro del ${actual.fecha}**`);
  partes.push(`Tu objetivo registrado: **${objetivoLabel}**`);

  // Caso: primer registro
  if (!anterior) {
    partes.push(`\n**Punto de partida**`);
    partes.push(`Este es tu primer registro de progreso. Lo guardamos como l\u00ednea base para comparar con futuros registros.`);
    partes.push(`\n**Datos iniciales:**`);
    if (actual.peso) partes.push(`\u2022 Peso: **${actual.peso} kg**`);
    if (actual.grasaCorporal) partes.push(`\u2022 Grasa corporal: **${actual.grasaCorporal}%**`);
    if (actual.medidas?.cintura) partes.push(`\u2022 Cintura: **${actual.medidas.cintura} cm**`);
    if (actual.medidas?.cadera) partes.push(`\u2022 Cadera: **${actual.medidas.cadera} cm**`);
    if (actual.medidas?.brazo) partes.push(`\u2022 Brazo: **${actual.medidas.brazo} cm**`);
    if (!actual.peso && !actual.grasaCorporal && !actual.medidas?.cintura) {
      partes.push(`\u2022 *No cargaste medidas. Te conviene cargar al menos peso para que pueda evaluar evoluci\u00f3n.*`);
    }
    partes.push(`\n**Para los pr\u00f3ximos registros:**`);
    partes.push(`\u2022 Sacate las fotos en las mismas condiciones: luz natural, misma hora del d\u00eda y en ayunas`);
    partes.push(`\u2022 Carg\u00e1 tus medidas cada 2 semanas para seguimiento real`);
    partes.push(`\u2022 La balanza sola miente: peso + grasa + medidas + foto te dan la verdad`);
    return partes.join('\n');
  }

  // Caso: hay registro anterior, calcular cambios reales
  const tsActual = parseAlFecha(actual.fecha);
  const tsAnterior = parseAlFecha(anterior.fecha);
  const dias = Math.max(1, Math.round((tsActual - tsAnterior) / (1000 * 60 * 60 * 24)));
  const semanas = Math.max(0.15, dias / 7);

  partes.push(`\n**Comparaci\u00f3n con el registro del ${anterior.fecha}** (hace ${dias} d\u00eda${dias !== 1 ? 's' : ''})`);

  const cambios: string[] = [];
  let positivos = 0, negativos = 0;

  if (actual.peso && anterior.peso) {
    const diff = +(actual.peso - anterior.peso).toFixed(1);
    const ritmo = +(diff / semanas).toFixed(2);
    const s = diff > 0 ? '+' : '';
    cambios.push(`\u2022 **Peso**: ${anterior.peso} \u2192 ${actual.peso} kg (**${s}${diff} kg**, ${s}${ritmo} kg/semana)`);
    if (esCut) { if (diff < -0.1) positivos++; else if (diff > 0.3) negativos++; }
    else if (esBulk) { if (diff > 0.1 && Math.abs(ritmo) < 0.7) positivos++; else if (diff < -0.3) negativos++; }
    else { if (Math.abs(diff) < 1) positivos++; else negativos++; }
  }
  if (actual.grasaCorporal && anterior.grasaCorporal) {
    const diff = +(actual.grasaCorporal - anterior.grasaCorporal).toFixed(1);
    const s = diff > 0 ? '+' : '';
    cambios.push(`\u2022 **Grasa corporal**: ${anterior.grasaCorporal}% \u2192 ${actual.grasaCorporal}% (**${s}${diff}%**)`);
    if (diff < -0.3) positivos += 2; else if (diff > 0.5) negativos++;
  }
  if (actual.medidas?.cintura && anterior.medidas?.cintura) {
    const diff = +(actual.medidas.cintura - anterior.medidas.cintura).toFixed(1);
    const s = diff > 0 ? '+' : '';
    cambios.push(`\u2022 **Cintura**: ${anterior.medidas.cintura} \u2192 ${actual.medidas.cintura} cm (**${s}${diff} cm**)`);
    if (diff < -0.5) positivos++; else if (diff > 1) negativos++;
  }
  if (actual.medidas?.cadera && anterior.medidas?.cadera) {
    const diff = +(actual.medidas.cadera - anterior.medidas.cadera).toFixed(1);
    const s = diff > 0 ? '+' : '';
    cambios.push(`\u2022 **Cadera**: ${anterior.medidas.cadera} \u2192 ${actual.medidas.cadera} cm (**${s}${diff} cm**)`);
  }
  if (actual.medidas?.brazo && anterior.medidas?.brazo) {
    const diff = +(actual.medidas.brazo - anterior.medidas.brazo).toFixed(1);
    const s = diff > 0 ? '+' : '';
    cambios.push(`\u2022 **Brazo**: ${anterior.medidas.brazo} \u2192 ${actual.medidas.brazo} cm (**${s}${diff} cm**)`);
    if (esBulk && diff > 0.2) positivos++;
  }

  if (cambios.length === 0) {
    partes.push(``);
    partes.push(`No cargaste medidas en uno o ambos registros, as\u00ed que no puedo comparar n\u00fameros. Pod\u00e9s ver las dos fotos lado a lado en la **Comparativa** de arriba. Para una evaluaci\u00f3n objetiva, carg\u00e1 peso, grasa y medidas en cada registro.`);
  } else {
    partes.push(``);
    partes.push(...cambios);
  }

  // Evaluacion segun objetivo
  if (cambios.length > 0) {
    partes.push(`\n**Evaluaci\u00f3n seg\u00fan tu objetivo (${objetivoLabel}):**`);
    if (positivos > negativos && positivos > 0) {
      partes.push(`\u2705 **Vas en la direcci\u00f3n correcta.** Los n\u00fameros muestran progreso real hacia tu meta. Banc\u00e1 el proceso.`);
    } else if (negativos > positivos) {
      if (esCut) {
        partes.push(`\u26a0\ufe0f **Retroceso respecto a tu objetivo.** El peso o las medidas subieron en lugar de bajar. Posibles causas: comer m\u00e1s de lo que pens\u00e1s (revis\u00e1 porciones reales), retenci\u00f3n por carbos/sodio (puede ser temporal), o falta de cardio. Antes de drasticar, esper\u00e1 1 semana m\u00e1s y volv\u00e9 a medir.`);
      } else if (esBulk) {
        partes.push(`\u26a0\ufe0f **Estancado o perdiendo masa.** Si quer\u00e9s ganar m\u00fasculo necesit\u00e1s super\u00e1vit cal\u00f3rico real (+200 a +400 kcal sobre tu mantenimiento) y prote\u00edna alta (1.8-2.2 g/kg). Tambi\u00e9n revis\u00e1: \u00bfdorm\u00eds 7+ horas? \u00bfprogres\u00e1 las cargas?`);
      } else {
        partes.push(`\u26a0\ufe0f Hay cambios que no acompa\u00f1an tu objetivo de mantenimiento. Peque\u00f1os ajustes a la dieta o entreno pueden traerte de vuelta al rango.`);
      }
    } else {
      if (semanas < 2) {
        partes.push(`\ud83d\udcca **Plazo corto.** Pasaron solo ${dias} d\u00eda${dias !== 1 ? 's' : ''}. No esper\u00e9s cambios visibles a\u00fan: lo recomendado es comparar entre 2-4 semanas para ver evoluci\u00f3n real.`);
      } else {
        partes.push(`\ud83d\udcca **Estancamiento.** Los n\u00fameros est\u00e1n casi iguales. Es normal a veces, pero si llev\u00e1s 3+ semanas as\u00ed: si quer\u00e9s bajar grasa rest\u00e1 100-200 kcal o sum\u00e1 cardio; si quer\u00e9s ganar masa sum\u00e1 100-200 kcal o aument\u00e1 cargas.`);
      }
    }
  }

  // Recomendacion especifica por ritmo
  if (actual.peso && anterior.peso) {
    const diff = actual.peso - anterior.peso;
    const ritmo = Math.abs(diff) / semanas;
    if (esCut && diff < 0 && ritmo > 1.0) {
      partes.push(`\n**\u26a0\ufe0f Ritmo agresivo:** est\u00e1s bajando ${ritmo.toFixed(2)} kg/sem. Recomendado: 0.5-0.75 kg/sem. A este ritmo perd\u00e9s masa muscular adem\u00e1s de grasa. Sub\u00ed 200-300 kcal/d\u00eda.`);
    } else if (esBulk && diff > 0 && ritmo > 0.7) {
      partes.push(`\n**\u26a0\ufe0f Subiendo muy r\u00e1pido:** ${ritmo.toFixed(2)} kg/sem es probablemente m\u00e1s grasa que m\u00fasculo. Recomendado: 0.25-0.5 kg/sem. Baj\u00e1 200 kcal/d\u00eda.`);
    }
  }

  partes.push(`\n*Tip: sacate las fotos siempre con la misma luz, hora y postura para que la comparaci\u00f3n sea precisa.*`);

  return partes.join('\n');
}

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
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadNota, setUploadNota] = useState('');
  const [uploadPeso, setUploadPeso] = useState('');
  const [uploadGrasa, setUploadGrasa] = useState('');
  const [uploadCintura, setUploadCintura] = useState('');
  const [uploadCadera, setUploadCadera] = useState('');
  const [uploadBrazo, setUploadBrazo] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'foto' | 'video'>('todos');
  const [showComparativa, setShowComparativa] = useState(false);
  const [medidas, setMedidas] = useState<MedidaCorporal[]>(() => {
    try { const saved = getUserItem(MEDIDAS_KEY); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const handleMedidasChange = (nuevas: MedidaCorporal[]) => {
    setMedidas(nuevas);
    setUserItem(MEDIDAS_KEY, JSON.stringify(nuevas));
  };

  // Cargar desde Supabase al montar
  useEffect(() => {
    cargarMedia();
  }, []);

  const cargarMedia = async () => {
    const data = await getProgreso();
    const items: MediaEntry[] = data.map(d => ({
      id: d.id,
      tipo: d.tipo as 'foto' | 'video',
      url: d.url,
      fecha: d.fecha,
      nota: d.nota || '',
      peso: d.peso,
      grasaCorporal: d.grasa_corporal,
      medidas: (d.cintura || d.cadera || d.brazo) ? { cintura: d.cintura, cadera: d.cadera, brazo: d.brazo } : undefined,
      analisisIA: d.analisis_ia,
    }));
    setMedia(items);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'foto' | 'video') => {
    const files = e.target.files;
    if (!files) return;
    setShowUpload(false);
    for (const file of Array.from(files)) {
      try {
        // Validar tamano
        if (file.size > 50 * 1024 * 1024) {
          alert(`${file.name} es muy grande (m\u00e1ximo 50MB)`);
          continue;
        }
        // Comprimir imagen, video va tal cual
        const url = tipo === 'foto'
          ? await compressImage(file, 1200, 0.7)
          : await new Promise<string>((res, rej) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

        const sizeKB = base64SizeKB(url);
        if (sizeKB > 800) {
          alert(`Archivo demasiado grande (${sizeKB}KB). M\u00e1ximo 800KB. Prob\u00e1 con una imagen m\u00e1s chica.`);
          continue;
        }

        const result = await addProgreso({
          tipo, url,
          fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          nota: uploadNota,
          peso: parseFloat(uploadPeso) || undefined,
          grasa_corporal: parseFloat(uploadGrasa) || undefined,
          cintura: parseFloat(uploadCintura) || undefined,
          cadera: parseFloat(uploadCadera) || undefined,
          brazo: parseFloat(uploadBrazo) || undefined,
        });
        if (!result.success) {
          alert('Error al guardar en la nube:\n' + (result.error || 'desconocido') + '\n\nVerific\u00e1 que la tabla "progreso" exista en Supabase.');
        }
      } catch (err) {
        alert('Error procesando archivo: ' + (err instanceof Error ? err.message : 'desconocido'));
      }
    }
    await cargarMedia();
    setUploadNota(''); setUploadPeso(''); setUploadGrasa('');
    setUploadCintura(''); setUploadCadera(''); setUploadBrazo('');
  };

  const analizarConIA = async (id: string) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, analizando: true } : m));
    setTimeout(async () => {
      const actual = media.find(m => m.id === id);
      if (!actual) {
        setMedia(prev => prev.map(m => m.id === id ? { ...m, analizando: false } : m));
        return;
      }
      // Buscar el registro inmediatamente anterior del mismo tipo (foto/video)
      // por fecha cronologica real
      const tsActual = parseAlFecha(actual.fecha);
      const candidatos = media
        .filter(m => m.id !== id && m.tipo === actual.tipo && parseAlFecha(m.fecha) < tsActual)
        .sort((a, b) => parseAlFecha(b.fecha) - parseAlFecha(a.fecha));
      const anterior = candidatos[0] || null;

      const analisis = generarAnalisisPersonalizado(actual, anterior, user?.perfil);
      await updateProgresoIA(id, analisis);
      setMedia(prev => prev.map(m => m.id === id ? { ...m, analisisIA: analisis, analizando: false } : m));
      setExpandido(id);
    }, 1200);
  };

  const deleteMedia = async (id: string) => {
    await deleteProgreso(id);
    setMedia(prev => prev.filter(m => m.id !== id));
  };
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
              <p className="text-white/30 text-[10px] uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" />Ultimo peso</p>
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
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-electric" /> Comparativa: Primera vs Ultima</h3>
          <div className="grid grid-cols-2 gap-3">
            {[media.filter(m => m.tipo === 'foto').slice(-1)[0], media.filter(m => m.tipo === 'foto')[0]].map((m, i) => m && (
              <div key={m.id} className="space-y-2">
                <p className="text-white/40 text-xs text-center">{i === 0 ? 'Primer registro' : 'Ultimo registro'}</p>
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

      {/* Medidas corporales */}
      <MedidasCorporalesSection
        medidas={medidas}
        onChange={handleMedidasChange}
        perfil={perfil ? { peso: perfil.peso, altura: perfil.altura, objetivo: perfil.objetivo, genero: perfil.genero } : undefined}
      />

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
          <h3 className="text-white/40 font-bold mb-2">Sin registros aun</h3>
          <p className="text-white/20 text-sm mb-4">Subi fotos con tus medidas para hacer seguimiento de progreso.</p>
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
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {m.analisisIA ? (
                    <>
                      <button onClick={() => setExpandido(expandido === m.id ? null : m.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> Análisis <ChevronDown className={`w-3 h-3 transition-transform ${expandido === m.id ? 'rotate-180' : ''}`} />
                      </button>
                      <button onClick={() => analizarConIA(m.id)} className="flex items-center gap-1 px-2 py-1.5 bg-white/5 border border-dark-border rounded-lg text-white/55 hover:text-electric hover:bg-white/10 text-xs font-semibold transition-colors" title="Volver a generar el análisis con datos actualizados">
                        <Zap className="w-3 h-3" /> Re-analizar
                      </button>
                    </>
                  ) : m.analizando ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-electric/10 rounded-lg text-electric text-xs font-semibold"><Sparkles className="w-3.5 h-3.5 animate-spin" /> Analizando...</span>
                  ) : (
                    <button onClick={() => analizarConIA(m.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-electric/10 border border-electric/20 rounded-lg text-electric text-xs font-bold hover:bg-electric/20 transition-colors"><Zap className="w-3.5 h-3.5" /> Analizar</button>
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

              <p className="text-white/15 text-[10px] text-center">Datos corporales opcionales. La fecha se registra automaticamente.</p>

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
