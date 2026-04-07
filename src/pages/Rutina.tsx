import { Dumbbell, Clock, Flame, CheckCircle, RotateCcw, ChevronDown, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ExerciseThumbnail, ExerciseModal } from '../components/ExerciseIllustration';
import ShareButtons, { generateRutinaText, shareWhatsApp, printContent } from '../components/ShareButtons';

interface Ejercicio {
  id: number;
  nombre: string;
  series: number;
  reps: string;
  descanso: string;
  peso: string;
  musculo: string;
  completado: boolean;
  notas: string;
}

interface DiaEntrenamiento {
  dia: string;
  tipo: string;
}

const RUTINA_KEY = 'bc_rutina_semana';
const EJERCICIOS_KEY = 'bc_rutina_ejercicios';

const tiposEntrenamiento = ['Push', 'Pull', 'Piernas', 'Upper', 'Lower', 'Full Body', 'Cardio', 'HIIT', 'Funcional', 'Descanso'];
const gruposMusculares = ['Pecho', 'Pecho superior', 'Espalda', 'Espalda baja', 'Hombro anterior', 'Hombro lateral', 'Hombro posterior', 'B\u00edceps', 'Tr\u00edceps', 'Antebrazo', 'Cu\u00e1driceps', 'Isquiotibiales', 'Gl\u00fateos', 'Pantorrillas', 'Abdominales', 'Oblicuos', 'Core', 'Pecho / Tr\u00edceps', 'Espalda / B\u00edceps', 'Full Body'];

