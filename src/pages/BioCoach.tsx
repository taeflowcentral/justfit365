import { useState, useRef, useEffect } from 'react';
import { Zap, Send, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface KnowledgeEntry {
  keywords: string[];
  content: string;
}

const knowledgeBase: KnowledgeEntry[] = [
  {
    keywords: ['creatina'],
    content: `**Creatina: el suplemento m\u00e1s seguro que existe**

Mir\u00e1, la creatina monohidratada es b\u00e1sicamente lo m\u00e1s estudiado en el mundo de los suplementos. No es magia, pero funciona muy bien.

**Para vos ({peso} kg), la dosis es simple:**
- **3 a 5 gramos por d\u00eda**, todos los d\u00edas, y listo
- No necesit\u00e1s fase de carga (eso es un mito viejo)
- Tomala cuando quieras, con la comida, despu\u00e9s de entrenar, como te quede c\u00f3modo

**\u00bfQu\u00e9 vas a notar?**
- M\u00e1s fuerza en los ejercicios pesados
- Un poquito m\u00e1s de volumen muscular (retiene agua dentro del m\u00fasculo, no hincha)
- Mejor rendimiento en series cortas e intensas
- Incluso ayuda un poco a nivel cerebral

**\u00bfEs segura?** Totalmente. Hay cientos de estudios y no hay evidencia de que haga da\u00f1o renal en personas sanas. Es de los suplementos m\u00e1s seguros que pod\u00e9s tomar, incluso a largo plazo.

\u00bfAlguna otra duda sobre suplemen? \ud83d\udcaa`
  },
  {
    keywords: ['whey', 'proteina suero', 'conviene whey', 'tomar whey'],
    content: `**Whey Protein: \u00bfte conviene o no?**

A ver, el whey no es m\u00e1gico. Es simplemente prote\u00edna de buena calidad en formato pr\u00e1ctico. La pregunta clave es: **\u00bflleg\u00e1s a comer suficiente prote\u00edna solo con comida?**

**Para tu objetivo ({objetivo}) necesit\u00e1s ~{protReq}g de prote\u00edna por d\u00eda.**

Si con pollo, carne, huevos, l\u00e1cteos y legumbres ya lleg\u00e1s... el whey no es necesario. Pero si te cuesta llegar (y a muchos nos pasa), 1-2 scoops por d\u00eda te re solucionan la vida.

**Tips posta:**
- Eleg\u00ed whey concentrado que es m\u00e1s barato y funciona igual (a menos que seas intolerante a la lactosa, ah\u00ed and\u00e1 por aislado)
- Fijate que no tenga mucha az\u00facar agregada (menos de 5g por scoop)
- El "cu\u00e1ndo tomarlo" no importa tanto como te dicen. La ventana anab\u00f3lica es mucho m\u00e1s amplia de lo que se cre\u00eda
- Si quer\u00e9s algo para antes de dormir, mejor case\u00edna que se absorbe lento

No te vuelvas loco con las marcas. Que tenga buen perfil de amino\u00e1cidos y listo. \ud83e\udd1b`
  },
  {
    keywords: ['proteina', 'cuanta proteina', 'prote\u00edna'],
    content: `**Prote\u00edna: cu\u00e1nta necesit\u00e1s posta**

Con tus datos ({peso} kg, {objetivo}, nivel {nivel}), tu rango ideal es:

**{protKg} gramos por kilo = {protReq}g por d\u00eda**

**\u00bfC\u00f3mo distribuirla?**
- Lo ideal son 4-5 comidas con ~{protToma}g de prote\u00edna cada una
- No hace falta ser perfecto, pero trat\u00e1 de que cada comida tenga una buena fuente de prote

**Las mejores fuentes (de mayor a menor calidad):**
- Huevo entero \u2014 el cl\u00e1sico, nunca falla
- Pechuga de pollo \u2014 31g por cada 100g
- Carne roja \u2014 adem\u00e1s te da hierro y creatina natural
- Pescado \u2014 el salm\u00f3n te suma omega-3 de regalo
- L\u00e1cteos \u2014 yogur griego es un golazo
- Legumbres \u2014 ojo que son prote\u00edna incompleta, combinalas con cereales

**Dato importante:** Si est\u00e1s en d\u00e9ficit cal\u00f3rico (queriendo bajar grasa), sub\u00ed la prote\u00edna a 2.2g/kg para no perder m\u00fasculo. Es clave.

\u00bfQuer\u00e9s que te arme un ejemplo de c\u00f3mo llegar a esos gramos en el d\u00eda? \ud83c\udf57`
  },
  {
    keywords: ['magnesio'],
    content: `**Magnesio: el mineral que casi todos tienen bajo**

El magnesio es clave para m\u00e1s de 300 procesos en el cuerpo, y la mayor\u00eda de la gente no llega a la cantidad que necesita.

**\u00bfPara qu\u00e9 te sirve como deportista?**
- **Dormir mejor** \u2014 es lo primero que vas a notar
- Menos calambres y contracturas
- Mejor recuperaci\u00f3n muscular
- Ayuda a mantener la testosterona si ten\u00e9s deficiencia

**\u00bfCu\u00e1l comprar?** Esto es importante:
- **Bisglicinato** \u2192 el mejor para dormir y relajar, no te afloja la panza
- **Citrato** \u2192 buena absorci\u00f3n pero puede ser laxante
- **\u00d3xido** \u2192 olvidate, se absorbe muy poco

**Dosis:** 200-400mg antes de dormir. Vas a notar la diferencia en el sue\u00f1o en pocos d\u00edas.

**Tambi\u00e9n pod\u00e9s comer m\u00e1s:** semillas de calabaza, almendras, espinaca, chocolate negro. Pero generalmente no alcanza solo con la dieta.

\u00bfTe interesa saber sobre alg\u00fan otro suplemento? \ud83d\ude34`
  },
  {
    keywords: ['omega', 'omega3', 'aceite pescado', 'fish oil'],
    content: `**Omega-3: el antiinflamatorio natural**

El omega-3 (EPA y DHA) es uno de esos suplementos que beneficia a casi todo el mundo, hagas o no deporte.

**\u00bfPara qu\u00e9 sirve?**
- Reduce la inflamaci\u00f3n post-entreno (menos dolor muscular)
- Mejora la salud cardiovascular
- Ayuda al cerebro y al estado de \u00e1nimo
- Mejora la salud de las articulaciones

**La dosis que funciona:**
- **2 a 3 gramos de EPA+DHA combinados por d\u00eda** (ojo, no 2g de aceite de pescado, sino de EPA+DHA que est\u00e1 adentro)
- Tomalo siempre con una comida que tenga grasa, as\u00ed se absorbe 3 veces mejor

**\u00bfComida o suplemento?**
Si com\u00e9s pescado graso (salm\u00f3n, caballa, sardinas) 2-3 veces por semana, quiz\u00e1s no necesit\u00e9s suplemento. Si no, las c\u00e1psulas te resuelven.

**Tip:** si la c\u00e1psula tiene olor a pescado rancio, tir\u00e1la. Significa que est\u00e1 oxidada y no sirve.

**\u00bfSos vegetariano/vegano?** Omega-3 de algas, te da DHA directo sin conversi\u00f3n. \ud83d\udc1f`
  },
  {
    keywords: ['se\u00f1al metab\u00f3lica', 'metabolica', 'metabolismo'],
    content: `**Se\u00f1al metab\u00f3lica: c\u00f3mo tu cuerpo regula todo**

Esto es re interesante. Tu cuerpo tiene un sistema de "se\u00f1ales" hormonales que le dicen si est\u00e1 todo bien o si hay que activar modo ahorro.

**Las hormonas que ten\u00e9s que conocer:**

**Leptina** (la de "estoy lleno"):
- La produce la grasa corporal. Cuando baj\u00e1s mucho de peso o hac\u00e9s dieta mucho tiempo, baja un mont\u00f3n
- Resultado: hambre, cansancio, metabolismo m\u00e1s lento
- Soluci\u00f3n: meter un d\u00eda de mantenimiento por semana (refeed)

**Cortisol** (la del estr\u00e9s):
- Si est\u00e1 cr\u00f3nicamente alto = perd\u00e9s m\u00fasculo y acumul\u00e1s grasa en la panza
- Se baja durmiendo bien, meditando, y no pasarte con el entreno

**Insulina** (la anab\u00f3lica):
- Mete nutrientes al m\u00fasculo. El ejercicio de fuerza la mantiene funcionando bien
- Lo peor que pod\u00e9s hacer: sedentarismo + ultraprocesados = resistencia a la insulina

**mTOR** (la de construir m\u00fasculo):
- Se activa con prote\u00edna (especialmente leucina) y entrenamiento
- Se apaga con d\u00e9ficit cal\u00f3rico excesivo y demasiado cardio

**Tip para vos ({objetivo}):** no hagas d\u00e9ficits de m\u00e1s de 500 kcal, entren\u00e1 fuerza, dorm\u00ed bien y met\u00e9 prote\u00edna en cada comida. As\u00ed manten\u00e9s las se\u00f1ales a tu favor. \u2728`
  },
  {
    keywords: ['carbo', 'carbohidrato', 'cuando carbos', 'qu\u00e9 carbos', 'ingerir carbos'],
    content: `**Carbohidratos: no son el enemigo**

Primero lo primero: **los carbos no engordan**. Lo que engorda es comer m\u00e1s calor\u00edas de las que gast\u00e1s, vengan de donde vengan.

**Para vos ({peso} kg, {objetivo}, {nivel}):**
Tu rango ideal: **{carbReq}g por d\u00eda** (~{carbKg}g/kg)

**\u00bfCu\u00e1ndo comerlos?**
- **2-3 horas antes de entrenar:** carbos complejos (avena, batata, arroz integral). Te dan energ\u00eda sostenida
- **Despu\u00e9s de entrenar:** carbos m\u00e1s r\u00e1pidos est\u00e1n bien (arroz blanco, banana). Reponen el gluc\u00f3geno
- **El resto del d\u00eda:** repartilos como quieras

**Los mejores carbos:**
- Avena \u2014 el desayuno cl\u00e1sico del fit
- Batata \u2014 golazo de nutrientes
- Arroz integral \u2014 vers\u00e1til y barato
- Frutas \u2014 nunca le tengas miedo a la fruta
- Legumbres \u2014 carbos + prote\u00edna + fibra, combo genial

**Los que conviene evitar:**
- Galletitas, facturas, cereales azucarados
- Bebidas azucaradas (lo peor que hay)
- Pan blanco industrial todos los d\u00edas

**Si quer\u00e9s bajar de peso:** no necesit\u00e1s eliminar los carbos, solo reducirlos un poco y priorizar los de buena calidad. \ud83c\udf5a`
  },
  {
    keywords: ['d\u00e9ficit', 'super\u00e1vit', 'deficit', 'superavit', 'como saber'],
    content: `**\u00bfEst\u00e1s en d\u00e9ficit o super\u00e1vit? Te lo explico f\u00e1cil**

Con tus datos ({peso}kg, {altura}cm, {edad} a\u00f1os, nivel {nivel}):
- Tu cuerpo en reposo gasta: **{tmb} kcal** (TMB)
- Con tu actividad, gast\u00e1s: **{tdee} kcal por d\u00eda** (TDEE)

**La cuenta es simple:**
- Com\u00e9s MENOS que {tdee} = **d\u00e9ficit** = baj\u00e1s de peso
- Com\u00e9s M\u00c1S que {tdee} = **super\u00e1vit** = sub\u00eds de peso

**\u00bfC\u00f3mo saber en cu\u00e1l est\u00e1s? El m\u00e9todo que funciona:**
1. Pesate todos los d\u00edas en ayunas (s\u00ed, todos)
2. Al final de la semana sac\u00e1 el promedio
3. Compar\u00e1 promedios semana a semana
4. Si baja \u2192 est\u00e1s en d\u00e9ficit. Si sube \u2192 super\u00e1vit

**No te asustes** por las variaciones diarias. Es normal subir 1-2 kg de un d\u00eda al otro por agua, sal, fibra. Lo que importa es la TENDENCIA semanal.

**Se\u00f1ales de que est\u00e1s en d\u00e9ficit:** hambre constante, menos energ\u00eda, fuerza estancada.
**Se\u00f1ales de super\u00e1vit:** fuerza subiendo, buena energ\u00eda, hambre controlada.

**Para tu objetivo ({objetivo}):**
- Hipertrofia: super\u00e1vit chiquito, +200-300 kcal
- Bajar grasa: d\u00e9ficit moderado, -300 a -500 kcal
- Mantener: com\u00e9 en tu TDEE

\u00bfNecesit\u00e1s ayuda para calcular tus comidas? \ud83d\udcca`
  },
  {
    keywords: ['recuperaci\u00f3n', 'recuperacion', 'descanso', 'sobreentrenamiento'],
    content: `**Recuperaci\u00f3n: ac\u00e1 es donde crec\u00e9s**

Esto es algo que mucha gente no entiende: **no crec\u00e9s entrenando, crec\u00e9s descansando**. El entreno es el est\u00edmulo, la recuperaci\u00f3n es donde pasa la magia.

**Los 5 pilares, en orden de importancia:**

**1. Sue\u00f1o (el n\u00famero 1 lejos):**
- 7 a 9 horas de sue\u00f1o de calidad
- La hormona de crecimiento se libera mayormente mientras dorm\u00eds
- Dormir mal = menos s\u00edntesis de prote\u00edna + m\u00e1s cortisol
- Tip: pieza oscura, fr\u00eda (18-20\u00b0C), sin celular 30 min antes

**2. Nutrici\u00f3n post-entreno:**
- 30-40g de prote\u00edna despu\u00e9s de entrenar (no hace falta que sea inmediato, ten\u00e9s varias horas)
- Carbohidratos para reponer energ\u00eda
- Hidrataci\u00f3n: 500ml por cada medio kilo que perd\u00e9s entrenando

**3. Manejo del estr\u00e9s:**
- El cortisol cr\u00f3nico es tu peor enemigo
- Caminar, meditar, respirar profundo... lo que te sirva

**4. Deload cada 4-6 semanas:**
- Una semana de bajar el volumen un 40-50%
- No es "no entrenar", es entrenar m\u00e1s tranqui

**5. Suplementos que ayudan:**
- Creatina (5g/d\u00eda)
- Magnesio antes de dormir
- Omega-3

**\u00bfSe\u00f1ales de que te est\u00e1s pasando?** Rendimiento estancado, insomnio, lesiones seguidas, cero ganas de entrenar. Si te pasa, frena una semana. \ud83d\udca4`
  },
  {
    keywords: ['macro', 'macros', 'ajustar', 'calcular'],
    content: `**Tus macros calculados al detalle**

Dale, te lo armo con tus datos ({peso}kg, {altura}cm, {edad} a\u00f1os, {objetivo}, {nivel}):

**Paso a paso:**
1. Tu metabolismo basal (TMB): **{tmb} kcal**
2. Con tu actividad (TDEE): **{tdee} kcal**
3. Tu objetivo cal\u00f3rico: **{calObj} kcal**

**Distribuci\u00f3n recomendada:**
- **Prote\u00edna:** {protReq}g \u2192 {protCal} kcal ({protPct}%)
- **Grasas:** {grasaReq}g \u2192 {grasaCal} kcal ({grasaPct}%)
- **Carbohidratos:** {carbReq}g \u2192 {carbCal} kcal ({carbPct}%)

**\u00bfC\u00f3mo ajustar?**
- Si no baj\u00e1s de peso en 2 semanas: sac\u00e1 200 kcal de carbos
- Si no sub\u00eds de peso: sum\u00e1 200 kcal (mitad carbos, mitad grasas)
- Si perd\u00e9s fuerza haciendo d\u00e9ficit: sub\u00ed la prote a 2.5g/kg
- **Nunca bajes** las grasas de 0.5g/kg (se te desarman las hormonas)

Ajust\u00e1 cada 2-3 semanas seg\u00fan c\u00f3mo venga la balanza y el espejo. No cambies todo de golpe. \ud83d\udcdd`
  },
];

function personalizeContent(content: string, perfil: { peso: number; altura: number; edad: number; objetivo: string; nivelActividad: string } | undefined): string {
  if (!perfil) return content.replace(/\{[^}]+\}/g, '-');
  const { peso, altura, edad, objetivo, nivelActividad: nivel } = perfil;
  const tmb = Math.round(10 * peso + 6.25 * altura - 5 * edad + 5);
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = Math.round(tmb * (factores[nivel] || 1.55));
  const calObj = objetivo.includes('Hipertrofia') || objetivo.includes('Fuerza') ? tdee + 300 : objetivo.includes('grasa') ? tdee - 400 : tdee;
  const protKg = objetivo.includes('grasa') ? 2.2 : objetivo.includes('Hipertrofia') || objetivo.includes('Fuerza') ? 2.0 : 1.6;
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
    .replace(/\{peso\}/g, peso.toString()).replace(/\{altura\}/g, altura.toString()).replace(/\{edad\}/g, edad.toString())
    .replace(/\{objetivo\}/g, objetivo).replace(/\{nivel\}/g, nivel).replace(/\{tmb\}/g, tmb.toString()).replace(/\{tdee\}/g, tdee.toString())
    .replace(/\{calObj\}/g, calObj.toString()).replace(/\{protKg\}/g, protKg.toString()).replace(/\{protReq\}/g, protReq.toString())
    .replace(/\{protToma\}/g, Math.round(protReq / 5).toString()).replace(/\{protCal\}/g, protCal.toString()).replace(/\{protPct\}/g, protPct.toString())
    .replace(/\{grasaReq\}/g, grasaReq.toString()).replace(/\{grasaCal\}/g, grasaCal.toString()).replace(/\{grasaPct\}/g, grasaPct.toString())
    .replace(/\{carbReq\}/g, carbReq.toString()).replace(/\{carbCal\}/g, carbCal.toString()).replace(/\{carbPct\}/g, carbPct.toString()).replace(/\{carbKg\}/g, carbKg);
}

