import { useState, useRef, useEffect } from 'react';
import { Zap, Send, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const GEMINI_KEY = 'AIzaSyBR97C-s1lrKd9ML-UFQ8aQb79ANtfhfT0';

function buildSystemPrompt(perfil: { edad: number; peso: number; altura: number; objetivo: string; nivelActividad: string } | undefined) {
  const tmb = perfil ? Math.round(10 * perfil.peso + 6.25 * perfil.altura - 5 * perfil.edad + 5) : 0;
  const factores: Record<string, number> = { 'Sedentario': 1.2, 'Principiante': 1.375, 'Intermedio': 1.55, 'Avanzado': 1.725, 'Elite': 1.9 };
  const tdee = perfil ? Math.round(tmb * (factores[perfil.nivelActividad] || 1.55)) : 0;

  return `Sos "JustFit Coach", un coach de fitness y nutrici\u00f3n deportiva integrado en la plataforma JustFit365.

PERSONALIDAD Y TONO:
- Habl\u00e1s en espa\u00f1ol argentino (vos, ten\u00e9s, quer\u00e9s, dale, banc\u00e1, golazo, etc.)
- Sos amigable, directo y motivador. Como un amigo que sabe mucho del tema.
- Us\u00e1 emojis con moderaci\u00f3n (\ud83d\udcaa, \ud83d\ude34, \ud83c\udf57, \u2728, \ud83d\udd25)
- NUNCA cites fuentes acad\u00e9micas ni referencias bibliogr\u00e1ficas. Nada de "seg\u00fan tal estudio" ni "Ref:". Habl\u00e1 como si lo supieras por experiencia y formaci\u00f3n.
- Us\u00e1 **negritas** para conceptos clave
- S\u00e9 conciso pero completo. No m\u00e1s de 250 palabras por respuesta.

PERFIL DEL USUARIO:
${perfil ? `- Edad: ${perfil.edad} a\u00f1os
- Peso: ${perfil.peso} kg
- Altura: ${perfil.altura} cm
- Objetivo: ${perfil.objetivo}
- Nivel de actividad: ${perfil.nivelActividad}
- TMB estimada: ~${tmb} kcal
- TDEE estimado: ~${tdee} kcal` : '- Perfil no configurado a\u00fan'}

CONOCIMIENTO:
Ten\u00e9s formaci\u00f3n en medicina deportiva, nutrici\u00f3n cl\u00ednica y ciencias del ejercicio. Conoc\u00e9s a fondo:
- Suplementaci\u00f3n: creatina, whey, omega-3, magnesio, cafe\u00edna, vitamina D
- Nutrici\u00f3n deportiva: macros, timing, calidad de alimentos, dietas
- Fisiolog\u00eda: se\u00f1al metab\u00f3lica, hormonas, recuperaci\u00f3n, periodizaci\u00f3n
- Entrenamiento: hipertrofia, fuerza, resistencia, HIIT, funcional

REGLAS:
1. Personaliz\u00e1 SIEMPRE las respuestas al perfil del usuario
2. NUNCA cites papers, estudios ni referencias. Solo respond\u00e9 con el conocimiento.
3. Si algo requiere supervisi\u00f3n m\u00e9dica, advert\u00ed de forma casual ("eso consultalo con tu m\u00e9dico")
4. Si te preguntan algo fuera de fitness/nutrici\u00f3n, redirig\u00ed amablemente
5. Siempre termin\u00e1 con una pregunta o invitaci\u00f3n a seguir charlando`;
}

export default function BioCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<ReturnType<ReturnType<GoogleGenerativeAI['getGenerativeModel']>['startChat']> | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar Gemini
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      chatRef.current = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
      });

      // Enviar system prompt y obtener saludo
      chatRef.current.sendMessage(buildSystemPrompt(user?.perfil) + '\n\nAhora presentate brevemente al usuario. Decile que sos su JustFit Coach y en qu\u00e9 lo pod\u00e9s ayudar. Tono amigable argentino, corto.').then(result => {
        setMessages([{
          id: 1,
          role: 'assistant',
          content: result.response.text(),
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        }]);
      }).catch(() => {
        setMessages([{
          id: 1,
          role: 'assistant',
          content: '\u00a1Hola! Soy tu **JustFit Coach** \ud83d\udcaa\n\nEstoy ac\u00e1 para ayudarte con todo sobre entrenamiento, nutrici\u00f3n y suplementos.\n\nPreguntame lo que quieras!',
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        }]);
      });
    } catch {
      chatRef.current = null;
      setMessages([{
        id: 1,
        role: 'assistant',
        content: '\u00a1Hola! Soy tu **JustFit Coach** \ud83d\udcaa\n\nEstoy ac\u00e1 para ayudarte con todo sobre entrenamiento, nutrici\u00f3n y suplementos.\n\nPreguntame lo que quieras!',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [user?.perfil]);

  const sendMessage = async () => {
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

    try {
      if (chatRef.current) {
        const result = await chatRef.current.sendMessage(query);
        const text = result.response.text();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: text,
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        }]);
      } else {
        throw new Error('Chat no inicializado');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Uh, tuve un problema para responderte: ${errorMsg}\n\nProbá de nuevo en unos segundos \ud83d\ude05`,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
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
