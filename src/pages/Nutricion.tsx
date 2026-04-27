import { useState, useEffect } from 'react';
import { Apple, Flame, Droplets, Wheat, Droplet, Clock, Edit3, Save, Trash2, Plus, Zap, Sparkles, RotateCcw, Target, ArrowLeftRight, ShoppingCart, MessageCircle, CheckSquare, Square, X } from 'lucide-react';
import FoodAlternatives, { findAlternatives } from '../components/FoodAlternatives';
import { buscarAlimentos, buscarAlimentoExacto, type AlimentoBase } from '../lib/foodDB';
import { useAuth } from '../context/AuthContext';
import ShareButtons, { generateNutricionText, shareWhatsApp, printContent } from '../components/ShareButtons';
import { getUserItem, setUserItem } from '../lib/storage';

interface Alimento {
  id: number;
  alimento: string;
  porcion: string;
  cal: number;
  prot: number;
  carb: number;
  grasa: number;
}

interface Comida {
  id: number;
  nombre: string;
  hora: string;
  items: Alimento[];
}

const PLAN_KEY = 'bc_plan_nutricional';

function generarPlanIA(peso: number, altura: number, edad: number, objetivo: string, nivel: string, tipoEntreno?: string, enfermedades?: string[]): { comidas: Comida[]; nota: string } {
  const tmb = Math.round(10 * peso + 6.25 * altura - 5 * edad + 5);
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = Math.round(tmb * (factores[nivel] || 1.55));

  // Soporte para multiples actividades por dia (ej: "Push + Running")
  const actividades = (tipoEntreno || '').split(' + ').filter(Boolean);
  const esDescanso = actividades.length === 0 || actividades.every(t => t === 'Descanso');
  const tieneCardio = actividades.some(t => ['Cardio', 'Running', 'Caminata Activa', 'Spinning', 'Ciclismo'].includes(t));
  const tieneFuerza = actividades.some(t => ['Push', 'Pull', 'Piernas', 'Upper', 'Lower', 'Full Body'].includes(t));
  const esYoga = actividades.some(t => t === 'Yoga');
  const esHIIT = actividades.some(t => t === 'HIIT');
  const tieneFuncional = actividades.some(t => t === 'Funcional');
  // Para compatibilidad con logica existente
  const esCardio = tieneCardio && !tieneFuerza;
  void tieneFuerza; void tieneFuncional;

  // Ajuste por enfermedades
  const tieneHipo = enfermedades?.some(e => e.toLowerCase().includes('hipotiroidismo') || e.toLowerCase().includes('hashimoto'));
  const tieneDiabetes = enfermedades?.some(e => e.toLowerCase().includes('diabetes'));
  const tieneCeliaca = enfermedades?.some(e => e.toLowerCase().includes('cel\u00edaca') || e.toLowerCase().includes('gluten'));
  const tieneRenal = enfermedades?.some(e => e.toLowerCase().includes('renal'));
  const tieneLactosa = enfermedades?.some(e => e.toLowerCase().includes('lactosa'));

  let calObjetivo = tdee;
  let protPorKg = 1.8;
  let notaObj = '';
  const notasExtra: string[] = [];

  // Ajuste por objetivo
  if (objetivo.includes('Hipertrofia') || objetivo.includes('Fuerza')) {
    calObjetivo = tdee + 300;
    protPorKg = 2.0;
    notaObj = `Super\u00e1vit moderado (+300 kcal) para s\u00edntesis proteica.`;
  } else if (objetivo.includes('grasa')) {
    calObjetivo = tdee - 400;
    protPorKg = 2.2;
    notaObj = `D\u00e9ficit controlado (-400 kcal). Prote\u00edna alta para preservar m\u00fasculo.`;
  } else if (objetivo.includes('Tonificacion')) {
    calObjetivo = tdee;
    protPorKg = 1.8;
    notaObj = `Mantenimiento con prote\u00edna moderada-alta.`;
  } else {
    calObjetivo = tdee;
    protPorKg = 1.6;
    notaObj = `Plan equilibrado de mantenimiento.`;
  }

  // Ajuste por tipo de entreno del dia (soporte multiple)
  if (esDescanso) {
    calObjetivo = Math.round(calObjetivo * 0.9);
    notasExtra.push('D\u00eda de descanso: calor\u00edas reducidas un 10%.');
  } else {
    let extraKcal = 0;
    const detalles: string[] = [];
    if (tieneFuerza) detalles.push('fuerza');
    if (tieneCardio) { extraKcal += 150; detalles.push('cardio'); }
    if (tieneFuerza && tieneCardio) extraKcal += 100;
    if (esHIIT) { extraKcal += 200; detalles.push('HIIT'); }
    if (tieneFuncional) { extraKcal += 100; detalles.push('funcional'); }
    if (esYoga && detalles.length === 0) detalles.push('yoga');
    calObjetivo = Math.round(calObjetivo + extraKcal);
    if (actividades.length > 1) {
      notasExtra.push(`Combinaci\u00f3n ${actividades.join(' + ')}: +${extraKcal} kcal extra para cubrir el gasto de m\u00faltiples actividades.`);
    } else if (extraKcal > 0) {
      notasExtra.push(`D\u00eda de ${detalles.join(', ')}: +${extraKcal} kcal para energ\u00eda.`);
    } else if (esYoga) {
      notasExtra.push('D\u00eda de Yoga: plan equilibrado con alimentos antiinflamatorios.');
    }
  }

  // Ajuste por enfermedades
  if (tieneHipo) {
    calObjetivo = Math.round(calObjetivo * 0.9);
    notasExtra.push('Hipotiroidismo: calor\u00edas ajustadas -10%. Incluir selenio (nueces de Brasil).');
  }
  if (tieneDiabetes) {
    notasExtra.push('Diabetes: carbohidratos de bajo \u00edndice gluc\u00e9mico. Evitar az\u00facares simples.');
  }
  if (tieneRenal) {
    protPorKg = Math.min(protPorKg, 1.2);
    notasExtra.push('Condici\u00f3n renal: prote\u00edna limitada a 1.2g/kg.');
  }

  const protTotal = Math.round(peso * protPorKg);
  const grasaTotal = Math.round((calObjetivo * 0.25) / 9);
  const carbTotal = Math.round((calObjetivo - protTotal * 4 - grasaTotal * 9) / 4);
  const protPorComida = Math.round(protTotal / 6);

  // Alimentos adaptados
  const lecheDesayuno = tieneLactosa ? 'Leche de almendras' : 'Leche descremada';
  const carbAlmuerzo = tieneCeliaca ? 'Quinoa cocida' : (tieneDiabetes ? 'Batata asada' : 'Arroz integral');
  const carbCena = tieneCeliaca ? 'Papa hervida' : 'Batata asada';
  const protCena = objetivo.includes('grasa') ? 'Merluza al horno' : (esCardio ? 'Pasta integral con at\u00fan' : 'Salm\u00f3n al horno');
  const snackNocturno = tieneLactosa ? 'Prote\u00edna vegana con agua' : 'Case\u00edna o yogur griego';
  const preEntreno = esCardio
    ? [{ id: 301, alimento: 'Banana + miel', porcion: '1 banana + 15g miel', cal: 140, prot: 1, carb: 35, grasa: 0 },
       { id: 302, alimento: 'Galletas de arroz con mermelada', porcion: '3 unid + 20g', cal: 130, prot: 2, carb: 30, grasa: 1 }]
    : [{ id: 301, alimento: 'Tostada integral con queso untable', porcion: '2 rebanadas + 30g queso', cal: 200, prot: 10, carb: Math.round(carbTotal * 0.1), grasa: 5 },
       { id: 302, alimento: 'Whey Protein con agua', porcion: '1 scoop (30g)', cal: 120, prot: 24, carb: 3, grasa: 1 }];

  const comidas: Comida[] = [
    {
      id: 1, nombre: 'Desayuno', hora: '07:30', items: [
        { id: 101, alimento: `Avena con ${lecheDesayuno.toLowerCase()}`, porcion: `${Math.round(calObjetivo * 0.04)}g avena + 200ml`, cal: Math.round(calObjetivo * 0.14), prot: protPorComida - 8, carb: Math.round(carbTotal * 0.2), grasa: 6 },
        { id: 102, alimento: 'Banana', porcion: '1 unidad mediana', cal: 105, prot: 1, carb: 27, grasa: 0 },
        { id: 103, alimento: tieneHipo ? 'Nueces de Brasil (selenio)' : 'Mantequilla de man\u00ed natural', porcion: '15g', cal: 95, prot: 4, carb: 3, grasa: 8 },
      ]
    },
    ...(!esDescanso ? [{
      id: 6, nombre: 'Post-Entreno', hora: '09:30', items: [
        { id: 601, alimento: tieneLactosa ? 'Prote\u00edna vegana con agua' : 'Whey Protein con agua o leche', porcion: '1 scoop (30g) + 250ml', cal: 150, prot: 26, carb: 5, grasa: 2 },
        { id: 602, alimento: esCardio ? 'Fruta + miel' : 'Banana madura', porcion: esCardio ? '1 fruta + 10g miel' : '1 unidad', cal: esCardio ? 140 : 105, prot: 1, carb: esCardio ? 35 : 27, grasa: 0 },
      ]
    }] : []),
    {
      id: 2, nombre: 'Almuerzo', hora: '12:30', items: [
        { id: 201, alimento: 'Pechuga de pollo grillada', porcion: `${Math.round(protPorComida * 3.2)}g`, cal: Math.round(protPorComida * 5.3), prot: protPorComida, carb: 0, grasa: Math.round(protPorComida * 0.12) },
        { id: 202, alimento: carbAlmuerzo, porcion: '150g cocido', cal: 170, prot: 4, carb: Math.round(carbTotal * 0.2), grasa: 1 },
        { id: 203, alimento: 'Ensalada mixta + aceite oliva', porcion: '200g + 10ml', cal: 130, prot: 3, carb: 8, grasa: 10 },
        { id: 204, alimento: 'Fruta de estaci\u00f3n', porcion: '1 unidad', cal: 60, prot: 1, carb: 14, grasa: 0 },
      ]
    },
    ...(!esDescanso ? [{
      id: 3, nombre: esCardio ? 'Snack Pre-Cardio' : 'Merienda Pre-Entreno', hora: '16:00', items: preEntreno
    }] : [{
      id: 3, nombre: 'Merienda', hora: '16:00', items: [
        { id: 301, alimento: tieneLactosa ? 'Yogur de coco' : 'Yogur griego', porcion: '200g', cal: 130, prot: tieneLactosa ? 2 : 20, carb: tieneLactosa ? 12 : 6, grasa: tieneLactosa ? 6 : 3 },
        { id: 302, alimento: 'Frutas secas mix', porcion: '20g', cal: 110, prot: 3, carb: 5, grasa: 9 },
      ]
    }]),
    {
      id: 4, nombre: 'Cena', hora: '20:30', items: [
        { id: 401, alimento: protCena, porcion: `${Math.round(protPorComida * 4.5)}g`, cal: Math.round(protPorComida * (objetivo.includes('grasa') ? 4 : 7)), prot: protPorComida, carb: esCardio ? Math.round(carbTotal * 0.15) : 0, grasa: Math.round(protPorComida * 0.3) },
        { id: 402, alimento: carbCena, porcion: '200g', cal: 180, prot: 2, carb: Math.round(carbTotal * 0.18), grasa: 0 },
        { id: 403, alimento: 'Br\u00f3coli al vapor', porcion: '150g', cal: 50, prot: 4, carb: 8, grasa: 0 },
      ]
    },
    {
      id: 5, nombre: 'Colaci\u00f3n Nocturna', hora: '22:00', items: [
        { id: 501, alimento: snackNocturno, porcion: '200g', cal: 130, prot: 20, carb: 6, grasa: 3 },
        { id: 502, alimento: 'Almendras', porcion: '15g', cal: 90, prot: 3, carb: 2, grasa: 8 },
      ]
    },
  ];

  const tipoLabel = tipoEntreno ? ` | **Entreno del d\u00eda:** ${tipoEntreno}` : '';
  const enfLabel = notasExtra.length > 0 ? `\n\n**Adaptaciones:** ${notasExtra.join(' ')}` : '';
  // Determinar tipo energetico segun el ajuste calorico
  const diferencia = calObjetivo - tdee;
  let tipoEnergetico = 'Mantenimiento';
  if (diferencia < -100) tipoEnergetico = `D\u00e9ficit (-${Math.abs(diferencia)} kcal)`;
  else if (diferencia > 100) tipoEnergetico = `Super\u00e1vit (+${diferencia} kcal)`;

  const nota = `**Plan generado por JustFit Coach** para ${peso}kg, ${edad} a\u00f1os.\n\n**Objetivo:** ${objetivo} (${tipoEnergetico}) | **Nivel:** ${nivel}${tipoLabel}\n**TMB:** ${tmb} kcal | **TDEE:** ${tdee} kcal | **Objetivo cal\u00f3rico:** ${calObjetivo} kcal\n**Macros:** ${protTotal}g P / ${carbTotal}g C / ${grasaTotal}g G\n\n${notaObj}${enfLabel}`;

  return { comidas, nota };
}

