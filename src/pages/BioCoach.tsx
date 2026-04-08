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
- Tomala cuando quieras, con la comida, como te quede c\u00f3modo

**\u00bfQu\u00e9 vas a notar?**
- M\u00e1s fuerza en los ejercicios pesados
- Un poquito m\u00e1s de volumen muscular
- Mejor rendimiento en series cortas e intensas

**\u00bfEs segura?** Totalmente. No hay evidencia de da\u00f1o renal en personas sanas. Es de los suplementos m\u00e1s seguros que pod\u00e9s tomar.

\u00bfAlguna otra duda sobre suplemen? \ud83d\udcaa`
  },
  {
    keywords: ['whey', 'proteina suero', 'conviene whey', 'tomar whey'],
    content: `**Whey Protein: \u00bfte conviene o no?**

El whey no es m\u00e1gico. Es prote\u00edna de buena calidad en formato pr\u00e1ctico. La pregunta clave es: **\u00bflleg\u00e1s a comer suficiente prote\u00edna solo con comida?**

**Para tu objetivo ({objetivo}) necesit\u00e1s ~{protReq}g de prote\u00edna por d\u00eda.**

Si con pollo, carne, huevos y l\u00e1cteos ya lleg\u00e1s... el whey no es necesario. Pero si te cuesta, 1-2 scoops por d\u00eda te solucionan.

**Tips:**
- Whey concentrado es m\u00e1s barato y funciona igual
- Fijate que no tenga mucha az\u00facar (menos de 5g por scoop)
- El "cu\u00e1ndo tomarlo" no importa tanto como te dicen
- Para antes de dormir, mejor case\u00edna que se absorbe lento

No te vuelvas loco con las marcas. Que tenga buen perfil de amino\u00e1cidos y listo \ud83e\udd1b`
  },
  {
    keywords: ['proteina', 'cuanta proteina', 'prote\u00edna'],
    content: `**Prote\u00edna: cu\u00e1nta necesit\u00e1s posta**

Con tus datos ({peso} kg, {objetivo}, nivel {nivel}), tu rango ideal es:

**{protKg} gramos por kilo = {protReq}g por d\u00eda**

**\u00bfC\u00f3mo distribuirla?**
- Lo ideal son 4-5 comidas con ~{protToma}g cada una
- No hace falta ser perfecto, pero que cada comida tenga buena prote

**Las mejores fuentes:**
- Huevo entero \u2014 el cl\u00e1sico
- Pechuga de pollo \u2014 31g por cada 100g
- Carne roja \u2014 adem\u00e1s te da hierro y creatina natural
- Pescado \u2014 el salm\u00f3n suma omega-3 de regalo
- L\u00e1cteos \u2014 yogur griego es un golazo
- Legumbres \u2014 combinalas con cereales

**Dato clave:** Si est\u00e1s bajando grasa, sub\u00ed la prote a 2.2g/kg para no perder m\u00fasculo.

\u00bfQuer\u00e9s que te arme un ejemplo? \ud83c\udf57`
  },
  {
    keywords: ['magnesio'],
    content: `**Magnesio: el mineral que casi todos tienen bajo**

Es clave para m\u00e1s de 300 procesos en el cuerpo, y la mayor\u00eda no llega a lo que necesita.

**\u00bfPara qu\u00e9 te sirve?**
- **Dormir mejor** \u2014 lo primero que vas a notar
- Menos calambres y contracturas
- Mejor recuperaci\u00f3n muscular

**\u00bfCu\u00e1l comprar?**
- **Bisglicinato** \u2192 el mejor para dormir, no afloja la panza
- **Citrato** \u2192 buena absorci\u00f3n pero puede ser laxante
- **\u00d3xido** \u2192 olvidate, se absorbe muy poco

**Dosis:** 200-400mg antes de dormir.

**Tambi\u00e9n pod\u00e9s comer m\u00e1s:** semillas de calabaza, almendras, espinaca, chocolate negro.

\u00bfTe interesa saber sobre alg\u00fan otro suplemento? \ud83d\ude34`
  },
  {
    keywords: ['omega', 'omega3', 'aceite pescado', 'fish oil'],
    content: `**Omega-3: el antiinflamatorio natural**

