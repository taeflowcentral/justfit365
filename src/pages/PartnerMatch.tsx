import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  HeartHandshake, MapPin, Clock, Target, Activity, MessageCircle,
  Save, Edit3, Users, Sparkles, Phone, ToggleRight
} from 'lucide-react';
import {
  type PartnerData, type PartnerUsuario, type MatchResult, type Horario,
  HORARIOS, OBJETIVOS, NIVELES, DISCIPLINAS,
  rankear, whatsappLink, rowToPartner, disciplinasCompartidas,
} from '../lib/partnerMatch';

const PARTNER_DEFAULT: PartnerData = {
  activo: false, zona: '', horario: 'Flexible', nivel: 3, objetivo: '', telefono: '', disciplinas: [],
};

export default function PartnerMatch() {
  const { user } = useAuth();
  const [propio, setPropio] = useState<PartnerData>(PARTNER_DEFAULT);
  const [draft, setDraft] = useState<PartnerData>(PARTNER_DEFAULT);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activosTotal, setActivosTotal] = useState(0);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [filtroDisciplinas, setFiltroDisciplinas] = useState(true); // por default: solo con disciplinas en comun

  useEffect(() => {
    if (user?.dni) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.dni]);

  async function cargar() {
    if (!user?.dni) return;
    setCargando(true);
    try {
      // Mi perfil
      const { data: yo } = await supabase
        .from('usuarios')
        .select('partner_activo, partner_zona, partner_horario, partner_nivel, partner_objetivo, partner_telefono, partner_disciplinas')
        .eq('dni', user.dni).single();
      const mio: PartnerData = yo ? {
        activo: !!yo.partner_activo,
        zona: yo.partner_zona || '',
        horario: (yo.partner_horario as Horario) || 'Flexible',
        nivel: yo.partner_nivel || 3,
        objetivo: yo.partner_objetivo || '',
        telefono: yo.partner_telefono || '',
        disciplinas: ((yo.partner_disciplinas as string) || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      } : PARTNER_DEFAULT;
      setPropio(mio);
      setDraft(mio);
      if (!mio.activo) setEditando(true);

      // Otros usuarios opt-in (incluye foto, genero y edad del perfil)
      const { data: otrosRows } = await supabase
        .from('usuarios')
        .select('dni, nombre, foto, perfil_genero, perfil_edad, partner_activo, partner_zona, partner_horario, partner_nivel, partner_objetivo, partner_telefono, partner_disciplinas, partner_actualizado')
        .eq('partner_activo', true)
        .neq('dni', user.dni);
      const otros: PartnerUsuario[] = (otrosRows || [])
        .map(r => rowToPartner(r as Record<string, unknown>))
        .filter((u): u is PartnerUsuario => u !== null);
      setActivosTotal(otros.length + (mio.activo ? 1 : 0));
      setMatches(rankear(mio, otros));
    } catch (e) {
      setError('Error al cargar Partner Match: ' + (e instanceof Error ? e.message : 'desconocido'));
    } finally {
      setCargando(false);
    }
  }

  async function guardar() {
    if (!user?.dni) return;
    setError('');
    if (draft.activo) {
      if (!draft.zona.trim()) { setError('Ingresá tu zona o barrio.'); return; }
      if (!draft.objetivo) { setError('Elegí un objetivo.'); return; }
      if (!draft.telefono.trim() || draft.telefono.replace(/\D/g, '').length < 10) {
        setError('Ingresá un WhatsApp válido con código de país (ej: +54 9 221 6806000).'); return;
      }
    }
    setGuardando(true);
    try {
      const { error: err } = await supabase.from('usuarios').update({
        partner_activo: draft.activo,
        partner_zona: draft.activo ? draft.zona : null,
        partner_horario: draft.activo ? draft.horario : null,
        partner_nivel: draft.activo ? draft.nivel : null,
        partner_objetivo: draft.activo ? draft.objetivo : null,
        partner_telefono: draft.activo ? draft.telefono : null,
        partner_disciplinas: draft.activo ? draft.disciplinas.join(',') : null,
        partner_actualizado: new Date().toISOString(),
      }).eq('dni', user.dni);
      if (err) { setError('Error al guardar: ' + err.message); return; }
      setPropio(draft);
      setEditando(false);
      cargar();
    } finally {
      setGuardando(false);
    }
  }

  const enZonaPropia = propio.activo && propio.zona
    ? matches.filter(m => m.user.zona.toLowerCase().trim() === propio.zona.toLowerCase().trim()).length
    : 0;

  // Filtrar matches por disciplinas en comun si el toggle esta activo
  const matchesFiltrados = (filtroDisciplinas && propio.disciplinas.length > 0)
    ? matches.filter(m => disciplinasCompartidas(propio.disciplinas, m.user.disciplinas).length > 0)
    : matches;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <HeartHandshake className="w-7 h-7 text-pink-400" /> Partner Match
        </h1>
        <p className="text-white/55 text-sm mt-1">Encontrá compañeros de entrenamiento cerca tuyo. Gratis y voluntario.</p>
      </div>

      {/* Tablero de actividad */}
      {propio.activo && (
        <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500/15 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold">
              <strong className="text-pink-400">{activosTotal}</strong> personas activas en JustFit365
              {propio.zona && enZonaPropia > 0 && <> · <strong className="text-electric">{enZonaPropia}</strong> en {propio.zona}</>}
            </p>
            <p className="text-white/45 text-xs mt-0.5">Buscando compañero/a para entrenar.</p>
          </div>
        </div>
      )}

      {/* Form de configuracion */}
      {(editando || !propio.activo) && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h2 className="text-white font-bold">{propio.activo ? 'Editar mi perfil' : 'Activar Partner Match'}</h2>
          </div>

          {/* Toggle activar */}
          <label className="flex items-center justify-between gap-3 bg-black/40 rounded-xl p-3 cursor-pointer">
            <div className="flex-1">
              <p className="text-white font-bold text-sm flex items-center gap-2"><ToggleRight className="w-4 h-4 text-pink-400" /> Activar Partner Match</p>
              <p className="text-white/55 text-xs mt-0.5">Otros usuarios opted-in podrán verte y contactarte por WhatsApp.</p>
            </div>
            <input type="checkbox" checked={draft.activo} onChange={e => setDraft({ ...draft, activo: e.target.checked })}
              className="w-6 h-6 accent-pink-500" />
          </label>

          {draft.activo && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs font-bold mb-1.5">Qué se comparte cuando activás Partner Match</p>
              <ul className="text-white/65 text-xs space-y-1 list-disc list-inside">
                <li>Tu primer nombre, género, edad y foto de perfil (datos que ya cargaste).</li>
                <li>Lo que completás abajo: zona, horario, nivel, objetivo y WhatsApp.</li>
                <li>Solo lo ven personas que también activaron Partner Match.</li>
                <li>Se borra todo si desactivás el toggle.</li>
              </ul>
            </div>
          )}

          {draft.activo && (
            <>
              {/* Zona */}
              <div>
                <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Zona / Barrio</label>
                <input type="text" value={draft.zona} onChange={e => setDraft({ ...draft, zona: e.target.value })}
                  placeholder="Ej: City Bell, La Plata Centro, Tolosa..."
                  className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500/40 placeholder-white/30" />
              </div>

              {/* Horario */}
              <div>
                <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ¿Cuándo entrenás?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HORARIOS.map(h => (
                    <button key={h} onClick={() => setDraft({ ...draft, horario: h })}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                        draft.horario === h ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-500/40' : 'bg-black/40 text-white/55 border-2 border-dark-border hover:text-white/85'
                      }`}>{h}</button>
                  ))}
                </div>
              </div>

              {/* Nivel */}
              <div>
                <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Nivel de intensidad</label>
                <div className="flex gap-1.5">
                  {NIVELES.map(n => (
                    <button key={n.v} onClick={() => setDraft({ ...draft, nivel: n.v })}
                      title={n.label}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        draft.nivel === n.v ? 'bg-pink-500 text-white' : 'bg-black/40 text-white/55 border border-dark-border hover:text-white/85'
                      }`}>{n.v}</button>
                  ))}
                </div>
                <p className="text-white/45 text-xs mt-1.5">{NIVELES.find(n => n.v === draft.nivel)?.label}</p>
              </div>

              {/* Objetivo */}
              <div>
                <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Objetivo</label>
                <select value={draft.objetivo} onChange={e => setDraft({ ...draft, objetivo: e.target.value })}
                  className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 appearance-none">
                  <option value="" className="bg-dark-800">Elegí uno...</option>
                  {OBJETIVOS.map(o => <option key={o} value={o} className="bg-dark-800">{o}</option>)}
                </select>
              </div>

              {/* Disciplinas (multi-select) */}
              <div>
                <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Disciplinas que te interesan</label>
                <p className="text-white/45 text-xs mb-2">Elegí una o más. Lo usamos para mostrarte gente con intereses en común.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {DISCIPLINAS.map(d => {
                    const seleccionada = draft.disciplinas.includes(d);
                    return (
                      <button key={d} type="button"
                        onClick={() => {
                          const nuevas = seleccionada
                            ? draft.disciplinas.filter(x => x !== d)
                            : [...draft.disciplinas, d];
                          setDraft({ ...draft, disciplinas: nuevas });
                        }}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                          seleccionada
                            ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-500/40'
                            : 'bg-black/40 text-white/55 border-2 border-dark-border hover:text-white/85'
                        }`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                {draft.disciplinas.length > 0 && (
                  <p className="text-white/45 text-xs mt-1.5">Seleccionadas: <strong className="text-pink-300">{draft.disciplinas.length}</strong></p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> WhatsApp (con código país)</label>
                <input type="tel" value={draft.telefono} onChange={e => setDraft({ ...draft, telefono: e.target.value })}
                  placeholder="+54 9 221 6806000"
                  className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
                <p className="text-white/45 text-xs mt-1">Solo se comparte con otros usuarios que activaron Partner Match. No se publica.</p>
              </div>
            </>
          )}

          {error && <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm">{error}</div>}

          <div className="flex gap-3">
            {propio.activo && (
              <button onClick={() => { setDraft(propio); setEditando(false); setError(''); }}
                className="flex-1 py-3 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">
                Cancelar
              </button>
            )}
            <button onClick={guardar} disabled={guardando}
              className="flex-1 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {guardando ? 'Guardando...' : draft.activo ? 'Activar y guardar' : 'Guardar (desactivado)'}
            </button>
          </div>
        </div>
      )}

      {/* Mi perfil resumen */}
      {propio.activo && !editando && (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-pink-500/15 rounded-xl flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">Tu perfil está activo</p>
            <p className="text-white/55 text-xs mt-0.5 truncate">
              {propio.zona} · {propio.horario} · Nivel {propio.nivel} · {propio.objetivo}
            </p>
          </div>
          <button onClick={() => setEditando(true)} className="p-2.5 text-white/55 hover:text-pink-400 transition-colors rounded-xl hover:bg-white/5" title="Editar mi perfil">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Lista de matches */}
      {propio.activo && !editando && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              <h2 className="text-white font-bold text-sm">Matches sugeridos</h2>
              <span className="text-white/40 text-xs">({matchesFiltrados.length}{matches.length !== matchesFiltrados.length ? ` de ${matches.length}` : ''})</span>
            </div>
            {propio.disciplinas.length > 0 && (
              <button onClick={() => setFiltroDisciplinas(!filtroDisciplinas)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filtroDisciplinas
                    ? 'bg-pink-500/15 border border-pink-500/30 text-pink-300'
                    : 'bg-white/5 border border-dark-border text-white/55 hover:text-white/85'
                }`}>
                {filtroDisciplinas ? '✓' : '○'} Solo con disciplinas en común
              </button>
            )}
          </div>

          {cargando ? (
            <div className="text-center py-8 text-white/40 text-sm">Cargando matches...</div>
          ) : matchesFiltrados.length === 0 ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/55 font-bold mb-1">Sin matches con esos filtros</p>
              <p className="text-white/40 text-xs">
                {matches.length === 0
                  ? 'A medida que más personas activen Partner Match en tu zona, vas a verlas acá. Compartí JustFit365 con tus amigos para empezar.'
                  : 'Probá desactivar el filtro "Solo con disciplinas en común" para ver más perfiles.'}
              </p>
            </div>
          ) : (
            matchesFiltrados.map(m => <MatchCard key={m.user.dni} match={m} miNombre={user?.nombre || ''} misDisciplinas={propio.disciplinas} />)
          )}
        </div>
      )}

      <p className="text-white/30 text-[11px] text-center max-w-md mx-auto">
        Partner Match es 100% voluntario y gratuito. Podés desactivarlo cuando quieras desde el toggle de arriba.
      </p>
    </div>
  );
}

