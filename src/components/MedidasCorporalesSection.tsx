import { useState } from 'react';
import { Ruler, Plus, Trash2, Sparkles, Zap, ChevronDown, X, TrendingUp, Activity, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  type MedidaCorporal,
  PARAMS,
  nuevaMedida,
  generarAnalisisMedidas,
  calcularIMC,
  categoriaIMC,
  calcularICC,
  categoriaICC,
} from '../lib/medidasCorporales';

interface Props {
  medidas: MedidaCorporal[];
  onChange: (medidas: MedidaCorporal[]) => void;
  perfil?: { peso: number; altura: number; objetivo: string; genero?: string };
  titulo?: string;
}

export default function MedidasCorporalesSection({ medidas, onChange, perfil, titulo = 'Medidas corporales' }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  // Form draft
  const draftInicial: Partial<MedidaCorporal> = { fecha: new Date().toISOString().slice(0, 10) };
  const [draft, setDraft] = useState<Partial<MedidaCorporal>>(draftInicial);

  const ordenadas = [...medidas].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultima = ordenadas[0];
  const anterior = ordenadas[1];
  const esHombre = perfil?.genero === 'Hombre';

  const abrirNueva = () => {
    setDraft(draftInicial);
    setEditandoId(null);
    setShowForm(true);
  };

  const abrirEdicion = (m: MedidaCorporal) => {
    setDraft({ ...m });
    setEditandoId(m.id);
    setShowForm(true);
  };

  const guardar = () => {
    if (!draft.fecha) return;
    if (editandoId) {
      onChange(medidas.map(m => m.id === editandoId ? { ...m, ...draft } as MedidaCorporal : m));
    } else {
      const nueva = nuevaMedida(draft);
      onChange([...medidas, nueva]);
    }
    setShowForm(false);
    setEditandoId(null);
    setDraft(draftInicial);
  };

  const eliminar = (id: string) => {
    if (confirm('¿Eliminar este registro de medidas?')) {
      onChange(medidas.filter(m => m.id !== id));
    }
  };

  const analizar = (id: string) => {
    setAnalizando(id);
    setTimeout(() => {
      const actual = medidas.find(m => m.id === id);
      if (!actual) { setAnalizando(null); return; }
      const previas = ordenadas.filter(m => m.id !== id && m.fecha < actual.fecha);
      const prev = previas[0] || null;
      const analisis = generarAnalisisMedidas(actual, prev, perfil);
      onChange(medidas.map(m => m.id === id ? { ...m, analisisIA: analisis } : m));
      setAnalizando(null);
      setExpandido(id);
    }, 1000);
  };

  const setField = (key: keyof MedidaCorporal, value: string | number) => {
    setDraft(prev => ({ ...prev, [key]: value === '' ? undefined : value }));
  };

  // Indicadores derivados (de la ultima medida + altura del perfil)
  const imc = ultima?.peso && perfil?.altura ? calcularIMC(ultima.peso, perfil.altura) : 0;
  const imcCat = imc ? categoriaIMC(imc) : null;
  const icc = ultima?.cintura && ultima?.cadera ? calcularICC(ultima.cintura, ultima.cadera) : 0;
  const iccCat = icc ? categoriaICC(icc, esHombre) : null;

  // Helper: delta entre ultima y anterior
  const delta = (key: keyof MedidaCorporal) => {
    if (!ultima || !anterior) return null;
    const a = ultima[key];
    const b = anterior[key];
    if (typeof a !== 'number' || typeof b !== 'number') return null;
    return +(a - b).toFixed(1);
  };

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-violet-300" />
          <h3 className="text-white font-bold text-base">{titulo}</h3>
          <span className="text-white/40 text-xs">({medidas.length} registro{medidas.length !== 1 ? 's' : ''})</span>
        </div>
        <div className="flex items-center gap-2">
          {medidas.length >= 2 && (
            <button onClick={() => setShowCharts(!showCharts)}
              className="flex items-center gap-1.5 px-3 py-2 bg-electric/10 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/20">
              <TrendingUp className="w-3.5 h-3.5" /> {showCharts ? 'Ocultar' : 'Ver'} evolución
            </button>
          )}
          <button onClick={abrirNueva}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-500/15 border border-violet-500/30 text-violet-300 rounded-xl text-xs font-bold hover:bg-violet-500/25">
            <Plus className="w-3.5 h-3.5" /> Nueva medición
          </button>
        </div>
      </div>

      {/* Resumen ultimo registro */}
      {ultima && (
        <div className="bg-black/40 border border-dark-border rounded-xl p-3">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2 font-semibold">Último registro · {ultima.fecha}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {imc > 0 && imcCat && (
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-white/45 text-[10px] uppercase">IMC</p>
                <p className={`text-lg font-black ${imcCat.color}`}>{imc}</p>
                <p className="text-white/40 text-[10px]">{imcCat.categoria}</p>
              </div>
            )}
            {icc > 0 && iccCat && (
              <div className="bg-black/40 rounded-lg p-2 text-center">
                <p className="text-white/45 text-[10px] uppercase">ICC</p>
                <p className={`text-lg font-black ${iccCat.color}`}>{icc}</p>
                <p className="text-white/40 text-[10px]">{iccCat.categoria}</p>
              </div>
            )}
            {PARAMS.filter(p => typeof ultima[p.key] === 'number').slice(0, 6).map(p => {
              const v = ultima[p.key] as number;
              const d = delta(p.key);
              return (
                <div key={p.key} className="bg-black/40 rounded-lg p-2 text-center">
                  <p className="text-white/45 text-[10px] uppercase truncate">{p.label}</p>
                  <p className="text-white text-lg font-black">{v}<span className="text-white/45 text-xs ml-0.5">{p.unidad}</span></p>
                  {d !== null && d !== 0 && (
                    <p className={`text-[10px] font-semibold ${d > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {d > 0 ? '▲' : '▼'} {Math.abs(d)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Graficos de evolucion */}
      {showCharts && medidas.length >= 2 && (
        <div className="bg-black/30 border border-dark-border rounded-xl p-3 space-y-3">
          <p className="text-white/55 text-xs font-semibold">Evolución de los parámetros más cargados</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PARAMS.filter(p => medidas.filter(m => typeof m[p.key] === 'number').length >= 2).slice(0, 6).map(p => {
              const data = ordenadas
                .filter(m => typeof m[p.key] === 'number')
                .map(m => ({ fecha: m.fecha.slice(5), valor: m[p.key] as number }))
                .reverse();
              return (
                <div key={p.key} className="bg-black/40 rounded-lg p-2">
                  <p className="text-white/55 text-xs font-semibold mb-1">{p.label} <span className="text-white/30">({p.unidad})</span></p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={data}>
                      <XAxis dataKey="fecha" stroke="#555" fontSize={9} tick={{ fill: '#888' }} />
                      <YAxis stroke="#555" fontSize={9} tick={{ fill: '#888' }} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="valor" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de mediciones pasadas */}
      {ordenadas.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-10 h-10 text-white/10 mx-auto mb-2" />
          <p className="text-white/45 text-sm">Sin medidas cargadas todavía.</p>
          <p className="text-white/25 text-xs mt-1">Cargá tu primera medición para tener una línea base.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ordenadas.map(m => {
            const cargados = PARAMS.filter(p => typeof m[p.key] === 'number');
            return (
              <div key={m.id} className="bg-black/40 border border-dark-border rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    {m.fotoTicket && (
                      <button onClick={() => setExpandido(expandido === m.id ? null : m.id)}
                        className="shrink-0" title="Ver ticket en grande">
                        <img src={m.fotoTicket} alt="ticket" className="w-10 h-10 rounded-lg object-cover border border-violet-500/30 hover:border-violet-400 transition-colors" />
                      </button>
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold">{m.fecha}{m.fotoTicket && <span className="ml-1.5 text-[10px] text-violet-300 font-semibold">📸 con ticket</span>}</p>
                      <p className="text-white/55 text-xs">
                        {cargados.length} parámetro{cargados.length !== 1 ? 's' : ''} cargado{cargados.length !== 1 ? 's' : ''}
                        {m.nota && ` · ${m.nota}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {m.analisisIA ? (
                      <button onClick={() => setExpandido(expandido === m.id ? null : m.id)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> Análisis <ChevronDown className={`w-3 h-3 ${expandido === m.id ? 'rotate-180' : ''} transition-transform`} />
                      </button>
                    ) : analizando === m.id ? (
                      <span className="px-2 py-1.5 bg-electric/10 rounded-lg text-electric text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analizando...
                      </span>
                    ) : (
                      <button onClick={() => analizar(m.id)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-electric/10 border border-electric/20 rounded-lg text-electric text-xs font-bold hover:bg-electric/20">
                        <Zap className="w-3.5 h-3.5" /> Analizar
                      </button>
                    )}
                    <button onClick={() => abrirEdicion(m)} className="p-1.5 text-white/45 hover:text-electric transition-colors rounded-lg hover:bg-white/5" title="Editar">
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                    <button onClick={() => eliminar(m.id)} className="p-1.5 text-white/45 hover:text-danger transition-colors rounded-lg hover:bg-white/5" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {expandido === m.id && (
                  <div className="mt-3 pt-3 border-t border-dark-border/50 space-y-3">
                    {m.fotoTicket && (
                      <div>
                        <p className="text-white/45 text-[10px] uppercase tracking-wider font-semibold mb-1.5">Ticket de balanza</p>
                        <img src={m.fotoTicket} alt="ticket de balanza" className="w-full max-h-80 object-contain rounded-lg border border-dark-border bg-black/40" />
                      </div>
                    )}
                    {m.analisisIA && (
                      <>
                        <div className="text-sm text-white/75 whitespace-pre-line leading-relaxed">
                          {m.analisisIA.split(/(\*\*.*?\*\*)/).map((part, i) =>
                            part.startsWith('**') && part.endsWith('**')
                              ? <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
                              : <span key={i}>{part}</span>
                          )}
                        </div>
                        <button onClick={() => analizar(m.id)} className="text-xs text-electric/80 hover:text-electric font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Re-analizar con datos actualizados
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-800 z-10">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-violet-300" />
                <h3 className="text-white font-black text-base">{editandoId ? 'Editar medición' : 'Nueva medición'}</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-white/40 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm text-white/60 uppercase tracking-wider mb-1.5 font-semibold">Fecha</label>
                <input type="date" value={draft.fecha || ''} onChange={e => setField('fecha', e.target.value)}
                  className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-electric/40" />
              </div>

              {/* Composición */}
              <div className="space-y-2">
                <p className="text-violet-300 text-xs uppercase tracking-wider font-bold">Composición corporal</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PARAMS.filter(p => p.grupo === 'composicion').map(p => (
                    <div key={p.key}>
                      <label className="block text-xs text-white/55 mb-1 font-semibold">{p.label} <span className="text-white/30">({p.unidad})</span></label>
                      <input
                        type="number"
                        step="0.1"
                        value={(draft[p.key] as number | undefined) ?? ''}
                        onChange={e => setField(p.key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder={p.rango?.placeholder}
                        className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder-white/25"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Perimetros */}
              <div className="space-y-2">
                <p className="text-violet-300 text-xs uppercase tracking-wider font-bold">Perímetros (cm)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PARAMS.filter(p => p.grupo === 'perimetro').map(p => (
                    <div key={p.key}>
                      <label className="block text-xs text-white/55 mb-1 font-semibold">{p.label}</label>
                      <input
                        type="number"
                        step="0.5"
                        value={(draft[p.key] as number | undefined) ?? ''}
                        onChange={e => setField(p.key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder={p.rango?.placeholder}
                        className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder-white/25"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Salud */}
              <div className="space-y-2">
                <p className="text-violet-300 text-xs uppercase tracking-wider font-bold">Salud (opcional)</p>
                <div className="grid grid-cols-2 gap-3">
                  {PARAMS.filter(p => p.grupo === 'salud').map(p => (
                    <div key={p.key}>
                      <label className="block text-xs text-white/55 mb-1 font-semibold">{p.label} <span className="text-white/30">({p.unidad})</span></label>
                      <input
                        type="number"
                        value={(draft[p.key] as number | undefined) ?? ''}
                        onChange={e => setField(p.key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder={p.rango?.placeholder}
                        className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder-white/25"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-white/55 mb-1 font-semibold">Presión arterial</label>
                    <input
                      type="text"
                      value={draft.presionArterial || ''}
                      onChange={e => setField('presionArterial', e.target.value)}
                      placeholder="120/80"
                      className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder-white/25"
                    />
                  </div>
                </div>
              </div>

              {/* Foto del ticket de balanza */}
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3">
                <label className="block text-xs text-white/65 mb-1.5 font-semibold uppercase tracking-wider">📸 Foto del ticket de balanza (opcional)</label>
                <p className="text-white/45 text-[11px] mb-2">Subí la foto del ticket de tu balanza Tanita/Omron como respaldo. Después completá manualmente los valores arriba.</p>
                {draft.fotoTicket ? (
                  <div className="space-y-2">
                    <img src={draft.fotoTicket} alt="ticket" className="w-full max-h-48 object-contain rounded-lg border border-dark-border bg-black/40" />
                    <button type="button" onClick={() => setField('fotoTicket', undefined)}
                      className="text-danger text-xs font-bold hover:underline">Quitar foto</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-3 py-3 bg-black/40 border-2 border-dashed border-violet-500/30 rounded-xl text-violet-300 text-xs font-bold cursor-pointer hover:bg-violet-500/10">
                    📎 Elegir foto
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 5 * 1024 * 1024) { alert('La imagen es muy grande (max 5MB).'); return; }
                        const reader = new FileReader();
                        reader.onloadend = () => setField('fotoTicket', reader.result as string);
                        reader.readAsDataURL(f);
                      }}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/55 mb-1 font-semibold">Nota (opcional)</label>
                <input
                  type="text"
                  value={draft.nota || ''}
                  onChange={e => setField('nota', e.target.value)}
                  placeholder="Ej: Después de vacaciones, post operación..."
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder-white/25"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">
                  Cancelar
                </button>
                <button onClick={guardar}
                  className="flex-1 py-3 bg-violet-500 hover:bg-violet-400 text-white rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