Beneficia a casi todo el mundo, hagas o no deporte.

**\u00bfPara qu\u00e9 sirve?**
- Reduce inflamaci\u00f3n post-entreno (menos dolor muscular)
- Mejora salud cardiovascular
- Ayuda al cerebro y al \u00e1nimo
- Mejora salud articular

**La dosis que funciona:**
- **2 a 3 gramos de EPA+DHA por d\u00eda**
- Tomalo siempre con comida que tenga grasa, as\u00ed se absorbe mejor

**\u00bfComida o suplemento?**
Si com\u00e9s pescado graso 2-3 veces por semana, quiz\u00e1s no necesit\u00e9s suplemento. Si no, las c\u00e1psulas te resuelven.

**Tip:** si la c\u00e1psula tiene olor rancio, tir\u00e1la. Est\u00e1 oxidada.

**\u00bfSos vegetariano?** Omega-3 de algas, te da DHA directo \ud83d\udc1f`
  },
  {
    keywords: ['se\u00f1al metab\u00f3lica', 'metabolica', 'metabolismo'],
    content: `**Se\u00f1al metab\u00f3lica: c\u00f3mo tu cuerpo regula todo**

Tu cuerpo tiene "se\u00f1ales" hormonales que dicen si est\u00e1 todo bien o hay que activar modo ahorro.

**Las hormonas clave:**

**Leptina** (saciedad):
- Cuando hac\u00e9s dieta mucho tiempo, baja \u2192 hambre, cansancio
- Soluci\u00f3n: un d\u00eda de mantenimiento por semana

**Cortisol** (estr\u00e9s):
- Cr\u00f3nicamente alto = perd\u00e9s m\u00fasculo + grasa en la panza
- Se baja durmiendo bien y no pas\u00e1ndote con el entreno

**Insulina** (anab\u00f3lica):
- Mete nutrientes al m\u00fasculo. El ejercicio de fuerza la mantiene bien
- Lo peor: sedentarismo + ultraprocesados

**mTOR** (construir m\u00fasculo):
- Se activa con prote\u00edna y entrenamiento
- Se apaga con d\u00e9ficit excesivo y demasiado cardio

**Tip para vos ({objetivo}):** no hagas d\u00e9ficits de m\u00e1s de 500 kcal, entren\u00e1 fuerza, dorm\u00ed bien y met\u00e9 prote en cada comida \u2728`
  },
  {
    keywords: ['carbo', 'carbohidrato', 'cuando carbos', 'qu\u00e9 carbos', 'ingerir carbos'],
    content: `**Carbohidratos: no son el enemigo**

Primero: **los carbos no engordan**. Lo que engorda es comer m\u00e1s calor\u00edas de las que gast\u00e1s.

**Para vos ({peso} kg, {objetivo}):**
Tu rango ideal: **{carbReq}g por d\u00eda**

**\u00bfCu\u00e1ndo comerlos?**
- **Antes de entrenar:** avena, batata, arroz integral
- **Despu\u00e9s de entrenar:** arroz blanco, banana. Reponen energ\u00eda
- **El resto del d\u00eda:** como quieras

**Los mejores:**
- Avena, batata, arroz integral, quinoa, frutas, legumbres

**Los que conviene evitar:**
- Galletitas, cereales azucarados, bebidas azucaradas, pan blanco industrial

**Si quer\u00e9s bajar de peso:** no elimines carbos, solo reduc\u00edlos un poco y prioriz\u00e1 los buenos \ud83c\udf5a`
  },
  {
    keywords: ['d\u00e9ficit', 'super\u00e1vit', 'deficit', 'superavit', 'como saber'],
    content: `**\u00bfEst\u00e1s en d\u00e9ficit o super\u00e1vit?**

Con tus datos ({peso}kg, {altura}cm, {edad} a\u00f1os):
- Tu cuerpo en reposo gasta: **{tmb} kcal** (TMB)
- Con tu actividad: **{tdee} kcal por d\u00eda** (TDEE)

