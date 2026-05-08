import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  HeartHandshake, MapPin, Clock, Target, Activity, MessageCircle,
  Save, Edit3, Users, Sparkles, Phone, ToggleRight, Share2, Shield,
  Calendar, Flag, Ban, MoreVertical, BadgeCheck, X, TrendingUp, Plus, Trash2, UserPlus, UserMinus,
} from 'lucide-react';
import {
  type PartnerData, type PartnerUsuario, type MatchResult, type Horario, type PrefGenero, type PartnerEvento,
  HORARIOS, OBJETIVOS, NIVELES, DISCIPLINAS, DIAS_SEMANA, PREF_GENERO_OPCIONES, MENSAJE_DEFAULT,
  rankear, whatsappLink, armarMensaje, rowToPartner, disciplinasCompartidas,
  ultimaActividadLabel, frescuraColor, esVerificado, pasaPreferencias, contarPorZona,
} from '../lib/partnerMatch';

const PARTNER_DEFAULT: PartnerData = {
  activo: false, zona: '', horario: 'Flexible', nivel: 3, objetivo: '', telefono: '',
  disciplinas: [], dias: [], prefGenero: 'Cualquiera',
};

type Vista = 'buscar' | 'eventos';

export default function PartnerMatch() {
  const { user } = useAuth();
  const [vista, setVista] = useState<Vista>('buscar');
  const [propio, setPropio] = useState<PartnerData>(PARTNER_DEFAULT);
  const [draft, setDraft] = useState<PartnerData>(PARTNER_DEFAULT);
  const [otrosCrudos, setOtrosCrudos] = useState<(PartnerUsuario & { verificado?: boolean })[]>([]);
  const [bloqueadosDni, setBloqueadosDni] = useState<Set<string>>(new Set());
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [filtroDisciplinas, setFiltroDisciplinas] = useState(true);
  const [filtroPrefs, setFiltroPrefs] = useState(true);
  const [reportando, setReportando] = useState<{ dni: string; nombre: string } | null>(null);
  const [enviando, setEnviando] = useState<{ user: PartnerUsuario; mensaje: string } | null>(null);
  const [shareToast, setShareToast] = useState('');

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
        .select('partner_activo, partner_zona, partner_horario, partner_nivel, partner_objetivo, partner_telefono, partner_disciplinas, partner_dias, partner_pref_genero, partner_pref_edad_min, partner_pref_edad_max, partner_mensaje_template')
        .eq('dni', user.dni).single();
      const mio: PartnerData = yo ? {
        activo: !!yo.partner_activo,
        zona: yo.partner_zona || '',
        horario: (yo.partner_horario as Horario) || 'Flexible',
        nivel: yo.partner_nivel || 3,
        objetivo: yo.partner_objetivo || '',
        telefono: yo.partner_telefono || '',
        disciplinas: ((yo.partner_disciplinas as string) || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        dias: ((yo.partner_dias as string) || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        prefGenero: ((yo.partner_pref_genero as string) || 'Cualquiera') as PrefGenero,
        prefEdadMin: typeof yo.partner_pref_edad_min === 'number' ? yo.partner_pref_edad_min : undefined,
        prefEdadMax: typeof yo.partner_pref_edad_max === 'number' ? yo.partner_pref_edad_max : undefined,
        mensajeTemplate: yo.partner_mensaje_template || undefined,
      } : PARTNER_DEFAULT;
      setPropio(mio);
      setDraft(mio);
      if (!mio.activo) setEditando(true);

      // Otros opted-in (excluyendo bloqueados por moderacion)
      const { data: otrosRows } = await supabase
        .from('usuarios')
        .select('dni, nombre, foto, password_hash, perfil_genero, perfil_edad, partner_activo, partner_zona, partner_horario, partner_nivel, partner_objetivo, partner_telefono, partner_disciplinas, partner_dias, partner_pref_genero, partner_pref_edad_min, partner_pref_edad_max, partner_mensaje_template, partner_actualizado, partner_bloqueado')
        .eq('partner_activo', true)
        .neq('dni', user.dni)
        .or('partner_bloqueado.is.null,partner_bloqueado.eq.false');
      const otros: (PartnerUsuario & { verificado?: boolean })[] = [];
      for (const r of (otrosRows || [])) {
        const u = rowToPartner(r as Record<string, unknown>);
        if (!u) continue;
        otros.push({ ...u, verificado: esVerificado(r as { foto?: unknown; password_hash?: unknown }) });
      }
      setOtrosCrudos(otros);

      // Mis bloqueos
      const { data: bloqueosRows } = await supabase
        .from('partner_bloqueos')
        .select('bloqueado_dni')
        .eq('usuario_dni', user.dni);
      setBloqueadosDni(new Set((bloqueosRows || []).map(b => b.bloqueado_dni as string)));
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
      if (typeof draft.prefEdadMin === 'number' && typeof draft.prefEdadMax === 'number' && draft.prefEdadMin > draft.prefEdadMax) {
        setError('Edad mínima no puede ser mayor a la máxima.'); return;
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
        partner_dias: draft.activo ? draft.dias.join(',') : null,
        partner_pref_genero: draft.activo ? draft.prefGenero : null,
        partner_pref_edad_min: draft.activo ? (draft.prefEdadMin ?? null) : null,
        partner_pref_edad_max: draft.activo ? (draft.prefEdadMax ?? null) : null,
        partner_mensaje_template: draft.activo ? (draft.mensajeTemplate || null) : null,
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

  async function reportar(dni: string, motivo: string) {
    if (!user?.dni) return;
    // Incrementar contador
    const { data: target } = await supabase.from('usuarios').select('partner_reportes').eq('dni', dni).single();
    const reportes = ((target?.partner_reportes as number) || 0) + 1;
    await supabase.from('usuarios').update({
      partner_reportes: reportes,
      partner_bloqueado: reportes >= 3, // auto-disable a los 3 reportes
    }).eq('dni', dni);
    // Tambien bloquearlo para mí
    await supabase.from('partner_bloqueos').insert({
      usuario_dni: user.dni,
      bloqueado_dni: dni,
      motivo: motivo || null,
    }).select();
    setReportando(null);
    cargar();
  }

  async function bloquear(dni: string) {
    if (!user?.dni) return;
    if (!confirm('¿Bloquear este usuario? No volverás a verlo en tu lista de matches.')) return;
    await supabase.from('partner_bloqueos').insert({ usuario_dni: user.dni, bloqueado_dni: dni });
    cargar();
  }

  function compartir() {
    const url = `${window.location.origin}/landing`;
    const texto = `Probá Partner Match en JustFit365: encontrá compañero/a para entrenar gratis cerca tuyo. ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'JustFit365 Partner Match', text: texto, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(texto).then(() => {
        setShareToast('Link copiado al portapapeles');
        setTimeout(() => setShareToast(''), 2500);
      });
    }
  }

  // Filtros aplicados sobre los matches
  const otrosVisibles = useMemo(() => {
    return otrosCrudos.filter(u => !bloqueadosDni.has(u.dni));
  }, [otrosCrudos, bloqueadosDni]);

  const matches: MatchResult[] = useMemo(() => rankear(propio, otrosVisibles), [propio, otrosVisibles]);

  const matchesFiltrados = useMemo(() => {
    let res = matches;
    if (filtroDisciplinas && propio.disciplinas.length > 0) {
      res = res.filter(m => disciplinasCompartidas(propio.disciplinas, m.user.disciplinas).length > 0);
    }
    if (filtroPrefs) {
      res = res.filter(m => pasaPreferencias(propio, m.user));
    }
    return res;
  }, [matches, filtroDisciplinas, filtroPrefs, propio]);

  const enZonaPropia = propio.activo && propio.zona
    ? otrosVisibles.filter(u => u.zona.toLowerCase().trim() === propio.zona.toLowerCase().trim()).length
    : 0;

  const heatmap = useMemo(() => contarPorZona(otrosVisibles).slice(0, 6), [otrosVisibles]);

  const stats = useMemo(() => {
    const total = otrosVisibles.length + (propio.activo ? 1 : 0);
    const verificados = otrosVisibles.filter(u => u.verificado).length;
    const altos = matches.filter(m => m.score >= 70).length;
    return { total, verificados, altos };
  }, [otrosVisibles, propio.activo, matches]);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <HeartHandshake className="w-7 h-7 text-pink-400" /> Partner Match
        </h1>
        <p className="text-white/55 text-sm mt-1">Encontrá compañeros de entrenamiento cerca tuyo. Gratis y voluntario.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl border border-dark-border">
        <button onClick={() => setVista('buscar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${vista === 'buscar' ? 'bg-pink-500/15 text-pink-300' : 'text-white/40 hover:text-white/60'}`}>
          <Users className="w-3.5 h-3.5" /> Buscar partner
        </button>
        <button onClick={() => setVista('eventos')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${vista === 'eventos' ? 'bg-pink-500/15 text-pink-300' : 'text-white/40 hover:text-white/60'}`}>
          <Calendar className="w-3.5 h-3.5" /> Eventos
        </button>
      </div>

      {vista === 'buscar' && (
        <>
          {/* Tablero de actividad */}
          {propio.activo && (
            <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-500/15 rounded-xl flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-pink-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">
                    <strong className="text-pink-400">{stats.total}</strong> personas activas
                    {propio.zona && enZonaPropia > 0 && <> · <strong className="text-electric">{enZonaPropia}</strong> en {propio.zona}</>}
                  </p>
                  <p className="text-white/45 text-xs mt-0.5">
                    {stats.altos > 0 && <span className="text-emerald-400">{stats.altos} matches +70%</span>}
                    {stats.altos > 0 && stats.verificados > 0 && ' · '}
                    {stats.verificados > 0 && <span>{stats.verificados} verificados</span>}
                  </p>
                </div>
                <button onClick={compartir}
                  className="flex items-center gap-1.5 px-3 py-2 bg-electric/10 border border-electric/20 text-electric text-xs font-bold rounded-lg hover:bg-electric/20 transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Invitar
                </button>
              </div>
              {/* Heatmap zonas */}
              {heatmap.length > 0 && (
                <div className="border-t border-pink-500/10 pt-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-2">Zonas con más actividad</p>
                  <div className="flex flex-wrap gap-1.5">
                    {heatmap.map(z => (
                      <span key={z.zona} className="px-2.5 py-1 bg-black/40 border border-dark-border rounded-full text-xs text-white/65">
                        <strong className="text-pink-300">{z.cantidad}</strong> {z.zona}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          {(editando || !propio.activo) && (
            <FormPartner
              draft={draft} setDraft={setDraft} guardar={guardar} guardando={guardando}
              onCancel={() => { setDraft(propio); setEditando(false); setError(''); }}
              error={error} canCancel={propio.activo}
              miNombre={user?.nombre || ''}
            />
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
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-1.5">
                {propio.disciplinas.length > 0 && (
                  <button onClick={() => setFiltroDisciplinas(!filtroDisciplinas)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroDisciplinas ? 'bg-pink-500/15 border border-pink-500/30 text-pink-300' : 'bg-white/5 border border-dark-border text-white/55 hover:text-white/85'}`}>
                    {filtroDisciplinas ? '✓' : '○'} Disciplinas en común
                  </button>
                )}
                <button onClick={() => setFiltroPrefs(!filtroPrefs)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroPrefs ? 'bg-pink-500/15 border border-pink-500/30 text-pink-300' : 'bg-white/5 border border-dark-border text-white/55 hover:text-white/85'}`}>
                  {filtroPrefs ? '✓' : '○'} Mis preferencias (género/edad)
                </button>
              </div>

              {cargando ? (
                <div className="text-center py-8 text-white/40 text-sm">Cargando matches...</div>
              ) : matchesFiltrados.length === 0 ? (
                <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
                  <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/55 font-bold mb-1">Sin matches con esos filtros</p>
                  <p className="text-white/40 text-xs">
                    {matches.length === 0
                      ? 'A medida que más personas activen Partner Match en tu zona, vas a verlas acá. Compartí JustFit365 con tus amigos.'
                      : 'Probá desactivar alguno de los filtros de arriba para ver más perfiles.'}
                  </p>
                </div>
              ) : (
                matchesFiltrados.map(m => {
                  const u = m.user as PartnerUsuario & { verificado?: boolean };
                  return (
                    <MatchCard
                      key={u.dni}
                      match={m}
                      verificado={!!u.verificado}
                      misDisciplinas={propio.disciplinas}
                      onEnviar={() => setEnviando({
                        user: u,
                        mensaje: armarMensaje(propio.mensajeTemplate, u.nombre, user?.nombre || ''),
                      })}
                      onReportar={() => setReportando({ dni: u.dni, nombre: u.nombre.split(' ')[0] })}
                      onBloquear={() => bloquear(u.dni)}
                    />
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {vista === 'eventos' && (
        <PartnerEventosTab perfilActivo={propio.activo} />
      )}

      <p className="text-white/30 text-[11px] text-center max-w-md mx-auto">
        Partner Match es 100% voluntario y gratuito. Podés desactivarlo o bloquear a alguien cuando quieras.
      </p>

      {/* Toast share */}
      {shareToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-emerald-500 text-black rounded-xl text-sm font-black z-50 shadow-2xl">
          {shareToast}
        </div>
      )}

      {/* Modal Reportar */}
      {reportando && (
        <ReportarModal
          nombre={reportando.nombre}
          onClose={() => setReportando(null)}
          onConfirmar={(motivo) => reportar(reportando.dni, motivo)}
        />
      )}

      {/* Modal Enviar mensaje (preview/edit antes de WhatsApp) */}
      {enviando && (
        <EnviarModal
          user={enviando.user}
          mensajeInicial={enviando.mensaje}
          onClose={() => setEnviando(null)}
        />
      )}
    </div>
  );
}

// ====================================================================
// FORM
// ====================================================================
function FormPartner({ draft, setDraft, guardar, guardando, onCancel, error, canCancel, miNombre }: {
  draft: PartnerData;
  setDraft: (d: PartnerData) => void;
  guardar: () => void;
  guardando: boolean;
  onCancel: () => void;
  error: string;
  canCancel: boolean;
  miNombre: string;
}) {
  const tieneTemplate = !!draft.mensajeTemplate;

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-pink-400" />
        <h2 className="text-white font-bold">{draft.activo ? 'Mi perfil de Partner Match' : 'Activar Partner Match'}</h2>
      </div>

      {/* Toggle */}
      <label className="flex items-center justify-between gap-3 bg-black/40 rounded-xl p-3 cursor-pointer">
        <div className="flex-1">
          <p className="text-white font-bold text-sm flex items-center gap-2"><ToggleRight className="w-4 h-4 text-pink-400" /> Activar Partner Match</p>
          <p className="text-white/55 text-xs mt-0.5">Otros usuarios opted-in podrán verte y contactarte por WhatsApp.</p>
        </div>
        <input type="checkbox" checked={draft.activo} onChange={e => setDraft({ ...draft, activo: e.target.checked })}
          className="w-6 h-6 accent-pink-500" />
      </label>

      {draft.activo && (
        <>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
            <p className="text-amber-400 text-xs font-bold mb-1.5">Qué se comparte cuando activás Partner Match</p>
            <ul className="text-white/65 text-xs space-y-1 list-disc list-inside">
              <li>Tu primer nombre, género, edad y foto del perfil.</li>
              <li>Lo que completás abajo: zona, horario, días, nivel, objetivo, disciplinas y WhatsApp.</li>
              <li>Solo lo ven personas opted-in. Se borra todo si desactivás el toggle.</li>
            </ul>
          </div>

          {/* Zona */}
          <Field label="Zona / Barrio" icon={<MapPin className="w-3.5 h-3.5" />}>
            <input type="text" value={draft.zona} onChange={e => setDraft({ ...draft, zona: e.target.value })}
              placeholder="Ej: City Bell, La Plata Centro, Tolosa..."
              className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500/40 placeholder-white/30" />
          </Field>

          {/* Horario */}
          <Field label="¿Cuándo entrenás?" icon={<Clock className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HORARIOS.map(h => (
                <PillButton key={h} active={draft.horario === h} onClick={() => setDraft({ ...draft, horario: h })}>{h}</PillButton>
              ))}
            </div>
          </Field>

          {/* Dias */}
          <Field label="Días que entrenás">
            <div className="grid grid-cols-7 gap-1">
              {DIAS_SEMANA.map(d => {
                const sel = draft.dias.includes(d);
                return (
                  <button key={d} type="button"
                    onClick={() => setDraft({ ...draft, dias: sel ? draft.dias.filter(x => x !== d) : [...draft.dias, d] })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${sel ? 'bg-pink-500 text-white' : 'bg-black/40 text-white/55 border border-dark-border hover:text-white/85'}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Nivel */}
          <Field label="Nivel de intensidad" icon={<Activity className="w-3.5 h-3.5" />}>
            <div className="flex gap-1.5">
              {NIVELES.map(n => (
                <button key={n.v} type="button" onClick={() => setDraft({ ...draft, nivel: n.v })}
                  title={n.label}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${draft.nivel === n.v ? 'bg-pink-500 text-white' : 'bg-black/40 text-white/55 border border-dark-border hover:text-white/85'}`}>{n.v}</button>
              ))}
            </div>
            <p className="text-white/45 text-xs mt-1.5">{NIVELES.find(n => n.v === draft.nivel)?.label}</p>
          </Field>

          {/* Objetivo */}
          <Field label="Objetivo" icon={<Target className="w-3.5 h-3.5" />}>
            <select value={draft.objetivo} onChange={e => setDraft({ ...draft, objetivo: e.target.value })}
              className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 appearance-none">
              <option value="" className="bg-dark-800">Elegí uno...</option>
              {OBJETIVOS.map(o => <option key={o} value={o} className="bg-dark-800">{o}</option>)}
            </select>
          </Field>

          {/* Disciplinas */}
          <Field label="Disciplinas que te interesan">
            <p className="text-white/45 text-xs mb-2">Elegí una o más.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DISCIPLINAS.map(d => {
                const sel = draft.disciplinas.includes(d);
                return (
                  <button key={d} type="button"
                    onClick={() => setDraft({ ...draft, disciplinas: sel ? draft.disciplinas.filter(x => x !== d) : [...draft.disciplinas, d] })}
                    className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${sel ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-500/40' : 'bg-black/40 text-white/55 border-2 border-dark-border hover:text-white/85'}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* WhatsApp */}
          <Field label="WhatsApp (con código país)" icon={<Phone className="w-3.5 h-3.5" />}>
            <input type="tel" value={draft.telefono} onChange={e => setDraft({ ...draft, telefono: e.target.value })}
              placeholder="+54 9 221 6806000"
              className="w-full px-3.5 py-3 bg-black/60 border-2 border-dark-border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
            <p className="text-white/45 text-xs mt-1">Solo se comparte con otros opted-in.</p>
          </Field>

          {/* Preferencias de match */}
          <div className="bg-black/30 border border-dark-border rounded-xl p-3 space-y-3">
            <p className="text-violet-300 text-xs uppercase tracking-wider font-bold">Preferencias para mis matches</p>

            <Field label="Mostrar matches de género">
              <div className="grid grid-cols-3 gap-2">
                {PREF_GENERO_OPCIONES.map(g => (
                  <PillButton key={g} active={draft.prefGenero === g} onClick={() => setDraft({ ...draft, prefGenero: g })}>{g}</PillButton>
                ))}
              </div>
            </Field>

            <Field label="Rango de edad (opcional)">
              <div className="flex items-center gap-2">
                <input type="number" min="14" max="99" value={draft.prefEdadMin ?? ''}
                  onChange={e => setDraft({ ...draft, prefEdadMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Min"
                  className="w-24 px-3 py-2 bg-black/60 border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
                <span className="text-white/40">a</span>
                <input type="number" min="14" max="99" value={draft.prefEdadMax ?? ''}
                  onChange={e => setDraft({ ...draft, prefEdadMax: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Max"
                  className="w-24 px-3 py-2 bg-black/60 border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
                <span className="text-white/40 text-sm">años</span>
              </div>
            </Field>
          </div>

          {/* Mensaje template */}
          <Field label="Mensaje al conectar (opcional)">
            <p className="text-white/45 text-xs mb-2">Editá el mensaje que se enviará por WhatsApp. Usá <code className="text-pink-300">{'{nombre}'}</code> para el nombre del receptor y <code className="text-pink-300">{'{yo}'}</code> para el tuyo.</p>
            <textarea
              value={draft.mensajeTemplate || ''}
              onChange={e => setDraft({ ...draft, mensajeTemplate: e.target.value })}
              rows={3}
              placeholder={MENSAJE_DEFAULT('{nombre}', miNombre.split(' ')[0] || 'Carlos')}
              className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30 resize-none"
            />
            {tieneTemplate && (
              <button onClick={() => setDraft({ ...draft, mensajeTemplate: undefined })}
                className="text-xs text-white/45 hover:text-white/65 mt-1">Volver al mensaje por defecto</button>
            )}
          </Field>
        </>
      )}

      {error && <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm">{error}</div>}

      <div className="flex gap-3">
        {canCancel && (
          <button onClick={onCancel} className="flex-1 py-3 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
        )}
        <button onClick={guardar} disabled={guardando}
          className="flex-1 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" /> {guardando ? 'Guardando...' : draft.activo ? 'Activar y guardar' : 'Guardar (desactivado)'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/65 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${active ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-500/40' : 'bg-black/40 text-white/55 border-2 border-dark-border hover:text-white/85'}`}>
      {children}
    </button>
  );
}

// ====================================================================
// MATCH CARD
// ====================================================================
function MatchCard({ match, verificado, misDisciplinas, onEnviar, onReportar, onBloquear }: {
  match: MatchResult;
  verificado: boolean;
  misDisciplinas: string[];
  onEnviar: () => void;
  onReportar: () => void;
  onBloquear: () => void;
}) {
  const { user: u, score, detalle } = match;
  const primero = u.nombre.split(/\s+/)[0] || u.nombre;
  const colorScore = score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-white/55 bg-white/5 border-dark-border';
  const generoLabel = u.genero === 'Hombre' ? '♂' : u.genero === 'Mujer' ? '♀' : u.genero ? '⚧' : '';
  const misSet = new Set(misDisciplinas);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-4 flex items-start gap-3 hover:border-pink-500/20 transition-colors relative">
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
          {verificado && <BadgeCheck className="w-4 h-4 text-electric" aria-label="Verificado" />}
          {u.edad && <span className="text-white/60 text-sm font-semibold">· {u.edad} años</span>}
          {generoLabel && <span className="text-white/60 text-sm" title={u.genero}>{generoLabel}</span>}
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${colorScore}`}>{score}% match</span>
          {/* Menu kebab */}
          <div className="ml-auto relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#0a0a0a] border border-white/15 rounded-xl shadow-2xl z-40 overflow-hidden w-44">
                  <button onClick={() => { setMenuOpen(false); onReportar(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-amber-400 text-sm hover:bg-amber-500/10 text-left">
                    <Flag className="w-4 h-4" /> Reportar
                  </button>
                  <button onClick={() => { setMenuOpen(false); onBloquear(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-danger text-sm hover:bg-danger/10 text-left">
                    <Ban className="w-4 h-4" /> Bloquear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60 mt-1.5 flex-wrap">
          {u.zona && <span className={`flex items-center gap-1 ${detalle.zona > 0 ? 'text-emerald-400 font-semibold' : ''}`}><MapPin className="w-3 h-3" /> {u.zona}</span>}
          {u.horario && <span className={`flex items-center gap-1 ${detalle.horario > 0 ? 'text-emerald-400 font-semibold' : ''}`}><Clock className="w-3 h-3" /> {u.horario}</span>}
          {typeof u.nivel === 'number' && <span className={`flex items-center gap-1 ${detalle.nivel > 0 ? 'text-emerald-400 font-semibold' : ''}`}><Activity className="w-3 h-3" /> Nivel {u.nivel}</span>}
          {u.objetivo && <span className={`flex items-center gap-1 ${detalle.objetivo > 0 ? 'text-emerald-400 font-semibold' : ''}`}><Target className="w-3 h-3" /> {u.objetivo}</span>}
        </div>
        {u.dias && u.dias.length > 0 && (
          <p className="text-white/45 text-xs mt-1.5">Entrena: <strong className="text-white/65">{u.dias.join(' · ')}</strong></p>
        )}
        {u.disciplinas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {u.disciplinas.map(d => {
              const compartida = misSet.has(d);
              return (
                <span key={d}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${compartida ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-white/45 border border-dark-border'}`}>
                  {d}
                </span>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          <button onClick={onEnviar}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black transition-colors">
            <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
          </button>
          <span className={`text-[11px] ${frescuraColor(u.actualizado)}`}>{ultimaActividadLabel(u.actualizado)}</span>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// REPORTAR MODAL
// ====================================================================
const MOTIVOS_REPORTE = [
  'Perfil falso o engañoso',
  'Comportamiento inapropiado',
  'Spam o publicidad',
  'Acoso o lenguaje ofensivo',
  'Otro',
];

function ReportarModal({ nombre, onClose, onConfirmar }: { nombre: string; onClose: () => void; onConfirmar: (motivo: string) => void }) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-black text-base">Reportar a {nombre}</h3>
        </div>
        <p className="text-white/55 text-xs mb-4">Tu reporte es anónimo. Si un usuario recibe 3 reportes, su perfil se desactiva automáticamente y revisamos su cuenta.</p>
        <div className="space-y-2 mb-4">
          {MOTIVOS_REPORTE.map(m => (
            <button key={m} onClick={() => setMotivo(m)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${motivo === m ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-black/40 text-white/65 border border-dark-border hover:text-white'}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
          <button onClick={() => motivo && onConfirmar(motivo)} disabled={!motivo}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-sm font-black disabled:opacity-40">
            Reportar y bloquear
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// ENVIAR MODAL (preview/edit del mensaje antes de WhatsApp)
// ====================================================================
function EnviarModal({ user, mensajeInicial, onClose }: { user: PartnerUsuario; mensajeInicial: string; onClose: () => void }) {
  const [mensaje, setMensaje] = useState(mensajeInicial);
  const link = whatsappLink(user.telefono, mensaje);
  const primero = user.nombre.split(' ')[0];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-black text-base">Escribir a {primero}</h3>
        </div>
        <p className="text-white/55 text-xs mb-3">Editá el mensaje antes de enviarlo. Se abre WhatsApp con el texto pre-cargado.</p>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none mb-3"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
          <a href={link} target="_blank" rel="noopener noreferrer" onClick={onClose}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// EVENTOS TAB
// ====================================================================
function PartnerEventosTab({ perfilActivo }: { perfilActivo: boolean }) {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<PartnerEvento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [crear, setCrear] = useState(false);

  useEffect(() => {
    cargarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarEventos() {
    setCargando(true);
    const ahora = new Date().toISOString();
    const { data } = await supabase
      .from('partner_eventos')
      .select('*')
      .gte('fecha_hora', ahora)
      .order('fecha_hora', { ascending: true });
    const evs: PartnerEvento[] = (data || []).map(e => ({
      id: e.id as number,
      creadorDni: e.creador_dni as string,
      creadorNombre: e.creador_nombre as string,
      creadorFoto: (e.creador_foto as string) || undefined,
      titulo: e.titulo as string,
      descripcion: (e.descripcion as string) || undefined,
      zona: e.zona as string,
      puntoEncuentro: (e.punto_encuentro as string) || undefined,
      disciplina: (e.disciplina as string) || undefined,
      fechaHora: e.fecha_hora as string,
      duracionMin: (e.duracion_min as number) || 60,
      cupo: (e.cupo as number) || 5,
      participantes: ((e.participantes as string) || '').split(',').filter(Boolean),
      participantesNombres: ((e.participantes_nombres as string) || '').split(',').filter(Boolean),
      creado: (e.creado as string) || undefined,
    }));
    setEventos(evs);
    setCargando(false);
  }

  async function sumarse(ev: PartnerEvento) {
    if (!user?.dni) return;
    if (ev.participantes.includes(user.dni)) return;
    if (ev.participantes.length >= ev.cupo) { alert('Cupo lleno.'); return; }
    const newPart = [...ev.participantes, user.dni];
    const newNombres = [...ev.participantesNombres, (user.nombre || '').split(' ')[0]];
    await supabase.from('partner_eventos').update({
      participantes: newPart.join(','),
      participantes_nombres: newNombres.join(','),
    }).eq('id', ev.id);
    cargarEventos();
  }

  async function abandonar(ev: PartnerEvento) {
    if (!user?.dni) return;
    const idx = ev.participantes.indexOf(user.dni);
    if (idx === -1) return;
    const newPart = ev.participantes.filter(d => d !== user.dni);
    const newNombres = ev.participantesNombres.filter((_, i) => i !== idx);
    await supabase.from('partner_eventos').update({
      participantes: newPart.join(','),
      participantes_nombres: newNombres.join(','),
    }).eq('id', ev.id);
    cargarEventos();
  }

  async function eliminar(ev: PartnerEvento) {
    if (!confirm(`¿Eliminar el evento "${ev.titulo}"?`)) return;
    await supabase.from('partner_eventos').delete().eq('id', ev.id);
    cargarEventos();
  }

  if (!perfilActivo) {
    return (
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
        <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
        <p className="text-white/55 font-bold mb-1">Activá Partner Match primero</p>
        <p className="text-white/40 text-xs">Para crear o sumarte a eventos necesitás tener tu perfil activo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-pink-400" />
          <h2 className="text-white font-bold text-sm">Próximos eventos</h2>
          <span className="text-white/40 text-xs">({eventos.length})</span>
        </div>
        <button onClick={() => setCrear(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-xs font-black">
          <Plus className="w-3.5 h-3.5" /> Crear evento
        </button>
      </div>

      {cargando ? (
        <div className="text-center py-8 text-white/40 text-sm">Cargando eventos...</div>
      ) : eventos.length === 0 ? (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
          <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/55 font-bold mb-1">Sin eventos próximos</p>
          <p className="text-white/40 text-xs">Sé el primero en crear uno y se suma quien quiera.</p>
        </div>
      ) : (
        eventos.map(ev => (
          <EventoCard key={ev.id} ev={ev} miDni={user?.dni || ''}
            onSumarse={() => sumarse(ev)}
            onAbandonar={() => abandonar(ev)}
            onEliminar={() => eliminar(ev)} />
        ))
      )}

      {crear && <CrearEventoModal onClose={() => setCrear(false)} onCreated={() => { setCrear(false); cargarEventos(); }} />}
    </div>
  );
}

function EventoCard({ ev, miDni, onSumarse, onAbandonar, onEliminar }: {
  ev: PartnerEvento; miDni: string;
  onSumarse: () => void; onAbandonar: () => void; onEliminar: () => void;
}) {
  const fecha = new Date(ev.fechaHora);
  const fechaLabel = fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  const horaLabel = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const soyCreador = ev.creadorDni === miDni;
  const yaParticipo = ev.participantes.includes(miDni);
  const lleno = ev.participantes.length >= ev.cupo;

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-2">
        {ev.creadorFoto ? (
          <img src={ev.creadorFoto} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
            {ev.creadorNombre.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base">{ev.titulo}</p>
          <p className="text-white/55 text-xs">Por {ev.creadorNombre.split(' ')[0]}</p>
        </div>
        {soyCreador && (
          <button onClick={onEliminar} className="p-1.5 text-white/40 hover:text-danger rounded-lg" title="Eliminar evento">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-white/65 mb-2">
        <span className="flex items-center gap-1 capitalize"><Calendar className="w-3 h-3 text-pink-400" /> {fechaLabel} · {horaLabel}</span>
        {ev.disciplina && <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {ev.disciplina}</span>}
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.duracionMin} min</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.zona}</span>
      </div>
      {ev.puntoEncuentro && <p className="text-white/55 text-xs mb-2">📍 {ev.puntoEncuentro}</p>}
      {ev.descripcion && <p className="text-white/65 text-xs mb-2">{ev.descripcion}</p>}
      <div className="flex items-center justify-between gap-2 flex-wrap mt-3 pt-3 border-t border-dark-border">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-white/65 text-xs"><strong className="text-white">{ev.participantes.length}/{ev.cupo}</strong></span>
          {ev.participantesNombres.length > 0 && (
            <span className="text-white/45 text-xs">· {ev.participantesNombres.slice(0, 3).join(', ')}{ev.participantesNombres.length > 3 ? ` +${ev.participantesNombres.length - 3}` : ''}</span>
          )}
        </div>
        {!soyCreador && (
          yaParticipo ? (
            <button onClick={onAbandonar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/65 border border-dark-border rounded-lg text-xs font-bold hover:bg-white/10">
              <UserMinus className="w-3.5 h-3.5" /> Abandonar
            </button>
          ) : (
            <button onClick={onSumarse} disabled={lleno}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black disabled:opacity-40">
              <UserPlus className="w-3.5 h-3.5" /> {lleno ? 'Cupo lleno' : 'Sumarme'}
            </button>
          )
        )}
        {soyCreador && (
          <span className="text-pink-300 text-xs font-bold">Sos el creador</span>
        )}
      </div>
    </div>
  );
}

function CrearEventoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [zona, setZona] = useState('');
  const [puntoEncuentro, setPuntoEncuentro] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [duracion, setDuracion] = useState(60);
  const [cupo, setCupo] = useState(5);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function crear() {
    setError('');
    if (!user?.dni) return;
    if (!titulo.trim()) { setError('Ingresá un título.'); return; }
    if (!zona.trim()) { setError('Ingresá la zona.'); return; }
    if (!fecha || !hora) { setError('Ingresá fecha y hora.'); return; }
    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (fechaHora.getTime() < Date.now()) { setError('La fecha tiene que ser futura.'); return; }
    setGuardando(true);
    const { error: err } = await supabase.from('partner_eventos').insert({
      creador_dni: user.dni,
      creador_nombre: user.nombre,
      creador_foto: user.foto || null,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      zona: zona.trim(),
      punto_encuentro: puntoEncuentro.trim() || null,
      disciplina: disciplina || null,
      fecha_hora: fechaHora.toISOString(),
      duracion_min: duracion,
      cupo,
      participantes: user.dni,
      participantes_nombres: (user.nombre || '').split(' ')[0],
    });
    setGuardando(false);
    if (err) { setError('Error al crear: ' + err.message); return; }
    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-base flex items-center gap-2"><Calendar className="w-5 h-5 text-pink-400" /> Crear evento</h3>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Título"><input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Salida a correr 10K" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" /></Field>
          <Field label="Descripción (opcional)"><textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} placeholder="Ritmo, distancia, nivel esperado..." className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30 resize-none" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Fecha"><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40" /></Field>
            <Field label="Hora"><input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40" /></Field>
          </div>
          <Field label="Zona"><input type="text" value={zona} onChange={e => setZona(e.target.value)} placeholder="Ej: City Bell" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" /></Field>
          <Field label="Punto de encuentro (opcional)"><input type="text" value={puntoEncuentro} onChange={e => setPuntoEncuentro(e.target.value)} placeholder="Ej: Plaza Belgrano, esquina del kiosco" className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" /></Field>
          <Field label="Disciplina (opcional)">
            <select value={disciplina} onChange={e => setDisciplina(e.target.value)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 appearance-none">
              <option value="" className="bg-dark-800">Sin especificar</option>
              {DISCIPLINAS.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Duración (min)"><input type="number" min="15" max="300" value={duracion} onChange={e => setDuracion(parseInt(e.target.value) || 60)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40" /></Field>
            <Field label="Cupo"><input type="number" min="2" max="50" value={cupo} onChange={e => setCupo(parseInt(e.target.value) || 5)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40" /></Field>
          </div>
          {error && <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm">{error}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
            <button onClick={crear} disabled={guardando} className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" /> {guardando ? 'Creando...' : 'Crear evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export TrendingUp y Shield para evitar warnings de unused
void TrendingUp; void Shield;
