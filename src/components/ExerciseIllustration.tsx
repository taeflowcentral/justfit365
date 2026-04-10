import { useState } from 'react';

// Base URL de la base de datos libre de ejercicios (GitHub - yuhonas/free-exercise-db)
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

interface ExerciseData {
  folder: string;
  instrucciones: string;
  musculos: string[];
}

const exercises: Record<string, ExerciseData> = {
  'Press Banca con Barra': {
    folder: 'Barbell_Bench_Press_-_Medium_Grip',
    musculos: ['Pectoral mayor', 'Deltoides anterior', 'Tr\u00edceps'],
    instrucciones: 'Acostado en banco plano, pies firmes en el suelo. Agarre medio (1.5x ancho de hombros). Bajar la barra al pecho medio con control en 2-3 seg. Empujar verticalmente hasta extensi\u00f3n completa. Esc\u00e1pulas retra\u00eddas durante todo el movimiento.',
  },
  'Press Inclinado Mancuernas': {
    folder: 'Incline_Dumbbell_Press',
    musculos: ['Pectoral superior', 'Deltoides anterior', 'Tr\u00edceps'],
    instrucciones: 'Banco inclinado 30-45\u00b0. Mancuernas a la altura del pecho con codos a 45\u00b0. Empujar hacia arriba convergiendo ligeramente. Bajar con control manteniendo tensi\u00f3n en el pectoral superior.',
  },
  'Press Militar con Barra': {
    folder: 'Barbell_Shoulder_Press',
    musculos: ['Deltoides anterior', 'Deltoides lateral', 'Tr\u00edceps', 'Trapecio'],
    instrucciones: 'De pie, pies al ancho de hombros. Barra a la altura de las clav\u00edculas. Empujar verticalmente pasando por delante de la cara. Extensi\u00f3n completa arriba. Core activado, sin arquear la espalda.',
  },
  'Elevaciones Laterales': {
    folder: 'Side_Lateral_Raise',
    musculos: ['Deltoides lateral', 'Trapecio superior', 'Supraespinoso'],
    instrucciones: 'De pie, leve inclinaci\u00f3n del torso. Mancuernas a los costados. Elevar lateralmente liderando con los codos hasta la l\u00ednea de hombros. Mantener 1 seg arriba. Bajar en 3 seg. No balancear.',
  },
  'Fondos en Paralelas': {
    folder: 'Dips_-_Chest_Version',
    musculos: ['Pectoral inferior', 'Tr\u00edceps', 'Deltoides anterior'],
    instrucciones: 'Agarrar barras paralelas con brazos extendidos. Inclinar torso 15-20\u00b0 hacia adelante para pecho. Bajar flexionando codos hasta 90\u00b0. Empujar hasta extensi\u00f3n completa. No rebotar abajo.',
  },
  'Extensi\u00f3n Tr\u00edceps Polea': {
    folder: 'Triceps_Pushdown',
    musculos: ['Tr\u00edceps (3 cabezas)', 'Anc\u00f3neo'],
    instrucciones: 'De pie frente a polea alta. Pies al ancho de cadera. Codos fijos pegados al torso. Extender brazos empujando hacia abajo. Apretar tr\u00edceps 1 seg en extensi\u00f3n completa. Volver con control.',
  },
  'Tr\u00edceps Franc\u00e9s Mancuerna': {
    folder: 'Lying_Dumbbell_Tricep_Extension',
    musculos: ['Tr\u00edceps largo', 'Tr\u00edceps medial', 'Tr\u00edceps lateral'],
    instrucciones: 'Acostado en banco. Mancuerna con ambas manos sobre la cara, codos al techo. Flexionar codos bajando detr\u00e1s de la cabeza. Extender sin mover los codos. Controlar todo el recorrido.',
  },
  // Pull
  'Dominadas': {
    folder: 'Pullups',
    musculos: ['Dorsal ancho', 'B\u00edceps', 'Romboides'],
    instrucciones: 'Agarre prono al ancho de hombros. Tirar del cuerpo hasta que el ment\u00f3n supere la barra. Bajar con control completo. No balancear.',
  },
  'Remo con Barra': {
    folder: 'Bent_Over_Barbell_Row',
    musculos: ['Dorsal ancho', 'Romboides', 'Trapecio', 'B\u00edceps'],
    instrucciones: 'Torso a 45\u00b0, rodillas semi-flexionadas. Llevar codos hacia atr\u00e1s apretando esc\u00e1pulas. Bajar con control.',
  },
  'Remo Mancuerna a 1 Brazo': {
    folder: 'One-Arm_Dumbbell_Row',
    musculos: ['Dorsal ancho', 'Romboides'],
    instrucciones: 'Rodilla y mano en banco. Tirar mancuerna hacia la cadera. Apretar esc\u00e1pula arriba 1 seg.',
  },
  'Pull Down Polea': {
    folder: 'Wide-Grip_Lat_Pulldown',
    musculos: ['Dorsal ancho', 'B\u00edceps', 'Redondo mayor'],
    instrucciones: 'Agarre ancho prono. Tirar barra al pecho sacando pecho. Codos hacia abajo y atr\u00e1s. Volver con control.',
  },
  'Curl B\u00edceps con Barra': {
    folder: 'Barbell_Curl',
    musculos: ['B\u00edceps', 'Braquial'],
    instrucciones: 'De pie, agarre supino al ancho de hombros. Flexionar codos sin mover los hombros. Sin balanceo.',
  },
  'Curl Martillo Mancuernas': {
    folder: 'Hammer_Curls',
    musculos: ['B\u00edceps', 'Braquiorradial'],
    instrucciones: 'Agarre neutro (palmas enfrentadas). Flexionar alternando o simult\u00e1neo. Codos fijos.',
  },
  'Face Pull': {
    folder: 'Face_Pull',
    musculos: ['Deltoides posterior', 'Trapecio', 'Rotadores externos'],
    instrucciones: 'Polea alta con cuerda. Tirar hacia la cara separando manos. Rotaci\u00f3n externa al final.',
  },
  // Piernas
  'Sentadilla con Barra': {
    folder: 'Barbell_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos', 'Isquiotibiales'],
    instrucciones: 'Barra en trapecios. Pies al ancho de hombros. Bajar hasta paralelo o m\u00e1s. Rodillas en l\u00ednea con pies. Core firme.',
  },
  'Prensa de Piernas': {
    folder: 'Leg_Press',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Pies al ancho de hombros en la plataforma. Bajar hasta 90\u00b0 de rodilla. Empujar sin bloquear rodillas arriba.',
  },
  'Peso Muerto Rumano': {
    folder: 'Romanian_Deadlift_With_Dumbbells',
    musculos: ['Isquiotibiales', 'Gl\u00fateos', 'Erectores espinales'],
    instrucciones: 'Rodillas semi-flexionadas fijas. Bisagra de cadera empujando gl\u00fateos atr\u00e1s. Barra/mancuernas pegadas al cuerpo.',
  },
  'Zancadas con Mancuernas': {
    folder: 'Dumbbell_Lunges',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Paso largo hacia adelante. Rodilla trasera casi al suelo. Empujar con el tal\u00f3n delantero.',
  },
  'Extensi\u00f3n de Piernas': {
    folder: 'Leg_Extensions',
    musculos: ['Cu\u00e1driceps'],
    instrucciones: 'Sentado, espalda contra el respaldo. Extender piernas hasta arriba. Apretar 1 seg. Bajar con control.',
  },
  'Curl Femoral Acostado': {
    folder: 'Lying_Leg_Curls',
    musculos: ['Isquiotibiales'],
    instrucciones: 'Boca abajo, rodillo en los tobillos. Flexionar rodillas trayendo talones a gl\u00fateos. Control en la bajada.',
  },
  'Elevaci\u00f3n de Pantorrillas': {
    folder: 'Standing_Calf_Raises',
    musculos: ['Gemelos', 'S\u00f3leo'],
    instrucciones: 'De pie, puntas en el borde. Subir al m\u00e1ximo en puntas. Bajar estirando completamente.',
  },
  'Hip Thrust': {
    folder: 'Barbell_Hip_Thrust',
    musculos: ['Gl\u00fateos', 'Isquiotibiales'],
    instrucciones: 'Espalda superior en banco. Barra sobre la cadera. Empujar cadera arriba apretando gl\u00fateos. Pausa 2 seg arriba.',
  },
  'Sentadilla B\u00falgara': {
    folder: 'Dumbbell_Lunges',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Pie trasero elevado en banco. Bajar hasta que rodilla trasera casi toque el suelo. Empujar con pierna delantera.',
  },
  // Funcional
  'Kettlebell Swing': {
    folder: 'One-Arm_Kettlebell_Swings',
    musculos: ['Gl\u00fateos', 'Isquiotibiales', 'Core'],
    instrucciones: 'Bisagra de cadera explosiva. Impulsar kettlebell con la cadera, no con los brazos. Gl\u00fateos apretados arriba.',
  },
  'Turkish Get Up': {
    folder: 'Kettlebell_Turkish_Get-Up_Squat_style',
    musculos: ['Core', 'Hombros', 'Gl\u00fateos', 'Full Body'],
    instrucciones: 'Acostado con kettlebell en una mano. Levantarse paso a paso manteniendo el peso arriba. Controlar cada posici\u00f3n. Volver al suelo en orden inverso.',
  },
  'Farmer Walk': {
    folder: 'Farmers_Walk',
    musculos: ['Core', 'Trapecio', 'Antebrazo', 'Full Body'],
    instrucciones: 'Mancuernas pesadas a los costados. Caminar erguido con hombros atr\u00e1s y core firme. Pasos cortos y controlados.',
  },
  'Battle Ropes': {
    folder: 'Battling_Ropes',
    musculos: ['Hombros', 'Core', 'Brazos', 'Full Body'],
    instrucciones: 'De pie, rodillas semi-flexionadas. Alternar ondas con los brazos a m\u00e1xima velocidad. Mantener core activado.',
  },
  // HIIT
  'Burpees': {
    folder: 'Freehand_Jump_Squat',
    musculos: ['Full Body', 'Pecho', 'Cu\u00e1driceps'],
    instrucciones: 'Desde posici\u00f3n de pie, bajar a sentadilla, manos al suelo, saltar a plancha, flexi\u00f3n, saltar a sentadilla y saltar arriba con brazos extendidos. M\u00e1xima intensidad.',
  },
  'Mountain Climbers': {
    folder: 'Mountain_Climbers',
    musculos: ['Core', 'Flexores de cadera', 'Hombros'],
    instrucciones: 'Posici\u00f3n de plancha alta. Alternar rodillas al pecho r\u00e1pidamente como si corriera. Mantener cadera baja y core firme.',
  },
  'Jumping Squats': {
    folder: 'Freehand_Jump_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos', 'Pantorrillas'],
    instrucciones: 'Sentadilla profunda y saltar explosivamente. Aterrizar suave con rodillas flexionadas. Repetir sin pausa.',
  },
  'Sprint en Cinta': {
    folder: 'Running_Treadmill',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos', 'Pantorrillas', 'Core'],
    instrucciones: 'Sprint a m\u00e1xima velocidad por 30 segundos. Descansar 30 segundos caminando. Repetir 8 rondas.',
  },
  // Cardio
  'Cinta - Trote': {
    folder: 'Jogging_Treadmill',
    musculos: ['Cu\u00e1driceps', 'Pantorrillas', 'Cardiovascular'],
    instrucciones: 'Trote a ritmo moderado (7-8 km/h). Mantener postura erguida, mirada al frente. Respiraci\u00f3n r\u00edtmica.',
  },
  'Bicicleta Est\u00e1tica': {
    folder: 'Bicycling_Stationary',
    musculos: ['Cu\u00e1driceps', 'Isquiotibiales', 'Cardiovascular'],
    instrucciones: 'Ajustar asiento a la altura correcta. Pedalear a resistencia media manteniendo cadencia constante (70-90 RPM).',
  },
  'El\u00edptico': {
    folder: 'Elliptical_Trainer',
    musculos: ['Full Body', 'Cu\u00e1driceps', 'Gl\u00fateos', 'Cardiovascular'],
    instrucciones: 'Movimiento fluido sin impacto. Usar brazos activamente. Mantener postura erguida sin apoyarse en los mangos.',
  },
  // Cardio extras
  'Remo ergometro': {
    folder: 'Rowing_Stationary',
    musculos: ['Espalda', 'B\u00edceps', 'Cu\u00e1driceps', 'Core'],
    instrucciones: 'Empujar con piernas primero, luego tirar con espalda. Cadencia 24-28 SPM. No redondear la espalda.',
  },
  'Saltar la soga': {
    folder: 'Rope_Jumping',
    musculos: ['Pantorrillas', 'Hombros', 'Cardiovascular'],
    instrucciones: 'Saltos peque\u00f1os sobre las puntas de los pies. Girar la soga con las mu\u00f1ecas, no con los brazos.',
  },
  'Escalador (StairMaster)': {
    folder: 'Stairmaster',
    musculos: ['Gl\u00fateos', 'Cu\u00e1driceps', 'Pantorrillas'],
    instrucciones: 'Paso completo sin apoyar las manos. Mantener el core activado y la postura erguida.',
  },
  // HIIT extras
  'Box Jumps': {
    folder: 'Box_Jump_Multiple_Response',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos', 'Pantorrillas'],
    instrucciones: 'Saltar al caj\u00f3n con ambos pies. Aterrizar suave con rodillas flexionadas. Bajar caminando.',
  },
  'Plancha con toque de hombro': {
    folder: 'Plank',
    musculos: ['Core', 'Hombros', 'Pecho'],
    instrucciones: 'Posici\u00f3n de plancha alta. Tocar hombro contrario alternando. Minimizar rotaci\u00f3n de cadera.',
  },
  // Funcional extras
  'Clean and Press con Kettlebell': {
    folder: 'Clean_and_Press',
    musculos: ['Full Body', 'Hombros', 'Gl\u00fateos'],
    instrucciones: 'Movimiento desde el suelo hasta extensi\u00f3n completa arriba. Bisagra de cadera explosiva en el clean.',
  },
  'Goblet Squat': {
    folder: 'Goblet_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos', 'Core'],
    instrucciones: 'Kettlebell o mancuerna al pecho. Codos adentro. Sentadilla profunda con espalda recta.',
  },
  'Plancha din\u00e1mica': {
    folder: 'Push_Up_to_Side_Plank',
    musculos: ['Core', 'Hombros', 'Tr\u00edceps'],
    instrucciones: 'Alternar entre plancha alta y baja. Mantener core firme sin balancear.',
  },
};