**La cuenta es simple:**
- Com\u00e9s MENOS que {tdee} = **d\u00e9ficit** = baj\u00e1s
- Com\u00e9s M\u00c1S que {tdee} = **super\u00e1vit** = sub\u00eds

**\u00bfC\u00f3mo saberlo? El m\u00e9todo que funciona:**
1. Pesate todos los d\u00edas en ayunas
2. Sac\u00e1 promedio semanal
3. Compar\u00e1 semana a semana
4. Si baja \u2192 d\u00e9ficit. Si sube \u2192 super\u00e1vit

No te asustes por variaciones diarias de 1-2 kg, es normal (agua, sal, fibra).

**Para tu objetivo ({objetivo}):**
- Hipertrofia: super\u00e1vit chiquito, +200-300 kcal
- Bajar grasa: d\u00e9ficit moderado, -300 a -500 kcal
- Mantener: com\u00e9 en tu TDEE

\u00bfNecesit\u00e1s ayuda para calcular tus comidas? \ud83d\udcca`
  },
  {
    keywords: ['recuperaci\u00f3n', 'recuperacion', 'descanso', 'sobreentrenamiento'],
    content: `**Recuperaci\u00f3n: ac\u00e1 es donde crec\u00e9s**

**No crec\u00e9s entrenando, crec\u00e9s descansando.** El entreno es el est\u00edmulo, la recuperaci\u00f3n es la magia.

**Los 5 pilares:**

**1. Sue\u00f1o (el n\u00famero 1 lejos):**
- 7 a 9 horas de calidad
- Pieza oscura, fr\u00eda, sin celular 30 min antes

**2. Nutrici\u00f3n post-entreno:**
- 30-40g de prote\u00edna despu\u00e9s de entrenar
- Carbohidratos para reponer energ\u00eda

**3. Manejo del estr\u00e9s:**
- Cortisol cr\u00f3nico es tu peor enemigo
- Caminar, meditar, respirar profundo

**4. Deload cada 4-6 semanas:**
- Una semana de bajar el volumen un 40-50%

**5. Suplementos que ayudan:**
- Creatina, magnesio antes de dormir, omega-3

**\u00bfSe\u00f1ales de que te est\u00e1s pasando?** Fuerza estancada, insomnio, lesiones seguidas, cero ganas. Si te pasa, fren\u00e1 una semana \ud83d\udca4`
  },
  {
    keywords: ['macro', 'macros', 'ajustar', 'calcular'],
    content: `**Tus macros calculados**

Con tus datos ({peso}kg, {altura}cm, {edad} a\u00f1os, {objetivo}, {nivel}):

**Los n\u00fameros:**
1. Metabolismo basal (TMB): **{tmb} kcal**
2. Con actividad (TDEE): **{tdee} kcal**
3. Tu objetivo: **{calObj} kcal**

**Distribuci\u00f3n:**
- **Prote\u00edna:** {protReq}g ({protPct}%)
- **Grasas:** {grasaReq}g ({grasaPct}%)
- **Carbohidratos:** {carbReq}g ({carbPct}%)

**\u00bfC\u00f3mo ajustar?**
- No baj\u00e1s de peso en 2 semanas \u2192 sac\u00e1 200 kcal de carbos
- No sub\u00eds \u2192 sum\u00e1 200 kcal
- Perd\u00e9s fuerza en d\u00e9ficit \u2192 sub\u00ed prote a 2.5g/kg
- **Nunca bajes** grasas de 0.5g/kg

Ajust\u00e1 cada 2-3 semanas. No cambies todo de golpe \ud83d\udcdd`
  },
  {
    keywords: ['cafe\u00edna', 'cafeina', 'caf\u00e9', 'cafe', 'pre entreno'],
    content: `**Cafe\u00edna: el mejor pre-entreno natural**

Si hay algo que funciona posta para rendir m\u00e1s entrenando, es la cafe\u00edna. Simple, barata y efectiva.

**Dosis \u00f3ptima para vos ({peso} kg):**
- **3 a 6 mg por kilo** = {cafMin}-{cafMax} mg
- Un caf\u00e9 com\u00fan tiene ~80-100mg. Un espresso doble ~150mg
- Pre-entrenos comerciales tienen 150-300mg

