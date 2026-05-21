// Historial de medidas corporales por fecha. Soporta los parametros mas
// usados por apps tipo MyFitnessPal, FitBit, BodySpace, Cronometer.

export interface MedidaCorporal {
  id: string;
  fecha: string; // ISO YYYY-MM-DD
  // Composicion corporal (tickets de balanza electrónica Tanita/Omron)
  peso?: number;            // kg
  grasaCorporal?: number;   // %
  masaMuscular?: number;    // kg
  masaOsea?: number;        // kg
  agua?: number;            // %
  grasaVisceral?: number;   // escala 1-30
  edadMetabolica?: number;  // años
  tmbBalanza?: number;      // kcal/día (TMB que reporta la balanza)
  // Perimetros (cm)
  cuello?: number;
  hombros?: number;
  pecho?: number;
  bicepsContraido?: number;
  cintura?: number;
  abdomen?: number;
  cadera?: number;
  muslo?: number;
  pantorrilla?: number;
  // Salud
  fcReposo?: number;        // bpm
  presionArterial?: string; // "120/80"
  // Foto del ticket de balanza (base64)
  fotoTicket?: string;
  // Otros
  nota?: string;
  analisisIA?: string;
  guardadoEn: number;
}

export interface ParamConfig {
  key: keyof MedidaCorporal;
  label: string;
  unidad: string;
  grupo: 'composicion' | 'perimetro' | 'salud';
  // direccion de mejora segun objetivo: 'down' = bajar es mejor, 'up' = subir,
  // 'context' = depende, 'neutral' = no juzgar
  mejoraEn?: { cut: 'down' | 'up' | 'neutral'; bulk: 'down' | 'up' | 'neutral' };
  rango?: { min: number; max: number; placeholder: string };
}

export const PARAMS: ParamConfig[] = [
  { key: 'peso', label: 'Peso', unidad: 'kg', grupo: 'composicion', mejoraEn: { cut: 'down', bulk: 'up' }, rango: { min: 30, max: 250, placeholder: '78.5' } },
  { key: 'grasaCorporal', label: 'Grasa corporal', unidad: '%', grupo: 'composicion', mejoraEn: { cut: 'down', bulk: 'down' }, rango: { min: 3, max: 60, placeholder: '18' } },
  { key: 'masaMuscular', label: 'Masa muscular', unidad: 'kg', grupo: 'composicion', mejoraEn: { cut: 'up', bulk: 'up' }, rango: { min: 10, max: 100, placeholder: '32' } },
  { key: 'agua', label: 'Agua corporal', unidad: '%', grupo: 'composicion', mejoraEn: { cut: 'neutral', bulk: 'neutral' }, rango: { min: 30, max: 80, placeholder: '55' } },
  { key: 'grasaVisceral', label: 'Grasa visceral', unidad: '', grupo: 'composicion', mejoraEn: { cut: 'down', bulk: 'down' }, rango: { min: 1, max: 30, placeholder: '8' } },
  { key: 'masaOsea', label: 'Masa ósea', unidad: 'kg', grupo: 'composicion', mejoraEn: { cut: 'neutral', bulk: 'neutral' }, rango: { min: 1, max: 8, placeholder: '3.2' } },
  { key: 'edadMetabolica', label: 'Edad metabólica', unidad: 'años', grupo: 'composicion', mejoraEn: { cut: 'down', bulk: 'down' }, rango: { min: 10, max: 99, placeholder: '28' } },
  { key: 'tmbBalanza', label: 'TMB (balanza)', unidad: 'kcal', grupo: 'composicion', mejoraEn: { cut: 'neutral', bulk: 'up' }, rango: { min: 800, max: 3500, placeholder: '1850' } },
  { key: 'cuello', label: 'Cuello', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'neutral', bulk: 'up' }, rango: { min: 25, max: 60, placeholder: '38' } },
  { key: 'hombros', label: 'Hombros', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'up', bulk: 'up' }, rango: { min: 80, max: 160, placeholder: '115' } },
  { key: 'pecho', label: 'Pecho', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'up', bulk: 'up' }, rango: { min: 70, max: 150, placeholder: '100' } },
  { key: 'bicepsContraido', label: 'Bíceps (contraído)', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'up', bulk: 'up' }, rango: { min: 20, max: 60, placeholder: '36' } },
  { key: 'cintura', label: 'Cintura', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'down', bulk: 'neutral' }, rango: { min: 50, max: 150, placeholder: '82' } },
  { key: 'abdomen', label: 'Abdomen', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'down', bulk: 'neutral' }, rango: { min: 50, max: 160, placeholder: '88' } },
  { key: 'cadera', label: 'Cadera', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'down', bulk: 'neutral' }, rango: { min: 70, max: 160, placeholder: '95' } },
  { key: 'muslo', label: 'Muslo', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'neutral', bulk: 'up' }, rango: { min: 40, max: 90, placeholder: '58' } },
  { key: 'pantorrilla', label: 'Pantorrilla', unidad: 'cm', grupo: 'perimetro', mejoraEn: { cut: 'neutral', bulk: 'up' }, rango: { min: 25, max: 60, placeholder: '38' } },
  { key: 'fcReposo', label: 'FC en reposo', unidad: 'bpm', grupo: 'salud', mejoraEn: { cut: 'down', bulk: 'down' }, rango: { min: 35, max: 120, placeholder: '65' } },
];