// Mapeo extendido para ejercicios comunes que el usuario pueda agregar
const extraMappings: Record<string, string> = {
  'sentadilla': 'Barbell_Squat',
  'squat': 'Barbell_Squat',
  'peso muerto': 'Barbell_Deadlift',
  'deadlift': 'Barbell_Deadlift',
  'curl biceps': 'Dumbbell_Bicep_Curl',
  'curl con barra': 'Barbell_Curl',
  'dominadas': 'Pullups',
  'pull up': 'Pullups',
  'remo con barra': 'Bent_Over_Barbell_Row',
  'remo': 'Bent_Over_Barbell_Row',
  'press hombro': 'Dumbbell_Shoulder_Press',
  'press hombros': 'Dumbbell_Shoulder_Press',
  'sentadilla bulgara': 'Single_Leg_Push-off',
  'zancadas': 'Dumbbell_Lunges',
  'lunges': 'Dumbbell_Lunges',
  'hip thrust': 'Barbell_Hip_Thrust',
  'plancha': 'Plank',
  'abdominales': 'Crunches',
  'crunch': 'Crunches',
  'face pull': 'Face_Pull',
  'press pecho': 'Dumbbell_Bench_Press',
  'apertura': 'Dumbbell_Flyes',
  'vuelos': 'Dumbbell_Flyes',
  'flyes': 'Dumbbell_Flyes',
  'extension triceps': 'Triceps_Pushdown',
  'pushdown': 'Triceps_Pushdown',
  'lateral raise': 'Side_Lateral_Raise',
  'elevacion lateral': 'Side_Lateral_Raise',
  'bench press': 'Barbell_Bench_Press_-_Medium_Grip',
  'press banca': 'Barbell_Bench_Press_-_Medium_Grip',
  'press militar': 'Barbell_Shoulder_Press',
  'fondos': 'Dips_-_Chest_Version',
  'dips': 'Dips_-_Chest_Version',
  'triceps polea': 'Triceps_Pushdown',
  'triceps frances': 'Lying_Dumbbell_Tricep_Extension',
  'press inclinado': 'Incline_Dumbbell_Press',
  'pantorrillas': 'Standing_Calf_Raises',
  'calf raise': 'Standing_Calf_Raises',
  'prensa': 'Leg_Press',
  'leg press': 'Leg_Press',
  'extension piernas': 'Leg_Extensions',
  'leg extension': 'Leg_Extensions',
  'curl femoral': 'Lying_Leg_Curls',
  'leg curl': 'Lying_Leg_Curls',
  // HIIT
  'burpee': 'Freehand_Jump_Squat',
  'mountain climber': 'Mountain_Climbers',
  'jumping squat': 'Freehand_Jump_Squat',
  'jump squat': 'Freehand_Jump_Squat',
  'sprint': 'Running_Treadmill',
  'box jump': 'Front_Box_Jump',
  // Cardio
  'cinta': 'Jogging_Treadmill',
  'treadmill': 'Jogging_Treadmill',
  'trote': 'Jogging_Treadmill',
  'correr': 'Running_Treadmill',
  'bicicleta': 'Bicycling_Stationary',
  'bike': 'Bicycling_Stationary',
  'eliptico': 'Elliptical_Trainer',
  'elliptical': 'Elliptical_Trainer',
  'saltar soga': 'Rope_Jumping',
  // Funcional
  'kettlebell': 'One-Arm_Kettlebell_Swings',
  'swing': 'One-Arm_Kettlebell_Swings',
  'turkish': 'Kettlebell_Turkish_Get-Up_Squat_style',
  'farmer': 'Farmers_Walk',
  'battle rope': 'Battling_Ropes',
  'cuerdas': 'Battling_Ropes',
  'clean and': 'Clean_and_Press',
  'snatch': 'Power_Snatch',
};