**\u00bfCu\u00e1ndo tomarla?**
- **30-60 minutos antes de entrenar**
- Evitala despu\u00e9s de las 14-15hs si ten\u00e9s problemas para dormir

**\u00bfQu\u00e9 vas a notar?**
- M\u00e1s energ\u00eda y concentraci\u00f3n
- Mejor rendimiento en fuerza y resistencia
- Menos percepci\u00f3n de fatiga

**Tips:**
- No tom\u00e9s todos los d\u00edas la misma dosis, vas a generar tolerancia
- Los d\u00edas de descanso baj\u00e1 la dosis o no tom\u00e9s
- El caf\u00e9 negro funciona igual que un pre-entreno caro

\u00bfTom\u00e1s caf\u00e9 antes de entrenar? \u2615`
  },
  {
    keywords: ['vitamina d', 'vitamina', 'sol'],
    content: `**Vitamina D: el suplemento que casi todos necesitan**

La vitamina D se produce con el sol, pero la mayor\u00eda de la gente no se expone lo suficiente (laburo, invierno, protector solar).

**\u00bfPor qu\u00e9 importa para entrenar?**
- Influye en la testosterona
- Mejora la funci\u00f3n muscular y la fuerza
- Fortalece los huesos
- Mejora el sistema inmune

**Dosis recomendada:**
- **2000 a 4000 UI por d\u00eda**
- Tomala con una comida que tenga grasa (se absorbe mejor)
- Lo ideal es hacerte un an\u00e1lisis de sangre para saber tu nivel

**\u00bfCu\u00e1ndo suplementar?**
- En invierno casi seguro
- Si labur\u00e1s todo el d\u00eda adentro
- Si ten\u00e9s piel oscura (produce menos vitamina D)

Es barata y vale mucho la pena \u2600\ufe0f`
  },
  {
    keywords: ['sue\u00f1o', 'sueno', 'dormir', 'insomnio'],
    content: `**Sue\u00f1o: lo m\u00e1s importante para tus resultados**

Pod\u00e9s tener la mejor rutina y la mejor dieta, pero si dorm\u00eds mal, los resultados van a ser una fracci\u00f3n de lo que podr\u00edan ser.

**\u00bfPor qu\u00e9 es tan importante?**
- La hormona de crecimiento se libera mayormente durmiendo
- Dormir mal = menos m\u00fasculo + m\u00e1s grasa + m\u00e1s hambre
- Afecta la fuerza, la coordinaci\u00f3n y la motivaci\u00f3n

**Tips para dormir mejor:**
- **7 a 9 horas** s\u00ed o s\u00ed
- Pieza **oscura** y **fr\u00eda** (18-20\u00b0C)
- Nada de celular 30 min antes (la luz azul mata la melatonina)
- Cen\u00e1 al menos 2 horas antes de acostarte
- **Magnesio bisglicinato** antes de dormir = game changer
- Horarios fijos: acostarte y levantarte siempre a la misma hora

**Si entren\u00e1s a la ma\u00f1ana temprano**, prioriz\u00e1 acostarte temprano antes que madrugar sin haber dormido bien.

El sue\u00f1o no es negociable \ud83d\ude34`
  },
  {
    keywords: ['grasa', 'bajar de peso', 'adelgazar', 'perder peso', 'quemar grasa', 'definir', 'definici\u00f3n'],
    content: `**Bajar grasa: lo que realmente funciona**

Olvidate de dietas m\u00e1gicas, t\u00e9 verde milagroso y fajas. La \u00fanica forma de bajar grasa es el **d\u00e9ficit cal\u00f3rico sostenido**.

**Para vos ({peso}kg, TDEE: {tdee} kcal):**
- Com\u00e9 entre **{defMin} y {defMax} kcal por d\u00eda**
- Eso es un d\u00e9ficit de 300-500 kcal. Moderado y sostenible.

**Claves que s\u00ed funcionan:**
- **Prote\u00edna alta** (2-2.2g/kg) para no perder m\u00fasculo
- **Entrenamiento de fuerza** \u2014 no solo cardio
- **Paciencia** \u2014 0.5-1% de tu peso por semana es ideal
- **No elimines grupos de alimentos** \u2014 reduc\u00ed porciones
- **Dorm\u00ed bien** \u2014 dormir mal = m\u00e1s hambre + m\u00e1s cortisol

