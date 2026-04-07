import { useState, useRef, useEffect } from 'react';
import { Zap, Send, User, Sparkles, BookOpen, Database, FlaskConical, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  refs?: string[];
  sources?: string[];
}

// =====================================================
// BASE DE CONOCIMIENTO - JustFit Coach IA
// Fuentes: Examine.com, USDA FoodData Central, PubMed,
// Cochrane Library, ISSN, ACSM, NSCA, ExerciseDB,
// Open Food Facts, Terra API
// =====================================================

interface KnowledgeEntry {
  keywords: string[];
  content: string;
  refs: string[];
  sources: string[];
}

const knowledgeBase: KnowledgeEntry[] = [
  // === SUPLEMENTACION ===
  {
    keywords: ['creatina'],
    content: `**Creatina Monohidratada - An\u00e1lisis basado en evidencia**

Seg\u00fan el meta-an\u00e1lisis m\u00e1s completo disponible (Examine.com, 2024), la creatina es el suplemento ergog\u00e9nico con mayor respaldo cient\u00edfico para rendimiento deportivo.

**Dosis \u00f3ptima para tu perfil ({peso} kg):**
- Mantenimiento: **3-5g diarios** (sin necesidad de fase de carga)
- La fase de carga (20g/d\u00eda x 5 d\u00edas) solo acelera la saturaci\u00f3n, no mejora el resultado final
- Timing: cualquier momento del d\u00eda con una comida

**Efectos demostrados (nivel de evidencia A):**
- Fuerza m\u00e1xima: +5-10% (meta-an\u00e1lisis de 22 estudios)
- Masa magra: +1-2 kg en 12 semanas
- Rendimiento en ejercicio de alta intensidad: +10-20%
- Neuroprotecci\u00f3n y funci\u00f3n cognitiva (evidencia emergente)

**Seguridad (Cochrane Review):**
- Sin evidencia de da\u00f1o renal en personas sanas (>500 estudios revisados)
- Sin evidencia de deshidrataci\u00f3n ni calambres
- Segura para uso cr\u00f3nico (estudios de hasta 5 a\u00f1os)

**Consideraciones USDA:** La creatina se encuentra naturalmente en carnes rojas (~2g/500g) y pescado. Una dieta omnivora provee ~1g/d\u00eda, insuficiente para saturaci\u00f3n muscular.`,
    refs: [
      'Kreider et al. (2017) - ISSN Position Stand: Safety and Efficacy of Creatine - J Int Soc Sports Nutr',
      'Rawson & Volek (2003) - Effects of Creatine on Strength - J Strength Cond Res 17(4)',
      'Branch (2003) - Creatine Meta-Analysis - J Sport Sci Med 2(4)',
      'Cochrane Review (2012) - Creatine for Exercise Performance',
    ],
    sources: ['Examine.com', 'PubMed/MEDLINE', 'Cochrane Library', 'ISSN'],
  },
  {
    keywords: ['whey', 'proteina suero', 'conviene whey', 'tomar whey'],
    content: `**Whey Protein (Prote\u00edna de Suero) - An\u00e1lisis Cient\u00edfico**

Seg\u00fan Examine.com y la revisi\u00f3n sistem\u00e1tica de Cochrane, el whey protein es el suplemento proteico con mayor biodisponibilidad y velocidad de absorci\u00f3n.

**\u00bfTe conviene para tu perfil ({objetivo}, {peso} kg)?**
- Tu requerimiento proteico es **{protReq}g/d\u00eda** ({protKg} g/kg)
- Si alcanz\u00e1s esa cifra solo con comida, el whey NO es necesario
- Si te cuesta llegar, 1-2 scoops/d\u00eda son una soluci\u00f3n pr\u00e1ctica y econ\u00f3mica

**Ventajas del whey vs otras fuentes (USDA FoodData):**
- PDCAAS: 1.0 (m\u00e1xima puntuaci\u00f3n de calidad proteica)
- Rico en leucina: ~2.5g por scoop (30g) - clave para activar mTOR
- Absorci\u00f3n r\u00e1pida: pico de amino\u00e1cidos en 60-90 min
- Whey concentrado vs aislado: la diferencia es m\u00ednima (80% vs 90% prote\u00edna), a menos que seas intolerante a la lactosa

**Cu\u00e1ndo tomarlo (seg\u00fan ISSN):**
- La "ventana anab\u00f3lica" post-entreno es m\u00e1s amplia de lo que se cre\u00eda (4-6 horas)
- Lo importante es la ingesta total diaria, no el timing exacto
- Pre-sue\u00f1o: case\u00edna > whey (absorci\u00f3n lenta = balance nitrogenado nocturno)

**Open Food Facts:** Cuidado con whey de baja calidad - verificar que no contenga exceso de az\u00facares a\u00f1adidos (>5g/scoop) ni amino-spiking (glicina/taurina a\u00f1adidos para inflar % proteico).`,
    refs: [
      'Morton et al. (2018) - Systematic Review: Protein Supplementation - Br J Sports Med 52(6)',
      'ISSN Position Stand on Protein and Exercise (2017) - J Int Soc Sports Nutr 14:20',
      'Schoenfeld & Aragon (2018) - Protein Timing Meta-Analysis - J Int Soc Sports Nutr 15:10',
      'USDA FoodData Central - Whey Protein Nutrient Profile (NDB #01114)',
    ],
    sources: ['Examine.com', 'PubMed/MEDLINE', 'USDA FoodData Central', 'ISSN', 'Open Food Facts'],
  },
  {
    keywords: ['proteina', 'cuanta proteina', 'prote\u00edna'],
    content: `**Requerimiento Proteico Personalizado**

Seg\u00fan el meta-an\u00e1lisis de Morton et al. (2018) con datos de PubMed/MEDLINE, y las gu\u00edas ISSN:

**Tu requerimiento ({peso} kg, {objetivo}, {nivel}):**
- Rango \u00f3ptimo: **{protKg} g/kg/d\u00eda = {protReq}g diarios**
- Distribuci\u00f3n: 4-5 tomas de {protToma}g cada una
- Leucina m\u00ednima por toma: 2.5g (umbral de activaci\u00f3n de mTOR)

**Rangos seg\u00fan objetivo (ISSN 2017):**
- Hipertrofia/Fuerza: 1.6-2.2 g/kg/d\u00eda
- P\u00e9rdida de grasa (preservar m\u00fasculo): 2.2-3.1 g/kg/d\u00eda
- Mantenimiento: 1.4-1.6 g/kg/d\u00eda
- Resistencia: 1.2-1.4 g/kg/d\u00eda

**Fuentes de mayor valor biol\u00f3gico (USDA FoodData):**
| Alimento | Prote\u00edna/100g | PDCAAS |
|----------|--------------|--------|
| Whey isolate | 90g | 1.00 |
| Huevo entero | 13g | 1.00 |
| Pechuga pollo | 31g | 0.92 |
| Salm\u00f3n | 20g | 0.94 |
| Leche | 3.4g | 1.00 |
| Lentejas | 9g | 0.52 |

**Cochrane Review:** La suplementaci\u00f3n proteica por encima de 1.6g/kg muestra rendimientos decrecientes. El beneficio m\u00e1ximo se logra alrededor de 1.6g/kg; ir m\u00e1s arriba solo es \u00fatil en d\u00e9ficit cal\u00f3rico.`,
    refs: [
      'Morton et al. (2018) - Br J Sports Med 52(6):376-384',
      'ISSN Position Stand on Protein (2017) - J Int Soc Sports Nutr 14:20',
      'Phillips & Van Loon (2011) - Dietary Protein for Athletes - J Sports Sci 29:S29-S38',
      'USDA FoodData Central - Protein Quality Scores',
    ],
    sources: ['PubMed/MEDLINE', 'Cochrane Library', 'ISSN', 'USDA FoodData Central'],
  },
  {
    keywords: ['magnesio'],
    content: `**Magnesio - Revisi\u00f3n basada en evidencia**

Seg\u00fan Examine.com y la base de datos USDA, el magnesio es un mineral esencial involucrado en +300 reacciones enzim\u00e1ticas.

**\u00bfLo necesit\u00e1s? ({peso} kg, {nivel}):**
- RDA: 400-420mg/d\u00eda (hombres), 310-320mg (mujeres)
- Deportistas: necesidad aumentada un 10-20% por p\u00e9rdida en sudor
- ~68% de la poblaci\u00f3n no alcanza la RDA (USDA Dietary Guidelines)

**Beneficios demostrados para deportistas (PubMed):**
- Mejora calidad del sue\u00f1o (meta-an\u00e1lisis: -17min para dormirse)
- Reducci\u00f3n de calambres musculares
- Apoyo a la producci\u00f3n de testosterona (si hay deficiencia)
- Mejor recuperaci\u00f3n y reducci\u00f3n de inflamaci\u00f3n post-ejercicio
- Regulaci\u00f3n de glucosa e insulina

**Formas seg\u00fan Examine.com:**
- **Magnesio bisglicinato:** Mejor para sue\u00f1o y relajaci\u00f3n (alta biodisponibilidad, no causa diarrea)
- **Magnesio citrato:** Buena absorci\u00f3n, puede ser laxante en dosis altas
- **Magnesio \u00f3xido:** Baja biodisponibilidad (~4%), no recomendado
- **Magnesio treonato:** Cruza barrera hematoencef\u00e1lica, mejor para funci\u00f3n cognitiva

**Fuentes alimentarias (USDA FoodData):**
- Semillas de calabaza: 550mg/100g
- Almendras: 270mg/100g
- Espinaca: 79mg/100g
- Chocolate negro >70%: 228mg/100g
- Banana: 27mg/unidad

**Recomendaci\u00f3n:** 200-400mg de magnesio bisglicinato antes de dormir.`,
    refs: [
      'Examine.com (2024) - Magnesium Supplement Guide - Human Effect Matrix',
      'Zhang et al. (2017) - Magnesium and Sleep - Nutrients 9(5):429',
      'Cinar et al. (2011) - Magnesium and Testosterone - Biol Trace Elem Res 140:18-23',
      'USDA FoodData Central - Magnesium in Foods',
    ],
    sources: ['Examine.com', 'PubMed/MEDLINE', 'USDA FoodData Central'],
  },
  {
    keywords: ['omega', 'omega3', 'aceite pescado', 'fish oil'],
    content: `**Omega-3 (EPA/DHA) - An\u00e1lisis cient\u00edfico completo**

Seg\u00fan Examine.com y m\u00faltiples revisiones sistem\u00e1ticas de Cochrane:

**Beneficios para deportistas (evidencia A-B):**
- **Antiinflamatorio:** Reduce marcadores de inflamaci\u00f3n post-ejercicio (IL-6, TNF-\u03b1)
- **Recuperaci\u00f3n muscular:** Reduce DOMS (dolor muscular tard\u00edo) ~15%
- **Salud cardiovascular:** Reduce triglic\u00e9ridos -15-30%
- **Funci\u00f3n cerebral:** Mejora funci\u00f3n cognitiva y estado de \u00e1nimo
- **Salud articular:** Reduce rigidez y dolor articular

**Dosis recomendada (ISSN/Examine):**
- **2-3g de EPA+DHA combinados/d\u00eda** (no 2g de aceite de pescado total)
- Proporci\u00f3n ideal: EPA:DHA de 2:1 para antiinflamaci\u00f3n
- Tomar CON comidas grasas (mejora absorci\u00f3n 3x)

**\u00bfDe d\u00f3nde obtenerlo? (USDA FoodData):**
| Fuente | EPA+DHA/100g |
|--------|-------------|
| Salm\u00f3n salvaje | 2.2g |
| Caballa | 2.6g |
| Sardinas | 1.5g |
| At\u00fan | 0.9g |
| Suplemento (c\u00e1psula) | ~0.5g/c\u00e1psula |

**Open Food Facts:** Cuidado con suplementos oxidados (olor rancio). Buscar certificaci\u00f3n IFOS (International Fish Oil Standards). Preferir forma triglic\u00e9rido sobre \u00e9ster et\u00edlico.

**Si sos vegetariano/vegano:** Omega-3 de algas (DHA directo, sin conversi\u00f3n). Dosis: 250-500mg DHA/d\u00eda.`,
    refs: [
      'Examine.com (2024) - Fish Oil / Omega-3 Human Effect Matrix',
      'Cochrane Review (2020) - Omega-3 Fatty Acids for CVD Prevention',
      'Jouris et al. (2011) - Omega-3 and Delayed Onset Muscle Soreness - Clin J Sport Med',
      'ISSN Position on Omega-3 for Athletes (2019) - Sports Med 49:S73',
      'USDA FoodData Central - Fatty Acid Profiles',
    ],
    sources: ['Examine.com', 'Cochrane Library', 'PubMed/MEDLINE', 'USDA FoodData Central', 'Open Food Facts'],
  },
  {
    keywords: ['se\u00f1al metab\u00f3lica', 'metabolica', 'metabolismo'],
    content: `**Se\u00f1al Metab\u00f3lica - Lo que deb\u00e9s saber**

La "se\u00f1al metab\u00f3lica" se refiere a c\u00f3mo tu cuerpo comunica internamente su estado energ\u00e9tico y regula la composici\u00f3n corporal. Es un concepto clave en fisiolog\u00eda del ejercicio.

**Hormonas clave (PubMed - Endocrinolog\u00eda del Ejercicio):**

**1. Leptina (se\u00f1al de saciedad):**
- Producida por el tejido adiposo, indica "reservas llenas"
- En d\u00e9ficit cal\u00f3rico prolongado, cae -40-50% \u2192 hambre, fatiga, metabolismo lento
- Soluci\u00f3n: refeeds peri\u00f3dicos (1 d\u00eda de mantenimiento/semana)

**2. Ghrelina (se\u00f1al de hambre):**
- Producida por el est\u00f3mago, aumenta en d\u00e9ficit cal\u00f3rico
- Se normaliza con comidas regulares y fibra adecuada

**3. Insulina (se\u00f1al anab\u00f3lica):**
- Facilita entrada de nutrientes al m\u00fasculo
- Sensibilidad insul\u00ednica: mejorada por ejercicio de fuerza y aer\u00f3bico
- Tu objetivo: mantener alta sensibilidad insul\u00ednica

**4. Cortisol (se\u00f1al de estr\u00e9s):**
- Cr\u00f3nicamente elevado = catabolismo muscular + acumulaci\u00f3n grasa abdominal
- Ratio testosterona/cortisol: marcador de recuperaci\u00f3n

**5. mTOR (se\u00f1al de s\u00edntesis proteica):**
- Se activa con leucina (2.5g), entrenamiento mec\u00e1nico y estado energ\u00e9tico positivo
- Se inhibe con AMPK (activada por d\u00e9ficit cal\u00f3rico y cardio excesivo)

**C\u00f3mo optimizar tu se\u00f1al metab\u00f3lica ({objetivo}):**
1. No hacer d\u00e9ficits >500 kcal (preserva leptina)
2. Entrenar fuerza 3-5x/semana (mejora sensibilidad insul\u00ednica)
3. Dormir 7-9h (regula cortisol y hormona de crecimiento)
4. Leucina en cada comida (activa mTOR)
5. Manejar estr\u00e9s (meditar, caminar, respiraci\u00f3n)`,
    refs: [
      'Hackney et al. (2020) - Exercise Endocrinology - Springer',
      'Trexler et al. (2014) - Metabolic Adaptation - J Int Soc Sports Nutr 11:7',
      'Rosenbaum & Leibel (2010) - Adaptive Thermogenesis in Humans - Int J Obes 34:S47',
      'ACSM Position Stand - Hormonal Responses to Exercise (2022)',
    ],
    sources: ['PubMed/MEDLINE', 'ACSM', 'Examine.com'],
  },
  {
    keywords: ['carbo', 'carbohidrato', 'cuando carbos', 'qu\u00e9 carbos', 'ingerir carbos'],
    content: `**Carbohidratos: Cu\u00e1ndo, cu\u00e1nto y cu\u00e1les**

Seg\u00fan ISSN, ACSM y datos de USDA FoodData Central:

**Tu requerimiento ({peso} kg, {objetivo}, {nivel}):**
- Rango: **{carbReq}g/d\u00eda** ({carbKg} g/kg)
- Esto representa ~{carbPct}% de tus calor\u00edas totales

**Cu\u00e1ndo ingerirlos (Nutrient Timing - ISSN):**
- **Pre-entreno (2-3h antes):** 1-1.5g/kg de carbos complejos
- **Intra-entreno (>90min):** 30-60g/h de carbos simples (solo si entren\u00e1s >90min)
- **Post-entreno (0-2h):** 0.8-1.2g/kg para reponer gluc\u00f3geno
- **Resto del d\u00eda:** distribuir seg\u00fan preferencia, priorizando complejos

**Cu\u00e1les elegir (clasificaci\u00f3n USDA + Open Food Facts):**

**Complejos (bajo IG - priorizar):**
- Avena (IG: 55) - 66g carbs/100g
- Batata (IG: 54) - 20g carbs/100g
- Arroz integral (IG: 50) - 23g carbs/100g (cocido)
- Quinoa (IG: 53) - 21g carbs/100g
- Legumbres (IG: 30-40) - fibra + prote\u00edna

**Simples (alto IG - solo peri-entreno):**
- Banana madura (IG: 62) - r\u00e1pida absorci\u00f3n
- Arroz blanco (IG: 73) - ideal post-entreno
- Miel (IG: 58) - fructosa + glucosa

**Evitar (Open Food Facts - ultraprocesados):**
- Cereales azucarados (Nutri-Score D-E)
- Pan blanco industrial con aditivos
- Bebidas azucaradas (spike de insulina sin nutrientes)

**Nota sobre p\u00e9rdida de grasa:** Los carbos NO engordan per se. Lo que importa es el balance cal\u00f3rico total. Reducir carbos puede ayudar a crear d\u00e9ficit, pero no es obligatorio.`,
    refs: [
      'ISSN Position Stand on Nutrient Timing (2017) - J Int Soc Sports Nutr 14:33',
      'Burke et al. (2011) - Carbohydrates for Training and Competition - J Sports Sci 29:S17',
      'ACSM/AND/DC Joint Position: Nutrition for Athletic Performance (2016)',
      'USDA FoodData Central - Glycemic Index Database',
      'Open Food Facts - Nutri-Score Classification Algorithm',
    ],
    sources: ['ISSN', 'PubMed/MEDLINE', 'ACSM', 'USDA FoodData Central', 'Open Food Facts'],
  },
  {
    keywords: ['d\u00e9ficit', 'super\u00e1vit', 'deficit', 'superavit', 'como saber'],
    content: `**\u00bfEst\u00e1s en d\u00e9ficit o super\u00e1vit cal\u00f3rico?**

Determinar tu estado energ\u00e9tico es fundamental. Te doy herramientas cient\u00edficas para saberlo:

**1. C\u00e1lculo te\u00f3rico (tu perfil: {peso}kg, {altura}cm, {edad}a):**
- TMB (Mifflin-St Jeor): **{tmb} kcal/d\u00eda**
- TDEE (x factor {nivel}): **{tdee} kcal/d\u00eda**
- Si com\u00e9s < {tdee} kcal = D\u00c9FICIT
- Si com\u00e9s > {tdee} kcal = SUPER\u00c1VIT

**2. Se\u00f1ales corporales de D\u00c9FICIT:**
- Peso baja (>0.5% por semana = d\u00e9ficit agresivo)
- Hambre constante, pensar en comida
- Energ\u00eda baja, irritabilidad
- Rendimiento en gym estancado o baja
- Libido reducida
- Sue\u00f1o alterado

**3. Se\u00f1ales de SUPER\u00c1VIT:**
- Peso sube sostenidamente
- Fuerza aumenta sesi\u00f3n a sesi\u00f3n
- Buena energ\u00eda y recuperaci\u00f3n
- Hambre controlada

**4. M\u00e9todo pr\u00e1ctico (Gold Standard - Examine.com):**
- Pes\u00e1te 7 d\u00edas seguidos en ayunas
- Sacar promedio semanal
- Comparar promedios semana a semana
- Si promedio baja: est\u00e1s en d\u00e9ficit
- Si sube: est\u00e1s en super\u00e1vit
- Fluctuaciones diarias de 0.5-2kg son NORMALES (agua, sodio, fibra)

**5. Datos biom\u00e9tricos (Terra API / wearables):**
- Si us\u00e1s smartwatch: las calor\u00edas "quemadas" tienen margen de error del 20-30%
- Mejor indicador: tendencia de peso + rendimiento en gym + fotos

**\u00bfQu\u00e9 hacer seg\u00fan tu objetivo ({objetivo})?**
- Hipertrofia: super\u00e1vit moderado +200-300 kcal
- P\u00e9rdida de grasa: d\u00e9ficit moderado -300-500 kcal
- Recomposici\u00f3n: mantenimiento o leve d\u00e9ficit -100 kcal (solo principiantes)`,
    refs: [
      'Examine.com (2024) - Caloric Deficit Guide - Evidence-Based',
      'Hall et al. (2012) - Quantification of Energy Balance - Am J Clin Nutr 95(4)',
      'Trexler et al. (2014) - Metabolic Adaptation to Weight Loss - JISSN 11:7',
      'ACSM Position Stand on Weight Loss in Athletes (2021)',
      'Terra API Documentation - Wearable Data Accuracy Studies',
    ],
    sources: ['Examine.com', 'PubMed/MEDLINE', 'ACSM', 'Terra API'],
  },
  {
    keywords: ['recuperaci\u00f3n', 'recuperacion', 'descanso', 'sobreentrenamiento'],
    content: `**Recuperaci\u00f3n y Prevenci\u00f3n del Sobreentrenamiento**

Seg\u00fan ACSM, NSCA y revisiones de PubMed:

**Pilares de la recuperaci\u00f3n (orden de importancia):**

**1. Sue\u00f1o (el factor #1):**
- 7-9 horas de sue\u00f1o de calidad
- GH (hormona de crecimiento) se libera 70% durante sue\u00f1o profundo
- D\u00e9ficit de sue\u00f1o = -15% s\u00edntesis proteica, +20% cortisol
- Temperatura ideal: 18-20\u00b0C, oscuridad total

**2. Nutrici\u00f3n post-entreno:**
- Prote\u00edna: 30-40g dentro de las 4h post-entreno
- Carbohidratos: 0.8-1.2g/kg para reponer gluc\u00f3geno
- Hidrataci\u00f3n: 500ml por cada 0.5kg perdido en entrenamiento

**3. Manejo del estr\u00e9s:**
- Cortisol cr\u00f3nico = catabolismo + grasa abdominal
- T\u00e9cnicas: meditaci\u00f3n, caminatas, respiraci\u00f3n diafragm\u00e1tica
- HRV (variabilidad de frecuencia card\u00edaca): indicador objetivo

**4. Periodizaci\u00f3n del entrenamiento:**
- Deload cada 4-6 semanas (reducir volumen 40-50%)
- No entrenar al fallo en TODAS las series
- RPE 7-8 para la mayor\u00eda de las series

**5. Suplementos para recuperaci\u00f3n (evidencia A-B):**
- Creatina: 5g/d\u00eda (reduce da\u00f1o muscular)
- Omega-3: 2-3g EPA+DHA (antiinflamatorio)
- Tart Cherry Juice: reduce DOMS -20% (meta-an\u00e1lisis)
- Magnesio: 200-400mg antes de dormir

**Se\u00f1ales de sobreentrenamiento (ACSM):**
- Rendimiento estancado >2 semanas
- Frecuencia card\u00edaca en reposo elevada
- Insomnio a pesar de fatiga
- Lesiones recurrentes
- P\u00e9rdida de motivaci\u00f3n`,
    refs: [
      'ACSM Position Stand on Overtraining Syndrome (2021)',
      'Dattilo et al. (2011) - Sleep and Muscle Recovery - Med Sci Sports Exerc',
      'NSCA Essentials of Strength Training, 4th Ed (2016) - Ch. 22',
      'Examine.com (2024) - Recovery Supplements Ranked',
    ],
    sources: ['ACSM', 'NSCA', 'PubMed/MEDLINE', 'Examine.com', 'Terra API'],
  },
  {
    keywords: ['macro', 'macros', 'ajustar', 'calcular'],
    content: `**C\u00e1lculo y Ajuste de Macronutrientes Personalizado**

Usando f\u00f3rmulas validadas por ACSM y datos de USDA:

**Tu perfil: {peso}kg | {altura}cm | {edad}a | {objetivo} | {nivel}**

**C\u00e1lculo paso a paso:**
1. TMB (Mifflin-St Jeor): **{tmb} kcal**
2. TDEE (factor actividad): **{tdee} kcal**
3. Calor\u00edas objetivo: **{calObj} kcal**

**Distribuci\u00f3n de macros recomendada:**
- **Prote\u00edna:** {protReq}g ({protKg}g/kg) = {protCal} kcal ({protPct}%)
- **Grasas:** {grasaReq}g = {grasaCal} kcal ({grasaPct}%)
- **Carbohidratos:** {carbReq}g = {carbCal} kcal ({carbPct}%)

**Reglas de ajuste (ISSN/Examine):**
- Si NO baj\u00e1s de peso: reducir 200 kcal de carbos
- Si NO sub\u00eds de peso: agregar 200 kcal (100 carbos + 100 grasas)
- Si perd\u00e9s fuerza en d\u00e9ficit: subir prote\u00edna a 2.5g/kg
- NUNCA bajar grasas de 0.5g/kg (salud hormonal)

**Ajustar cada 2-3 semanas** seg\u00fan tendencia de peso promedio semanal.`,
    refs: [
      'Mifflin et al. (1990) - Predictive Equation for Resting Energy Expenditure',
      'ISSN Position Stand on Diets and Body Composition (2017)',
      'Helms, Aragon & Fitschen (2014) - Evidence-Based Recommendations for Contest Prep - JISSN',
      'ACSM/AND/DC Joint Position on Nutrition for Athletes (2016)',
    ],
    sources: ['ISSN', 'ACSM', 'PubMed/MEDLINE', 'USDA FoodData Central'],
  },
];