function findResponse(query: string, perfil: Parameters<typeof personalizeContent>[1]): string {
  const lower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(kwNorm)) score += 10;
      for (const w of kwNorm.split(' ')) {
        if (lower.includes(w) && w.length > 3) score += 3;
      }
    }
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }

  if (bestMatch && bestScore >= 3) {
    return personalizeContent(bestMatch.content, perfil);
  }

  return personalizeContent(`\u00a1Buena pregunta! Mir\u00e1, con tu perfil ({peso}kg, {objetivo}, nivel {nivel}) te puedo ayudar con varias cosas.

Preguntame sobre:
- **Suplementos:** creatina, whey, omega-3, magnesio
- **Nutrici\u00f3n:** prote\u00ednas, carbohidratos, macros
- **Tu cuerpo:** d\u00e9ficit/super\u00e1vit, se\u00f1al metab\u00f3lica, recuperaci\u00f3n

Tu TDEE (lo que gast\u00e1s por d\u00eda): {tdee} kcal
Prote\u00edna recomendada: {protReq}g/d\u00eda

Preguntame lo que quieras que estoy para ayudarte \ud83d\udcaa`, perfil);
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: `\u00a1Hola! Soy tu **JustFit Coach** \ud83d\udcaa

Estoy ac\u00e1 para ayudarte con todo lo que necesites sobre entrenamiento, nutrici\u00f3n y suplementos. Mis respuestas est\u00e1n basadas en la mejor evidencia cient\u00edfica disponible, pero te las cuento como un amigo que sabe del tema.

Pod\u00e9s preguntarme sobre:
- Creatina, whey, omega-3, magnesio
- Cu\u00e1nta prote\u00edna comer y c\u00f3mo distribuirla
- Carbohidratos: cu\u00e1ndo y cu\u00e1les
- C\u00f3mo saber si est\u00e1s en d\u00e9ficit o super\u00e1vit
- Recuperaci\u00f3n y descanso
- Ajuste de macros personalizado

\u00bfEn qu\u00e9 te puedo dar una mano?`,
    timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
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
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: findResponse(query, user?.perfil),
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-electric to-neon rounded-2xl flex items-center justify-center shadow-lg shadow-electric/20">
          <Zap className="w-6 h-6 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">JustFit <span className="text-electric">Coach</span></h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/30 text-xs">Online &middot; Listo para ayudarte</span>
          </div>
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
                Pensando...
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
        {['\u00bfDebo tomar creatina?', '\u00bfCu\u00e1nta prote\u00edna necesito?', '\u00bfMe conviene Whey?', '\u00bfDebo tomar magnesio?', '\u00bfDebo tomar Omega3?', '\u00bfSe\u00f1al metab\u00f3lica?', '\u00bfCu\u00e1ndo y qu\u00e9 carbos?', '\u00bfD\u00e9ficit o super\u00e1vit?', 'Recuperaci\u00f3n', 'Ajustar macros'].map(s => (
          <button key={s} onClick={() => setInput(s)}
            className="px-2.5 py-1 bg-white/[0.03] border border-dark-border hover:border-electric/30 rounded-lg text-[11px] text-white/40 hover:text-electric transition-all">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Preguntame lo que quieras..."
          className="flex-1 px-5 py-4 bg-dark-800 border border-dark-border rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/30 text-sm" />
        <button onClick={sendMessage} disabled={!input.trim() || isTyping}
          className="w-14 h-14 bg-gradient-to-r from-electric to-neon rounded-2xl flex items-center justify-center text-black hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-electric/20 disabled:opacity-30 disabled:cursor-not-allowed">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
