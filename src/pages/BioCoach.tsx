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
    keywords: ['se\u00f1al metab\u00f3lica', 'metabolica', 'metabolismo', 'senal metabolica', 'hormonas'],
    content: `**Senal metabolica: la clave que nadie te explica**

Tu cuerpo NO es una calculadora de calorias. Es un sistema hormonal. Las "senales metabolicas" son las hormonas que le dicen a tu cuerpo si debe quemar grasa, construir musculo o almacenar todo.

**Las 5 hormonas que controlan tu cuerpo:**

**1. Insulina (la llave maestra)**
- Cuando comes carbos/azucar, la insulina SUBE y tu cuerpo entra en modo "almacenamiento"
- Con insulina alta NO PODES quemar grasa (esta bloqueada)
- El ejercicio de fuerza mejora la sensibilidad a la insulina
- Comer proteina + fibra ANTES de los carbos reduce el pico de insulina un 40%
- CLAVE: mantener insulina estable = quemar grasa + tener energia todo el dia

**2. Cortisol (la hormona del estres)**
- Crónicamente alto = pierdes musculo + acumulas grasa abdominal
- Se dispara con: poco sueno, sobreentrenamiento, estres cronico, ayunos excesivos
- Se baja con: dormir 7-9hs, magnesio, caminatas, meditacion, no entrenar mas de 60-75 min

**3. Leptina (saciedad)**
- Cuando haces dieta mucho tiempo, baja y tu cuerpo entra en "modo ahorro"
- Solucion: 1 dia de mantenimiento por semana (refeed) para resetearla
- No es "dia trampa" - es comer al nivel de tu TDEE con carbos limpios

**4. Grelina (hambre)**
- Sube cuando dormis poco o comes muy pocas veces al dia
- Se controla con: proteina en cada comida, fibra, buena hidratacion, sueno

**5. mTOR (construccion muscular)**
- Se activa con proteina (leucina) y entrenamiento de fuerza
- Se apaga con deficit excesivo y demasiado cardio
- Por eso no sirve hacer 2hs de cardio para "quemar" - pierdes musculo

**Como usar las senales a tu favor ({objetivo}):**
- Come proteina en cada comida (activa mTOR, controla grelina)
- Entrena fuerza 3-5x/semana (mejora insulina, activa mTOR)
- Dormi 7-9 horas (baja cortisol, regula leptina)
- No hagas deficit de mas de 500 kcal (protege leptina)
- Evita azucares y harinas (estabiliza insulina)

Tu cuerpo es inteligente. Dale las senales correctas y responde \u2728`
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
    keywords: ['agua', 'hidrataci\u00f3n', 'hidratacion', 'tomar agua', 'cuanta agua', 'beber agua'],
    content: `**Hidrataci\u00f3n: el factor m\u00e1s subestimado del rendimiento** \ud83d\udca7

El agua representa el **60% de tu cuerpo** y el **75% de tus m\u00fasculos**. Una deshidrataci\u00f3n del solo 2% ya baja tu rendimiento un 10-20%.

**\u00bfCu\u00e1nta agua para vos ({peso} kg)?**
- F\u00f3rmula b\u00e1sica: **35ml por kg = ~{aguaMin} litros** como m\u00ednimo
- Si entren\u00e1s: **45-50ml por kg = ~{aguaMax} litros**
- D\u00eda de mucho calor: sum\u00e1 500ml-1L extra
- Por cada hora de ejercicio: 500-750ml adicionales

**Funciones vitales del agua en tu cuerpo:**
1. **Regula la temperatura corporal** (sudoraci\u00f3n)
2. **Transporta nutrientes** a las c\u00e9lulas
3. **Elimina toxinas** v\u00eda ri\u00f1ones e h\u00edgado
4. **Lubrica articulaciones** (clave si entren\u00e1s)
5. **S\u00edntesis proteica** \u2014 el m\u00fasculo necesita agua para crecer
6. **Funci\u00f3n cognitiva** \u2014 con poca agua pens\u00e1s peor
7. **Digesti\u00f3n** y absorci\u00f3n de nutrientes
8. **Volumen sangu\u00edneo** y presi\u00f3n arterial estables
9. **Recuperaci\u00f3n muscular** post-entreno

**Se\u00f1ales de deshidrataci\u00f3n:**
- Pis amarillo oscuro o muy poca cantidad
- Dolor de cabeza o mareo
- Cansancio inexplicable
- Boca seca, sed (cuando ten\u00e9s sed ya estabas deshidratado)
- Calambres musculares
- Rendimiento bajo en el gym

**Tips para hidratarte mejor:**
- **Arranc\u00e1 el d\u00eda con 500ml** apenas te despert\u00e1s
- Llev\u00e1 una **botella** siempre con vos
- Tom\u00e1 antes/durante/despu\u00e9s del entreno
- Si entren\u00e1s >1h, agreg\u00e1 electrolitos (sodio, potasio)
- El **caf\u00e9 y el mate s\u00ed cuentan** (mito que deshidratan)
- Frutas y verduras aportan ~20% de tu hidrataci\u00f3n diaria
- Si no te gusta el agua sola: agreg\u00e1 lim\u00f3n, menta o pepino

**\u00bfCu\u00e1ndo NO tomar mucha agua?**
- Justo antes de dormir (te despert\u00e1s a hacer pis)
- Durante las comidas en exceso (diluye los jugos g\u00e1stricos)
- Excederse cr\u00f3nicamente (>5L/d\u00eda sin actividad puede causar hiponatremia)

**Regla pr\u00e1ctica para vos:**
Tu objetivo es **{aguaMax} litros = {vasos} vasos de 250ml** por d\u00eda. Distribuilos a lo largo del d\u00eda, no todos juntos.

Hidratarte bien es lo m\u00e1s f\u00e1cil que pod\u00e9s hacer para mejorar tu rendimiento, energ\u00eda, recuperaci\u00f3n y hasta tu \u00e1nimo. No lo subestimes \ud83d\udcaa\ud83d\udca7`
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
  {
    keywords: ['sarcopenia', 'perder musculo', 'edad', 'envejecimiento', 'mayor', 'tercera edad', 'adulto mayor'],
    content: `**Sarcopenia: la p\u00e9rdida de m\u00fasculo con la edad**

A partir de los 30 a\u00f1os empezamos a perder m\u00fasculo naturalmente (~3-5% por d\u00e9cada). Despu\u00e9s de los 50 se acelera. Pero la buena noticia es que **se puede frenar y revertir**.

**\u00bfQu\u00e9 la causa?**
- Sedentarismo (el factor n\u00famero 1)
- Poca prote\u00edna en la dieta
- Cambios hormonales (testosterona, hormona de crecimiento)
- Inflamaci\u00f3n cr\u00f3nica

**\u00bfC\u00f3mo combatirla?**
- **Entrenamiento de fuerza 2-4 veces por semana** \u2014 es lo m\u00e1s efectivo que existe. Nunca es tarde para empezar, incluso a los 70-80 a\u00f1os se gana m\u00fasculo
- **Prote\u00edna m\u00e1s alta:** 1.2-1.6g/kg m\u00ednimo. En adultos mayores la s\u00edntesis proteica es menos eficiente, as\u00ed que necesit\u00e1s m\u00e1s
- **Leucina en cada comida:** 3g por toma (carne, l\u00e1cteos, whey)
- **Vitamina D:** fundamental para la funci\u00f3n muscular
- **Creatina:** 3-5g/d\u00eda, tambi\u00e9n funciona excelente en adultos mayores

**Lo importante:** no hace falta levantar 100 kg. Con bandas el\u00e1sticas, mancuernas livianas o m\u00e1quinas ya alcanza. La clave es la **consistencia**.

Si ten\u00e9s m\u00e1s de 50, esto es lo mejor que pod\u00e9s hacer por tu salud \ud83d\udcaa`
  },
  {
    keywords: ['masculino', 'hombre', 'testosterona', 'entrenamiento masculino'],
    content: `**Entrenamiento masculino: optimiz\u00e1 tus resultados**

El entrenamiento para hombres tiene algunas particularidades hormonales que vale la pena conocer.

**Testosterona y entrenamiento:**
- El ejercicio de fuerza con cargas pesadas **aumenta la testosterona** de forma aguda
- Los mejores ejercicios: sentadilla, peso muerto, press banca, dominadas
- Entrenar piernas es clave (los m\u00fasculos grandes generan m\u00e1s respuesta hormonal)

**C\u00f3mo maximizar tu testosterona naturalmente:**
- **Dormir 7-9 horas** (una sola semana durmiendo mal baja la testo un 15%)
- **No hacer d\u00e9ficits extremos** (las dietas muy restrictivas la tiran abajo)
- **Grasas saludables:** no bajes de 0.5g/kg. La testosterona se fabrica a partir del colesterol
- **Zinc** (30mg/d\u00eda) y **magnesio** (400mg/d\u00eda) \u2014 esenciales
- **Vitamina D** (2000-4000 UI)
- **Reducir alcohol** (el alcohol es anti-testosterona)
- **Manejar el estr\u00e9s** (cortisol alto = testosterona baja)

**Para tu perfil ({peso}kg, {objetivo}):**
- Prote\u00edna: {protReq}g/d\u00eda
- Entrenamiento de fuerza como base, cardio como complemento
- No le tengas miedo a los compuestos pesados

**A partir de los 40** la testosterona baja ~1% por a\u00f1o. Todo lo de arriba se vuelve a\u00fan m\u00e1s importante.

\u00bfQuer\u00e9s que armemos un plan? \ud83d\udd25`
  },
  {
    keywords: ['preexistente', 'condicion', 'enfermedad', 'diabetes', 'presi\u00f3n', 'hipertensi\u00f3n', 'coraz\u00f3n', 'cardiaco', 'asma', 'hernia'],
    content: `**Entrenamiento con condiciones preexistentes**

Lo primero y m\u00e1s importante: **siempre consult\u00e1 con tu m\u00e9dico antes de arrancar o modificar tu entrenamiento** si ten\u00e9s alguna condici\u00f3n de salud. Dicho eso, la actividad f\u00edsica es beneficiosa para casi todas las condiciones.

**Diabetes tipo 2:**
- El ejercicio de fuerza mejora la sensibilidad a la insulina (es uno de los mejores "medicamentos")
- Cuidado con la hipoglucemia durante el ejercicio si us\u00e1s insulina
- Ideal: fuerza 3x/semana + caminatas diarias

**Hipertensi\u00f3n:**
- El ejercicio regular BAJA la presi\u00f3n arterial
- Evit\u00e1 la maniobra de Valsalva (aguantar la respiraci\u00f3n haciendo fuerza)
- Mejor series de repeticiones medias-altas (10-15 reps) que m\u00e1ximos pesados
- El cardio moderado es excelente

**Problemas card\u00edacos:**
- SIEMPRE con apto m\u00e9dico y preferiblemente supervisi\u00f3n inicial
- Arrancar suave e ir progresando gradualmente

**Asma:**
- El ejercicio regular mejora la capacidad pulmonar
- Tené el inhalador siempre a mano
- Calentamiento progresivo y largo

**Hernias de disco:**
- Evitar compresi\u00f3n axial pesada (sentadilla con barra alta)
- Fortalecer core con ejercicios de estabilidad (plancha, bird dog)
- El peso muerto con buena t\u00e9cnica puede ser terap\u00e9utico

**Regla de oro:** el ejercicio casi siempre ayuda, pero necesit\u00e1s la gu\u00eda de tu m\u00e9dico para adaptarlo a tu caso \ud83c\udfe5`
  },
  {
    keywords: ['menopausia', 'climaterio', 'hormona femenina', 'estr\u00f3geno'],
    content: `**Menopausia y entrenamiento: tu mejor aliado**

La menopausia trae cambios hormonales importantes (baja el estr\u00f3geno), pero el ejercicio es literalmente lo mejor que pod\u00e9s hacer para atravesarla bien.

**\u00bfQu\u00e9 pasa en la menopausia?**
- P\u00e9rdida de masa muscular acelerada
- P\u00e9rdida de densidad \u00f3sea (riesgo de osteoporosis)
- Tendencia a acumular grasa abdominal
- Cambios de \u00e1nimo y sue\u00f1o

**El entrenamiento de fuerza es NO NEGOCIABLE:**
- **Previene la osteoporosis** \u2014 el hueso se fortalece cuando el m\u00fasculo tira de \u00e9l
- **Frena la p\u00e9rdida muscular** \u2014 sarcopenia se acelera sin estr\u00f3geno
- **Reduce la grasa abdominal** \u2014 m\u00e1s efectivo que solo cardio
- **Mejora el \u00e1nimo** \u2014 libera endorfinas

**Recomendaciones espec\u00edficas:**
- Fuerza **3-4 veces por semana** con cargas progresivas
- Incluir ejercicios de **impacto** (caminata r\u00e1pida, escaleras) para los huesos
- **Prote\u00edna alta:** 1.4-1.6g/kg m\u00ednimo
- **Calcio:** 1000-1200mg/d\u00eda (l\u00e1cteos, br\u00f3coli, almendras)
- **Vitamina D:** 2000-4000 UI/d\u00eda
- **Magnesio:** ayuda con el sue\u00f1o y los calambres

**Lo que no te dicen:** las mujeres post-menop\u00e1usicas que hacen pesas tienen la misma capacidad de ganar fuerza que las j\u00f3venes. Nunca es tarde.

Consult\u00e1 con tu ginec\u00f3loga sobre TRH (terapia de reemplazo hormonal) si los s\u00edntomas son muy fuertes \ud83c\udf3a`
  },
  {
    keywords: ['hipotiroidismo', 'tiroides', 'hashimoto', 'metabolismo lento'],
    content: `**Hipotiroidismo y fitness: se puede, y mucho**

El hipotiroidismo ralentiza el metabolismo, pero eso NO significa que no puedas mejorar tu f\u00edsico. Solo hay que ser m\u00e1s inteligente.

**\u00bfC\u00f3mo afecta el hipotiroidismo?**
- Metabolismo m\u00e1s lento (quem\u00e1s menos calor\u00edas en reposo)
- M\u00e1s cansancio y fatiga
- Tendencia a retener l\u00edquido
- Puede afectar la recuperaci\u00f3n muscular

**Claves para entrenar con hipotiroidismo:**
- **Fuerza 3-4x/semana** \u2014 aumentar masa muscular sube tu metabolismo basal
- **No te mates con el cardio** \u2014 demasiado cardio puede empeorar la fatiga. Mejor caminatas y HIIT corto
- **Calor\u00edas:** tu TDEE real puede ser un 10-15% m\u00e1s bajo que la f\u00f3rmula. Empez\u00e1 con {tdee} kcal y ajust\u00e1 seg\u00fan resultados
- **No hagas d\u00e9ficits agresivos** \u2014 con tiroides lenta, d\u00e9ficits grandes empeoran todo

**Nutrici\u00f3n espec\u00edfica:**
- **Selenio** (2-3 nueces de Brasil por d\u00eda) \u2014 esencial para convertir T4 en T3
- **Zinc y magnesio** \u2014 apoyan la funci\u00f3n tiroidea
- **Evitar exceso de soja y cruciferas crudas** en grandes cantidades
- **Yodo:** no suplementar sin consultar al endocrin\u00f3logo

**Importante:** tom\u00e1 la levotiroxina en ayunas, 30-60 min antes de comer. No la tomes con caf\u00e9 ni suplementos de calcio/hierro.

Con la medicaci\u00f3n bien ajustada y un buen plan, pod\u00e9s tener resultados excelentes \u2728`
  },
  {
    keywords: ['alcohol', 'cerveza', 'vino', 'tomar', 'birra'],
    content: `**Alcohol y fitness: la posta**

No te voy a decir "nunca tomes" porque no es realista. Pero s\u00ed ten\u00e9s que saber c\u00f3mo te afecta.

**\u00bfQu\u00e9 le hace el alcohol a tus resultados?**
- **Baja la s\u00edntesis proteica muscular** hasta un 25% post-entreno
- **Baja la testosterona** y sube el cortisol
- **Son calor\u00edas vac\u00edas** (7 kcal por gramo, casi como la grasa)
- **Arruina el sue\u00f1o** \u2014 parece que dorm\u00eds pero no lleg\u00e1s a sue\u00f1o profundo
- **Deshidrata**

**Si vas a tomar (la versi\u00f3n realista):**
- Que no sea despu\u00e9s de entrenar (ah\u00ed es cuando m\u00e1s da\u00f1o hace)
- Mejor vino tinto o destilados con soda que cerveza (menos calor\u00edas)
- Com\u00e9 bien antes de tomar (prote\u00edna + carbos)
- Hidratate intercalando agua
- Limit\u00e1 a 1-2 consumiciones
- Al d\u00eda siguiente entren\u00e1 igual (aunque sea m\u00e1s suave)

**Las calor\u00edas cuentan:**
- 1 cerveza: ~150 kcal
- 1 copa de vino: ~120 kcal
- 1 fernet con coca: ~250 kcal
- Una salida con 5-6 birras: +800 kcal (un d\u00eda entero de d\u00e9ficit perdido)

**\u00bfSe puede tener buen f\u00edsico y tomar socialmente?** S\u00ed, pero moder\u00e1ndote. Si tu objetivo es serio, menos alcohol = mejores resultados \ud83c\udf7a`
  },
  {
    keywords: ['vegetariano', 'vegano', 'sin carne', 'plant based', 'planta'],
    content: `**Entrenamiento y dieta vegetariana/vegana**

Pod\u00e9s ganar m\u00fasculo y tener un f\u00edsico incre\u00edble siendo vegetariano o vegano. Solo necesit\u00e1s prestar m\u00e1s atenci\u00f3n a algunos nutrientes.

**Prote\u00edna vegetal ({protReq}g/d\u00eda para vos):**
- Las mejores fuentes: soja/tofu (36g/100g), lentejas (9g), garbanzos (9g), quinoa (4g cocida), seitan (75g!)
- **Combin\u00e1 legumbres + cereales** para completar amino\u00e1cidos
- Whey vegano de arvejas + arroz es excelente
- Quiz\u00e1s necesites 10-15% m\u00e1s prote\u00edna que un omn\u00edvoro por menor digestibilidad

**Suplementos clave si sos vegano:**
- **Vitamina B12** \u2014 obligatoria, no la produce ninguna planta
- **Omega-3 de algas** \u2014 para el DHA que no vas a sacar de pescado
- **Hierro** \u2014 monitorear con an\u00e1lisis de sangre
- **Zinc** \u2014 menor absorci\u00f3n de fuentes vegetales
- **Creatina** \u2014 al no comer carne, tus reservas son m\u00e1s bajas. 5g/d\u00eda te va a dar un boost notable
- **Vitamina D** \u2014 si no tom\u00e1s sol suficiente

**Tips pr\u00e1cticos:**
- Tofu revuelto al desayuno = golazo proteico
- Hummus con todo
- Batido de whey vegano + banana + mantequilla de man\u00ed
- Tempeh salteado > tofu com\u00fan (m\u00e1s nutrientes y mejor textura)

Se puede al 100%. Solo necesita un poco m\u00e1s de planificaci\u00f3n \ud83c\udf31`
  },
  {
    keywords: ['intermitente', 'ayuno', 'fasting', 'no desayunar', 'ventana alimentaria', '16 8', '18 6', 'ayuno prolongado'],
    content: `**Ayuno Intermitente: guia completa con ciencia real**

El ayuno intermitente (AI) NO es una dieta. Es un PATRON de alimentacion que alterna ventanas de comida con ventanas de ayuno. La evidencia es solida si se hace bien.

**TIPOS DE AYUNO INTERMITENTE:**

**12:12 (Principiantes)**
- 12 horas comiendo, 12 ayunando
- Ejemplo: cenas a las 20hs, desayunas a las 8hs
- El mas facil. Casi cualquiera puede hacerlo
- Beneficio: activa limpieza celular basica

**16:8 (El mas popular)**
- 16 horas ayuno, 8 horas comiendo
- Ejemplo: comes entre 12 y 20hs. Salteas el desayuno
- Optimo para perdida de grasa + mantener musculo
- Ideal para: personas con sobrepeso, resistencia insulinica

**18:6 (Intermedio)**
- 18 horas ayuno, 6 horas comiendo
- Ejemplo: comes entre 13 y 19hs
- Mayor autofagia y quema de grasa
- Requiere experiencia previa con 16:8

**20:4 (Avanzado - "Warrior Diet")**
- 20 horas ayuno, 4 horas comiendo
- Una comida principal grande + un snack
- NO recomendado para principiantes ni deportistas de fuerza

**OMAD (One Meal A Day)**
- 23 horas ayuno, 1 comida
- Muy dificil llegar a los macros necesarios
- Riesgo de perder musculo. Solo para casos especificos

**5:2 (Ayuno semanal)**
- 5 dias comes normal, 2 dias comes solo 500-600 kcal
- Los dias de ayuno no deben ser consecutivos

**QUE PASA EN TU CUERPO DURANTE EL AYUNO:**

**0-4 horas:** Digestion de la ultima comida. Insulina elevada
**4-8 horas:** Insulina baja. Empieza a usar glucogeno (reservas de azucar)
**8-12 horas:** Glucogeno se agota. Empieza la QUEMA DE GRASA (lipólisis)
**12-16 horas:** Quema de grasa acelerada. Hormona de crecimiento SUBE hasta 5 veces
**16-24 horas:** AUTOFAGIA se activa fuerte. El cuerpo "recicla" celulas danadas
**24-48 horas:** Autofagia maxima. Regeneracion celular profunda. Solo bajo supervision medica

**HORMONA DE CRECIMIENTO (GH):**
- Durante el ayuno de 16+ horas, la GH sube hasta un 500%
- La GH es la hormona de la "juventud": quema grasa, protege musculo, regenera tejidos
- Combinar ayuno + entrenamiento en ayunas = pico maximo de GH
- CUIDADO: romper el ayuno con azucar ANULA el efecto de la GH

**COMO ROMPER EL AYUNO CORRECTAMENTE:**
1. Empezar con agua + limon o caldo de huesos (prepara el estomago)
2. A los 15 min: proteina + grasas saludables (huevos, palta)
3. Evitar carbos simples al romper (nada de pan, jugos, galletitas)
4. El orden importa: proteina primero, vegetales, carbos al final

**DURANTE EL AYUNO PODES TOMAR:**
- Agua (la base)
- Cafe negro sin azucar (acelera la quema de grasa)
- Te verde o te de hierbas
- Agua con sal (electrolitos)
- NO: leche, edulcorantes, jugos, caldos con grasa

**Para tu objetivo ({objetivo}) con {peso}kg:**
- Necesitas {protReq}g de proteina diaria
- En una ventana de 8 horas = 3 comidas de ~{Math.round(parseInt('{protReq}') / 3 || 40)}g de proteina cada una
- Entrenar idealmente al final del ayuno o dentro de la ventana de comida

**BENEFICIOS COMPROBADOS del AI:**
- Mejora sensibilidad a la insulina (clave para perder grasa)
- Reduce inflamacion cronica
- Activa autofagia (limpieza celular)
- Aumenta hormona de crecimiento
- Mejora perfil lipidico (colesterol, trigliceridos)
- Mejora claridad mental y concentracion
- Puede mejorar longevidad (estudios en curso)

Preguntame sobre autofagia o hormona de crecimiento para mas detalle \u23f0`
  },
  {
    keywords: ['autofagia', 'limpieza celular', 'reciclaje celular', 'celulas danadas', 'regeneracion', 'detox real'],
    content: `**Autofagia: el verdadero "detox" que tu cuerpo ya sabe hacer**

Olvidate de jugos detox y te "desintoxicantes". Tu cuerpo tiene un mecanismo REAL de limpieza celular: la AUTOFAGIA (descubierta por Yoshinori Ohsumi, Premio Nobel 2016).

**Que es la autofagia?**
"Auto" = uno mismo. "Fagia" = comer. Literalmente: la celula SE COME a si misma. Pero solo las partes danadas, viejas o disfuncionales. Es un sistema de RECICLAJE CELULAR.

**Que hace exactamente:**
- Elimina proteinas danadas y mal plegadas (basura celular)
- Destruye mitocondrias disfuncionales y genera nuevas
- Elimina patogenos intracelulares (bacterias, virus)
- Recicla componentes celulares para generar energia
- Protege contra enfermedades neurodegenerativas (Alzheimer, Parkinson)
- Efecto anticancerigeno: elimina celulas precancerigenas

**COMO ACTIVAR LA AUTOFAGIA:**

**1. Ayuno (el activador mas potente)**
- La autofagia comienza a las 12-14 horas de ayuno
- Se intensifica fuertemente a las 16-24 horas
- Pico maximo: 24-48 horas (solo bajo supervision medica)
- Por eso el ayuno 16:8 es el minimo para activarla

**2. Ejercicio**
- El ejercicio intenso activa autofagia en el musculo
- Especialmente entrenamiento de fuerza + cardio Zone 2
- Entrenar en ayunas = doble activacion (ayuno + ejercicio)

**3. Restriccion de proteinas (ciclica)**
- 1 dia por semana con proteina baja (<50g) activa autofagia
- NO hacerlo todos los dias (necesitas proteina para el musculo)

**4. Cafe y te verde**
- Los polifenoles del cafe y EGCG del te verde activan autofagia
- Cafe negro sin azucar durante el ayuno: perfecto

**5. Curcuma y resveratrol**
- Ambos activan vias de autofagia (AMPK, SIRT1)

**QUE APAGA LA AUTOFAGIA (evitar durante el ayuno):**
- Cualquier alimento con calorias (incluso un poco de leche en el cafe)
- Azucar o edulcorantes (disparan insulina)
- Aminoacidos/proteina (activan mTOR que FRENA la autofagia)
- Nota: la autofagia y mTOR son OPUESTOS. Uno limpia, el otro construye. Necesitas AMBOS en momentos diferentes

**CICLO OPTIMO SEMANAL:**
- 5-6 dias: comer bien, proteina alta, activar mTOR (construir musculo)
- 1-2 dias: ayuno 16-20hs (activar autofagia, limpiar celulas)
- Es el equilibrio entre CONSTRUIR y LIMPIAR

**Beneficios observados:**
- Piel mas luminosa y joven
- Mejor funcion cognitiva
- Menos inflamacion
- Mejor recuperacion deportiva
- Sistema inmune mas fuerte
- Potencial anti-envejecimiento

La autofagia es gratuita, esta en tu cuerpo y se activa con solo no comer por 16 horas. El mejor "suplemento" que existe \ud83e\uddec`
  },
  {
    keywords: ['hormona crecimiento', 'gh', 'hgh', 'growth hormone', 'rejuvenecer', 'anti envejecimiento', 'anti age'],
    content: `**Hormona de Crecimiento (GH): la hormona de la juventud**

La GH no es solo para crecer de estatura. En adultos es fundamental para: quemar grasa, construir musculo, regenerar tejidos y mantenerte joven.

**Que hace la GH en adultos:**
- Quema grasa (especialmente abdominal) como combustible
- Protege y construye masa muscular
- Regenera piel, tendones, huesos
- Mejora calidad del sueno profundo
- Fortalece sistema inmune
- Mejora densidad osea
- Efecto "anti-aging" medible

**A partir de los 30 anos, la GH baja un 14% por decada.** A los 60 tenes solo un 20% de la GH que tenias a los 20. PERO podes ESTIMULARLA naturalmente.

**LAS 7 FORMAS DE AUMENTAR TU GH NATURALMENTE:**

**1. Ayuno intermitente (la mas potente)**
- 16hs de ayuno = GH sube hasta 500%
- Es el estimulador natural mas potente que existe
- La insulina BAJA la GH. Sin comer = insulina baja = GH alta

**2. Sueno profundo**
- El 75% de la GH se libera durante el sueno profundo (fase 3-4)
- Pico maximo: entre las 23hs y las 2am
- Si dormis mal, tu GH se desploma
- Magnesio + cuarto oscuro + sin pantallas = mas sueno profundo

**3. Entrenamiento de fuerza intenso**
- Series pesadas con descansos cortos (60-90 seg) = pico de GH
- Los ejercicios multiarticulares (sentadilla, peso muerto) son los que mas la estimulan
- Sesiones de 45-60 min son optimas. Mas de 75 min = cortisol sube y anula la GH

**4. Entrenamiento en ayunas**
- Combinar ayuno + entrenamiento = DOBLE estimulo de GH
- Entrenar al final del ayuno (ej: ayunas 16hs, entrenas a las 15hs, comes a las 16hs)

**5. Reducir azucar e insulina**
- Cada pico de insulina SUPRIME la GH
- Mantener glucosa estable = GH alta durante mas tiempo
- La canela de Ceilon ayuda a estabilizar glucosa

**6. Sauna / duchas frias**
- El estres termico (calor o frio) estimula GH
- Sauna: 20 min a 80-100 grados puede duplicar GH
- Ducha fria: 2-3 min al final de la ducha

**7. Suplementos que apoyan la GH:**
- GABA (antes de dormir, 3-5g)
- Arginina + Ornitina (antes de dormir, en ayunas)
- Melatonina (0.5-1mg, mejora sueno profundo = mas GH)
- Glutamina (5g post-entreno)
- Zinc (cofactor para la produccion de GH)

**QUE DESTRUYE LA GH:**
- Comer antes de dormir (la insulina de la cena bloquea el pico nocturno)
- Alcohol (elimina fase de sueno profundo)
- Azucar refinada constante
- Grasa abdominal (a mas grasa visceral, menos GH)
- Estres cronico (cortisol suprime GH)

**Plan practico para maximizar GH:**
- Cenar 3 horas antes de dormir (dejar insulina baja para el pico nocturno)
- Dormir 8 horas en oscuridad total
- Ayuno 16:8 al menos 3 veces por semana
- Entrenar fuerza pesado con descansos cortos
- Minimizar azucar y harinas

No necesitas inyectarte nada. Tu cuerpo produce GH, solo tenes que darle las condiciones correctas \ud83d\ude80`
  },
  {
    keywords: ['ayuno riesgo', 'ayuno peligro', 'quien no ayunar', 'contraindicacion ayuno', 'ayuno edad', 'ayuno mujer'],
    content: `**Ayuno Intermitente: riesgos, edades y contraindicaciones**

El ayuno NO es para todos. Antes de empezar, conoce los riesgos y las contraindicaciones absolutas.

**CONTRAINDICACIONES ABSOLUTAS (NO hacer ayuno):**
- Embarazadas y en periodo de lactancia
- Menores de 18 anos (estan en crecimiento, necesitan nutrientes constantes)
- Personas con diabetes tipo 1 (riesgo de hipoglucemia severa)
- Trastornos alimentarios actuales o pasados (anorexia, bulimia, binge eating)
- Bajo peso o desnutricion (IMC menor a 18.5)
- Medicacion que requiere ingesta con alimentos

**PRECAUCION ESPECIAL (consultar medico primero):**
- Diabetes tipo 2 con medicacion (puede causar hipoglucemia)
- Hipotension arterial
- Enfermedades renales o hepaticas
- Personas mayores de 70 anos (mayor riesgo de sarcopenia)
- Mujeres con amenorrea o trastornos hormonales
- Personas con calculos biliares

**MUJERES Y AYUNO - PRECAUCION ESPECIAL:**
Las mujeres son mas sensibles a las senales de "restriccion". El ayuno excesivo puede:
- Alterar el ciclo menstrual (amenorrea)
- Aumentar cortisol desproporcionadamente
- Afectar la tiroides
- Recomendacion: empezar con 12:12 o 14:10, no directamente 16:8
- Evitar ayunar en la fase lutea (2 semanas antes del periodo)
- Si el periodo se altera, DEJAR el ayuno inmediatamente

**SEGUN LA EDAD:**

**18-30 anos:**
- Pueden hacer 16:8 sin problemas si estan sanos
- Ideal para perder grasa manteniendo musculo
- Si buscan hipertrofia, mejor 4-5 comidas distribuidas (no ayuno)

**30-50 anos:**
- Franja ideal para el ayuno intermitente
- Beneficios metabolicos maximos
- 16:8 es el protocolo recomendado
- 1-2 ayunos de 24hs/mes para autofagia (opcional)

**50-65 anos:**
- Empezar con 12:12 o 14:10
- La proteina es CRITICA - asegurar {protReq}g minimo
- Entrenar fuerza para prevenir sarcopenia
- Consultar medico antes de ayunos de mas de 16 horas

**65+ anos:**
- NO recomendado el ayuno prolongado sin supervision medica
- El riesgo de perder musculo supera los beneficios
- Mejor estrategia: comer bien, mucha proteina, entrenar fuerza
- Si se hace, maximo 12:12

**SENALES DE ALARMA durante el ayuno (parar inmediatamente):**
- Mareos fuertes o vision borrosa
- Temblores
- Confusion mental
- Palpitaciones
- Nauseas intensas
- Debilidad extrema
- Dolor de cabeza severo que no pasa con agua

**COMO EMPEZAR DE FORMA SEGURA:**
1. Semana 1-2: Ayuno 12:12 (solo no comer entre cena y desayuno)
2. Semana 3-4: Ayuno 14:10 (retrasar desayuno 2 horas)
3. Semana 5+: Ayuno 16:8 (si te sentis bien)
4. Nunca saltar directamente a 20:4 o OMAD

El ayuno es una herramienta poderosa, pero como todo lo poderoso, mal usado puede ser peligroso. Escucha a tu cuerpo \u26a0\ufe0f`
  },
  {
    keywords: ['ayuno prolongado', 'ayuno 24', 'ayuno 36', 'ayuno 48', 'ayuno 72', 'ayuno largo', 'ayuno 40 horas', 'ayuno 3 dias', 'ayuno 5 dias', 'ayuno extremo', 'ayuno limite'],
    content: `**Ayunos prolongados (24 a 120 horas): guia completa**

Los ayunos de mas de 24 horas activan mecanismos profundos de regeneracion. Pero tienen riesgos reales y REQUIEREN supervision medica a partir de las 48 horas.

**HORA POR HORA: que pasa en tu cuerpo**

**12-24 horas:**
- Glucogeno hepatico se agota completamente
- Quema de grasa (lipolisis) como fuente principal de energia
- Hormona de crecimiento sube 300-500%
- Autofagia comienza a activarse
- Insulina en minimos historicos
- Claridad mental por produccion de cetonas

**24-36 horas:**
- Autofagia se intensifica significativamente
- El cuerpo entra en cetosis (usa grasa como combustible principal)
- Cetonas cruzan la barrera hematoencefalica = claridad mental notable
- BDNF (factor neurotrofico) sube: regeneracion neuronal
- Inflamacion sistemica cae drasticamente
- Hormona de crecimiento en pico maximo

**36-48 horas:**
- Autofagia en nivel maximo
- Celulas madre comienzan a activarse
- Sistema inmune empieza un proceso de "reseteo"
- El cuerpo se vuelve muy eficiente metabolizando grasa
- Posible sensacion de euforia por cetonas elevadas
- El hambre PARADOJICAMENTE disminuye (las cetonas suprimen grelina)

**48-72 horas:**
- Regeneracion del sistema inmune (las celulas inmunes viejas son destruidas y reemplazadas)
- Valter Longo (USC) demostro que 72hs de ayuno "reinicia" el sistema inmune
- Celulas madre hematopoyeticas se activan
- Maxima regeneracion celular
- Resistencia a la insulina puede revertirse significativamente

**72-120 horas (3-5 dias):**
- El cuerpo funciona casi exclusivamente con cetonas y acidos grasos
- Autofagia profunda: se reciclan proteinas mal plegadas asociadas a enfermedades neurodegenerativas
- Posible regeneracion parcial de celulas beta del pancreas (estudios en ratones, investigacion en humanos en curso)
- Perdida de peso: ~300-500g de grasa real por dia (el resto es agua y glucogeno)
- LIMITE MAXIMO recomendado para personas sin supervision medica continua

**MAS DE 5 DIAS (120+ horas):**
- SOLO bajo supervision medica estricta en clinica especializada
- Existe riesgo real de: arritmia cardiaca, desbalance electrolitico severo, sindrome de realimentacion
- Historicamente se han hecho ayunos de 7, 14, 21 y hasta 40 dias (bajo supervision)
- El caso extremo documentado: Angus Barbieri ayuno 382 dias en 1965-66 (bajo control medico permanente, NO replicable)

**PROTOCOLO SEGURO PARA AYUNOS DE 24-72 HORAS:**

**Preparacion (1-2 dias antes):**
- Reducir carbohidratos gradualmente
- Ultima comida rica en grasas saludables + proteina + vegetales
- Hidratar bien los dias previos

**Durante el ayuno - OBLIGATORIO:**
- Agua: 2-3 litros por dia minimo
- Sal: 1/2 cdta de sal marina en agua, 2-3 veces por dia (CRITICO para evitar mareos)
- Magnesio: 400mg/dia (previene calambres y arritmia)
- Potasio: agua de coco o suplemento (si pasa de 48hs)
- Cafe negro o te verde: permitidos, ayudan a suprimir hambre
- Caldo de huesos: 1 taza si te sentis muy debil (rompe parcialmente el ayuno pero mantiene la cetosis)

**ROMPER EL AYUNO - MAS IMPORTANTE QUE EL AYUNO MISMO:**

Ayuno de 24hs: Romper con comida normal (proteina + vegetales)

Ayuno de 36-48hs:
1. Caldo de huesos tibio (prepara el estomago)
2. Esperar 30 min
3. Comida pequena: 2 huevos + palta o yogur griego
4. Esperar 2 horas
5. Comida normal moderada

Ayuno de 72+ horas - SINDROME DE REALIMENTACION (peligro real):
1. Dia 1 post-ayuno: solo caldos, yogur, huevos blandos, porciones MINIMAS
2. Dia 2: agregar proteinas magras y vegetales cocidos, porciones moderadas
3. Dia 3: comida normal pero controlada
4. NUNCA comer un plato grande de carbohidratos inmediatamente despues de 72+ horas de ayuno. El cambio brusco de electrolitos puede causar arritmia cardiaca

**FRECUENCIA RECOMENDADA:**
- Ayuno 24hs: 1-2 veces por mes (seguro para la mayoria)
- Ayuno 36hs: 1 vez por mes
- Ayuno 48hs: cada 2-3 meses, con experiencia previa
- Ayuno 72hs: 2-4 veces por ano maximo, con supervision
- Ayuno 5+ dias: 1-2 veces por ano maximo, SOLO con medico

**QUIEN NO DEBE HACER AYUNOS PROLONGADOS:**
- Menores de 25 anos
- Mujeres embarazadas o lactando
- Personas con IMC menor a 20
- Diabeticos tipo 1
- Personas con trastornos alimentarios
- Personas con insuficiencia cardiaca o renal
- Sin experiencia previa en ayuno 16:8

**La ciencia es clara:** Los ayunos de 24-72 horas tienen beneficios reales y medibles. Pero mas alla de 72 horas los riesgos aumentan exponencialmente. El punto dulce para la mayoria de las personas es: ayuno 16:8 regular + un ayuno de 24-36hs mensual + un ayuno de 48-72hs trimestral \u26a0\ufe0f`
  },
  {
    keywords: ['rodilla', 'espalda', 'hombro', 'articulaci\u00f3n', 'articular', 'col\u00e1geno'],
    content: `**Salud articular: cuid\u00e1 tus articulaciones**

Las articulaciones son lo que te permite seguir entrenando a largo plazo. Si las destru\u00eds a los 30, a los 50 no pod\u00e9s ni caminar.

**Prevenci\u00f3n:**
- **Calentamiento SIEMPRE** \u2014 5-10 min de movilidad articular antes de cada sesi\u00f3n
- **T\u00e9cnica antes que peso** \u2014 una sentadilla con 40 kg bien hecha le gana a una con 100 kg mal hecha
- **Progresi\u00f3n gradual** \u2014 no subas m\u00e1s del 5-10% de carga por semana
- **Equilibrio muscular** \u2014 no entrenes solo lo que se ve en el espejo. Espalda = tan importante como pecho

**Suplementos para articulaciones:**
- **Col\u00e1geno hidrolizado:** 10-15g/d\u00eda. La evidencia es moderada pero muchos sienten mejora
- **Omega-3:** antiinflamatorio natural (2-3g EPA+DHA/d\u00eda)
- **Vitamina C:** necesaria para la s\u00edntesis de col\u00e1geno
- **Glucosamina + condroitina:** evidencia mixta, pero algunos les va bien

**Problemas comunes:**
- **Rodilla:** si chasquea sin dolor, no pasa nada. Si duele, par\u00e1 y consult\u00e1
- **Hombro:** manguito rotador es fr\u00e1gil. Hac\u00e9 rotaciones externas con banda como prevenci\u00f3n
- **Espalda baja:** fortalecer core y gl\u00fateos. El bird dog y la plancha son tus mejores amigos

Si algo te duele m\u00e1s de una semana, and\u00e1 al traumat\u00f3logo. No te hagas el guapo \ud83e\uddb4`
  },
  {
    keywords: ['ansiedad', 'estr\u00e9s', 'mental', 'depresi\u00f3n', 'emocional', 'cabeza'],
    content: `**Ejercicio y salud mental: m\u00e1s importante de lo que cre\u00e9s**

El ejercicio es uno de los "antidepresivos" naturales m\u00e1s potentes que existen. No es verso, es bioqu\u00edmica pura.

**\u00bfQu\u00e9 pasa cuando entren\u00e1s?**
- Se liberan **endorfinas** (la famosa "droga del corredor")
- Baja el **cortisol** (hormona del estr\u00e9s)
- Aumenta la **serotonina** (regula el \u00e1nimo)
- Mejora la **neuroplasticidad** (tu cerebro funciona mejor)

**Para ansiedad:**
- El ejercicio aer\u00f3bico es excelente (caminar, trotar, bici)
- Yoga y ejercicios de respiraci\u00f3n
- Evit\u00e1 la cafe\u00edna si sos muy ansioso

**Para depresi\u00f3n:**
- El entrenamiento de fuerza tiene evidencia muy fuerte
- La consistencia importa m\u00e1s que la intensidad
- 3-4 sesiones por semana de 30-45 min alcanza

**Para estr\u00e9s cr\u00f3nico:**
- Caminatas al aire libre (la naturaleza potencia el efecto)
- No sobreentrenar (genera m\u00e1s estr\u00e9s)
- Dormir bien es fundamental

**Tips:**
- Los d\u00edas que menos ganas ten\u00e9s son los que m\u00e1s te va a servir ir
- No hace falta sesiones largas ni intensas
- Entrenar con alguien ayuda mucho (compromiso social)
- Si est\u00e1s en un momento dif\u00edcil, **el ejercicio complementa el tratamiento profesional, no lo reemplaza**

Tu cuerpo y tu cabeza est\u00e1n conectados. Mov\u00e9 el cuerpo y la cabeza mejora \ud83e\udde0`
  },
  {
    keywords: ['correr', 'running', 'carrera', 'marat\u00f3n', 'trote', 'aerobico', 'aer\u00f3bico'],
    content: `**Running y entrenamiento aer\u00f3bico**

Correr est\u00e1 muy bien, pero hay algunas cosas que necesit\u00e1s saber para no lastimarte y sacarle el m\u00e1ximo jugo.

**Si reci\u00e9n arranc\u00e1s:**
- Empez\u00e1 caminando r\u00e1pido, no corriendo
- Programa tipo: 1 min trote / 2 min caminata, repetir 20 min
- Cada semana sum\u00e1 un poquito m\u00e1s de trote
- Zapatillas buenas (no escatimes ac\u00e1, es inversi\u00f3n en tus rodillas)

**Si ya corr\u00e9s:**
- No aumentes m\u00e1s del 10% de km por semana
- Incluí un d\u00eda de series/intervalos y un d\u00eda de fondo largo
- **Sumá fuerza de piernas** (sentadilla, zancadas) \u2014 reduce lesiones un 50%

**\u00bfCorrer para bajar de peso?**
- Funciona pero no es lo m\u00e1s eficiente solo
- Ideal: fuerza 3x + correr 2-3x por semana
- Si solo corr\u00e9s, tu cuerpo se adapta r\u00e1pido y cada vez quem\u00e1s menos

**Nutrici\u00f3n para runners:**
- Carbohidratos son tu combustible principal
- Si corr\u00e9s m\u00e1s de 60 min, necesit\u00e1s reponer electrolitos
- Prote\u00edna sigue siendo importante para reparar el tejido

**Calzado:** es lo m\u00e1s importante. And\u00e1 a una tienda especializada y que te analicen la pisada.

\u00bfCu\u00e1nto est\u00e1s corriendo? Te puedo orientar \ud83c\udfc3`
  },
  {
    keywords: ['colesterol', 'triglic\u00e9ridos', 'cardiovascular', 'coraz\u00f3n'],
    content: `**Colesterol, triglic\u00e9ridos y salud cardiovascular**

El ejercicio es una de las mejores "medicinas" para el coraz\u00f3n. Ac\u00e1 te explico c\u00f3mo impacta.

**\u00bfQu\u00e9 mejora el ejercicio?**
- **Sube el HDL** (colesterol "bueno") \u2014 el aer\u00f3bico es el m\u00e1s efectivo para esto
- **Baja los triglic\u00e9ridos** \u2014 tanto fuerza como cardio ayudan
- **Baja la presi\u00f3n arterial** \u2014 30 min de caminata diaria ya marca diferencia
- **Mejora la sensibilidad a la insulina**

**Nutrici\u00f3n cardiovascular:**
- **Omega-3** (2-3g EPA+DHA/d\u00eda) \u2014 baja triglic\u00e9ridos significativamente
- **Fibra** (30g/d\u00eda) \u2014 avena, legumbres, frutas, verduras
- **Reducir grasas trans** \u2014 nada de margarina, galletitas industriales
- **Reducir alcohol y az\u00facar** \u2014 son los principales causantes de triglic\u00e9ridos altos
- **Frutos secos** \u2014 un pu\u00f1ado de nueces por d\u00eda

**Entrenamiento recomendado:**
- Aer\u00f3bico moderado: 150 min/semana (caminar r\u00e1pido, bici, nadar)
- Fuerza: 2-3x/semana
- Si ten\u00e9s problema card\u00edaco diagnosticado, siempre con apto m\u00e9dico

**Los huevos NO suben el colesterol** (es un mito viejo). Pod\u00e9s comer 2-3 por d\u00eda tranquilo.

Hac\u00e9te un chequeo card\u00edaco anual, sobre todo despu\u00e9s de los 40 \u2764\ufe0f`
  },
  {
    keywords: ['gl\u00fateo', 'gluteo', 'cola', 'pompa', 'trasero'],
    content: `**Gl\u00fateos: la gu\u00eda completa para entrenarlos**

Los gl\u00fateos son el m\u00fasculo m\u00e1s grande del cuerpo y uno de los m\u00e1s importantes para el rendimiento y la est\u00e9tica.

**Los mejores ejercicios (de mayor a menor activaci\u00f3n):**
1. **Hip Thrust** \u2014 el rey del gl\u00fateo. Nada lo supera.
2. **Sentadilla profunda** \u2014 pasando el paralelo activa mucho m\u00e1s gl\u00fateo
3. **Peso muerto rumano** \u2014 gl\u00fateo + isquio
4. **Sentadilla b\u00falgara** \u2014 unilateral, excelente
5. **Zancadas** \u2014 paso largo = m\u00e1s gl\u00fateo
6. **Puente de gl\u00fateo** \u2014 ideal para activar antes de entrenar
7. **Patada en polea / m\u00e1quina** \u2014 buen complemento

**Frecuencia ideal:**
- **2-3 veces por semana** con 48hs de descanso entre sesiones
- 12-20 series totales por semana para gl\u00fateos

**Claves que la mayor\u00eda ignora:**
- **Conexi\u00f3n mente-m\u00fasculo** \u2014 sent\u00ed el gl\u00fateo trabajar, no solo mover peso
- **Rango completo** \u2014 media sentadilla = medio resultado
- **Variedad de rangos:** series pesadas (6-8 reps) + series livianas (15-20 reps)
- **Comer suficiente** \u2014 para que crezcan necesitan calor\u00edas y prote\u00edna

**Mito:** las sentadillas solas alcanzan para gl\u00fateos. FALSO. El hip thrust activa mucho m\u00e1s gl\u00fateo que la sentadilla. Necesit\u00e1s ambos.

\u00bfQuer\u00e9s una rutina espec\u00edfica? \ud83c\udf51`
  },
  {
    keywords: ['abdomen', 'abdominal', 'abs', 'panza', 'six pack', 'core'],
    content: `**Abdominales: la verdad que nadie quiere escuchar**

Los abdominales se hacen en la **cocina**, no en el gym. Pod\u00e9s hacer 1000 crunches por d\u00eda, pero si ten\u00e9s grasa encima no se van a ver.

**Para que se vean los abs necesit\u00e1s:**
- Hombres: ~12-15% de grasa corporal
- Mujeres: ~18-22% de grasa corporal
- Eso se logra con **d\u00e9ficit cal\u00f3rico sostenido** y paciencia

**Los mejores ejercicios de core (no solo "abdominales"):**
- **Plancha** \u2014 30-60 seg, 3 series. Si aguant\u00e1s m\u00e1s de 60 seg, agreg\u00e1 peso o hacela inestable
- **Ab wheel / rueda abdominal** \u2014 brutal para el recto abdominal
- **Pallof press** \u2014 anti-rotaci\u00f3n, excelente para oblicuos
- **Elevaci\u00f3n de piernas colgado** \u2014 el m\u00e1s dif\u00edcil pero el m\u00e1s efectivo
- **Farmer walk** \u2014 core a full sin hacer un solo crunch

**Lo que NO necesit\u00e1s:**
- Hacer abs todos los d\u00edas (2-3 veces por semana alcanza)
- Crunches infinitos (son poco efectivos y pueden joder la espalda)
- Aparatos de TV de abs (basura total)

**La posta:** entren\u00e1 con compuestos pesados (sentadilla, peso muerto, press), com\u00e9 en d\u00e9ficit, y los abs aparecen solos. 3-4 series de core al final de cada entreno es m\u00e1s que suficiente.

Paciencia y consistencia \ud83d\udcaf`
  },
  {
    keywords: ['principiante', 'empezar', 'primer', 'arrancar', 'novato', 'nuevo'],
    content: `**\u00bfReci\u00e9n arranc\u00e1s? Esto es todo lo que necesit\u00e1s saber**

Bienvenido/a al mundo del entrenamiento. La buena noticia: los principiantes son los que m\u00e1s r\u00e1pido progresan. La mala: hay mucha desinformaci\u00f3n.

**Primeras semanas (semana 1-4):**
- **3 d\u00edas por semana** de cuerpo completo (full body)
- **Aprend\u00e9 la t\u00e9cnica** con poco peso o solo el cuerpo
- Ejercicios b\u00e1sicos: sentadilla, press banca, remo, peso muerto, press hombro
- **2-3 series de 10-12 reps** de cada ejercicio
- Descanso de 1 d\u00eda entre sesiones

**Nutrici\u00f3n b\u00e1sica:**
- Com\u00e9 comida real (no hace falta suplementos todav\u00eda)
- Prote\u00edna en cada comida ({protReq}g/d\u00eda es tu objetivo)
- Tom\u00e1 agua suficiente
- No hagas dietas extremas al principio

**Errores cl\u00e1sicos del principiante:**
- Querer entrenar 6 d\u00edas por semana (vas a quemarte)
- Usar mucho peso con mala t\u00e9cnica (vas a lesionarte)
- Solo hacer cardio o solo hacer b\u00edceps
- Cambiar de rutina cada semana (dale tiempo a cada programa)
- Compararte con gente que lleva a\u00f1os entrenando

**Lo m\u00e1s importante:** **la consistencia le gana a la intensidad**. Mejor ir 3 veces por semana todo el a\u00f1o que ir 6 veces por semana y abandonar al mes.

Los primeros 6 meses vas a ver los cambios m\u00e1s grandes de tu vida. Aprovechalos \ud83d\ude80`
  },
  {
    keywords: ['meseta', 'estancado', 'estancamiento', 'no progreso', 'plateau', 'no avanzo'],
    content: `**\u00bfEstancado? C\u00f3mo romper la meseta**

Todos nos estancamos en alg\u00fan momento. Es normal y tiene soluci\u00f3n.

**Meseta en FUERZA (no sube el peso):**
- \u00bfEst\u00e1s comiendo suficiente? Sin calor\u00edas no hay fuerza nueva
- \u00bfDorm\u00eds bien? La fuerza se construye durmiendo
- Prob\u00e1 cambiar el esquema de series/reps (si hac\u00edas 3x8, prob\u00e1 5x5)
- Met\u00e9 una semana de deload y volv\u00e9 fresco
- Agreg\u00e1 ejercicios accesorios para el punto d\u00e9bil

**Meseta en PESO (no baj\u00e1s m\u00e1s):**
- Tu cuerpo se adapt\u00f3 al d\u00e9ficit. Opciones:
  1. Refeed: 1-2 d\u00edas comiendo en mantenimiento ({tdee} kcal)
  2. Diet break: 1-2 semanas comiendo en mantenimiento y despu\u00e9s retom\u00e1s
  3. Reducir 100-200 kcal m\u00e1s (pero ojo, no bajar de {defMin} kcal)
- \u00bfEst\u00e1s contando bien las calor\u00edas? El error m\u00e1s com\u00fan es subestimar lo que com\u00e9s

**Meseta en M\u00daSCULO (no crec\u00e9s):**
- Sub\u00ed el volumen de entrenamiento (m\u00e1s series por m\u00fasculo por semana)
- \u00bfCom\u00e9s suficiente? Para crecer necesit\u00e1s super\u00e1vit ({supMin}-{supMax} kcal)
- Prob\u00e1 t\u00e9cnicas de intensidad: drop sets, rest-pause, superseries
- Cambi\u00e1 la selecci\u00f3n de ejercicios (mismos m\u00fasculos, diferentes \u00e1ngulos)

**Regla de oro:** antes de cambiar todo, preguntate si est\u00e1s haciendo bien lo b\u00e1sico (comer, dormir, entrenar consistentemente).

La meseta es temporal. La consistencia la rompe siempre \ud83d\udcaa`
  },
  {
    keywords: ['suplemento', 'suplemen', 'que tomar', 'stack', 'basico'],
    content: `**Suplementos: gu\u00eda de prioridades**

Hay miles de suplementos en el mercado, pero la verdad es que solo unos pocos valen la pena. Ac\u00e1 van en orden de importancia:

**Tier 1 \u2014 Los que funcionan posta:**
- **Creatina monohidratada** (3-5g/d\u00eda) \u2014 fuerza y masa muscular
- **Prote\u00edna en polvo** (whey/case\u00edna) \u2014 solo si no lleg\u00e1s con la comida
- **Cafe\u00edna** ({cafMin}-{cafMax}mg pre-entreno) \u2014 rendimiento comprobado

**Tier 2 \u2014 Muy \u00fatiles seg\u00fan el caso:**
- **Omega-3** (2-3g EPA+DHA) \u2014 antiinflamatorio
- **Vitamina D** (2000-4000 UI) \u2014 si no tom\u00e1s sol
- **Magnesio** (200-400mg) \u2014 sue\u00f1o y recuperaci\u00f3n

**Tier 3 \u2014 Opcionales:**
- Col\u00e1geno hidrolizado \u2014 articulaciones
- Zinc \u2014 si no com\u00e9s mucha carne roja
- Multivitam\u00ednico \u2014 "seguro" pero mejor comer bien

**Tier BASURA \u2014 Ahorrá la plata:**
- Quemadores de grasa \u2014 no funcionan
- BCAAs \u2014 si ya tom\u00e1s whey, son redundantes
- Glutamina \u2014 innecesaria si com\u00e9s bien
- Pre-entrenos con 50 ingredientes \u2014 pag\u00e1s branding, no resultados
- Tribulus terrestris / ZMA mega / "test boosters" \u2014 humo total

**Mi recomendaci\u00f3n para arrancar:** creatina + vitamina D + magnesio. Con eso est\u00e1s cubierto. El resto es opcional.

\u00bfQuer\u00e9s que profundice en alguno? \ud83d\udc8a`
  },
  {
    keywords: ['colageno', 'col\u00e1geno', 'colageno hidrolizado', 'articulaciones piel', 'rejuvenecer'],
    content: `**Col\u00e1geno Hidrolizado: mucho m\u00e1s que est\u00e9tica**

El col\u00e1geno es la prote\u00edna m\u00e1s abundante del cuerpo. Despu\u00e9s de los 25 a\u00f1os, la producci\u00f3n natural baja un 1-1.5% por a\u00f1o. A los 40, ya perdiste un 20-30%.

**\u00bfPara qu\u00e9 sirve?**
- **Articulaciones**: reduce dolor articular en deportistas (estudios con 10g/d\u00eda x 24 semanas)
- **Tendones y ligamentos**: mejora la s\u00edntesis de tejido conectivo
- **Piel**: mejora hidrataci\u00f3n y elasticidad (visible en 4-8 semanas)
- **Huesos**: estimula osteoblastos (c\u00e9lulas que forman hueso)
- **Intestino**: ayuda a reparar la mucosa intestinal

**Tipos de col\u00e1geno:**
- **Tipo I**: piel, tendones, huesos (el m\u00e1s com\u00fan, 90% del cuerpo)
- **Tipo II**: cart\u00edlago articular (ideal para articulaciones)
- **Tipo III**: piel, vasos sangu\u00edneos, \u00f3rganos

**Dosis recomendada:** 10-15g por d\u00eda de col\u00e1geno hidrolizado (p\u00e9ptidos)

**Tip clave:** Tom\u00e1 el col\u00e1geno con **vitamina C** (un kiwi, naranja o suplemento de 500mg). La vitamina C es esencial para que tu cuerpo sintetice col\u00e1geno nuevo. Sin ella, no funciona igual.

**Marcas recomendadas en Argentina:**
- **Genacol** (canadiense, muy estudiado)
- **Nutrilab Col\u00e1geno** (buena relaci\u00f3n precio/calidad)
- **Vital Proteins** (premium, si lo consegu\u00eds)
- **Sports Research** (importado, excelente calidad)
- **Great Lakes / Now Foods** (opciones importadas confiables)

**Cu\u00e1ndo tomarlo:** En ayunas o entre comidas para mejor absorci\u00f3n. Muchos lo toman con el caf\u00e9 de la ma\u00f1ana.

**\u00bfCu\u00e1nto tarda en hacer efecto?**
- Articulaciones: 8-12 semanas
- Piel: 4-8 semanas
- Es acumulativo, la constancia es clave \ud83d\udcaa`
  },
  {
    keywords: ['omega 3 tipo', 'omega tipo', 'epa', 'dha', 'aceite krill', 'omega marcas'],
    content: `**Omega-3: la gu\u00eda completa de tipos y marcas**

No todos los Omega-3 son iguales. Lo que necesit\u00e1s son **EPA y DHA**, los \u00e1cidos grasos de cadena larga.

**Tipos de Omega-3:**
- **EPA (Eicosapentaenoico)**: antiinflamatorio potente, ideal post-entreno, mejora recuperaci\u00f3n
- **DHA (Docosahexaenoico)**: cerebro, retina, sistema nervioso. Fundamental para funci\u00f3n cognitiva
- **ALA (Alfa-linol\u00e9nico)**: de fuentes vegetales (l\u00ednaza, ch\u00eda). La conversi\u00f3n a EPA/DHA es solo 5-10%, no alcanza

**Dosis recomendada:** 2-3g de EPA+DHA combinados por d\u00eda

**Fuentes de Omega-3 en la dieta:**
- Salm\u00f3n, caballa, sardinas, at\u00fan (2-3 porciones/semana)
- Semillas de ch\u00eda y l\u00ednaza (ALA, complementario)
- Nueces (ALA)

**Aceite de Krill vs Aceite de Pescado:**
- **Krill**: mejor absorci\u00f3n (forma fosfolip\u00eddica), incluye astaxantina (antioxidante), m\u00e1s caro
- **Pescado**: m\u00e1s concentrado en EPA/DHA por c\u00e1psula, m\u00e1s econ\u00f3mico
- Ambos funcionan, el krill es superior pero no indispensable

**Marcas recomendadas:**
- **Nordic Naturals** (est\u00e1ndar de oro, certificaci\u00f3n IFOS)
- **NOW Foods Ultra Omega-3** (excelente relaci\u00f3n precio/calidad)
- **Sports Research Triple Strength** (alta concentraci\u00f3n)
- **Garden of Life** (si prefer\u00eds fuente vegana de algas)
- **Carlson Labs** (noruego, altamente purificado)

**Beneficios comprobados:**
- Reduce inflamaci\u00f3n sist\u00e9mica
- Mejora perfil lip\u00eddico (triglic\u00e9ridos)
- Protecci\u00f3n cardiovascular
- Mejor recuperaci\u00f3n muscular post-entreno
- Salud cerebral y estado de \u00e1nimo

**Tip:** Elegir aceites con certificaci\u00f3n **IFOS** o **Friend of the Sea** garantiza pureza y bajo contenido de metales pesados \ud83d\udc1f`
  },
  {
    keywords: ['magnesio tipo', 'magnesio cual', 'magnesio marca', 'tipos magnesio', 'magnesio mejor'],
    content: `**Magnesio: los 7 tipos y cu\u00e1l elegir**

El 70% de la poblaci\u00f3n tiene deficiencia de magnesio. Si entren\u00e1s, es peor porque lo perd\u00e9s por el sudor.

**Tipos de Magnesio y para qu\u00e9 sirve cada uno:**

1. **Citrato de Magnesio** \u2014 El m\u00e1s vers\u00e1til
   - Buena absorci\u00f3n, accesible
   - Ideal para: calambres, estre\u00f1imiento, uso general
   - Dosis: 400-600mg/d\u00eda

2. **Bisglicinato (Glicinato)** \u2014 El mejor para dormir
   - M\u00e1xima absorci\u00f3n, no causa efecto laxante
   - Ideal para: sue\u00f1o, ansiedad, recuperaci\u00f3n nocturna
   - La glicina tiene efecto calmante extra

3. **L-Treonato** \u2014 El cerebral
   - \u00danico que cruza la barrera hematoencef\u00e1lica
   - Ideal para: funci\u00f3n cognitiva, memoria, concentraci\u00f3n
   - M\u00e1s caro pero \u00fanico en su tipo

4. **Taurato** \u2014 El card\u00edaco
   - Combinaci\u00f3n con taurina
   - Ideal para: salud cardiovascular, presi\u00f3n arterial

5. **Malato** \u2014 El energ\u00e9tico
   - Con \u00e1cido m\u00e1lico (ciclo de Krebs)
   - Ideal para: energ\u00eda, fibromialgia, fatiga cr\u00f3nica

6. **\u00d3xido de Magnesio** \u2014 El PEOR para suplementar
   - Solo 4% de absorci\u00f3n. Es b\u00e1sicamente un laxante
   - Evitarlo como suplemento nutricional

7. **Cloruro de Magnesio** \u2014 Popular en Argentina
   - Absorci\u00f3n moderada, muy accesible
   - Funciona bien para uso general

**Marcas recomendadas:**
- **NOW Foods** (glicinato, citrato - econ\u00f3mico y confiable)
- **Doctor's Best** (bisglicinato de alta absorci\u00f3n)
- **Life Extension** (treonato para cognici\u00f3n)
- **Natural Calm** (citrato en polvo, pr\u00e1ctico)

**Mi recomendaci\u00f3n:** Bisglicinato antes de dormir (400mg). Vas a dormir mejor, recuperar m\u00e1s r\u00e1pido y reducir calambres \ud83c\udf19`
  },
  {
    keywords: ['harina', 'harinas', 'azucar', 'az\u00facar', 'az\u00facares', 'refinado', 'procesado', 'ultraprocesado', 'gluten eliminr'],
    content: `**Harinas y Az\u00facares: por qu\u00e9 son el enemigo silencioso**

Esto no es un capricho fitness. La ciencia es clara: las harinas refinadas y az\u00facares agregados son los principales responsables de la epidemia de obesidad, diabetes tipo 2 e inflamaci\u00f3n cr\u00f3nica.

**\u00bfQu\u00e9 pasa cuando com\u00e9s harina refinada o az\u00facar?**
1. **Pico de glucosa** \u2192 El p\u00e1ncreas libera insulina masivamente
2. **Ca\u00edda brusca** \u2192 Hipoglucemia reactiva (cansancio, hambre, irritabilidad)
3. **Ciclo vicioso** \u2192 Tu cuerpo pide m\u00e1s az\u00facar para compensar
4. **Inflamaci\u00f3n cr\u00f3nica** \u2192 Retenci\u00f3n de l\u00edquidos, dolor articular, fatiga
5. **Resistencia a la insulina** \u2192 Tu cuerpo almacena grasa m\u00e1s f\u00e1cilmente

**Los peores alimentos (elimin\u00e1 estos primero):**
- Pan blanco, galletitas, facturas, medialunas
- Gaseosas y jugos (hasta los "light" disparan insulina)
- Fideos y pastas de harina blanca
- Cereales de desayuno azucarados
- Salsas comerciales (ketchup, BBQ \u2014 llenas de az\u00facar oculto)
- Golosinas, helados, postres industriales

**Reemplazos inteligentes:**
- Pan blanco \u2192 **Pan de masa madre** o **pan de centeno**
- Fideos \u2192 **Fideos de lentejas** o **zucchini spiralizado**
- Az\u00facar \u2192 **Stevia**, eritritol o monk fruit
- Gaseosas \u2192 **Agua con gas + lim\u00f3n**
- Snacks \u2192 **Frutos secos**, queso, huevo duro

**No es necesario eliminar el 100%.** La regla 80/20 funciona: com\u00e9 limpio el 80% del tiempo y permit\u00edte un 20% flexible. Pero ese 80% tiene que ser real.

**Dato clave:** Una persona promedio consume 70kg de az\u00facar por a\u00f1o. Reducir a menos de 25g/d\u00eda (6 cucharaditas) reduce riesgo cardiovascular un 30% seg\u00fan la OMS.

Para tu objetivo ({objetivo}), eliminar harinas y az\u00facares es probablemente el cambio m\u00e1s impactante que pod\u00e9s hacer \ud83d\udca5`
  },
  {
    keywords: ['alimentacion objetivo', 'como alimentarme', 'dieta objetivo', 'que comer para', 'alimentaci\u00f3n seg\u00fan', 'plan segun objetivo'],
    content: `**C\u00f3mo alimentarte seg\u00fan tu objetivo ({objetivo})**

Tu TDEE es ~{tdee} kcal y necesit\u00e1s ~{protReq}g de prote\u00edna. Ahora, \u00bfc\u00f3mo estructurar tus comidas?

**Reglas universales (aplican a TODOS los objetivos):**
1. **Prote\u00edna en cada comida** \u2014 No la dejes para una sola vez
2. **Vegetales en almuerzo y cena** \u2014 M\u00ednimo 3 porciones diarias
3. **Grasas saludables todos los d\u00edas** \u2014 Palta, aceite oliva, frutos secos
4. **Hidrataci\u00f3n** \u2014 {aguaMin}-{aguaMax}L por d\u00eda para tus {peso}kg
5. **Evitar ultraprocesados** \u2014 Si tiene m\u00e1s de 5 ingredientes que no reconoc\u00e9s, no es comida

**\ud83d\udd34 Si tu objetivo es PERDER GRASA:**
- Calor\u00edas: {tdee} - 400 = ~{calObj} kcal/d\u00eda
- Prote\u00edna ALTA: {protReq}g (preserva m\u00fasculo)
- Carbos: solo en desayuno y post-entreno
- Cena liviana: prote\u00edna + vegetales (sin carbs)
- Ayuno intermitente 16:8 puede ayudar (no es obligatorio)

**\ud83d\udfe2 Si tu objetivo es GANAR M\u00daSCULO:**
- Calor\u00edas: {tdee} + 300 = super\u00e1vit moderado
- Prote\u00edna: {protReq}g distribuida en 4-5 comidas
- Carbos abundantes: arroz, avena, batata, banana
- Post-entreno: whey + carbos r\u00e1pidos (banana + miel)
- Cena: prote\u00edna + carbos complejos

**\ud83d\udfe1 Si tu objetivo es TONIFICAR:**
- Calor\u00edas: al nivel del TDEE ({tdee} kcal)
- Prote\u00edna moderada-alta: {protReq}g
- Carbos ciclados: m\u00e1s en d\u00edas de entreno, menos en descanso
- Grasas saludables estables

**Comida modelo para un d\u00eda completo:**
- **Desayuno:** Avena + whey + banana + canela
- **Media ma\u00f1ana:** Yogur griego + ar\u00e1ndanos + nueces
- **Almuerzo:** Pollo/salm\u00f3n + arroz integral + ensalada + aceite oliva
- **Merienda:** Tostada integral + palta + huevo
- **Cena:** Merluza/carne magra + verduras al vapor

\u00bfQuer\u00e9s que arme un plan m\u00e1s detallado para vos? \ud83c\udf7d`
  },
  {
    keywords: ['importancia proteina', 'por qu\u00e9 proteina', 'proteina importante', 'prote\u00edna fundamental', 'cuanta proteina necesito'],
    content: `**La prote\u00edna: el macronutriente m\u00e1s importante para transformar tu cuerpo**

Sin suficiente prote\u00edna, NO pod\u00e9s ganar m\u00fasculo. Punto. Tambi\u00e9n es esencial para mantener m\u00fasculo cuando baj\u00e1s de peso.

**\u00bfPor qu\u00e9 es TAN importante?**
- Es el \u00fanico macronutriente que **construye y repara m\u00fasculo**
- Tiene el mayor **efecto t\u00e9rmico**: quem\u00e1s 25-30% de sus calor\u00edas solo digiri\u00e9ndola
- Genera **m\u00e1s saciedad** que carbs o grasas (com\u00e9s menos naturalmente)
- Preserva masa muscular durante d\u00e9ficit cal\u00f3rico
- Fortalece sistema inmune, pelo, u\u00f1as, piel

**\u00bfCu\u00e1nta necesit\u00e1s? ({peso}kg, objetivo: {objetivo})**
- **Perder grasa:** {peso} x 2.2 = ~{protReq}g/d\u00eda (la m\u00e1s alta, para preservar m\u00fasculo)
- **Ganar m\u00fasculo:** {peso} x 2.0g/d\u00eda
- **Mantenimiento:** {peso} x 1.6g/d\u00eda

**Las mejores fuentes de prote\u00edna (ranking):**
1. **Huevo entero** \u2014 La referencia biol\u00f3gica. 6g por huevo. El m\u00e1s completo
2. **Pechuga de pollo** \u2014 31g por 100g. Vers\u00e1til y econ\u00f3mica
3. **Salm\u00f3n** \u2014 22g + Omega-3. Doble beneficio
4. **Carne vacuna magra** \u2014 26g + hierro + creatina natural
5. **Yogur griego** \u2014 20g por pote. Ideal para snack
6. **Whey protein** \u2014 24g por scoop. Pr\u00e1ctico post-entreno
7. **Lentejas** \u2014 9g por 100g cocida. Mejor fuente vegetal
8. **At\u00fan** \u2014 25g por lata. Econ\u00f3mico y pr\u00e1ctico

**Distribuci\u00f3n \u00f3ptima:** Repartir en 4-5 comidas de 25-40g cada una. El cuerpo absorbe mejor as\u00ed que todo de golpe.

**Error com\u00fan:** Comer mucha prote\u00edna solo en el almuerzo y cena. El desayuno TIENE que tener prote\u00edna (huevos, yogur griego, whey) \ud83e\udd5a`
  },
  {
    keywords: ['tendencia', 'tendencias', 'novedad', 'nuevo', 'moda fitness', 'trending', 'lo \u00faltimo', '2024', '2025', '2026'],
    content: `**Tendencias mundiales en fitness y nutrici\u00f3n 2025-2026**

Lo que realmente funciona y lo que es solo marketing:

**\u2705 TENDENCIAS CON EVIDENCIA:**

1. **Entrenamiento de fuerza para TODOS** \u2014 Ya no es "cosa de hombres". La OMS recomienda 2+ sesiones/semana para todas las edades. Previene sarcopenia, osteoporosis y mejora metabolismo.

2. **Prote\u00edna alta y distribuida** \u2014 1.6-2.2g/kg es el nuevo est\u00e1ndar. Desayunar con prote\u00edna ya es mainstream.

3. **Alimentos antiinflamatorios** \u2014 C\u00farcuma, jengibre, ar\u00e1ndanos, omega-3. La inflamaci\u00f3n cr\u00f3nica de baja intensidad est\u00e1 detr\u00e1s de la mayor\u00eda de enfermedades modernas.

4. **Col\u00e1geno hidrolizado** \u2014 Ya no es solo est\u00e9tica. La evidencia para articulaciones y tejido conectivo es s\u00f3lida. 10-15g/d\u00eda.

5. **Entrenamiento Zone 2** \u2014 Cardio de baja intensidad (poder hablar mientras lo hac\u00e9s). Mejora metabolismo de grasas y salud mitocondrial. Peter Attia y Andrew Huberman lo pusieron en el mapa.

6. **Cold exposure / Ba\u00f1os fr\u00edos** \u2014 Mejora recuperaci\u00f3n, grasa parda, sistema inmune. No es m\u00e1gico pero tiene beneficios reales con 2-3 min a 10-15\u00b0C.

7. **Glucosa estable (CGM)** \u2014 Monitorear glucosa continua para optimizar energ\u00eda. Comer fibra/prote\u00edna ANTES de carbos reduce picos 40%.

8. **Suplementaci\u00f3n inteligente** \u2014 Creatina, vitamina D, magnesio bisglicinato, omega-3 de calidad. Menos suplementos pero mejores.

9. **Gut Health (Salud intestinal)** \u2014 Prebios, probios, alimentos fermentados (kefir, chucrut, kimchi). El intestino es el "segundo cerebro".

10. **Longevidad y healthspan** \u2014 No solo vivir m\u00e1s, sino vivir mejor. Entrenamiento de fuerza + cardio zone 2 + sue\u00f1o + nutrici\u00f3n son los 4 pilares.

**\u274c TENDENCIAS HUMO (evitalas):**
- Detox / jugos detox (tu h\u00edgado ya hace detox gratis)
- Dieta cetog\u00e9nica para todos (funciona para algunos, no es universal)
- Suplementos "quemadores de grasa"
- Entrenamiento de 7 min que "reemplaza el gym"
- Electroestimulaci\u00f3n como \u00fanico entrenamiento

Lo que nunca pasa de moda: entrenar con pesas, comer prote\u00edna, dormir bien y tomar agua \ud83d\udcaa`
  },
  {
    keywords: ['canela', 'canela ceilon', 'especias', 'curcuma', 'c\u00farcuma', 'jengibre', 'antiinflamatorio natural'],
    content: `**Especias antiinflamatorias: la farmacia de tu cocina**

Estas especias tienen beneficios comprobados cient\u00edficamente:

**\ud83c\udf4f Canela de Ceil\u00f3n (la verdadera canela)**
- Regula glucosa en sangre (reduce picos post-comida 20-30%)
- Mejora sensibilidad a la insulina
- Antiinflamatoria y antioxidante
- **IMPORTANTE:** Us\u00e1 canela de **Ceil\u00f3n** (Ceylon), NO canela cassia (la com\u00fan). La cassia tiene cumarina que en exceso da\u00f1a el h\u00edgado.
- Dosis: 1-3g/d\u00eda (1 cucharadita). Agreg\u00e1 a avena, caf\u00e9, yogur, batidos
- Marcas: **Simply Organic**, **Frontier Co-op** (que digan "Ceylon")

**\ud83d\udfe1 C\u00farcuma (curcumina)**
- Antiinflamatorio potente (comparable a ibuprofeno en algunos estudios)
- Antioxidante, neuroprotector
- **Clave:** Siempre con pimienta negra (piperina aumenta absorci\u00f3n 2000%)
- Dosis: 500-1000mg de curcumina/d\u00eda, o 1 cucharadita de c\u00farcuma en comidas
- Golden milk: leche vegetal + c\u00farcuma + pimienta + canela + miel = antiinflamatorio delicioso

**\u26aa Jengibre**
- Antiinflamatorio, antinauseoso
- Mejora digesti\u00f3n y absorci\u00f3n de nutrientes
- Reduce dolor muscular post-entreno (DOMS) en un 25%
- Fresco rallado en comidas, t\u00e9 de jengibre, o suplemento

**\ud83d\udfe3 Ar\u00e1ndanos (berry power)**
- Los antioxidantes m\u00e1s potentes del mundo vegetal
- Mejoran funci\u00f3n cognitiva y memoria
- Antiinflamatorios
- 100-150g/d\u00eda. Frescos o congelados (mismos beneficios)

**Combinaci\u00f3n ganadora para el desayuno:** Avena + canela de Ceil\u00f3n + ar\u00e1ndanos + banana + col\u00e1geno. Antiinflamatorio, nutritivo y delicioso \ud83c\udf1f`
  },
  {
    keywords: ['zinc', 'hierro', 'selenio', 'mineral', 'minerales', 'micronutriente'],
    content: `**Minerales clave para el deportista**

**\ud83d\udd35 Zinc**
- Fundamental para testosterona, sistema inmune y s\u00edntesis proteica
- El 30% de deportistas tiene deficiencia
- Fuentes: carne roja, ostras, semillas de calabaza, garbanzos
- Suplemento: 15-30mg/d\u00eda de zinc picolinato o bisglicinato
- NO tomar junto con hierro (compiten por absorci\u00f3n)
- Marcas: **NOW Foods Zinc Picolinate**, **Solgar**

**\ud83d\udfe0 Hierro**
- Transporta ox\u00edgeno a los m\u00fasculos. Sin hierro = fatiga y mal rendimiento
- Mujeres deportistas son grupo de riesgo (menstruaci\u00f3n + sudor)
- Fuentes: carne roja, lentejas, espinaca (con lim\u00f3n para absorber)
- Solo suplementar si hay deficiencia confirmada por an\u00e1lisis de sangre
- Tomar con vitamina C, lejos del caf\u00e9 y l\u00e1cteos

**\ud83d\udfe1 Selenio**
- Esencial para tiroides (conversi\u00f3n T4\u2192T3)
- Antioxidante potente (con vitamina E)
- 2-3 nueces de Brasil por d\u00eda = dosis completa (la fuente natural m\u00e1s rica)
- Suplemento: 100-200mcg/d\u00eda m\u00e1ximo

**\ud83d\udfe3 Potasio**
- Previene calambres, regula presi\u00f3n arterial
- La mayor\u00eda de la gente no llega al m\u00ednimo (4700mg/d\u00eda)
- Fuentes: banana, palta, papa, espinaca, yogur
- Rara vez necesita suplemento si com\u00e9s bien

**Tip:** Antes de suplementar minerales, hac\u00e9 un an\u00e1lisis de sangre completo. Suplementar sin deficiencia puede ser contraproducente \ud83e\ude78`
  },
  {
    keywords: ['probiotico', 'probi\u00f3tico', 'prebiotico', 'intestino', 'flora intestinal', 'microbiota', 'fermentado', 'kefir', 'kombucha'],
    content: `**Salud Intestinal: el pilar olvidado del fitness**

Tu intestino tiene 100 billones de bacterias que influyen en TODO: absorci\u00f3n de nutrientes, sistema inmune (70% est\u00e1 ah\u00ed), estado de \u00e1nimo, inflamaci\u00f3n y hasta composici\u00f3n corporal.

**\u00bfPor qu\u00e9 importa para el fitness?**
- Mejor absorci\u00f3n de prote\u00edna y nutrientes
- Menos inflamaci\u00f3n = mejor recuperaci\u00f3n
- Mejor sistema inmune = menos enfermedades = m\u00e1s consistencia
- La serotonina (90%) se produce en el intestino

**Alimentos fermentados (incluir diariamente):**
- **Kefir**: el campe\u00f3n. M\u00e1s cepas que cualquier yogur. 200ml/d\u00eda
- **Yogur natural/griego**: con cultivos vivos (no los ultra-azucarados)
- **Chucrut**: repollo fermentado. 2-3 cucharadas/d\u00eda
- **Kimchi**: fermentado coreano, potente
- **Kombucha**: t\u00e9 fermentado. Ojo con las marcas con mucha az\u00facar

**Prebi\u00f3ticos (alimentan a tus bacterias buenas):**
- Ajo, cebolla, puerro
- Banana verde, espárragos
- Avena (beta-glucanos)
- Semillas de ch\u00eda y l\u00ednaza

**Probi\u00f3ticos en suplemento:**
- Cepas clave: **Lactobacillus rhamnosus**, **Bifidobacterium lactis**
- M\u00ednimo 10 billones CFU
- Marcas: **Seed**, **VSL#3**, **Garden of Life**, **Jarrow Formulas**

**Lo que DESTRUYE tu microbiota:**
- Antibi\u00f3ticos (necesarios pero devastadores para la flora)
- Edulcorantes artificiales (sucralosa, aspartamo)
- Ultraprocesados
- Estr\u00e9s cr\u00f3nico
- Alcohol en exceso

**Plan simple:** 1 porci\u00f3n de fermentado por d\u00eda + fibra variada + eliminar ultraprocesados. En 4 semanas not\u00e1s la diferencia \ud83e\uddec`
  },
  {
    keywords: ['vitamina c', 'antioxidante', 'antioxidantes', 'radicales libres'],
    content: `**Antioxidantes y Vitamina C para deportistas**

Entrenar genera estr\u00e9s oxidativo (radicales libres). Esto es NORMAL y necesario para la adaptaci\u00f3n muscular. Pero demasiado estr\u00e9s oxidativo sin defensa = inflamaci\u00f3n, fatiga, envejecimiento acelerado.

**Vitamina C:**
- Esencial para s\u00edntesis de col\u00e1geno (tendones, piel, articulaciones)
- Potente antioxidante
- Mejora absorci\u00f3n de hierro
- Fortalece sistema inmune
- Dosis: 500-1000mg/d\u00eda. No m\u00e1s de 2000mg
- Fuentes: kiwi (el rey), pimiento morr\u00f3n, frutillas, c\u00edtricos, br\u00f3coli
- **Tip:** NO tomar megadosis de vitamina C justo post-entreno. Puede interferir con las se\u00f1ales adaptativas del m\u00fasculo. Mejor con las comidas.

**Top antioxidantes naturales:**
1. **Ar\u00e1ndanos** \u2014 Antocianinas. El m\u00e1s potente fruta
2. **Cacao puro** \u2014 Flavonoides. 70%+ cacao. No chocolate con leche
3. **T\u00e9 verde** \u2014 EGCG. 2-3 tazas/d\u00eda
4. **C\u00farcuma** \u2014 Curcumina. Antiinflamatorio + antioxidante
5. **Tomate cocido** \u2014 Licopeno. Mejor cocido que crudo
6. **Nueces** \u2014 Polifenoles + omega-3
7. **Espinaca** \u2014 Luteina, zeaxantina

**No necesit\u00e1s suplementos antioxidantes caros.** Comer 5+ porciones de frutas y verduras variadas por d\u00eda cubre todo \ud83c\udf52`
  },
  {
    keywords: ['electrolito', 'electrolitos', 'sodio', 'sal', 'calambre', 'calambres', 'sudor'],
    content: `**Electrolitos: lo que perd\u00e9s cuando sudás**

Si entren\u00e1s fuerte y solo tom\u00e1s agua, est\u00e1s reponiendo volumen pero no minerales. Esto causa calambres, fatiga, mareos y bajo rendimiento.

**Los 4 electrolitos clave:**
- **Sodio** \u2014 El que m\u00e1s se pierde en el sudor. 500-1000mg durante entreno intenso
- **Potasio** \u2014 Funci\u00f3n muscular y card\u00edaca. Banana + palta
- **Magnesio** \u2014 Relajaci\u00f3n muscular, previene calambres. 400mg/d\u00eda
- **Calcio** \u2014 Contracci\u00f3n muscular. L\u00e1cteos + verduras verdes

**\u00bfCu\u00e1ndo suplementar electrolitos?**
- Entrenos de +60 min
- Mucho calor/sudor
- Entrenamiento en ayunas
- Si sufr\u00eds calambres frecuentes

**Receta casera de electrolitos (mejor que Gatorade):**
- 750ml de agua
- Jugo de 1 lim\u00f3n
- 1/4 cucharadita de sal marina (sodio)
- 1 cucharada de miel (glucosa)
- Opcional: un chorrito de jugo de naranja (potasio)

**Marcas de electrolitos recomendadas:**
- **LMNT** (sin az\u00facar, buena proporci\u00f3n sodio/potasio/magnesio)
- **Nuun** (tabletas efervescentes, pr\u00e1cticas)
- **Pedialyte** (originalmente pedi\u00e1trico pero excelente para deportistas)

**Dato:** La sal NO es el enemigo. Los deportistas necesitan m\u00e1s sodio que el sedentario promedio. Si entren\u00e1s duro, no tengas miedo de la sal \ud83e\uddc2`
  },
  {
    keywords: ['vitamina b', 'complejo b', 'energia', 'energ\u00eda', 'fatiga', 'cansancio cr\u00f3nico'],
    content: `**Complejo B y Energ\u00eda para el deportista**

Si te sent\u00eds cansado a pesar de dormir bien, puede ser deficiencia de vitaminas B.

**Las vitaminas B clave:**
- **B1 (Tiamina)** \u2014 Metabolismo de carbohidratos. Sin ella, no us\u00e1s la glucosa bien
- **B6 (Piridoxina)** \u2014 Metabolismo de prote\u00edna y amino\u00e1cidos. Esencial si com\u00e9s mucha prote\u00edna
- **B9 (Folato)** \u2014 S\u00edntesis de ADN, gl\u00f3bulos rojos. Importante en mujeres
- **B12 (Cobalamina)** \u2014 Sistema nervioso, energ\u00eda, gl\u00f3bulos rojos. Los veganos DEBEN suplementar

**\u00bfQui\u00e9nes tienen m\u00e1s riesgo de deficiencia?**
- Veganos/vegetarianos (B12 casi exclusiva de origen animal)
- Deportistas de resistencia (mayor gasto metab\u00f3lico)
- Personas con problemas g\u00e1stricos
- Adultos mayores (menor absorci\u00f3n)

**Fuentes naturales:**
- B12: carne, huevos, l\u00e1cteos, h\u00edgado
- B6: pollo, banana, papa, garbanzos
- B9: espinaca, lentejas, esp\u00e1rragos, palta

**Suplemento:** Un buen complejo B o B12 metilcobalamina (forma activa) si sos vegano.

**Si el cansancio persiste** a pesar de buena alimentaci\u00f3n, sue\u00f1o y entrenamiento: ped\u00ed un an\u00e1lisis de sangre completo (hemograma, ferritina, B12, vitamina D, tiroides) \u26a1`
  },
  {
    keywords: ['canela bloqueador', 'canela insulina', 'canela glucosa', 'indice glucemico', 'ceilon insulina', 'ig alimentos'],
    content: `**Canela de Ceilon: el bloqueador natural del indice glucemico**

La canela de Ceilon (Ceylon) no es solo un condimento. Es uno de los reguladores de glucosa mas potentes de la naturaleza.

**Como actua:**
- **Bloquea parcialmente la alfa-amilasa** (enzima que digiere almidones), ralentizando la absorcion de carbohidratos
- **Mejora la sensibilidad a la insulina** hasta un 20% segun estudios
- **Imita la accion de la insulina** ayudando a meter glucosa en las celulas sin tanto pico hormonal
- **Reduce la velocidad de vaciado gastrico** = los carbos se absorben mas lento

**Resultado practico:** Si comes arroz con canela, el pico de glucosa es 25-30% MENOR que sin canela.

**Como usarla para bajar el IG de tus comidas:**
1. **En la avena del desayuno:** 1 cdta de canela Ceylon. Convierte un plato de IG medio en IG bajo
2. **En el cafe/mate:** 1/2 cdta. Estabiliza la glucosa de la manana
3. **En batidos con fruta:** 1 cdta. Reduce el pico de la fructosa
4. **En el arroz o la pasta:** espolvorear antes de comer
5. **En el yogur:** con granola + canela = snack de IG controlado

**IMPORTANTE: Solo canela de CEILON (Ceylon)**
La canela comun (Cassia, la que venden en el super) tiene cumarina, que en exceso dana el higado. La de Ceilon tiene 250 veces menos cumarina. Busca que diga "Ceylon" o "Ceilon" en el envase.

**Dosis:** 1-6g/dia (1-2 cucharaditas). Mas no es mejor.

**Combo matador:** Canela + vinagre de manzana (1 cda en agua antes de comer) = doble bloqueo de pico glucemico \ud83c\udfaf`
  },
  {
    keywords: ['control insulina', 'resistencia insulina', 'pico insulina', 'glucosa estable', 'azucar sangre'],
    content: `**Control de insulina: la hormona que decide si quemas o almacenas**

La insulina es la hormona MAS IMPORTANTE para tu composicion corporal. No importa cuantas calorias comas si tu insulina esta descontrolada.

**Cuando la insulina esta ALTA:**
- Tu cuerpo almacena grasa (no puede quemarla)
- Retenes liquido
- Tenes hambre a las 2 horas de comer
- Energia inestable: picos y bajones
- A largo plazo: resistencia insulinica, diabetes tipo 2

**Cuando la insulina esta ESTABLE:**
- Quemas grasa como combustible
- Energia pareja todo el dia
- Saciedad prolongada
- Mejor humor y concentracion
- Mejor rendimiento deportivo

**7 estrategias para controlar la insulina:**

1. **Orden de los alimentos:** Come en este orden: fibra/vegetales PRIMERO, proteina SEGUNDO, carbohidratos ULTIMO. Reduce el pico glucemico un 40%

2. **Caminar 10 min post-comida:** El musculo "chupa" glucosa sin necesitar tanta insulina

3. **Vinagre de manzana:** 1 cda en agua antes de comer. Ralentiza la digestion de almidones

4. **Canela de Ceilon:** 1 cdta con las comidas. Mejora sensibilidad insulinica

5. **Proteina en cada comida:** Estabiliza glucosa y genera saciedad

6. **Eliminar azucar liquido:** Gaseosas, jugos, bebidas energeticas. Son bombas de insulina

7. **Entrenamiento de fuerza:** El mejor "medicamento" para sensibilidad insulinica. El musculo es el organo mas grande que absorbe glucosa

**Para tu objetivo ({objetivo}):** Controlar la insulina es mas importante que contar calorias. Estabiliza tus hormonas y el cuerpo hace el resto \ud83d\udcaa`
  },
  {
    keywords: ['cortisol', 'estres', 'estres cronico', 'cortisol alto', 'grasa abdominal'],
    content: `**Cortisol: la hormona que sabotea tus resultados**

El cortisol es la hormona del estres. En dosis agudas es util (te despierta, te da energia para entrenar). Pero CRONICAMENTE ALTO destruye todo.

**Que hace el cortisol alto cronico:**
- Acumula grasa en el abdomen (grasa visceral, la mas peligrosa)
- Descompone musculo para usarlo como energia
- Retiene liquidos (te "hincha")
- Altera el sueno (no podes dormir aunque estes cansado)
- Aumenta el hambre por azucar y harinas
- Debilita el sistema inmune
- Sube la presion arterial

**Las 5 peores causas de cortisol alto:**
1. **Dormir menos de 6 horas** - La #1 causa. Una noche mala sube cortisol 37%
2. **Sobreentrenamiento** - Entrenar mas de 75 min o entrenar intenso 7 dias sin descanso
3. **Deficit calorico extremo** - Menos de 1200 kcal/dia pone al cuerpo en modo supervivencia
4. **Estres emocional cronico** - Trabajo, relaciones, preocupaciones constantes
5. **Exceso de cafeina** - Mas de 400mg/dia (3-4 cafes) mantiene cortisol elevado

**Como bajarlo:**
- Dormir 7-9 horas (no negociable)
- Magnesio bisglicinato antes de dormir (400mg)
- Caminatas de 20-30 min en la naturaleza
- No entrenar mas de 60-75 min por sesion
- Respiracion 4-7-8: inspira 4 seg, retene 7, exhala 8
- Ashwagandha (suplemento adaptogeno con evidencia solida)
- Descansar 1-2 dias por semana del entrenamiento

El cortisol es la razon por la que muchos entrenan duro, comen "bien" y no ven resultados. No es falta de esfuerzo, es exceso de estres \u26a1`
  },
  {
    keywords: ['desinflamacion', 'inflamacion', 'inflamacion cronica', 'antiinflamatorio', 'desinflamar', 'hinchado', 'retencion'],
    content: `**Desinflamacion: el secreto para transformar tu cuerpo**

La inflamacion cronica de baja intensidad es INVISIBLE pero esta detras del 80% de los problemas: no bajar de peso, fatiga, dolor articular, mala recuperacion, envejecimiento acelerado.

**Senales de inflamacion cronica:**
- Hinchazon abdominal constante
- Retencion de liquidos (anillos apretados, tobillo hinchado)
- Fatiga aunque duermas
- Dolor articular sin lesion
- Piel opaca, acne en adultos
- Recuperacion lenta post-entreno
- Grasa abdominal que no se va

**Los 5 inflamadores principales (ELIMINAR):**
1. **Azucar refinado y harinas blancas** - Disparan citoquinas inflamatorias
2. **Aceites de semillas** (girasol, soja, maiz) - Exceso de Omega-6 pro-inflamatorio
3. **Alcohol** - Inflama intestino, higado y todo el sistema
4. **Ultraprocesados** - Conservantes, colorantes, emulsionantes destruyen la microbiota
5. **Estres cronico + mal sueno** - Cortisol alto = inflamacion sistemica

**Los 5 desinflamadores mas potentes (INCLUIR):**
1. **Omega-3** (salmon, sardinas, suplemento EPA/DHA) - Antiinflamatorio directo
2. **Curcuma + pimienta negra** - Curcumina es comparable a ibuprofeno
3. **Jengibre fresco** - Reduce marcadores inflamatorios un 25%
4. **Vegetales de hoja verde** - Espinaca, kale, rucula. Ricos en antioxidantes
5. **Ayuno nocturno de 12hs** - Darle descanso al sistema digestivo

**Plan desinflamacion 7 dias:**
- Eliminar azucar, harinas, alcohol
- 2-3 porciones de Omega-3 por dia (salmon + suplemento)
- Te de curcuma + jengibre + pimienta en ayunas
- Vegetales en cada comida
- Dormir 8 horas
- Resultado: en 7 dias notas la diferencia en hinchazon y energia

La desinflamacion es el primer paso antes de cualquier objetivo de composicion corporal \ud83d\udd25`
  },
  {
    keywords: ['dormir', 'sueno calidad', 'importancia dormir', 'insomnio entrenamiento', 'descanso nocturno', 'horas sueno'],
    content: `**Dormir: el suplemento gratis mas poderoso que existe**

Si dormis mal, todo lo demas falla. No importa cuanto entrenes ni que tan bien comas. Sin sueno de calidad, tus resultados se reducen a la mitad.

**Que pasa cuando dormis MENOS de 7 horas:**
- Cortisol sube 37% (acumulas grasa abdominal)
- Testosterona baja 10-15% (menos musculo, menos energia)
- Grelina sube (mas hambre, especialmente de azucar)
- Leptina baja (menos saciedad)
- Sensibilidad a la insulina cae 30% (almacenas mas grasa)
- Recuperacion muscular se reduce drasticamente
- Riesgo de lesion aumenta 70%

**Cuanto dormir segun tu actividad:**
- Sedentario: 7-8 horas
- Entrenamiento moderado: 7.5-8.5 horas
- Entrenamiento intenso: 8-9 horas
- Atleta de alto rendimiento: 9-10 horas

**10 tips para dormir mejor:**
1. **Misma hora todos los dias** (incluso fines de semana)
2. **Habitacion fria** (18-20 grados ideal)
3. **Oscuridad total** (cortinas blackout o antifaz)
4. **Sin pantallas 1 hora antes** (la luz azul bloquea melatonina)
5. **Magnesio bisglicinato** 400mg 30 min antes de dormir
6. **No cafeina despues de las 14hs** (vida media: 5-6 horas)
7. **Cenar liviano** y minimo 2 horas antes de acostarte
8. **Te de tilo, valeriana o pasiflora** antes de dormir
9. **Melatonina** 0.5-1mg si cuesta conciliar (no mas)
10. **Rutina de "cierre":** ducha tibia + lectura + respiracion

**El sueno es cuando:**
- Se libera hormona de crecimiento (repara musculo)
- Se consolida la memoria muscular del entrenamiento
- Se regulan todas las hormonas metabolicas
- Se desintoxica el cerebro (sistema glinfatico)

Dormir bien no es un lujo, es la base de todo lo demas \ud83c\udf19`
  },
  {
    keywords: ['deshidratacion', 'deshidrata', 'que deshidrata', 'bebidas deshidratan', 'alimentos deshidratan', 'hidratacion importancia'],
    content: `**Hidratacion avanzada: que te hidrata y que te deshidrata**

El agua es el nutriente mas importante. Con solo 2% de deshidratacion, tu rendimiento cae un 20% y tu concentracion un 30%.

**Para tus {peso}kg necesitas:** {aguaMin}-{aguaMax} litros por dia (mas si entrenas)

**BEBIDAS QUE DESHIDRATAN (evitar o compensar):**
- **Alcohol** - Diuretico potente. 1 cerveza = necesitas 1.5 vasos extra de agua
- **Cafe en exceso** (mas de 3 tazas) - Efecto diuretico. Hasta 2 tazas esta bien
- **Gaseosas** (incluso las diet) - El sodio y edulcorantes alteran hidratacion celular
- **Bebidas energeticas** - Cafeina + azucar = doble deshidratacion
- **Jugos industriales** - Azucar concentrada, poca agua util
- **Te negro en exceso** - Taninos son diureticos suaves

**ALIMENTOS QUE DESHIDRATAN:**
- Fiambres y embutidos (altisimos en sodio)
- Snacks salados (papas fritas, palitos)
- Comida rapida (sodio + grasas trans)
- Azucar refinada (requiere agua para metabolizarse)
- Harinas refinadas (misma razon que el azucar)

**ALIMENTOS QUE HIDRATAN (incluir):**
- Pepino (96% agua), sandia (92%), tomate (94%)
- Apio, lechuga, pimiento
- Frutas: frutillas, naranja, melon, uvas
- Sopas y caldos caseros
- Agua de coco (electrolitos naturales)

**Senales de deshidratacion:**
- Orina oscura (debe ser amarillo claro o transparente)
- Dolor de cabeza
- Fatiga sin razon
- Calambres
- Boca seca
- Mal rendimiento en el gym

**Protocolo de hidratacion diario:**
- Al despertar: 500ml de agua (tu cuerpo paso 8hs sin agua)
- Antes de entrenar: 500ml 30 min antes
- Durante entreno: 200ml cada 15-20 min
- Post-entreno: 500-750ml con electrolitos
- Resto del dia: distribuir hasta completar {aguaMin}-{aguaMax}L

La regla simple: si tenes sed, ya estas deshidratado. Toma antes de tener sed \ud83d\udca7`
  },
  {
    keywords: ['jengibre curcuma', 'como tomar curcuma', 'curcuma jengibre tuberculo', 'golden milk', 'cuando tomar jengibre', 'tuberculo antiinflamatorio'],
    content: `**Jengibre y Curcuma: los tuberculos antiinflamatorios mas poderosos**

IMPORTANTE: Siempre usar el TUBERCULO FRESCO o en polvo de calidad. Los suplementos funcionan pero el tuberculo tiene compuestos sinergicos que la capsula no tiene.

**CURCUMA (Curcuma longa)**

**Beneficios comprobados:**
- Antiinflamatorio comparable a ibuprofeno (sin efectos secundarios)
- Antioxidante 5-8 veces mas potente que la vitamina E
- Protege articulaciones (reduce dolor en artritis un 40%)
- Mejora recuperacion post-entreno
- Hepatoprotector (protege el higado)
- Anticancerigeno (estudios en curso muy prometedores)

**CLAVE: absorcion con pimienta negra**
La curcumina sola se absorbe solo un 3%. Con piperina (pimienta negra) la absorcion sube un 2000%. SIEMPRE combinar.

**Como tomarla:**
- **Golden Milk (la mejor forma):** Leche vegetal caliente + 1 cdta curcuma + pizca de pimienta negra + 1/2 cdta canela + miel. Tomar a la NOCHE, 1hs antes de dormir
- **En las comidas:** Agregar al arroz, pollo, huevos, sopas. Siempre con pimienta
- **Shot matutino:** Agua tibia + 1/2 cdta curcuma + pimienta + limon
- **Rallada fresca:** Sobre ensaladas, en jugos verdes

**JENGIBRE (Zingiber officinale)**

**Beneficios comprobados:**
- Reduce dolor muscular post-entreno (DOMS) un 25%
- Antiinflamatorio y analgesico natural
- Acelera metabolismo un 5% (termogenico)
- Mejora digestion y absorcion de nutrientes
- Antiemitico (nauseas, mareos)
- Mejora circulacion sanguinea

**Como tomarlo:**
- **Te de jengibre:** Rodajas de raiz fresca en agua caliente 10 min. Ideal en AYUNAS por la manana
- **Rallado fresco:** En woks, ensaladas, jugos, batidos
- **Shot anti-inflamatorio:** Jengibre + limon + curcuma + pimienta. En ayunas
- **Post-entreno:** Te de jengibre para acelerar recuperacion

**CUANDO TOMAR CADA UNO:**
- **Manana (ayunas):** Jengibre + limon (activa digestion, termogenico)
- **Con las comidas:** Curcuma + pimienta (mejora absorcion de nutrientes)
- **Post-entreno:** Jengibre (reduce inflamacion y DOMS)
- **Noche:** Golden milk con curcuma (antiinflamatorio + relajante)

**Combo diario recomendado:**
1. Manana: shot de jengibre + limon
2. Almuerzo: curcuma en la comida + pimienta
3. Noche: golden milk antes de dormir

Son baratos, naturales y tienen mas evidencia que la mayoria de los suplementos \ud83c\udf3f`
  },
  {
    keywords: ['dejar alcohol', 'alcohol objetivo', 'alcohol musculo', 'cerveza entreno', 'alcohol grasa', 'despedirse alcohol'],
    content: `**Alcohol: por que es INCOMPATIBLE con tus objetivos**

No es que "un vasito no hace nada". El alcohol afecta CADA sistema que necesitas para lograr resultados.

**Lo que hace el alcohol en tu cuerpo:**

**1. Destruye la sintesis proteica muscular**
- 1 noche de alcohol reduce la sintesis proteica un 37%
- Eso significa: el musculo que entrenaste HOY no se repara si tomas esta noche
- El efecto dura 24-48 horas

**2. Desploma la testosterona**
- Baja testosterona y sube estrogenos (si, en hombres tambien)
- Menos musculo, mas grasa, menos energia
- Efecto medible con solo 2-3 copas

**3. Descontrola la insulina y el cortisol**
- El alcohol es metabolizado como PRIORIDAD por el higado
- Mientras metaboliza alcohol, NO quema grasa
- Sube cortisol (acumula grasa abdominal)
- Altera la glucosa por 24-48 horas

**4. Destruye la calidad del sueno**
- "Me duermo rapido con alcohol" = FALSO sueno reparador
- Elimina la fase REM (donde se repara el musculo)
- Te despertars deshidratado y sin haber recuperado

**5. Calorias vacias + hambre**
- 1 cerveza = 150 kcal. 1 copa vino = 120 kcal. 1 fernet = 200 kcal
- El alcohol AUMENTA el hambre (altera grelina)
- Despues de tomar comes pizza, empanadas, snacks = 2000+ kcal extra

**6. Deshidratacion e inflamacion**
- Diuretico potente. Perdees electrolitos
- Inflama TODO el sistema digestivo
- La "hinchazon" post-salida dura 3-5 dias

**La verdad dura:** Si queres resultados reales, el alcohol tiene que irse. No es "moderacion" - cada copa retrasa tu progreso.

**Reemplazos sociales:**
- Agua con gas + limon + hielo (parece un trago)
- Kombucha
- Cerveza sin alcohol (0.0%)
- Agua tonica sin azucar + limon

Tu cuerpo te lo va a agradecer en 2 semanas. La diferencia es dramatica \ud83d\udcaa`
  },
];