function findFolder(nombre: string): string | null {
  // Buscar en el mapeo principal
  const entry = exercises[nombre];
  if (entry) return entry.folder;

  // Buscar en mapeo extendido
  const lower = nombre.toLowerCase();
  for (const [key, folder] of Object.entries(extraMappings)) {
    if (lower.includes(key)) return folder;
  }
  return null;
}

function getImageUrls(nombre: string): { img0: string; img1: string } | null {
  const folder = findFolder(nombre);
  if (!folder) return null;
  return {
    img0: `${IMG_BASE}/${folder}/0.jpg`,
    img1: `${IMG_BASE}/${folder}/1.jpg`,
  };
}

export function getIllustration(nombre: string) {
  const entry = exercises[nombre];
  return {
    images: getImageUrls(nombre),
    instrucciones: entry?.instrucciones || 'Ejecutar con rango completo de movimiento y control. Mantener postura correcta y core activado.',
    musculos: entry?.musculos || ['Varios'],
  };
}

export function ExerciseThumbnail({ nombre, onClick }: { nombre: string; onClick: () => void }) {
  const { images } = getIllustration(nombre);
  const [error, setError] = useState(false);

  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="w-14 h-14 bg-dark-700/80 border border-dark-border rounded-xl flex items-center justify-center shrink-0 hover:border-electric/30 hover:bg-electric/5 transition-all group cursor-pointer overflow-hidden"
      title="Ver ejecuci\u00f3n del ejercicio">
      {images && !error ? (
        <img src={images.img0} alt={nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={() => setError(true)} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-electric/10 to-neon/5 flex items-center justify-center">
          <svg className="w-7 h-7 text-electric/40 group-hover:text-electric/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 12l4 4 4-4M6 20h12"/></svg>
        </div>
      )}
    </button>
  );
}