export function calcularIMC(peso: number, alturaCm: number): number {
  if (!peso || !alturaCm) return 0;
  const m = alturaCm / 100;
  return Math.round((peso / (m * m)) * 10) / 10;
}

export function categoriaIMC(imc: number): { categoria: string; color: string } {
  if (!imc) return { categoria: '', color: 'text-white/40' };
  if (imc < 18.5) return { categoria: 'Bajo peso', color: 'text-amber-400' };
  if (imc < 25) return { categoria: 'Normal', color: 'text-emerald-400' };
  if (imc < 30) return { categoria: 'Sobrepeso', color: 'text-amber-400' };
  return { categoria: 'Obesidad', color: 'text-red-400' };
}

export function calcularICC(cintura: number, cadera: number): number {
  if (!cintura || !cadera) return 0;
  return Math.round((cintura / cadera) * 100) / 100;
}

export function categoriaICC(icc: number, esHombre: boolean): { categoria: string; color: string } {
  if (!icc) return { categoria: '', color: 'text-white/40' };
  const limiteRiesgo = esHombre ? 0.95 : 0.85;
  const limiteSaludable = esHombre ? 0.90 : 0.80;
  if (icc < limiteSaludable) return { categoria: 'Saludable', color: 'text-emerald-400' };
  if (icc < limiteRiesgo) return { categoria: 'Moderado', color: 'text-amber-400' };
  return { categoria: 'Riesgo cardio-metabólico', color: 'text-red-400' };
}

export function fechaISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function nuevaMedida(parcial: Partial<MedidaCorporal>): MedidaCorporal {
  return {
    id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    fecha: fechaISO(),
    guardadoEn: Date.now(),
    ...parcial,
  };
}