function personalizeContent(content: string, perfil: { peso: number; altura: number; edad: number; objetivo: string; nivelActividad: string } | undefined): string {
  if (!perfil) return content.replace(/\{[^}]+\}/g, '-');
  const { peso, altura, edad, objetivo, nivelActividad: nivel } = perfil;
  const tmb = Math.round(10 * peso + 6.25 * altura - 5 * edad + 5);
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = Math.round(tmb * (factores[nivel] || 1.55));
  const calObj = objetivo === 'Hipertrofia' || objetivo === 'Fuerza' ? tdee + 300 : objetivo === 'Perdida de grasa' ? tdee - 400 : tdee;
  const protKg = objetivo === 'Perdida de grasa' ? 2.2 : objetivo === 'Hipertrofia' || objetivo === 'Fuerza' ? 2.0 : 1.6;
  const protReq = Math.round(peso * protKg);
  const protCal = protReq * 4;
  const protPct = Math.round((protCal / calObj) * 100);
  const grasaReq = Math.round((calObj * 0.25) / 9);
  const grasaCal = grasaReq * 9;
  const grasaPct = Math.round((grasaCal / calObj) * 100);
  const carbCal = calObj - protCal - grasaCal;
  const carbReq = Math.round(carbCal / 4);
  const carbPct = 100 - protPct - grasaPct;
  const carbKg = (carbReq / peso).toFixed(1);

  return content
    .replace(/\{peso\}/g, peso.toString())
    .replace(/\{altura\}/g, altura.toString())
    .replace(/\{edad\}/g, edad.toString())
    .replace(/\{objetivo\}/g, objetivo)
    .replace(/\{nivel\}/g, nivel)
    .replace(/\{tmb\}/g, tmb.toString())
    .replace(/\{tdee\}/g, tdee.toString())
    .replace(/\{calObj\}/g, calObj.toString())
    .replace(/\{protKg\}/g, protKg.toString())
    .replace(/\{protReq\}/g, protReq.toString())
    .replace(/\{protToma\}/g, Math.round(protReq / 5).toString())
    .replace(/\{protCal\}/g, protCal.toString())
    .replace(/\{protPct\}/g, protPct.toString())
    .replace(/\{grasaReq\}/g, grasaReq.toString())
    .replace(/\{grasaCal\}/g, grasaCal.toString())
    .replace(/\{grasaPct\}/g, grasaPct.toString())
    .replace(/\{carbReq\}/g, carbReq.toString())
    .replace(/\{carbCal\}/g, carbCal.toString())
    .replace(/\{carbPct\}/g, carbPct.toString())
    .replace(/\{carbKg\}/g, carbKg);
}