**Lo que NO funciona:**
- Dietas de 800 kcal \u2192 perd\u00e9s m\u00fasculo y despu\u00e9s reboteas
- Solo cardio sin pesas \u2192 el cuerpo se adapta r\u00e1pido
- Suplementos "quema grasa" \u2192 basura marketing

\u00bfQuer\u00e9s que te arme un plan? \ud83d\udd25`
  },
  {
    keywords: ['ganar', 'masa muscular', 'volumen', 'hipertrofia', 'crecer', 'agrandar'],
    content: `**Ganar m\u00fasculo: la gu\u00eda completa**

Para ganar m\u00fasculo necesit\u00e1s 3 cosas: **est\u00edmulo (entreno), nutrientes (comida) y descanso**.

**Para vos ({peso}kg, {objetivo}):**

**1. Entrenamiento:**
- Fuerza 3-5 veces por semana
- Progresi\u00f3n: cada semana un poquito m\u00e1s de peso o reps
- Priorizá los compuestos: sentadilla, press, remo, peso muerto
- RPE 7-8 en la mayor\u00eda de las series (no al fallo siempre)

**2. Nutrici\u00f3n:**
- Super\u00e1vit moderado: **{tdee} + 200-300 = {supMin}-{supMax} kcal/d\u00eda**
- Prote\u00edna: **{protReq}g/d\u00eda** ({protKg}g/kg)
- No hace falta comer "limpio" todo el tiempo, pero s\u00ed priorizar comida real

**3. Descanso:**
- 7-9 horas de sue\u00f1o
- Deload cada 4-6 semanas

**Expectativas reales:**
- Primer a\u00f1o: 5-10 kg de m\u00fasculo posibles
- Segundo a\u00f1o: 2-5 kg
- Despu\u00e9s: 1-2 kg por a\u00f1o

La consistencia le gana a la intensidad \ud83d\udcaa`
  },
  {
    keywords: ['estirar', 'elongar', 'flexibilidad', 'movilidad', 'stretching'],
    content: `**Estiramiento y movilidad: lo justo y necesario**

No hace falta hacer 40 minutos de yoga despu\u00e9s de cada entreno, pero ignorar la movilidad completamente tampoco va.

**\u00bfCu\u00e1ndo estirar?**
- **Antes de entrenar:** movilidad din\u00e1mica (rotaciones, sentadillas sin peso, balanceos). NUNCA estiramiento est\u00e1tico antes de pesas.
- **Despu\u00e9s de entrenar:** ah\u00ed s\u00ed, est\u00e1tico suave 15-30 seg por m\u00fasculo
- **D\u00edas de descanso:** es el mejor momento para laburar flexibilidad

**\u00bfQu\u00e9 priorizar?**
- Cadera (flexores, aductores)
- Hombros (rotaci\u00f3n)
- Tobillos (para sentadilla)
- Columna tor\u00e1cica

**Tips:**
- 5-10 minutos de movilidad antes de entrenar alcanza
- Si algo te duele al estirar, par\u00e1
- Foam roller + pelotita de tenis = combo barato y efectivo

La movilidad es lo que te va a permitir seguir entrenando sin lesiones a largo plazo \ud83e\uddd8`
  },
  {
    keywords: ['agua', 'hidrataci\u00f3n', 'hidratacion', 'tomar agua', 'cuanta agua'],
    content: `**Hidrataci\u00f3n: m\u00e1s simple de lo que parece**

No necesit\u00e1s una app ni cargar una botella de 4 litros a todos lados. Pero s\u00ed prestarle atenci\u00f3n.

**\u00bfCu\u00e1nta agua para vos ({peso} kg)?**
- Como regla general: **~{aguaMin}-{aguaMax} litros por d\u00eda**
- Si entren\u00e1s fuerte, sum\u00e1 500ml por cada hora de ejercicio
- Si hace calor o transpir\u00e1s mucho, m\u00e1s todav\u00eda