function personalizeContent(content: string, perfil: { peso: number; altura: number; edad: number; objetivo: string; nivelActividad: string; genero?: string } | undefined): string {
  if (!perfil) return content.replace(/\{[^}]+\}/g, '-');
  const { peso, altura, edad, objetivo, nivelActividad: nivel, genero } = perfil;
  // Mifflin-St Jeor: hombre +5, mujer -161, default -78 (promedio)
  const ajusteGenero = genero === 'Mujer' ? -161 : genero === 'Hombre' ? 5 : -78;
  const tmb = Math.round(10 * peso + 6.25 * altura - 5 * edad + ajusteGenero);
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
  const vasos = Math.round(peso * 0.04 * 4); // litros * 4 (vasos de 250ml)

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
    .replace(/\{aguaMin\}/g, aguaMin).replace(/\{aguaMax\}/g, aguaMax).replace(/\{vasos\}/g, vasos.toString());
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
- **Suplementos:** creatina, whey, omega-3, magnesio, cafe\u00edna, vitamina D, gu\u00eda completa
- **Nutrici\u00f3n:** prote\u00ednas, carbos, macros, d\u00e9ficit/super\u00e1vit, ayuno intermitente, vegano
- **Objetivos:** bajar grasa, ganar m\u00fasculo, romper mesetas, principiantes
- **Salud:** sue\u00f1o, sarcopenia, menopausia, hipotiroidismo, colesterol, ansiedad
- **Cuerpo:** gl\u00fateos, abdominales, articulaciones, lesiones, movilidad, running
- **Lifestyle:** alcohol, entrenamiento femenino/masculino, hidrataci\u00f3n

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
- Suplementos (creatina, whey, omega-3, magnesio, cafe\u00edna, vitamina D)
- Nutrici\u00f3n (prote\u00ednas, carbos, macros, d\u00e9ficit/super\u00e1vit, ayuno intermitente)
- Bajar grasa, ganar m\u00fasculo, romper mesetas
- Sue\u00f1o, recuperaci\u00f3n, hidrataci\u00f3n
- Salud articular, lesiones, movilidad
- Sarcopenia, menopausia, hipotiroidismo
- Entrenamiento femenino y masculino
- Salud mental, running, colesterol
- Dieta vegetariana/vegana
- Abdominales, gl\u00fateos, y m\u00e1s

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
        {['Ayuno intermitente', 'Ayuno prolongado', 'Autofagia', 'Hormona crecimiento', 'Ayuno riesgo', 'Senal metabolica', 'Control insulina', 'Cortisol', 'Canela bloqueador IG', 'Desinflamacion', 'Dormir', 'Que deshidrata', 'Jengibre y curcuma', 'Dejar alcohol', 'Creatina', 'Proteina', 'Colageno', 'Omega3 tipos', 'Magnesio tipos', 'Harinas y azucar', 'Tendencias 2025', 'Electrolitos', 'Salud intestinal', 'Bajar grasa', 'Ganar musculo', 'Principiante', 'Suplementos'].map(s => (
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