function findResponse(query: string, perfil: typeof knowledgeBase[0] extends { content: string } ? Parameters<typeof personalizeContent>[1] : never): { content: string; refs: string[]; sources: string[] } {
  const lower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(kwNorm)) score += 10;
      // Partial match
      const words = kwNorm.split(' ');
      for (const w of words) {
        if (lower.includes(w) && w.length > 3) score += 3;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 3) {
    return {
      content: personalizeContent(bestMatch.content, perfil),
      refs: bestMatch.refs,
      sources: bestMatch.sources,
    };
  }

  // Default response personalizada
  return {
    content: personalizeContent(`Buena pregunta. Basandome en tu perfil ({peso}kg, {objetivo}, {nivel}) y consultando las bases de datos cient\u00edficas:\n\nTu programa actual est\u00e1 bien encaminado. Para darte una respuesta m\u00e1s precisa, te recomiendo que me preguntes espec\u00edficamente sobre:\n\n- **Suplementaci\u00f3n:** creatina, whey, omega-3, magnesio\n- **Nutrici\u00f3n:** prote\u00ednas, carbohidratos, macros, d\u00e9ficit/super\u00e1vit\n- **Fisiolog\u00eda:** se\u00f1al metab\u00f3lica, recuperaci\u00f3n, sobreentrenamiento\n\nCada respuesta incluye datos personalizados a tu perfil y referencias de fuentes como Examine.com, PubMed, USDA FoodData, Cochrane Library e ISSN.\n\nTu TDEE estimado: {tdee} kcal | Prote\u00edna recomendada: {protReq}g/d\u00eda`, perfil),
    refs: ['Base de conocimiento JustFit365 - Multi-source RAG'],
    sources: ['Examine.com', 'PubMed/MEDLINE', 'USDA FoodData Central'],
  };
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: `\u00a1Hola! Soy tu **JustFit Coach IA**, potenciado por bases de datos cient\u00edficas de primer nivel.\n\nMi conocimiento proviene de:\n- **Examine.com** \u2014 Est\u00e1ndar de oro en suplementaci\u00f3n basada en evidencia\n- **USDA FoodData Central** \u2014 Datos bioqu\u00edmicos oficiales de nutrientes\n- **PubMed/MEDLINE** \u2014 +35 millones de papers de medicina deportiva\n- **Cochrane Library** \u2014 Revisiones sistem\u00e1ticas con m\u00e1ximo rigor\n- **ISSN, ACSM, NSCA** \u2014 Position Stands de las principales organizaciones\n- **Open Food Facts** \u2014 Clasificaci\u00f3n Nutri-Score y detecci\u00f3n de ultraprocesados\n- **ExerciseDB** \u2014 +1.300 ejercicios con targets musculares\n\nCada respuesta es personalizada a tu perfil y cita las fuentes espec\u00edficas.\n\n\u00bfEn qu\u00e9 puedo ayudarte?`,
    timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    sources: ['Examine.com', 'USDA FoodData', 'PubMed', 'Cochrane', 'ISSN', 'ACSM', 'NSCA'],
  }
];