// Plantillas de ejercicios por tipo de entrenamiento
const plantillas: Record<string, Ejercicio[]> = {
  Push: [
    { id: 1, nombre: 'Press Banca con Barra', series: 4, reps: '8-10', descanso: '90', peso: '70', musculo: 'Pecho', completado: false, notas: 'Control exc\u00e9ntrico 3 seg.' },
    { id: 2, nombre: 'Press Inclinado Mancuernas', series: 3, reps: '10-12', descanso: '75', peso: '24', musculo: 'Pecho superior', completado: false, notas: '' },
    { id: 3, nombre: 'Press Militar con Barra', series: 4, reps: '8-10', descanso: '90', peso: '40', musculo: 'Hombro anterior', completado: false, notas: '' },
    { id: 4, nombre: 'Elevaciones Laterales', series: 4, reps: '12-15', descanso: '60', peso: '10', musculo: 'Hombro lateral', completado: false, notas: 'Drop set en \u00faltima serie.' },
    { id: 5, nombre: 'Fondos en Paralelas', series: 3, reps: '10-12', descanso: '75', peso: '+10', musculo: 'Pecho / Tr\u00edceps', completado: false, notas: '' },
    { id: 6, nombre: 'Extensi\u00f3n Tr\u00edceps Polea', series: 3, reps: '12-15', descanso: '60', peso: '25', musculo: 'Tr\u00edceps', completado: false, notas: '' },
    { id: 7, nombre: 'Tr\u00edceps Franc\u00e9s Mancuerna', series: 3, reps: '10-12', descanso: '60', peso: '14', musculo: 'Tr\u00edceps', completado: false, notas: '' },
  ],
  Pull: [
    { id: 10, nombre: 'Dominadas', series: 4, reps: '8-10', descanso: '90', peso: 'Corporal', musculo: 'Espalda', completado: false, notas: 'Agarre prono, ancho de hombros.' },
    { id: 11, nombre: 'Remo con Barra', series: 4, reps: '8-10', descanso: '90', peso: '60', musculo: 'Espalda', completado: false, notas: 'Torso a 45\u00b0. Llevar codos atr\u00e1s.' },
    { id: 12, nombre: 'Remo Mancuerna a 1 Brazo', series: 3, reps: '10-12', descanso: '60', peso: '28', musculo: 'Espalda', completado: false, notas: '' },
    { id: 13, nombre: 'Pull Down Polea', series: 3, reps: '10-12', descanso: '75', peso: '55', musculo: 'Espalda', completado: false, notas: 'Agarre ancho.' },
    { id: 14, nombre: 'Curl B\u00edceps con Barra', series: 3, reps: '10-12', descanso: '60', peso: '30', musculo: 'B\u00edceps', completado: false, notas: 'Sin balanceo.' },
    { id: 15, nombre: 'Curl Martillo Mancuernas', series: 3, reps: '12-15', descanso: '60', peso: '14', musculo: 'B\u00edceps', completado: false, notas: '' },
    { id: 16, nombre: 'Face Pull', series: 3, reps: '15-20', descanso: '45', peso: '20', musculo: 'Hombro posterior', completado: false, notas: 'Rotaci\u00f3n externa al final.' },
  ],
  Piernas: [
    { id: 20, nombre: 'Sentadilla con Barra', series: 4, reps: '6-8', descanso: '120', peso: '80', musculo: 'Cu\u00e1driceps', completado: false, notas: 'Profundidad completa. Core activado.' },
    { id: 21, nombre: 'Prensa de Piernas', series: 4, reps: '10-12', descanso: '90', peso: '150', musculo: 'Cu\u00e1driceps', completado: false, notas: 'Pies al ancho de hombros.' },
    { id: 22, nombre: 'Peso Muerto Rumano', series: 4, reps: '8-10', descanso: '90', peso: '70', musculo: 'Isquiotibiales', completado: false, notas: 'Rodillas semi-flexionadas. Bisagra de cadera.' },
    { id: 23, nombre: 'Zancadas con Mancuernas', series: 3, reps: '12 c/lado', descanso: '60', peso: '16', musculo: 'Gl\u00fateos', completado: false, notas: 'Paso largo para m\u00e1s gl\u00fateo.' },
    { id: 24, nombre: 'Extensi\u00f3n de Piernas', series: 3, reps: '12-15', descanso: '60', peso: '40', musculo: 'Cu\u00e1driceps', completado: false, notas: 'Apretar arriba 1 seg.' },
    { id: 25, nombre: 'Curl Femoral Acostado', series: 3, reps: '10-12', descanso: '60', peso: '35', musculo: 'Isquiotibiales', completado: false, notas: '' },
    { id: 26, nombre: 'Elevaci\u00f3n de Pantorrillas', series: 4, reps: '15-20', descanso: '45', peso: '60', musculo: 'Pantorrillas', completado: false, notas: 'Rango completo. Pausa abajo.' },
  ],
  Upper: [
    { id: 30, nombre: 'Press Banca con Barra', series: 4, reps: '6-8', descanso: '90', peso: '75', musculo: 'Pecho', completado: false, notas: '' },
    { id: 31, nombre: 'Dominadas', series: 4, reps: '8-10', descanso: '90', peso: 'Corporal', musculo: 'Espalda', completado: false, notas: '' },
    { id: 32, nombre: 'Press Militar con Barra', series: 3, reps: '8-10', descanso: '75', peso: '40', musculo: 'Hombro anterior', completado: false, notas: '' },
    { id: 33, nombre: 'Remo con Barra', series: 3, reps: '10-12', descanso: '75', peso: '55', musculo: 'Espalda', completado: false, notas: '' },
    { id: 34, nombre: 'Curl B\u00edceps con Barra', series: 3, reps: '10-12', descanso: '60', peso: '30', musculo: 'B\u00edceps', completado: false, notas: '' },
    { id: 35, nombre: 'Extensi\u00f3n Tr\u00edceps Polea', series: 3, reps: '12-15', descanso: '60', peso: '25', musculo: 'Tr\u00edceps', completado: false, notas: '' },
  ],
  Lower: [
    { id: 40, nombre: 'Sentadilla con Barra', series: 4, reps: '8-10', descanso: '90', peso: '70', musculo: 'Cu\u00e1driceps', completado: false, notas: '' },
    { id: 41, nombre: 'Peso Muerto Rumano', series: 4, reps: '8-10', descanso: '90', peso: '65', musculo: 'Isquiotibiales', completado: false, notas: '' },
    { id: 42, nombre: 'Hip Thrust', series: 4, reps: '10-12', descanso: '75', peso: '80', musculo: 'Gl\u00fateos', completado: false, notas: 'Apretar gl\u00fateos arriba 2 seg.' },
    { id: 43, nombre: 'Sentadilla B\u00falgara', series: 3, reps: '10 c/lado', descanso: '60', peso: '14', musculo: 'Cu\u00e1driceps', completado: false, notas: '' },
    { id: 44, nombre: 'Curl Femoral Acostado', series: 3, reps: '10-12', descanso: '60', peso: '35', musculo: 'Isquiotibiales', completado: false, notas: '' },
    { id: 45, nombre: 'Elevaci\u00f3n de Pantorrillas', series: 4, reps: '15-20', descanso: '45', peso: '60', musculo: 'Pantorrillas', completado: false, notas: '' },
  ],
  'Full Body': [
    { id: 50, nombre: 'Sentadilla con Barra', series: 3, reps: '8-10', descanso: '90', peso: '65', musculo: 'Cu\u00e1driceps', completado: false, notas: '' },
    { id: 51, nombre: 'Press Banca con Barra', series: 3, reps: '8-10', descanso: '90', peso: '65', musculo: 'Pecho', completado: false, notas: '' },
    { id: 52, nombre: 'Remo con Barra', series: 3, reps: '10-12', descanso: '75', peso: '50', musculo: 'Espalda', completado: false, notas: '' },
    { id: 53, nombre: 'Press Militar con Barra', series: 3, reps: '10-12', descanso: '75', peso: '35', musculo: 'Hombro anterior', completado: false, notas: '' },
    { id: 54, nombre: 'Curl B\u00edceps con Barra', series: 2, reps: '12-15', descanso: '60', peso: '25', musculo: 'B\u00edceps', completado: false, notas: '' },
    { id: 55, nombre: 'Extensi\u00f3n Tr\u00edceps Polea', series: 2, reps: '12-15', descanso: '60', peso: '22', musculo: 'Tr\u00edceps', completado: false, notas: '' },
  ],
  Cardio: [
    { id: 60, nombre: 'Cinta - Trote', series: 1, reps: '20 min', descanso: '0', peso: '-', musculo: 'Full Body', completado: false, notas: 'Ritmo moderado 7-8 km/h.' },
    { id: 61, nombre: 'Bicicleta Est\u00e1tica', series: 1, reps: '15 min', descanso: '0', peso: '-', musculo: 'Cu\u00e1driceps', completado: false, notas: 'Resistencia media.' },
    { id: 62, nombre: 'El\u00edptico', series: 1, reps: '15 min', descanso: '0', peso: '-', musculo: 'Full Body', completado: false, notas: '' },
  ],
  HIIT: [
    { id: 70, nombre: 'Burpees', series: 5, reps: '10', descanso: '30', peso: '-', musculo: 'Full Body', completado: false, notas: 'M\u00e1xima intensidad.' },
    { id: 71, nombre: 'Mountain Climbers', series: 5, reps: '20', descanso: '30', peso: '-', musculo: 'Core', completado: false, notas: '' },
    { id: 72, nombre: 'Jumping Squats', series: 5, reps: '15', descanso: '30', peso: '-', musculo: 'Cu\u00e1driceps', completado: false, notas: '' },
    { id: 73, nombre: 'Sprint en Cinta', series: 8, reps: '30 seg', descanso: '30', peso: '-', musculo: 'Full Body', completado: false, notas: '30s sprint / 30s descanso.' },
  ],
  Funcional: [
    { id: 80, nombre: 'Kettlebell Swing', series: 4, reps: '15', descanso: '60', peso: '16', musculo: 'Gl\u00fateos', completado: false, notas: 'Bisagra de cadera explosiva.' },
    { id: 81, nombre: 'Turkish Get Up', series: 3, reps: '3 c/lado', descanso: '60', peso: '12', musculo: 'Full Body', completado: false, notas: '' },
    { id: 82, nombre: 'Farmer Walk', series: 3, reps: '40 metros', descanso: '60', peso: '24 c/u', musculo: 'Core', completado: false, notas: 'Hombros atr\u00e1s, core firme.' },
    { id: 83, nombre: 'Battle Ropes', series: 4, reps: '30 seg', descanso: '30', peso: '-', musculo: 'Full Body', completado: false, notas: '' },
  ],
  Descanso: [],
};