**Se\u00f1ales de que te falta agua:**
- Pis amarillo oscuro
- Dolor de cabeza
- Cansancio sin raz\u00f3n
- Rendimiento bajo en el gym

**Tips:**
- Arranc\u00e1 el d\u00eda con un vaso grande de agua
- Llev\u00e1 una botella y tom\u00e1 de a sorbos durante el d\u00eda
- El caf\u00e9 y el mate s\u00ed hidratan (es un mito que deshidratan)
- Frutas y verduras tambi\u00e9n suman l\u00edquido

No es sexy hablar de agua, pero marca una diferencia enorme en el rendimiento \ud83d\udca7`
  },
  {
    keywords: ['lesion', 'lesi\u00f3n', 'dolor', 'duele', 'lastim\u00e9'],
    content: `**\u00bfDolor o lesi\u00f3n? C\u00f3mo diferenciarlo**

Primero lo importante: **si te duele mucho o fue algo agudo, consult\u00e1 con un traumat\u00f3logo o kinesio**. Yo te puedo orientar pero no reemplazo a un profesional de la salud.

**Dolor muscular vs lesi\u00f3n:**
- **DOMS** (dolor post-entreno): aparece 24-72hs despu\u00e9s, es difuso, se va solo. Es normal.
- **Lesi\u00f3n**: dolor agudo, puntual, puede haber inflamaci\u00f3n. Necesita atenci\u00f3n.

**Si es DOMS (agujetas):**
- Mov\u00e9te suave (caminata, bici lenta)
- Dorm\u00ed bien
- Com\u00e9 suficiente prote\u00edna
- En 2-3 d\u00edas pasa

**Para prevenir lesiones:**
- Calentamiento siempre (5-10 min)
- T\u00e9cnica antes que peso
- Progresi\u00f3n gradual (no subas 20 kg de golpe)
- Deload cada 4-6 semanas
- Escuch\u00e1 a tu cuerpo

**Si algo te viene doliendo hace m\u00e1s de una semana, and\u00e1 al m\u00e9dico. No te hagas el valiente.** \ud83c\udfe5`
  },
  {
    keywords: ['mujer', 'femenino', 'mujeres', 'chica', 'embarazo', 'menstruaci\u00f3n'],
    content: `**Entrenamiento femenino: lo que necesit\u00e1s saber**

El entrenamiento para mujeres NO es fundamentalmente diferente al de hombres. Pod\u00e9s y deber\u00edas hacer pesas pesadas sin miedo a "ponerte grande" (no ten\u00e9s la testosterona para eso).

**Mitos que hay que matar:**
- "Las pesas te ponen grande" \u2192 FALSO. Te tonifican y moldean
- "Solo hac\u00e9 cardio" \u2192 FALSO. La fuerza es m\u00e1s efectiva para cambiar el f\u00edsico
- "Com\u00e9 1200 kcal" \u2192 PELIGROSO. Es muy poco para cualquier adulta activa

**Consideraciones espec\u00edficas:**
- Durante la menstruaci\u00f3n pod\u00e9s entrenar normal, solo ajust\u00e1 la intensidad si te sent\u00eds mal
- La fase folicular (d\u00edas 1-14) suele ser mejor para fuerza m\u00e1xima
- La fase l\u00fatea (d\u00edas 15-28) pod\u00e9s sentir m\u00e1s fatiga, est\u00e1 bien bajar un poco

**Prote\u00edna:** mismos rangos que hombres ({protKg}g/kg = {protReq}g/d\u00eda)