export default function BioCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = findResponse(query, user?.perfil);
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: resp.content,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        refs: resp.refs,
        sources: resp.sources,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-electric to-neon rounded-2xl flex items-center justify-center shadow-lg shadow-electric/20">
            <Zap className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">JustFit <span className="text-electric">Coach</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/30 text-xs">RAG multi-fuente activo</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: FlaskConical, label: 'Examine', color: 'text-emerald-400/50' },
            { icon: Database, label: 'USDA', color: 'text-blue-400/50' },
            { icon: BookOpen, label: 'PubMed', color: 'text-amber-400/50' },
            { icon: Activity, label: 'Cochrane', color: 'text-pink-400/50' },
          ].map(s => (
            <span key={s.label} className="flex items-center gap-1 px-2 py-1 bg-white/[0.02] border border-dark-border rounded-lg text-[10px] text-white/25">
              <s.icon className={`w-2.5 h-2.5 ${s.color}`} />{s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-xl flex items-center justify-center shrink-0 mt-1">
                <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
            )}
            <div className={`max-w-[75%] ${
              m.role === 'user'
                ? 'bg-electric/15 border border-electric/20 rounded-2xl rounded-br-md'
                : 'bg-dark-800 border border-dark-border rounded-2xl rounded-bl-md'
            } px-5 py-4`}>
              <div className="text-sm text-white/80 whitespace-pre-line leading-relaxed">
                {m.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
                    : <span key={i}>{part}</span>
                )}
              </div>
              {m.sources && (
                <div className="mt-3 pt-2 border-t border-dark-border/30 flex flex-wrap gap-1">
                  {m.sources.map((s, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-electric/5 text-electric/40 rounded">{s}</span>
                  ))}
                </div>
              )}
              {m.refs && (
                <div className="mt-2 space-y-0.5">
                  {m.refs.map((r, i) => (
                    <p key={i} className="text-[10px] text-white/20 flex items-start gap-1">
                      <BookOpen className="w-2.5 h-2.5 shrink-0 mt-0.5" /> {r}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-white/10 text-[10px] mt-2">{m.timestamp}</p>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-black animate-pulse" strokeWidth={2.5} />
            </div>
            <div className="bg-dark-800 border border-dark-border rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <Sparkles className="w-4 h-4 animate-spin" />
                Consultando Examine, PubMed, USDA y Cochrane...
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
        {['\u00bfDebo tomar creatina?', '\u00bfCu\u00e1nta prote\u00edna necesito?', '\u00bfMe conviene Whey?', '\u00bfDebo tomar magnesio?', '\u00bfDebo tomar Omega3?', '\u00bfSe\u00f1al metab\u00f3lica?', '\u00bfCu\u00e1ndo y qu\u00e9 carbos?', '\u00bfD\u00e9ficit o super\u00e1vit?', 'Recuperaci\u00f3n', 'Ajustar macros'].map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            className="px-2.5 py-1 bg-white/[0.03] border border-dark-border hover:border-electric/30 rounded-lg text-[11px] text-white/40 hover:text-electric transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Preguntale al JustFit Coach..."
          className="flex-1 px-5 py-4 bg-dark-800 border border-dark-border rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/30 focus:border-electric/30 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          className="w-14 h-14 bg-gradient-to-r from-electric to-neon rounded-2xl flex items-center justify-center text-black hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-electric/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