export function ExerciseModal({ nombre, onClose }: { nombre: string; onClose: () => void }) {
  const { images, instrucciones, musculos } = getIllustration(nombre);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg shadow-2xl shadow-electric/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-electric/10 to-neon/5 border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-lg">{nombre}</h3>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {musculos.map(m => (
                <span key={m} className="text-[10px] px-2 py-0.5 bg-electric/15 text-electric/80 rounded-full">{m}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Imagenes */}
        {images && !imgError ? (
          <div>
            <div className="bg-[#0a1220] flex items-center justify-center p-4" style={{ minHeight: 280 }}>
              <img
                src={activeImg === 0 ? images.img0 : images.img1}
                alt={`${nombre} - ${activeImg === 0 ? 'Posici\u00f3n inicial' : 'Posici\u00f3n final'}`}
                className="max-h-64 object-contain rounded-lg"
                onError={() => setImgError(true)}
              />
            </div>
            {/* Toggle posiciones */}
            <div className="flex border-t border-dark-border">
              <button
                onClick={() => setActiveImg(0)}
                className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeImg === 0 ? 'bg-electric/10 text-electric border-b-2 border-electric' : 'text-white/30 hover:text-white/50 hover:bg-white/5'}`}>
                Posici\u00f3n Inicial
              </button>
              <button
                onClick={() => setActiveImg(1)}
                className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeImg === 1 ? 'bg-electric/10 text-electric border-b-2 border-electric' : 'text-white/30 hover:text-white/50 hover:bg-white/5'}`}>
                Posici\u00f3n Final
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a1220] flex items-center justify-center p-8" style={{ minHeight: 200 }}>
            <div className="text-center">
              <svg className="w-16 h-16 text-white/10 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 12l4 4 4-4M6 20h12"/></svg>
              <p className="text-white/20 text-sm">Ilustraci\u00f3n no disponible para este ejercicio</p>
              <p className="text-white/10 text-xs mt-1">Pod\u00e9s agregar una imagen personalizada</p>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="px-6 py-4 border-t border-dark-border">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2 font-bold">Ejecuci\u00f3n correcta</p>
          <p className="text-white/70 text-sm leading-relaxed">{instrucciones}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-border/50 text-[10px] text-white/15 text-center">
          Im\u00e1genes: Free Exercise DB (open source)
        </div>
      </div>
    </div>
  );
}