// Genera analisis comparando con la entrada anterior cronologica
export function generarAnalisisMedidas(
  actual: MedidaCorporal,
  anterior: MedidaCorporal | null,
  perfil?: { peso: number; altura: number; objetivo: string; genero?: string },
): string {
  const objetivo = (perfil?.objetivo || '').toLowerCase();
  const esCut = objetivo.includes('grasa');
  const esBulk = objetivo.includes('hipertrofia') || objetivo.includes('fuerza');
  const objLabel = esCut ? 'pérdida de grasa' : esBulk ? 'ganancia muscular' : 'mantenimiento';
  const esHombre = perfil?.genero === 'Hombre';
  const partes: string[] = [];

  partes.push(`**📏 Análisis de medidas corporales del ${actual.fecha}**`);
  partes.push(`Tu objetivo: **${objLabel}**`);

  // Indicadores derivados
  if (actual.peso && perfil?.altura) {
    const imc = calcularIMC(actual.peso, perfil.altura);
    const cat = categoriaIMC(imc);
    partes.push(`\n**IMC: ${imc}** (${cat.categoria})`);
  }
  if (actual.cintura && actual.cadera) {
    const icc = calcularICC(actual.cintura, actual.cadera);
    const cat = categoriaICC(icc, esHombre);
    partes.push(`**ICC: ${icc}** (${cat.categoria})`);
  }

  if (!anterior) {
    partes.push(`\n**Punto de partida**\nEste es tu primer registro de medidas. Lo guardamos como línea base para comparar con futuros registros.`);
    partes.push(`\n**Tips para próximas medidas:**`);
    partes.push(`• Tomátelas siempre a la misma hora del día (ideal: en ayunas, después de orinar)`);
    partes.push(`• Usá la misma cinta métrica y la misma postura`);
    partes.push(`• Cada 2-3 semanas es la frecuencia ideal — no diario`);
    partes.push(`• Combinálas con fotos para una visión completa`);
    return partes.join('\n');
  }

  // Hay anterior: comparar
  const dias = Math.max(1, Math.round((new Date(actual.fecha).getTime() - new Date(anterior.fecha).getTime()) / 86400000));
  partes.push(`\n**Comparación con el ${anterior.fecha}** (hace ${dias} día${dias !== 1 ? 's' : ''})`);

  const cambios: string[] = [];
  let positivos = 0, negativos = 0;

  for (const p of PARAMS) {
    const a = actual[p.key];
    const b = anterior[p.key];
    if (typeof a !== 'number' || typeof b !== 'number') continue;
    const diff = +(a - b).toFixed(1);
    if (Math.abs(diff) < 0.1) continue;
    const sign = diff > 0 ? '+' : '';
    cambios.push(`• **${p.label}**: ${b} → ${a} ${p.unidad} (**${sign}${diff}**)`);

    const dir = esCut ? p.mejoraEn?.cut : esBulk ? p.mejoraEn?.bulk : 'neutral';
    if (dir === 'down') {
      if (diff < 0) positivos++; else negativos++;
    } else if (dir === 'up') {
      if (diff > 0) positivos++; else negativos++;
    }
  }

  if (cambios.length === 0) {
    partes.push('\nNo hay cambios significativos entre los dos registros, o no cargaste los mismos parámetros en ambos.');
  } else {
    partes.push('');
    partes.push(...cambios);
  }

  // Evaluacion general
  if (cambios.length > 0) {
    partes.push(`\n**Evaluación general (${objLabel}):**`);
    if (positivos > negativos && positivos >= 2) {
      partes.push(`✅ **Vas en la dirección correcta.** La mayoría de las medidas acompañan tu objetivo. Mantené el rumbo.`);
    } else if (negativos > positivos && negativos >= 2) {
      if (esCut) {
        partes.push(`⚠️ **Retroceso.** Varias medidas crecieron en lugar de bajar. Revisá adherencia al plan calórico, hidratación y horas de sueño. Si estás reciente del periodo menstrual o comiste sodio/carbos altos los días previos, puede ser temporal — esperá 1 semana y volvé a medir.`);
      } else if (esBulk) {
        partes.push(`⚠️ **Perdiendo masa.** Necesitás superávit calórico real (+200-400 kcal sobre mantenimiento), proteína 1.8-2.2 g/kg y descanso. Revisá si progresaste cargas en el gym.`);
      } else {
        partes.push(`⚠️ Varios parámetros se movieron del rango de mantenimiento.`);
      }
    } else {
      if (dias < 14) {
        partes.push(`📊 **Plazo corto.** Solo ${dias} día${dias !== 1 ? 's' : ''} pasaron. Para evaluar evolución real esperá entre 2-3 semanas entre registros.`);
      } else {
        partes.push(`📊 **Estancamiento.** Las medidas están casi iguales. Si llevás 3+ semanas así, ajustá: en cut restá 100-200 kcal o sumá cardio; en bulk sumá 100-200 kcal o aumentá cargas.`);
      }
    }
  }

  // Cierre
  partes.push(`\n*Tip: tomate las medidas siempre en las mismas condiciones para que la comparación sea precisa.*`);

  return partes.join('\n');
}