export default function Nutricion() {
  const { user } = useAuth();
  const perfil = user?.perfil;

  const DIAS = ['Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b', 'Dom'];
  const [diaActivo, setDiaActivo] = useState(() => {
    // 0=Lun, 1=Mar, ..., 6=Dom. JS: 0=Dom, 1=Lun, ..., 6=Sab
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  });
  const [planSemanal, setPlanSemanal] = useState<Record<number, Comida[]>>(() => {
    const saved = getUserItem(PLAN_KEY + '_semanal');
    if (saved) return JSON.parse(saved);
    // Migrar plan viejo si existe
    const old = getUserItem(PLAN_KEY);
    if (old) {
      const initial: Record<number, Comida[]> = {};
      for (let i = 0; i < 7; i++) initial[i] = JSON.parse(old);
      return initial;
    }
    return {};
  });
  const comidas = planSemanal[diaActivo] || [];
  const [notaIA, setNotaIA] = useState(() => getUserItem(PLAN_KEY + '_nota') || '');
  const [editandoComida, setEditandoComida] = useState<number | null>(null);
  const [editandoItem, setEditandoItem] = useState<number | null>(null);
  const [generando, setGenerando] = useState(false);
  const [showAddComida, setShowAddComida] = useState(false);
  const [showAddItem, setShowAddItem] = useState<number | null>(null);
  const [showAlternatives, setShowAlternatives] = useState<{ comidaId: number; itemId: number; nombre: string } | null>(null);
  const [showMacros, setShowMacros] = useState(true);
  const [canasta, setCanasta] = useState<Set<string>>(new Set());
  const [showCanasta, setShowCanasta] = useState(false);

  const toggleCanasta = (alimento: string) => {
    setCanasta(prev => {
      const next = new Set(prev);
      if (next.has(alimento)) next.delete(alimento); else next.add(alimento);
      return next;
    });
  };

  const generarListaCompras = (): string[] => {
    // Unificar todos los alimentos de toda la semana
    const items: Record<string, string> = {};
    for (let d = 0; d < 7; d++) {
      const comidasDia = planSemanal[d] || [];
      comidasDia.forEach(c => {
        c.items.forEach(it => {
          const key = it.alimento.toLowerCase();
          if (!items[key]) items[key] = `${it.alimento} (${it.porcion})`;
        });
      });
    }
    return Object.values(items).sort();
  };

  const enviarCanastaWhatsApp = () => {
    const items = Array.from(canasta);
    if (items.length === 0) return;
    let text = '*JUSTFIT365 - Lista de Compras*\n\n';
    items.forEach((item, i) => { text += `${i + 1}. ${item}\n`; });
    text += `\nTotal: ${items.length} productos`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const [nuevaComida, setNuevaComida] = useState({ nombre: '', hora: '12:00' });
  const [nuevoItem, setNuevoItem] = useState<Alimento>({ id: 0, alimento: '', porcion: '', cal: 0, prot: 0, carb: 0, grasa: 0 });
  const [cantidadItem, setCantidadItem] = useState(1);
  const [alimentoBase, setAlimentoBase] = useState<AlimentoBase | null>(null);

  const guardar = (c: Comida[]) => {
    const updated = { ...planSemanal, [diaActivo]: c };
    setPlanSemanal(updated);
    setUserItem(PLAN_KEY + '_semanal', JSON.stringify(updated));
  };

  const guardarNota = (n: string) => {
    setNotaIA(n);
    setUserItem(PLAN_KEY + '_nota', n);
  };

  // Leer rutina semanal y enfermedades para coordinar plan nutricional
  const rutinaSemanal: { tipo: string }[] = (() => {
    try {
      const saved = getUserItem('bc_rutina_semana');
      return saved ? JSON.parse(saved) : [
        { tipo: 'Push' }, { tipo: 'Pull' }, { tipo: 'Descanso' }, { tipo: 'Piernas' },
        { tipo: 'Upper' }, { tipo: 'Lower' }, { tipo: 'Descanso' }
      ];
    } catch { return [{ tipo: 'Push' }, { tipo: 'Pull' }, { tipo: 'Descanso' }, { tipo: 'Piernas' }, { tipo: 'Upper' }, { tipo: 'Lower' }, { tipo: 'Descanso' }]; }
  })();
  const enfermedadesUsuario: string[] = (() => {
    try { return JSON.parse(getUserItem('jf365_enfermedades') || '[]'); } catch { return []; }
  })();

  const generarPlan = (todaLaSemana = false) => {
    if (!perfil) return;
    setGenerando(true);
    setTimeout(() => {
      const tipoHoy = rutinaSemanal[diaActivo]?.tipo || 'Push';
      const { comidas: plan, nota } = generarPlanIA(perfil.peso, perfil.altura, perfil.edad, perfil.objetivo, perfil.nivelActividad, tipoHoy, enfermedadesUsuario);
      if (todaLaSemana) {
        const semanal: Record<number, Comida[]> = {};
        let notaFinal = '';
        for (let i = 0; i < 7; i++) {
          const tipoDia = rutinaSemanal[i]?.tipo || 'Descanso';
          const { comidas: planDia, nota: notaDia } = generarPlanIA(perfil.peso, perfil.altura, perfil.edad, perfil.objetivo, perfil.nivelActividad, tipoDia, enfermedadesUsuario);
          semanal[i] = planDia;
          if (i === diaActivo) notaFinal = notaDia;
        }
        setPlanSemanal(semanal);
        localStorage.setItem(PLAN_KEY + '_semanal', JSON.stringify(semanal));
        guardarNota(notaFinal);
      } else {
        guardar(plan);
        guardarNota(nota);
      }
      setGenerando(false);
    }, 2000);
  };

  const borrarDia = () => {
    guardar([]);
  };

  const _copiarDia = (desde: number) => {
    const comidasOrigen = planSemanal[desde];
    if (comidasOrigen) {
      const copia = comidasOrigen.map(c => ({ ...c, id: Date.now() + Math.random(), items: c.items.map(it => ({ ...it, id: Date.now() + Math.random() })) }));
      guardar(copia);
    }
  };
  void _copiarDia;

  const updateItem = (comidaId: number, itemId: number, field: keyof Alimento, value: string | number) => {
    const current = planSemanal[diaActivo] || [];
    const updated = current.map(c => c.id === comidaId ? { ...c, items: c.items.map(it => it.id === itemId ? { ...it, [field]: value } : it) } : c);
    guardar(updated);
  };

  const replaceItem = (comidaId: number, itemId: number, newData: { alimento: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }) => {
    const current = planSemanal[diaActivo] || [];
    const updated = current.map(c => c.id === comidaId ? { ...c, items: c.items.map(it => it.id === itemId ? { ...it, ...newData } : it) } : c);
    guardar(updated);
  };

  const deleteItem = (comidaId: number, itemId: number) => {
    const updated = comidas.map(c => c.id === comidaId ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c);
    guardar(updated);
  };

  const deleteComida = (comidaId: number) => {
    guardar(comidas.filter(c => c.id !== comidaId));
  };

  // Ordenar comidas por horario (las sin hora van al final)
  const ordenarPorHora = (lista: Comida[]): Comida[] => {
    return [...lista].sort((a, b) => {
      if (!a.hora) return 1;
      if (!b.hora) return -1;
      return a.hora.localeCompare(b.hora);
    });
  };

  const updateComida = (comidaId: number, field: 'nombre' | 'hora', value: string) => {
    const actualizado = comidas.map(c => c.id === comidaId ? { ...c, [field]: value } : c);
    // Si cambio la hora, reordenar
    guardar(field === 'hora' ? ordenarPorHora(actualizado) : actualizado);
  };

  const addComida = () => {
    if (!nuevaComida.nombre.trim()) return;
    const nueva = { id: Date.now(), nombre: nuevaComida.nombre, hora: nuevaComida.hora, items: [] };
    // Insertar y ordenar automaticamente por hora
    guardar(ordenarPorHora([...comidas, nueva]));
    setNuevaComida({ nombre: '', hora: '12:00' });
    setShowAddComida(false);
  };

  const addItem = (comidaId: number) => {
    if (!nuevoItem.alimento.trim()) return;
    const updated = comidas.map(c => c.id === comidaId ? { ...c, items: [...c.items, { ...nuevoItem, id: Date.now() }] } : c);
    guardar(updated);
    setNuevoItem({ id: 0, alimento: '', porcion: '', cal: 0, prot: 0, carb: 0, grasa: 0 });
    setShowAddItem(null);
  };

  // Calcular macros totales
  const totalCal = comidas.reduce((a, c) => a + c.items.reduce((b, it) => b + (Number(it.cal) || 0), 0), 0);
  const totalProt = comidas.reduce((a, c) => a + c.items.reduce((b, it) => b + (Number(it.prot) || 0), 0), 0);
  const totalCarb = comidas.reduce((a, c) => a + c.items.reduce((b, it) => b + (Number(it.carb) || 0), 0), 0);
  const totalGrasa = comidas.reduce((a, c) => a + c.items.reduce((b, it) => b + (Number(it.grasa) || 0), 0), 0);

  const tmb = perfil ? Math.round(10 * perfil.peso + 6.25 * perfil.altura - 5 * perfil.edad + 5) : 0;
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = tmb ? Math.round(tmb * (factores[perfil?.nivelActividad || 'Intermedio'] || 1.55)) : 2500;

  // Detectar tipo de objetivo segun perfil
  const objetivosUsuario = (perfil?.objetivo || '').toLowerCase();
  const esDeficit = objetivosUsuario.includes('perdida') || objetivosUsuario.includes('grasa');
  const esSuperavit = objetivosUsuario.includes('hipertrofia') || objetivosUsuario.includes('fuerza');
  const tipoEnergetico = esDeficit ? 'D\u00e9ficit' : esSuperavit ? 'Super\u00e1vit' : 'Mantenimiento';
  const ajusteCal = esDeficit ? -400 : esSuperavit ? 300 : 0;
  const calSugerido = tdee + ajusteCal;

  const [calObjetivo, setCalObjetivo] = useState(() => {
    const saved = getUserItem(PLAN_KEY + '_cal_objetivo');
    return saved ? parseInt(saved) : calSugerido;
  });
  const [editandoCal, setEditandoCal] = useState(false);

  // Sincronizar con cambios del perfil del usuario
  useEffect(() => {
    const saved = getUserItem(PLAN_KEY + '_cal_objetivo');
    // Si nunca lo edito manualmente, usar el sugerido segun perfil actual
    if (!saved) setCalObjetivo(calSugerido);
  }, [calSugerido]);

  const guardarCalObjetivo = (val: number) => {
    setCalObjetivo(val);
    setUserItem(PLAN_KEY + '_cal_objetivo', val.toString());
  };


  // Sin plan generado
  if (comidas.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Apple className="w-7 h-7 text-emerald-400" /> Mi Plan Nutricional
          </h1>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <Zap className="w-16 h-16 text-electric/20 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Sin plan nutricional</h3>
          <p className="text-white/40 text-sm mb-2 max-w-md mx-auto">
            La IA va a generar un plan personalizado basado en tu perfil metab&oacute;lico
            {perfil ? ` (${perfil.peso}kg, ${perfil.altura}cm, ${perfil.edad} a\u00f1os, objetivo: ${perfil.objetivo}).` : '. Configur\u00e1 tu perfil primero.'}
          </p>
          {perfil && (
            <div className="bg-black/40 border border-dark-border rounded-xl p-3 max-w-sm mx-auto mb-6 text-xs text-white/40 space-y-1">
              <p>TMB: {tmb} kcal | TDEE: {tdee} kcal</p>
              <p>Objetivo cal&oacute;rico: <strong className="text-white">{calObjetivo} kcal</strong></p>
            </div>
          )}
          <button onClick={() => { generarPlan(true); }} disabled={!perfil || generando}
            className="px-8 py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 mx-auto">
            {generando ? <><Sparkles className="w-5 h-5 animate-spin" /> Generando plan...</> : <><Zap className="w-5 h-5" /> Generar Plan Semanal con 365</>}
          </button>
          {!perfil && <p className="text-warning text-xs mt-4">And&aacute; a "Mi Perfil" y complet&aacute; tus datos f&iacute;sicos primero.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Apple className="w-7 h-7 text-emerald-400" /> Mi Plan Nutricional
        </h1>
        <p className="text-white/40 text-sm mt-1">{perfil?.objetivo || '-'} &mdash; <span className={esDeficit ? 'text-red-400' : esSuperavit ? 'text-emerald-400' : 'text-electric'}>{tipoEnergetico} ({calObjetivo} kcal)</span></p>
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <ShareButtons
            onPrint={() => {
              let html = `<p class="subtitle">Plan nutricional personalizado &mdash; Objetivo: ${calObjetivo} kcal</p>`;
              comidas.forEach(c => {
                const cc = c.items.reduce((a, it) => a + (Number(it.cal) || 0), 0);
                html += `<h2>${c.nombre} (${c.hora} hs) &mdash; ${cc} kcal</h2><table><tr><th>Alimento</th><th>Porcion</th><th>Cal</th><th>Prot</th><th>Carb</th><th>Grasa</th></tr>`;
                c.items.forEach(it => { html += `<tr><td>${it.alimento}</td><td>${it.porcion}</td><td>${it.cal}</td><td>${it.prot}g</td><td>${it.carb}g</td><td>${it.grasa}g</td></tr>`; });
                html += `</table>`;
              });
              html += `<div class="note"><strong>Totales:</strong> ${totalCal} kcal | ${totalProt}g P | ${totalCarb}g C | ${totalGrasa}g G</div>`;
              printContent('Mi Plan Nutricional - JustFit365', html);
            }}
            onWhatsApp={() => shareWhatsApp(generateNutricionText(comidas, calObjetivo))}
          />
          <button onClick={() => setShowAddComida(true)} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition-colors">
            <Plus className="w-3 h-3" /> Comida
          </button>
          <button onClick={() => { generarPlan(false); }} disabled={!perfil || generando}
            className="flex items-center gap-2 px-3 py-2 bg-electric/15 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/25 transition-colors disabled:opacity-30">
            {generando ? <Sparkles className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Regenerar este plan
          </button>
          <button onClick={() => { generarPlan(true); }} disabled={!perfil || generando}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500/15 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-colors disabled:opacity-30">
            Generar semana
          </button>
          <button onClick={borrarDia}
            className="flex items-center gap-2 px-3 py-2 bg-danger/10 border border-danger/20 text-danger/60 rounded-xl text-xs font-bold hover:bg-danger/20 transition-colors">
            Borrar este plan
          </button>
          <button onClick={() => setShowCanasta(true)}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs font-bold hover:bg-cyan-500/25 transition-colors relative">
            <ShoppingCart className="w-3 h-3" /> Canasta
            {canasta.size > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyan-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">{canasta.size}</span>}
          </button>
          <button onClick={() => setShowMacros(!showMacros)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${showMacros ? 'bg-amber-500/15 border border-amber-500/20 text-amber-400' : 'bg-white/5 border border-dark-border text-white/40'}`}>
            {showMacros ? 'Ocultar macros' : 'Mostrar macros'}
          </button>
        </div>
      </div>

      {/* Tabs de dias */}
      <div className="flex gap-1.5">
        {DIAS.map((dia, i) => {
          const tieneComidas = (planSemanal[i] || []).length > 0;
          return (
            <button key={dia} onClick={() => { setDiaActivo(i); setEditandoComida(null); setEditandoItem(null); }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                i === diaActivo ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' :
                tieneComidas ? 'bg-dark-800 border border-dark-border text-white/50 hover:border-white/10' :
                'bg-dark-800 border border-dark-border text-white/20 hover:border-white/10'
              }`}>
              <p>{dia}</p>
              {tieneComidas && <span className="block w-1.5 h-1.5 bg-emerald-400/50 rounded-full mx-auto mt-0.5" />}
            </button>
          );
        })}
      </div>


      {/* Objetivo calorico editable */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">M&aacute;ximo de calor&iacute;as para mantenimiento</p>
            {editandoCal ? (
              <div className="flex items-center gap-2 mt-1">
                <input type="number" min="800" max="8000" step="50" value={calObjetivo}
                  onChange={e => guardarCalObjetivo(parseInt(e.target.value) || calSugerido)}
                  className="w-28 px-3 py-1.5 bg-black/60 border border-electric/30 rounded-lg text-white text-lg font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
                <span className="text-white/30 text-sm">kcal</span>
                <button onClick={() => setEditandoCal(false)} className="p-1 text-emerald-400 hover:text-emerald-300"><Save className="w-4 h-4" /></button>
              </div>
            ) : (
              <p className="text-white font-black text-xl">{calObjetivo} <span className="text-white/30 text-sm font-normal">kcal</span></p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-white/30 hidden sm:block">
            <p>TMB: {tmb} kcal</p>
            <p>TDEE: {tdee} kcal</p>
            <p>Sugerido IA: {calSugerido} kcal</p>
          </div>
          {!editandoCal && (
            <button onClick={() => setEditandoCal(true)} className="p-2 text-white/20 hover:text-electric transition-colors rounded-xl hover:bg-white/5">
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          {editandoCal && calObjetivo !== calSugerido && (
            <button onClick={() => { guardarCalObjetivo(calSugerido); setEditandoCal(false); }}
              className="px-3 py-1.5 bg-electric/10 border border-electric/20 text-electric text-xs rounded-lg hover:bg-electric/20 transition-colors">
              Usar sugerido
            </button>
          )}
        </div>
      </div>

      {/* Macros calculados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Calor\u00edas', value: totalCal, min: Math.round(calObjetivo * 0.9), max: calObjetivo, color: 'text-orange-400', gradient: 'from-orange-500 to-red-500', icon: Flame, unit: 'kcal' },
          { label: 'Prote\u00edna', value: totalProt, min: Math.round((perfil?.peso || 75) * 1.6), max: Math.round((perfil?.peso || 75) * 2.2), color: 'text-electric', gradient: 'from-electric to-neon', icon: Droplets, unit: 'g' },
          { label: 'Carbohidratos', value: totalCarb, min: Math.round((calObjetivo * 0.35) / 4), max: Math.round((calObjetivo * 0.55) / 4), color: 'text-amber-400', gradient: 'from-amber-400 to-yellow-400', icon: Wheat, unit: 'g' },
          { label: 'Grasas', value: totalGrasa, min: Math.round((calObjetivo * 0.20) / 9), max: Math.round((calObjetivo * 0.30) / 9), color: 'text-pink-400', gradient: 'from-pink-500 to-rose-500', icon: Droplet, unit: 'g' },
        ].map(m => (
          <div key={m.label} className="bg-dark-800 border border-dark-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-white/50 text-xs uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider leading-none mb-0.5">Min / Max</div>
                <div className="text-white font-bold text-base leading-none">
                  <span className="text-white/40">{m.min}</span>
                  <span className="text-white/20 mx-1">/</span>
                  <span>{m.max}</span>
                  <span className="text-white/30 text-[10px] font-normal ml-1">{m.unit}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-white/30 uppercase tracking-wider leading-none mb-0.5">Actual</div>
                <div className={`font-black text-base leading-none ${m.value >= m.min && m.value <= m.max ? 'text-emerald-400' : m.value > m.max ? 'text-red-400' : m.color}`}>{m.value}</div>
              </div>
            </div>
            <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${m.gradient}`} style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Comidas */}
      <div className="space-y-4">
        {comidas.map(c => {
          const comidaCal = c.items.reduce((a, it) => a + (Number(it.cal) || 0), 0);
          const isEditingComida = editandoComida === c.id;

          return (
            <div key={c.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              {/* Header comida */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  {isEditingComida ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={c.nombre} onChange={e => updateComida(c.id, 'nombre', e.target.value)}
                        className="px-2 py-1 bg-black/60 border border-dark-border rounded-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-electric/30 w-40" />
                      <input type="time" value={c.hora} onChange={e => updateComida(c.id, 'hora', e.target.value)}
                        className="px-2 py-1 bg-black/60 border border-dark-border rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-electric/30 w-24" />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-white font-bold text-sm">{c.nombre}</h3>
                      <p className="text-white/30 text-xs">{c.hora} hs</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-bold text-sm">{comidaCal} kcal</span>
                  <button onClick={() => setEditandoComida(isEditingComida ? null : c.id)} className="p-1.5 text-white/20 hover:text-electric transition-colors rounded-lg hover:bg-white/5">
                    {isEditingComida ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setShowAddItem(c.id)} className="p-1.5 text-white/20 hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/5">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteComida(c.id)} className="p-1.5 text-white/20 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-dark-border/50">
                {c.items.map(item => {
                  const isEditing = editandoItem === item.id;
                  return (
                    <div key={item.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={item.alimento} onChange={e => updateItem(c.id, item.id, 'alimento', e.target.value)} placeholder="Alimento"
                              className="px-2 py-1.5 bg-black/60 border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                            <input type="text" value={item.porcion} onChange={e => updateItem(c.id, item.id, 'porcion', e.target.value)} placeholder="Porcion"
                              className="px-2 py-1.5 bg-black/60 border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                          </div>
                          {/* Ajuste rapido por gramos */}
                          {(() => {
                            const base = buscarAlimentoExacto(item.alimento);
                            if (!base) return null;
                            // Detectar gramos actuales de la porcion
                            const gramosMatch = item.porcion.match(/(\d+)\s*g/);
                            const gramosActuales = gramosMatch ? parseInt(gramosMatch[1]) : 100;
                            const porcionMatch = base.porcionDefault.match(/(\d+)\s*g/);
                            const gramosBase = porcionMatch ? parseInt(porcionMatch[1]) : 100;
                            return (
                              <div className="bg-electric/5 border border-electric/10 rounded-lg p-2">
                                <label className="block text-[9px] text-electric uppercase tracking-wider mb-1">Ajustar gramos (recalcula autom&aacute;tico)</label>
                                <div className="flex items-center gap-2">
                                  {[50, 100, 150, 200, 250, 300].map(g => (
                                    <button key={g} type="button" onClick={() => {
                                      const factor = g / gramosBase;
                                      const updated = comidas.map(cm => cm.id === c.id ? { ...cm, items: cm.items.map(it => it.id === item.id ? {
                                        ...it,
                                        porcion: `${g}g`,
                                        cal: Math.round(base.cal * factor),
                                        prot: Math.round(base.prot * factor * 10) / 10,
                                        carb: Math.round(base.carb * factor * 10) / 10,
                                        grasa: Math.round(base.grasa * factor * 10) / 10,
                                      } : it) } : cm);
                                      guardar(updated);
                                    }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${gramosActuales === g ? 'bg-electric/20 text-electric border border-electric/30' : 'bg-black/40 text-white/40 border border-dark-border hover:text-white/60'}`}>
                                      {g}g
                                    </button>
                                  ))}
                                  <input type="number" min="10" max="1000" step="10" defaultValue={gramosActuales}
                                    onBlur={e => {
                                      const g = parseInt(e.target.value) || gramosActuales;
                                      const factor = g / gramosBase;
                                      const updated = comidas.map(cm => cm.id === c.id ? { ...cm, items: cm.items.map(it => it.id === item.id ? {
                                        ...it,
                                        porcion: `${g}g`,
                                        cal: Math.round(base.cal * factor),
                                        prot: Math.round(base.prot * factor * 10) / 10,
                                        carb: Math.round(base.carb * factor * 10) / 10,
                                        grasa: Math.round(base.grasa * factor * 10) / 10,
                                      } : it) } : cm);
                                      guardar(updated);
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                    className="w-16 px-2 py-1 bg-black/60 border border-dark-border rounded-lg text-white text-[11px] text-center focus:outline-none focus:ring-2 focus:ring-electric/30" />
                                  <span className="text-white/30 text-[10px]">g</span>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { field: 'cal' as const, label: 'Cal', color: 'text-orange-400' },
                              { field: 'prot' as const, label: 'Prot (g)', color: 'text-electric' },
                              { field: 'carb' as const, label: 'Carb (g)', color: 'text-amber-400' },
                              { field: 'grasa' as const, label: 'Grasa (g)', color: 'text-pink-400' },
                            ].map(f => (
                              <div key={f.field}>
                                <label className={`block text-[9px] ${f.color} uppercase tracking-wider mb-0.5`}>{f.label}</label>
                                <input type="number" min="0" value={item[f.field]} onChange={e => updateItem(c.id, item.id, f.field, parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 bg-black/60 border border-dark-border rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" />
                              </div>
                            ))}
                          </div>
                          <button onClick={() => setEditandoItem(null)} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Save className="w-3 h-3" /> Listo</button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between">
                            <button onClick={() => toggleCanasta(`${item.alimento} (${item.porcion})`)}
                              className="p-0.5 shrink-0 text-white/15 hover:text-cyan-400 transition-colors" title="Agregar a canasta">
                              {canasta.has(`${item.alimento} (${item.porcion})`) ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> : <Square className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => {
                              if (findAlternatives(item.alimento)) {
                                setShowAlternatives({ comidaId: c.id, itemId: item.id, nombre: item.alimento });
                              } else {
                                setEditandoItem(item.id);
                              }
                            }} className="text-white/80 text-sm truncate flex-1 mr-2 text-left hover:text-emerald-400 transition-colors cursor-pointer">
                              {item.alimento} {findAlternatives(item.alimento) && <ArrowLeftRight className="w-3 h-3 inline ml-1 text-emerald-400/40" />}
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => setShowAlternatives({ comidaId: c.id, itemId: item.id, nombre: item.alimento })} className="p-1 text-white/15 hover:text-emerald-400 transition-colors" title="Ver alternativas"><ArrowLeftRight className="w-3 h-3" /></button>
                              <button onClick={() => setEditandoItem(item.id)} className="p-1 text-white/15 hover:text-electric transition-colors"><Edit3 className="w-3 h-3" /></button>
                              <button onClick={() => deleteItem(c.id, item.id)} className="p-1 text-white/15 hover:text-danger transition-colors"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] mt-0.5">
                            <span className="text-white/25">{item.porcion}</span>
                            {showMacros && <>
                              <span className="text-white/10">|</span>
                              <span className="text-orange-400/70">{item.cal}cal</span>
                              <span className="text-electric/70">{item.prot}gP</span>
                              <span className="text-amber-400/70">{item.carb}gC</span>
                              <span className="text-pink-400/70">{item.grasa}gG</span>
                            </>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota IA */}
      {notaIA && (
        <div className="bg-electric/5 border border-electric/20 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-electric shrink-0 mt-0.5" />
          <div className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
            {notaIA.split(/(\*\*.*?\*\*)/).map((part, i) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
                : <span key={i}>{part}</span>
            )}
          </div>
        </div>
      )}

      {/* Modal agregar comida */}
      {showAddComida && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddComida(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Nueva Comida</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Nombre</label>
                <input type="text" value={nuevaComida.nombre} onChange={e => setNuevaComida(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Snack Post-Entreno"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Hora</label>
                <input type="time" value={nuevaComida.hora} onChange={e => setNuevaComida(p => ({ ...p, hora: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddComida(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={addComida} disabled={!nuevaComida.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar alimento */}
      {showAddItem !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => { setShowAddItem(null); setAlimentoBase(null); setCantidadItem(1); }}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Agregar Alimento</h2>
            <div className="space-y-3">
              {/* Buscar */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Buscar alimento</label>
                <div className="relative">
                  <input type="text" value={nuevoItem.alimento}
                    onChange={e => { setNuevoItem(p => ({ ...p, alimento: e.target.value })); setAlimentoBase(null); setCantidadItem(1); }}
                    placeholder="Ej: Pollo, Bife, Huevo, Avena..."
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  {nuevoItem.alimento.length >= 2 && !alimentoBase && buscarAlimentos(nuevoItem.alimento).length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-border rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                      {buscarAlimentos(nuevoItem.alimento, 12).map((a, i) => (
                        <button key={i} type="button"
                          onClick={() => {
                            setAlimentoBase(a);
                            const porcionMatch = a.porcionDefault.match(/(\d+)\s*g/);
                            const gramosBase = porcionMatch ? parseInt(porcionMatch[1]) : 0;
                            if (a.unidad) {
                              setCantidadItem(1);
                              setNuevoItem({ id: 0, alimento: a.nombre, porcion: `1 ${a.unidad}`, cal: a.cal, prot: a.prot, carb: a.carb, grasa: a.grasa });
                            } else {
                              setCantidadItem(gramosBase || 100);
                              setNuevoItem({ id: 0, alimento: a.nombre, porcion: a.porcionDefault, cal: a.cal, prot: a.prot, carb: a.carb, grasa: a.grasa });
                            }
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-500/10 transition-colors border-b border-dark-border/30 last:border-0">
                          <p className="text-white text-sm">{a.nombre}</p>
                          <p className="text-white/40 text-[10px]">{a.porcionDefault} &middot; {a.cal} cal &middot; {a.prot}g P</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cantidad por unidad (huevo, banana, etc) */}
              {alimentoBase && alimentoBase.unidad && (
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Cantidad ({alimentoBase.unidad}{cantidadItem > 1 ? 's' : ''})</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => {
                      const n = Math.max(1, cantidadItem - 1);
                      setCantidadItem(n);
                      setNuevoItem(p => ({ ...p, porcion: `${n} ${alimentoBase.unidad}${n > 1 ? 's' : ''}`, cal: Math.round(alimentoBase.cal * n), prot: Math.round(alimentoBase.prot * n * 10) / 10, carb: Math.round(alimentoBase.carb * n * 10) / 10, grasa: Math.round(alimentoBase.grasa * n * 10) / 10 }));
                    }} className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center text-xl font-bold border border-dark-border">-</button>
                    <input type="number" min="1" max="20" value={cantidadItem}
                      onChange={e => {
                        const n = Math.max(1, parseInt(e.target.value) || 1);
                        setCantidadItem(n);
                        setNuevoItem(p => ({ ...p, porcion: `${n} ${alimentoBase.unidad}${n > 1 ? 's' : ''}`, cal: Math.round(alimentoBase.cal * n), prot: Math.round(alimentoBase.prot * n * 10) / 10, carb: Math.round(alimentoBase.carb * n * 10) / 10, grasa: Math.round(alimentoBase.grasa * n * 10) / 10 }));
                      }}
                      className="w-20 px-3 py-2.5 bg-black/60 border border-electric/30 rounded-xl text-white text-lg text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
                    <button type="button" onClick={() => {
                      const n = Math.min(20, cantidadItem + 1);
                      setCantidadItem(n);
                      setNuevoItem(p => ({ ...p, porcion: `${n} ${alimentoBase.unidad}${n > 1 ? 's' : ''}`, cal: Math.round(alimentoBase.cal * n), prot: Math.round(alimentoBase.prot * n * 10) / 10, carb: Math.round(alimentoBase.carb * n * 10) / 10, grasa: Math.round(alimentoBase.grasa * n * 10) / 10 }));
                    }} className="w-10 h-10 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-bold border border-emerald-500/20">+</button>
                    <span className="text-white/30 text-xs">{alimentoBase.unidad}{cantidadItem > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {/* Gramos para alimentos por peso (carne, arroz, etc) */}
              {alimentoBase && !alimentoBase.unidad && (() => {
                const porcionMatch = alimentoBase.porcionDefault.match(/(\d+)\s*g/);
                const gramosBase = porcionMatch ? parseInt(porcionMatch[1]) : 100;
                const recalc = (g: number) => {
                  const factor = g / gramosBase;
                  setCantidadItem(g);
                  setNuevoItem(p => ({ ...p, porcion: `${g}g`, cal: Math.round(alimentoBase.cal * factor), prot: Math.round(alimentoBase.prot * factor * 10) / 10, carb: Math.round(alimentoBase.carb * factor * 10) / 10, grasa: Math.round(alimentoBase.grasa * factor * 10) / 10 }));
                };
                return (
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Gramos (valores se recalculan)</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[50, 100, 150, 200, 250, 300, 400, 500].map(g => (
                        <button key={g} type="button" onClick={() => recalc(g)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${cantidadItem === g ? 'bg-electric/20 text-electric border border-electric/30' : 'bg-black/40 text-white/40 border border-dark-border hover:text-white/60'}`}>
                          {g}g
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min="10" max="2000" step="10" value={cantidadItem}
                        onChange={e => recalc(parseInt(e.target.value) || gramosBase)}
                        className="w-24 px-3 py-2.5 bg-black/60 border border-electric/30 rounded-xl text-white text-base text-center font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
                      <span className="text-white/40 text-sm">gramos</span>
                      <span className="text-white/20 text-xs ml-auto">(base: {alimentoBase.porcionDefault})</span>
                    </div>
                  </div>
                );
              })()}

              {/* Porcion manual si no hay alimentoBase */}
              {!alimentoBase && (
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Porci&oacute;n</label>
                  <input type="text" value={nuevoItem.porcion} onChange={e => setNuevoItem(p => ({ ...p, porcion: e.target.value }))} placeholder="Ej: 200g, 2 unidades"
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
              )}

              {/* Valores nutricionales */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { field: 'cal' as const, label: 'Cal', color: 'text-orange-400' },
                  { field: 'prot' as const, label: 'g P', color: 'text-electric' },
                  { field: 'carb' as const, label: 'g C', color: 'text-amber-400' },
                  { field: 'grasa' as const, label: 'g G', color: 'text-pink-400' },
                ].map(f => (
                  <div key={f.field}>
                    <label className={`block text-[10px] ${f.color} uppercase tracking-wider mb-1`}>{f.label}</label>
                    <input type="number" min="0" value={nuevoItem[f.field] || ''} onChange={e => setNuevoItem(p => ({ ...p, [f.field]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-2 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  </div>
                ))}
              </div>
              {alimentoBase && (
                <p className="text-emerald-400/60 text-[10px] text-center">
                  {alimentoBase.nombre} &middot; {nuevoItem.porcion} = {nuevoItem.cal} cal, {nuevoItem.prot}g P, {nuevoItem.carb}g C, {nuevoItem.grasa}g G
                </p>
              )}
              {!alimentoBase && <p className="text-white/30 text-[10px] text-center">Los valores se completan al elegir un alimento. Pod&eacute;s ajustarlos manualmente.</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAddItem(null); setAlimentoBase(null); setCantidadItem(1); }} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={() => { addItem(showAddItem); setAlimentoBase(null); setCantidadItem(1); }} disabled={!nuevoItem.alimento.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal alternativas */}
      {showAlternatives && (
        <FoodAlternatives
          alimento={showAlternatives.nombre}
          onSelect={(alt) => {
            replaceItem(showAlternatives.comidaId, showAlternatives.itemId, {
              alimento: alt.nombre, porcion: alt.porcion,
              cal: alt.cal, prot: alt.prot, carb: alt.carb, grasa: alt.grasa,
            });
          }}
          onClose={() => setShowAlternatives(null)}
        />
      )}

      {/* Modal canasta de compras */}
      {showCanasta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowCanasta(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-cyan-400" /> Canasta de Compras
                </h3>
                <p className="text-white/30 text-xs mt-0.5">{canasta.size} productos seleccionados</p>
              </div>
              <button onClick={() => setShowCanasta(false)} className="p-1.5 text-white/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            {canasta.size === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-2">Canasta vac&iacute;a</p>
                <p className="text-white/20 text-xs">Seleccion&aacute; los productos que necesit&aacute;s comprar haciendo click en el cuadradito al lado de cada alimento.</p>
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto divide-y divide-dark-border/30">
                  {Array.from(canasta).map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-white text-sm">{item}</span>
                      </div>
                      <button onClick={() => toggleCanasta(item)} className="p-1 text-white/15 hover:text-danger transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-dark-border space-y-2">
                  {/* Agregar todos los del dia */}
                  <button onClick={() => {
                    comidas.forEach(c => c.items.forEach(it => {
                      const key = `${it.alimento} (${it.porcion})`;
                      setCanasta(prev => new Set([...prev, key]));
                    }));
                  }} className="w-full py-2.5 bg-white/5 text-white/50 rounded-xl text-xs font-medium border border-dark-border hover:bg-white/10 transition-colors">
                    + Agregar todo el {DIAS[diaActivo]}
                  </button>

                  {/* Agregar toda la semana */}
                  <button onClick={() => {
                    const all = generarListaCompras();
                    setCanasta(new Set(all));
                  }} className="w-full py-2.5 bg-white/5 text-white/50 rounded-xl text-xs font-medium border border-dark-border hover:bg-white/10 transition-colors">
                    + Agregar toda la semana
                  </button>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setCanasta(new Set())}
                      className="flex-1 py-2.5 bg-danger/10 text-danger/60 rounded-xl text-xs font-medium hover:bg-danger/20 transition-colors">
                      Vaciar canasta
                    </button>
                    <button onClick={enviarCanastaWhatsApp}
                      className="flex-1 py-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" /> Enviar por WhatsApp
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