function generarEjerciciosParaDia(tipo: string): Ejercicio[] {
  const base = plantillas[tipo] || [];
  return base.map(e => ({ ...e, id: Date.now() + Math.random() * 10000, completado: false }));
}

const semanaDefault: DiaEntrenamiento[] = [
  { dia: 'Lun', tipo: 'Push' },
  { dia: 'Mar', tipo: 'Pull' },
  { dia: 'Mi\u00e9', tipo: 'Descanso' },
  { dia: 'Jue', tipo: 'Piernas' },
  { dia: 'Vie', tipo: 'Upper' },
  { dia: 'S\u00e1b', tipo: 'Lower' },
  { dia: 'Dom', tipo: 'Descanso' },
];

export default function Rutina() {
  const [semana, setSemana] = useState<DiaEntrenamiento[]>(() => {
    const saved = localStorage.getItem(RUTINA_KEY);
    return saved ? JSON.parse(saved) : semanaDefault;
  });
  const [diaActivo, setDiaActivo] = useState(0);

  // Ejercicios guardados por dia (indice 0-6)
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState<Record<number, Ejercicio[]>>(() => {
    const saved = localStorage.getItem(EJERCICIOS_KEY);
    if (saved) return JSON.parse(saved);
    const initial: Record<number, Ejercicio[]> = {};
    semanaDefault.forEach((d, i) => { initial[i] = generarEjerciciosParaDia(d.tipo); });
    return initial;
  });

  const ejercicios = ejerciciosPorDia[diaActivo] || [];
  const tipoActivo = semana[diaActivo]?.tipo || 'Descanso';

  const [expandido, setExpandido] = useState<number | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [editSemana, setEditSemana] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIllustration, setShowIllustration] = useState<string | null>(null);
  const [nuevoEj, setNuevoEj] = useState<Ejercicio>({ id: 0, nombre: '', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Pecho', completado: false, notas: '' });

  // Persistir
  useEffect(() => {
    localStorage.setItem(RUTINA_KEY, JSON.stringify(semana));
  }, [semana]);
  useEffect(() => {
    localStorage.setItem(EJERCICIOS_KEY, JSON.stringify(ejerciciosPorDia));
  }, [ejerciciosPorDia]);

  const setEjercicios = (updater: Ejercicio[] | ((prev: Ejercicio[]) => Ejercicio[])) => {
    setEjerciciosPorDia(prev => ({
      ...prev,
      [diaActivo]: typeof updater === 'function' ? updater(prev[diaActivo] || []) : updater,
    }));
  };

  const toggleCompleto = (id: number) => {
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, completado: !e.completado } : e));
  };

  const updateEjercicio = (id: number, field: keyof Ejercicio, value: string | number) => {
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEjercicio = (id: number) => {
    setEjercicios(prev => prev.filter(e => e.id !== id));
    if (editando === id) setEditando(null);
  };

  const addEjercicio = () => {
    if (!nuevoEj.nombre.trim()) return;
    setEjercicios(prev => [...prev, { ...nuevoEj, id: Date.now() }]);
    setNuevoEj({ id: 0, nombre: '', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Pecho', completado: false, notas: '' });
    setShowAddModal(false);
  };

  const updateDia = (index: number, tipo: string) => {
    setSemana(prev => prev.map((d, i) => i === index ? { ...d, tipo } : d));
    // Generar nuevos ejercicios para ese dia
    setEjerciciosPorDia(prev => ({ ...prev, [index]: generarEjerciciosParaDia(tipo) }));
  };

  const seleccionarDia = (index: number) => {
    if (!editSemana) {
      setDiaActivo(index);
      setEditando(null);
      setExpandido(null);
    }
  };

  const completados = ejercicios.filter(e => e.completado).length;
  const totalSeries = ejercicios.reduce((a, e) => a + e.series, 0);
  const tiempoEstimado = ejercicios.reduce((a, e) => a + (e.series * (parseInt(e.descanso) || 60) / 60) + (e.series * 0.75), 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-purple-400" /> Mi Rutina
          </h1>
          {tipoActivo !== 'Descanso' && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-electric/15 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/25 transition-all">
              <Plus className="w-3.5 h-3.5" /> Ejercicio
            </button>
          )}
        </div>
        <p className="text-white/40 text-sm mt-1">
          {semana[diaActivo]?.dia} &mdash; <span className="text-purple-400 font-bold">{tipoActivo}</span>
          {tipoActivo === 'Descanso' ? ' (D\u00eda de recuperaci\u00f3n)' : ''}
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {tipoActivo !== 'Descanso' && (
            <ShareButtons
              onPrint={() => {
                let html = `<p class="subtitle">${semana[diaActivo]?.dia} - ${tipoActivo}</p>`;
                html += `<div class="semana">${semana.map((d, i) => `<div class="dia ${i === diaActivo ? 'dia-activo' : ''}"><strong>${d.dia}</strong><br/>${d.tipo}</div>`).join('')}</div>`;
                html += `<h2>Ejercicios</h2><table><tr><th>#</th><th>Ejercicio</th><th>M\u00fasculo</th><th>Series</th><th>Reps</th><th>Peso</th><th>Descanso</th><th>Notas</th></tr>`;
                ejercicios.forEach((e, i) => { html += `<tr><td>${i+1}</td><td><strong>${e.nombre}</strong></td><td>${e.musculo}</td><td>${e.series}</td><td>${e.reps}</td><td>${e.peso} kg</td><td>${e.descanso}s</td><td>${e.notas || '-'}</td></tr>`; });
                html += `</table>`;
                printContent(`Rutina ${semana[diaActivo]?.dia} ${tipoActivo} - JustFit365`, html);
              }}
              onWhatsApp={() => shareWhatsApp(generateRutinaText(ejercicios, semana))}
            />
          )}
        </div>
      </div>

      {/* Semana - clickeable para cambiar dia */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/30 text-xs uppercase tracking-wider">
            {editSemana ? 'Cambi\u00e1 el tipo de cada d\u00eda (los ejercicios se actualizan autom\u00e1ticamente)' : 'Click en un d\u00eda para ver su rutina'}
          </span>
          <button onClick={() => setEditSemana(!editSemana)} className="text-xs text-electric/60 hover:text-electric flex items-center gap-1 transition-colors">
            <Edit3 className="w-3 h-3" /> {editSemana ? 'Listo' : 'Editar d\u00edas'}
          </button>
        </div>
        <div className="flex gap-2">
          {semana.map((d, i) => (
            <button key={d.dia} onClick={() => seleccionarDia(i)}
              className={`flex-1 text-center py-3 rounded-xl border transition-all ${
                i === diaActivo
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10'
                  : d.tipo === 'Descanso'
                    ? 'bg-dark-800 border-dark-border text-white/20 hover:border-white/10'
                    : 'bg-dark-800 border-dark-border text-white/40 hover:border-white/10 hover:bg-dark-700'
              } ${editSemana ? 'cursor-default' : 'cursor-pointer'}`}>
              <p className="text-xs font-bold uppercase">{d.dia}</p>
              {editSemana ? (
                <select
                  value={d.tipo}
                  onChange={e => updateDia(i, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="bg-transparent text-[10px] mt-0.5 text-center focus:outline-none w-full appearance-none cursor-pointer"
                >
                  {tiposEntrenamiento.map(t => <option key={t} value={t} className="bg-dark-800 text-white">{t}</option>)}
                </select>
              ) : (
                <p className="text-[10px] mt-0.5 opacity-60">{d.tipo}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Descanso */}
      {tipoActivo === 'Descanso' ? (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">😴</div>
          <h3 className="text-white font-bold text-lg mb-2">D&iacute;a de Descanso</h3>
          <p className="text-white/40 text-sm max-w-md mx-auto">Recuperaci&oacute;n activa: caminar, elongar, yoga suave. El m&uacute;sculo crece cuando descansa.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-dark-800 border border-dark-border rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{completados}/{ejercicios.length}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider mt-1">Ejercicios</p>
            </div>
            <div className="bg-dark-800 border border-dark-border rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{totalSeries}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider mt-1">Series totales</p>
            </div>
            <div className="bg-dark-800 border border-dark-border rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">~{Math.round(tiempoEstimado)}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider mt-1">Min estimados</p>
            </div>
          </div>

          {/* Ejercicios */}
          <div className="space-y-3">
            {ejercicios.map((e) => (
              <div key={e.id} className={`bg-dark-800 border rounded-2xl overflow-hidden transition-all ${
                e.completado ? 'border-emerald-500/20 opacity-60' : 'border-dark-border hover:border-white/10'
              }`}>
                <div className="flex items-center gap-2 px-3 py-3 cursor-pointer" onClick={() => { if (editando !== e.id) setExpandido(expandido === e.id ? null : e.id); }}>
                  <ExerciseThumbnail nombre={e.nombre} onClick={() => setShowIllustration(e.nombre)} />
                  <button onClick={(ev) => { ev.stopPropagation(); toggleCompleto(e.id); }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${e.completado ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20 hover:text-white/50'}`}>
                    {e.completado ? <CheckCircle className="w-4 h-4" /> : <Dumbbell className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${e.completado ? 'text-white/40 line-through' : 'text-white'}`}>{e.nombre}</p>
                    <p className="text-white/30 text-xs mt-0.5">{e.musculo} &middot; {e.series}x{e.reps} &middot; {e.peso}kg</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(ev) => { ev.stopPropagation(); setEditando(editando === e.id ? null : e.id); setExpandido(e.id); }} className="p-1.5 text-white/20 hover:text-electric transition-colors rounded-lg hover:bg-white/5">
                      {editando === e.id ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </button>
                    <button onClick={(ev) => { ev.stopPropagation(); deleteEjercicio(e.id); }} className="p-1.5 text-white/20 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${expandido === e.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandido === e.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-dark-border/50">
                    {editando === e.id ? (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Nombre</label>
                            <input type="text" value={e.nombre} onChange={ev => updateEjercicio(e.id, 'nombre', ev.target.value)}
                              className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">M&uacute;sculo</label>
                            <select value={e.musculo} onChange={ev => updateEjercicio(e.id, 'musculo', ev.target.value)}
                              className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                              {gruposMusculares.map(g => <option key={g} value={g} className="bg-dark-800">{g}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div><label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Series</label>
                            <input type="number" min="1" max="20" value={e.series} onChange={ev => updateEjercicio(e.id, 'series', parseInt(ev.target.value) || 1)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                          <div><label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Reps</label>
                            <input type="text" value={e.reps} onChange={ev => updateEjercicio(e.id, 'reps', ev.target.value)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                          <div><label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Peso (kg)</label>
                            <input type="text" value={e.peso} onChange={ev => updateEjercicio(e.id, 'peso', ev.target.value)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                          <div><label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Descanso (s)</label>
                            <input type="text" value={e.descanso} onChange={ev => updateEjercicio(e.id, 'descanso', ev.target.value)} className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                        </div>
                        <div><label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Notas</label>
                          <textarea value={e.notas} onChange={ev => updateEjercicio(e.id, 'notas', ev.target.value)} rows={2} placeholder="Ej: Control exc\u00e9ntrico, drop set..."
                            className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none placeholder-white/15" /></div>
                        <button onClick={() => setEditando(null)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition-colors">
                          <Save className="w-3 h-3" /> Listo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-6 mt-3 text-xs">
                          <div className="flex items-center gap-1 text-white/40"><RotateCcw className="w-3 h-3" /> {e.series} series</div>
                          <div className="flex items-center gap-1 text-white/40"><Dumbbell className="w-3 h-3" /> {e.reps} reps</div>
                          <div className="flex items-center gap-1 text-white/40"><Clock className="w-3 h-3" /> {e.descanso}s descanso</div>
                          <div className="flex items-center gap-1 text-white/40"><Flame className="w-3 h-3" /> {e.peso} kg</div>
                        </div>
                        {e.notas && <p className="mt-3 text-xs text-electric/60 bg-electric/5 border border-electric/10 rounded-lg px-3 py-2">{e.notas}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Dumbbell className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-white/70 text-sm">
              <strong className="text-white">Tip:</strong> Click en un d&iacute;a de la semana para ver su rutina. "Editar d&iacute;as" cambia el tipo y genera ejercicios autom&aacute;ticamente. Todos los cambios que hagas se guardan.
            </p>
          </div>
        </>
      )}

      {/* Modal agregar ejercicio */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg p-6" onClick={ev => ev.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-electric" /> Agregar Ejercicio a {semana[diaActivo]?.dia} ({tipoActivo})
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Nombre</label>
                <input type="text" value={nuevoEj.nombre} onChange={e => setNuevoEj(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Sentadilla con barra"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">M&uacute;sculo</label>
                  <select value={nuevoEj.musculo} onChange={e => setNuevoEj(p => ({ ...p, musculo: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                    {gruposMusculares.map(g => <option key={g} value={g} className="bg-dark-800">{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Peso (kg)</label>
                  <input type="text" value={nuevoEj.peso} onChange={e => setNuevoEj(p => ({ ...p, peso: e.target.value }))} placeholder="Ej: 60"
                    className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Series</label>
                  <input type="number" min="1" value={nuevoEj.series} onChange={e => setNuevoEj(p => ({ ...p, series: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                <div><label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Reps</label>
                  <input type="text" value={nuevoEj.reps} onChange={e => setNuevoEj(p => ({ ...p, reps: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                <div><label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Descanso (s)</label>
                  <input type="text" value={nuevoEj.descanso} onChange={e => setNuevoEj(p => ({ ...p, descanso: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
              </div>
              <div><label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Notas</label>
                <input type="text" value={nuevoEj.notas} onChange={e => setNuevoEj(p => ({ ...p, notas: e.target.value }))} placeholder="Opcional..." className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors border border-dark-border">Cancelar</button>
                <button onClick={addEjercicio} disabled={!nuevoEj.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] transition-all disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ilustracion */}
      {showIllustration && (
        <ExerciseModal nombre={showIllustration} onClose={() => setShowIllustration(null)} />
      )}
    </div>
  );
}