function MatchCard({ match, miNombre, misDisciplinas }: { match: MatchResult; miNombre: string; misDisciplinas: string[] }) {
  const { user: u, score, detalle } = match;
  const primero = u.nombre.split(/\s+/)[0] || u.nombre;
  const colorScore = score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-white/55 bg-white/5 border-dark-border';
  const generoLabel = u.genero === 'Hombre' ? '♂' : u.genero === 'Mujer' ? '♀' : u.genero ? '⚧' : '';
  const misSet = new Set(misDisciplinas);

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-4 flex items-start gap-3 hover:border-pink-500/20 transition-colors">
      {u.foto ? (
        <img src={u.foto} alt={primero} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-dark-border" />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0">
          {primero.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-bold text-base">{primero}</p>
          {u.edad && <span className="text-white/60 text-sm font-semibold">· {u.edad} años</span>}
          {generoLabel && <span className="text-white/60 text-sm" title={u.genero}>{generoLabel}</span>}
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${colorScore}`}>
            {score}% match
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60 mt-1.5 flex-wrap">
          {u.zona && (
            <span className={`flex items-center gap-1 ${detalle.zona > 0 ? 'text-emerald-400 font-semibold' : ''}`}>
              <MapPin className="w-3 h-3" /> {u.zona}
            </span>
          )}
          {u.horario && (
            <span className={`flex items-center gap-1 ${detalle.horario > 0 ? 'text-emerald-400 font-semibold' : ''}`}>
              <Clock className="w-3 h-3" /> {u.horario}
            </span>
          )}
          {typeof u.nivel === 'number' && (
            <span className={`flex items-center gap-1 ${detalle.nivel > 0 ? 'text-emerald-400 font-semibold' : ''}`}>
              <Activity className="w-3 h-3" /> Nivel {u.nivel}
            </span>
          )}
          {u.objetivo && (
            <span className={`flex items-center gap-1 ${detalle.objetivo > 0 ? 'text-emerald-400 font-semibold' : ''}`}>
              <Target className="w-3 h-3" /> {u.objetivo}
            </span>
          )}
        </div>
        {u.disciplinas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {u.disciplinas.map(d => {
              const compartida = misSet.has(d);
              return (
                <span key={d}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    compartida ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-white/45 border border-dark-border'
                  }`}>
                  {d}
                </span>
              );
            })}
          </div>
        )}
        <a
          href={whatsappLink(u.telefono, primero, miNombre)}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}