**Si est\u00e1s embarazada o en postparto, consult\u00e1 con tu m\u00e9dico antes de entrenar.** \ud83d\udcab`
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
  const cafMin = Math.round(peso * 3);
  const cafMax = Math.round(peso * 6);
  const defMin = tdee - 500;
  const defMax = tdee - 300;
  const supMin = tdee + 200;
  const supMax = tdee + 300;
  const aguaMin = (peso * 0.033).toFixed(1);
  const aguaMax = (peso * 0.04).toFixed(1);

  return content
    .replace(/\{peso\}/g, peso.toString()).replace(/\{altura\}/g, altura.toString()).replace(/\{edad\}/g, edad.toString())
    .replace(/\{objetivo\}/g, objetivo).replace(/\{nivel\}/g, nivel).replace(/\{tmb\}/g, tmb.toString()).replace(/\{tdee\}/g, tdee.toString())
    .replace(/\{calObj\}/g, calObj.toString()).replace(/\{protKg\}/g, protKg.toString()).replace(/\{protReq\}/g, protReq.toString())
    .replace(/\{protToma\}/g, Math.round(protReq / 5).toString()).replace(/\{protCal\}/g, protCal.toString()).replace(/\{protPct\}/g, protPct.toString())
    .replace(/\{grasaReq\}/g, grasaReq.toString()).replace(/\{grasaCal\}/g, grasaCal.toString()).replace(/\{grasaPct\}/g, grasaPct.toString())
    .replace(/\{carbReq\}/g, carbReq.toString()).replace(/\{carbCal\}/g, carbCal.toString()).replace(/\{carbPct\}/g, carbPct.toString())
    .replace(/\{carbKg\}/g, carbKg).replace(/\{cafMin\}/g, cafMin.toString()).replace(/\{cafMax\}/g, cafMax.toString())
    .replace(/\{defMin\}/g, defMin.toString()).replace(/\{defMax\}/g, defMax.toString())
    .replace(/\{supMin\}/g, supMin.toString()).replace(/\{supMax\}/g, supMax.toString())
    .replace(/\{aguaMin\}/g, aguaMin).replace(/\{aguaMax\}/g, aguaMax);
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
- **Suplementos:** creatina, whey, omega-3, magnesio, cafe\u00edna, vitamina D
- **Nutrici\u00f3n:** prote\u00ednas, carbohidratos, macros, d\u00e9ficit/super\u00e1vit
- **Tu cuerpo:** sue\u00f1o, recuperaci\u00f3n, hidrataci\u00f3n, lesiones
- **Objetivos:** bajar grasa, ganar m\u00fasculo, definir
- **Movilidad:** estiramientos, flexibilidad
- **Entrenamiento femenino**

Tu TDEE (lo que gast\u00e1s por d\u00eda): **{tdee} kcal**
Prote\u00edna recomendada: **{protReq}g/d\u00eda**

Preguntame lo que quieras que estoy para ayudarte \ud83d\udcaa`, perfil);
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: `\u00a1Hola! Soy tu **JustFit Coach** \ud83d\udcaa

Estoy ac\u00e1 para ayudarte con todo lo que necesites sobre entrenamiento, nutrici\u00f3n y suplementos.

Pod\u00e9s preguntarme sobre:
- Creatina, whey, omega-3, magnesio, cafe\u00edna
- Cu\u00e1nta prote\u00edna comer y c\u00f3mo distribuirla
- Carbohidratos: cu\u00e1ndo y cu\u00e1les
- C\u00f3mo bajar grasa o ganar m\u00fasculo
- D\u00e9ficit, super\u00e1vit y ajuste de macros
- Sue\u00f1o, recuperaci\u00f3n, hidrataci\u00f3n
- Lesiones y movilidad
- Entrenamiento femenino

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
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: findResponse(query, user?.perfil),
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
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
                <Sparkles className="w-4 h-4 animate-spin" /> Pensando...
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
        {['\u00bfDebo tomar creatina?', '\u00bfCu\u00e1nta prote\u00edna?', '\u00bfMe conviene Whey?', '\u00bfMagnesio?', '\u00bfOmega3?', '\u00bfCafe\u00edna pre-entreno?', '\u00bfCarbos?', '\u00bfD\u00e9ficit o super\u00e1vit?', 'Recuperaci\u00f3n', 'Macros', 'Bajar grasa', 'Ganar m\u00fasculo', 'Sue\u00f1o', 'Hidrataci\u00f3n'].map(s => (
          <button key={s} onClick={() => setInput(s)}
            className="px-2.5 py-1 bg-white/[0.03] border border-dark-border hover:border-electric/30 rounded-lg text-[11px] text-white/40 hover:text-electric transition-all">
            {s}
          </button>
        ))}
      </div>

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
