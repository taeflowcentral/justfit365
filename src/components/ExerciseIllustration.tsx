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
  // Ejercicios corporales (Casa/Hotel/Aire libre)
  'Flexiones (push ups)': {
    folder: 'Pushups',
    musculos: ['Pecho', 'Tr\u00edceps', 'Hombros', 'Core'],
    instrucciones: 'Manos al ancho de hombros, cuerpo en l\u00ednea recta de cabeza a pies. Bajar el pecho a 5cm del suelo. Empujar hacia arriba sin bloquear codos. Si es dif\u00edcil: rodillas apoyadas. Si es f\u00e1cil: pies elevados en silla.',
  },
  'Flexiones': {
    folder: 'Pushups',
    musculos: ['Pecho', 'Tr\u00edceps', 'Hombros'],
    instrucciones: 'Manos al ancho de hombros, cuerpo recto. Bajar pecho a 5cm del suelo. Empujar hacia arriba con control. Core activado todo el movimiento.',
  },
  'Flexiones diamante': {
    folder: 'Close-Grip_Pushup',
    musculos: ['Tr\u00edceps', 'Pecho interno'],
    instrucciones: 'Manos juntas formando un diamante (pulgares e \u00edndices se tocan). Bajar el pecho hasta tocar las manos. Codos pegados al cuerpo. \u00c9nfasis en tr\u00edceps.',
  },
  'Pike push ups (hombro)': {
    folder: 'Pushups',
    musculos: ['Hombros', 'Tr\u00edceps'],
    instrucciones: 'Cuerpo en V invertida (cadera arriba, manos y pies en el suelo). Bajar la cabeza hacia el suelo flexionando codos. Empujar hacia arriba como un press militar invertido.',
  },
  'Fondos en silla': {
    folder: 'Bench_Dips',
    musculos: ['Tr\u00edceps', 'Pecho inferior', 'Hombros'],
    instrucciones: 'Apoyado en el borde de una silla S\u00d3LIDA o banco. Manos al ancho de hombros, dedos hacia adelante. Bajar el cuerpo flexionando codos a 90\u00b0. Empujar hacia arriba sin bloquear.',
  },
  'Flexiones inclinadas': {
    folder: 'Decline_Pushup',
    musculos: ['Pecho superior', 'Hombros'],
    instrucciones: 'Manos en una silla, mesa baja o banco. Cuerpo recto. Bajar el pecho hacia el apoyo. Empujar con control. M\u00e1s f\u00e1cil que flexiones normales, ideal para principiantes.',
  },
  'Plancha con toque hombro': {
    folder: 'Plank',
    musculos: ['Core', 'Hombros', 'Pecho'],
    instrucciones: 'En posici\u00f3n de plancha alta. Tocar el hombro contrario alternando. Minimizar la rotaci\u00f3n de cadera. Core firme todo el movimiento.',
  },
  'Remo con mochila pesada': {
    folder: 'Bent_Over_Barbell_Row',
    musculos: ['Espalda', 'B\u00edceps'],
    instrucciones: 'Carga una mochila con libros o bidones de agua (5-10kg). Inclinarse adelante con espalda recta. Tirar la mochila hacia el ombligo, codos pegados al cuerpo. Apretar om\u00f3platos arriba.',
  },
  'Remo con mochila': {
    folder: 'Bent_Over_Barbell_Row',
    musculos: ['Espalda', 'B\u00edceps'],
    instrucciones: 'Mochila con peso (libros, botellas). Inclinado adelante, espalda recta. Tirar al ombligo, apretar la espalda.',
  },
  'Remo invertido (mesa robusta)': {
    folder: 'Inverted_Row',
    musculos: ['Espalda', 'B\u00edceps'],
    instrucciones: 'Acostado debajo de una mesa S\u00d3LIDA. Tomar el borde con las manos al ancho de hombros. Tirar el pecho hacia la mesa con cuerpo recto. Bajar con control. Cuanto m\u00e1s horizontal, m\u00e1s dif\u00edcil.',
  },
  'Superman': {
    folder: 'Hyperextensions',
    musculos: ['Espalda baja', 'Gl\u00fateos'],
    instrucciones: 'Boca abajo en el piso, brazos extendidos al frente. Levantar simult\u00e1neamente brazos, pecho y piernas como volando. Mantener 2 segundos arriba. Bajar con control.',
  },
  'Curl de biceps con bidones': {
    folder: 'Dumbbell_Bicep_Curl',
    musculos: ['B\u00edceps'],
    instrucciones: 'Tomar 2 bidones de agua de 1.5L (3kg cada uno). Brazos al costado, palmas hacia arriba. Flexionar codos llevando bidones a los hombros. Sin balancear el cuerpo.',
  },
  'Curl con bidones': {
    folder: 'Dumbbell_Bicep_Curl',
    musculos: ['B\u00edceps'],
    instrucciones: 'Bidones de agua como pesas. Curl tradicional con codos pegados al cuerpo.',
  },
  'Pull aparts con toalla': {
    folder: 'Face_Pull',
    musculos: ['Hombros posteriores', 'Espalda alta'],
    instrucciones: 'Toalla o banda el\u00e1stica en las manos. Brazos extendidos al frente. Tirar de los extremos hacia afuera apretando los om\u00f3platos. Mantener tensi\u00f3n 2 seg.',
  },
  'Reverse fly con bidones': {
    folder: 'Bent_Over_Dumbbell_Reverse_Fly',
    musculos: ['Hombros posteriores'],
    instrucciones: 'Inclinado adelante con bidones. Brazos colgando. Levantar bidones lateralmente como volando. Apretar om\u00f3platos arriba.',
  },
  'Sentadilla con peso corporal': {
    folder: 'Bodyweight_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Pies al ancho de hombros, punta levemente afuera. Bajar como sent\u00e1ndose en una silla, rodillas alineadas con los pies. Profundidad m\u00e1xima manteniendo espalda recta. Subir empujando con talones.',
  },
  'Sentadilla con mochila': {
    folder: 'Goblet_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Mochila con peso al pecho o en la espalda. Sentadilla profunda con espalda recta. La mochila aumenta la carga.',
  },
  'Sentadilla profunda': {
    folder: 'Bodyweight_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Pies al ancho de hombros. Bajar lo m\u00e1s profundo posible manteniendo espalda recta y talones en el piso. Subir con control.',
  },
  'Sentadilla bulgara': {
    folder: 'Single_Leg_Push-off',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Pie trasero apoyado en una silla atr\u00e1s. Pierna delantera firme. Bajar flexionando la rodilla delantera hasta 90\u00b0. Empujar con el tal\u00f3n delantero. Cambiar de pierna.',
  },
  'Hip thrust en piso': {
    folder: 'Glute_Bridge',
    musculos: ['Gl\u00fateos', 'Isquios'],
    instrucciones: 'Acostado boca arriba, espalda apoyada en sof\u00e1 o cama. Pies firmes en el suelo. Empujar la cadera hacia arriba apretando gl\u00fateos al m\u00e1ximo. Mantener 2 seg arriba. Bajar con control.',
  },
  'Estocadas caminando': {
    folder: 'Dumbbell_Lunges',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Paso largo adelante. Bajar la rodilla trasera hacia el suelo sin tocarlo. Rodilla delantera no pasa la l\u00ednea del dedo gordo. Alternar piernas.',
  },
  'Sentadilla con salto': {
    folder: 'Freehand_Jump_Squat',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos', 'Cardio'],
    instrucciones: 'Sentadilla normal y al subir, saltar con explosividad. Aterrizar suave en posici\u00f3n de sentadilla. Usar brazos para impulso.',
  },
  'Elevaciones de pantorrillas': {
    folder: 'Standing_Calf_Raises',
    musculos: ['Pantorrillas'],
    instrucciones: 'En el borde de un escal\u00f3n con la mitad del pie afuera. Bajar talones por debajo del nivel del escal\u00f3n. Subir lo m\u00e1s alto posible apretando pantorrillas.',
  },
  'Pantorrillas en escalon': {
    folder: 'Standing_Calf_Raises',
    musculos: ['Pantorrillas'],
    instrucciones: 'Borde de escal\u00f3n, talones colgando. Subir y bajar con rango completo.',
  },
  'Patadas de gluteo': {
    folder: 'Donkey_Kick',
    musculos: ['Gl\u00fateos'],
    instrucciones: 'En 4 patas. Levantar una pierna hacia atr\u00e1s manteniendo rodilla flexionada a 90\u00b0. Apretar gl\u00fateo arriba. Alternar piernas.',
  },
  'Curl femoral acostado (toalla)': {
    folder: 'Lying_Leg_Curls',
    musculos: ['Isquiotibiales', 'Gl\u00fateos'],
    instrucciones: 'Acostado boca arriba con talones sobre una toalla en piso liso. Levantar cadera y deslizar talones hacia los gl\u00fateos. Volver con control.',
  },
  'Jumping jacks': {
    folder: 'Jumping_Jacks',
    musculos: ['Cardio', 'Full Body'],
    instrucciones: 'De pie, saltar abriendo piernas mientras los brazos suben sobre la cabeza. Volver al centro con un salto. Ritmo constante.',
  },
  'High knees': {
    folder: 'Mountain_Climbers',
    musculos: ['Cardio', 'Cu\u00e1driceps'],
    instrucciones: 'Trotar en el lugar levantando las rodillas a la altura de la cadera. Alternar r\u00e1pidamente. Brazos activos.',
  },
  'Salto al cajon o silla solida': {
    folder: 'Front_Box_Jump',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Saltar a una superficie estable. Aterrizar suave en flexi\u00f3n. Bajar caminando.',
  },
  'Bear crawl': {
    folder: 'Bear_Crawl_Sled_Drags',
    musculos: ['Core', 'Hombros', 'Full Body'],
    instrucciones: 'En 4 patas con rodillas a 5cm del suelo. Caminar mano y pie contrario simult\u00e1neamente. Cadera baja, espalda neutra.',
  },
  'Crunch en V': {
    folder: 'V-Up',
    musculos: ['Core', 'Abdominales'],
    instrucciones: 'Acostado boca arriba. Levantar simult\u00e1neamente piernas y torso formando una V. Tocar las manos con las puntas de los pies. Bajar con control.',
  },
  'Saltar la soga / soga imaginaria': {
    folder: 'Rope_Jumping',
    musculos: ['Pantorrillas', 'Cardio'],
    instrucciones: 'Con o sin soga. Saltos peque\u00f1os con mu\u00f1ecas relajadas. Mantener ritmo constante. Aterrizar suave en la planta del pie.',
  },
  'Sentadilla isometrica': {
    folder: 'Wall_Sit',
    musculos: ['Cu\u00e1driceps'],
    instrucciones: 'Espalda apoyada en una pared, deslizar hacia abajo hasta que las rodillas formen 90\u00b0. Mantener la posici\u00f3n sin moverse. Quema cu\u00e1driceps.',
  },
  'Step ups en silla': {
    folder: 'Step-up_with_Knee_Raise',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Silla S\u00d3LIDA o caj\u00f3n estable. Subir un pie, llevar el cuerpo arriba apoyando todo el pie. Bajar con control. Alternar piernas.',
  },
  'Plancha lateral': {
    folder: 'Side_Bridge',
    musculos: ['Core lateral', 'Oblicuos'],
    instrucciones: 'De costado, apoyado en antebrazo y pie. Elevar la cadera formando l\u00ednea recta. Mantener tiempo indicado. Cambiar de lado.',
  },
  'Plancha': {
    folder: 'Plank',
    musculos: ['Core', 'Hombros'],
    instrucciones: 'Antebrazos apoyados, cuerpo recto de cabeza a talones. Activar core y gl\u00fateos. Sin levantar ni hundir la cadera. Mantener tiempo indicado.',
  },
  'Plancha con saltos': {
    folder: 'Plank',
    musculos: ['Core', 'Cardio'],
    instrucciones: 'En plancha alta. Saltar separando y juntando los pies (jumping jacks horizontales). Core estable.',
  },
  'Caminata rapida': {
    folder: 'Jogging_Treadmill',
    musculos: ['Full Body', 'Cardio'],
    instrucciones: 'Caminata a ritmo donde pod\u00e9s hablar pero no cantar. Brazos activos. Postura erguida. 6-7 km/h.',
  },
  'Trote continuo': {
    folder: 'Jogging_Treadmill',
    musculos: ['Full Body', 'Cardio'],
    instrucciones: 'Trote a ritmo conversacional. Pisada en el medio del pie. Cadencia constante 7-9 km/h.',
  },
  'Subida de escaleras': {
    folder: 'Step-up_with_Knee_Raise',
    musculos: ['Gl\u00fateos', 'Cu\u00e1driceps'],
    instrucciones: 'Subir y bajar escaleras a buen ritmo. Pasos completos sin saltar escalones. Excelente cardio.',
  },
  'Saludo al sol': {
    folder: 'Bodyweight_Squat',
    musculos: ['Full Body', 'Movilidad'],
    instrucciones: 'Secuencia de yoga: parado, extender brazos arriba, flexi\u00f3n adelante, plancha alta, perro boca abajo, perro boca arriba, plancha, flexi\u00f3n, parado. Fluir con la respiraci\u00f3n.',
  },
  'Saltar al cajon o silla solida': {
    folder: 'Front_Box_Jump',
    musculos: ['Cu\u00e1driceps', 'Gl\u00fateos'],
    instrucciones: 'Caja o silla muy s\u00f3lida. Saltar con ambos pies a la vez. Aterrizar en flexi\u00f3n.',
  },
  'Sentadilla cossack': {
    folder: 'Bodyweight_Squat',
    musculos: ['Cu\u00e1driceps', 'Aductores'],
    instrucciones: 'Pies bien separados. Bajar a un costado flexionando esa pierna y manteniendo la otra extendida con punta arriba. Alternar lados sin bajar al centro.',
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
                alt={`${nombre} - ${activeImg === 0 ? 'Posicion inicial' : 'Posicion final'}`}
                className="max-h-64 object-contain rounded-lg"
                onError={() => setImgError(true)}
              />
            </div>
            {/* Toggle posiciones */}
            <div className="flex border-t border-dark-border">
              <button
                onClick={() => setActiveImg(0)}
                className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeImg === 0 ? 'bg-electric/10 text-electric border-b-2 border-electric' : 'text-white/30 hover:text-white/50 hover:bg-white/5'}`}>
                Posicion Inicial
              </button>
              <button
                onClick={() => setActiveImg(1)}
                className={`flex-1 py-3 text-sm font-bold text-center transition-all ${activeImg === 1 ? 'bg-electric/10 text-electric border-b-2 border-electric' : 'text-white/30 hover:text-white/50 hover:bg-white/5'}`}>
                Posicion Final
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-electric/5 to-purple-500/5 p-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-electric/15 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-electric" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-electric text-xs font-bold uppercase tracking-wider mb-1">Como hacer este ejercicio</p>
                <p className="text-white/80 text-sm leading-relaxed">{instrucciones}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones (cuando hay imagen) */}
        {images && !imgError && (
          <div className="px-6 py-4 border-t border-dark-border">
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2 font-bold">Ejecucion correcta</p>
            <p className="text-white/70 text-sm leading-relaxed">{instrucciones}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-border/50 text-[10px] text-white/15 text-center">
          {images && !imgError ? 'Imagenes: Free Exercise DB (open source)' : 'Tip: practica frente a un espejo para corregir la tecnica'}
        </div>
      </div>
    </div>
  );
}
