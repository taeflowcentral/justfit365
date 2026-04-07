import { useState, useEffect } from 'react';
import { Zap, Dumbbell, Apple, MessageSquare, Camera, Stethoscope, BarChart3, Shield, Users, Play, ChevronRight, Star } from 'lucide-react';

const slides = [
  {
    id: 0,
    titulo: 'JUSTFIT365',
    subtitulo: 'Tu coach de fitness & nutrici\u00f3n con IA',
    icon: Zap,
    color: 'from-electric to-neon',
    mockup: (
      <div className="space-y-2">
        <div className="h-3 bg-electric/30 rounded-full w-3/4 mx-auto" />
        <div className="h-2 bg-white/10 rounded-full w-1/2 mx-auto" />
        <div className="grid grid-cols-2 gap-2 mt-4 px-4">
          <div className="h-12 bg-electric/15 rounded-lg border border-electric/20" />
          <div className="h-12 bg-neon/10 rounded-lg border border-neon/20" />
          <div className="h-12 bg-purple-500/15 rounded-lg border border-purple-500/20" />
          <div className="h-12 bg-emerald-500/15 rounded-lg border border-emerald-500/20" />
        </div>
      </div>
    ),
    features: ['Planes personalizados por IA', 'Basado en ciencia real', 'Para vos y tu gimnasio'],
  },
  {
    id: 1,
    titulo: 'Rutinas Inteligentes',
    subtitulo: '9 tipos de entrenamiento con fotos reales',
    icon: Dumbbell,
    color: 'from-purple-500 to-pink-500',
    mockup: (
      <div className="space-y-2 px-3">
        {['Press Banca', 'Sentadilla', 'Peso Muerto'].map((e, i) => (
          <div key={e} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5" style={{ animationDelay: `${i * 0.2}s` }}>
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg" />
            <div className="flex-1">
              <div className="h-2 bg-white/20 rounded-full w-20" />
              <div className="h-1.5 bg-white/10 rounded-full w-14 mt-1" />
            </div>
            <div className="text-[8px] text-purple-400/60">4x8</div>
          </div>
        ))}
      </div>
    ),
    features: ['Push, Pull, Piernas, HIIT y m\u00e1s', 'Editable al 100%', 'Fotos de ejecuci\u00f3n real'],
  },
  {
    id: 2,
    titulo: 'Nutrici\u00f3n con IA',
    subtitulo: 'Plan generado seg\u00fan tu perfil metab\u00f3lico',
    icon: Apple,
    color: 'from-emerald-500 to-green-400',
    mockup: (
      <div className="space-y-2 px-3">
        <div className="flex justify-between px-1">
          {['Cal', 'Prot', 'Carb', 'Gras'].map((m, i) => (
            <div key={m} className="text-center">
              <div className="w-8 h-8 rounded-full border-2 mx-auto mb-0.5" style={{ borderColor: ['#f97316', '#0099ff', '#eab308', '#ec4899'][i] + '60' }}>
                <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${['#f97316', '#0099ff', '#eab308', '#ec4899'][i]}80 ${[85, 75, 60, 70][i]}%, transparent 0)` }} />
              </div>
              <span className="text-[7px] text-white/30">{m}</span>
            </div>
          ))}
        </div>
        {['Desayuno', 'Almuerzo', 'Cena'].map(c => (
          <div key={c} className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <div className="h-1.5 bg-white/15 rounded-full w-16" />
            <div className="h-1 bg-white/5 rounded-full w-24 mt-1" />
          </div>
        ))}
      </div>
    ),
    features: ['TMB y TDEE autom\u00e1tico', 'Macros personalizados', '5 comidas optimizadas'],
  },
  {
    id: 3,
    titulo: 'JustFit Coach',
    subtitulo: 'Examine.com + PubMed + USDA + Cochrane',
    icon: MessageSquare,
    color: 'from-electric to-cyan-400',
    mockup: (
      <div className="space-y-2 px-3">
        <div className="flex justify-end"><div className="px-3 py-1.5 bg-electric/15 rounded-xl rounded-br-sm text-[8px] text-white/50 max-w-[70%]">\u00bfDebo tomar creatina?</div></div>
        <div className="flex gap-1.5">
          <div className="w-5 h-5 bg-electric/30 rounded-md shrink-0" />
          <div className="px-3 py-1.5 bg-white/5 rounded-xl rounded-bl-sm">
            <div className="h-1.5 bg-white/15 rounded-full w-32" />
            <div className="h-1 bg-white/10 rounded-full w-28 mt-1" />
            <div className="h-1 bg-white/10 rounded-full w-20 mt-1" />
            <div className="flex gap-1 mt-1.5">
              <span className="text-[6px] px-1 py-0.5 bg-emerald-500/15 text-emerald-400/50 rounded">Examine</span>
              <span className="text-[6px] px-1 py-0.5 bg-blue-500/15 text-blue-400/50 rounded">PubMed</span>
            </div>
          </div>
        </div>
      </div>
    ),
    features: ['Respuestas con referencias cient\u00edficas', 'Personalizado a tu perfil', '10+ temas entrenados'],
  },
  {
    id: 4,
    titulo: 'Progreso & An\u00e1lisis',
    subtitulo: 'Fotos, videos y estudios m\u00e9dicos con IA',
    icon: Camera,
    color: 'from-pink-500 to-rose-500',
    mockup: (
      <div className="grid grid-cols-3 gap-1.5 px-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="aspect-square bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/10 flex items-center justify-center">
            {i <= 3 ? <Camera className="w-3 h-3 text-pink-400/30" /> : <Stethoscope className="w-3 h-3 text-cyan-400/30" />}
          </div>
        ))}
      </div>
    ),
    features: ['Sub\u00ed fotos y la IA analiza avances', 'Carg\u00e1 estudios m\u00e9dicos', 'Opini\u00f3n basada en evidencia'],
  },
  {
    id: 5,
    titulo: 'Para Gimnasios',
    subtitulo: 'Gestion\u00e1 clientes con rutinas y nutrici\u00f3n',
    icon: Users,
    color: 'from-amber-500 to-orange-500',
    mockup: (
      <div className="space-y-2 px-3">
        {['Lucas M.', 'Sofia L.', 'Pedro R.'].map((n, i) => (
          <div key={n} className="flex items-center gap-2 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-full text-[7px] text-amber-400/70 flex items-center justify-center font-bold">{n[0]}</div>
            <div className="flex-1"><div className="h-1.5 bg-white/15 rounded-full w-16" /></div>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-purple-500/15 rounded" />
              <div className="w-4 h-4 bg-emerald-500/15 rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
    features: ['Cre\u00e1 rutinas por cliente', 'Envi\u00e1 planes por WhatsApp', 'Acceso a todos los m\u00f3dulos'],
  },
];

export default function DemoShowcase({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const slide = slides[current];

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden">
      {/* Player */}
      <div className="relative bg-gradient-to-b from-[#060a12] to-dark-800 p-5" style={{ minHeight: 260 }}>
        {/* Slide content */}
        <div className="text-center mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${slide.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
            <slide.icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-black text-lg tracking-tight">{slide.titulo}</h3>
          <p className="text-white/40 text-xs mt-0.5">{slide.subtitulo}</p>
        </div>

        {/* Mockup */}
        <div className="bg-dark-900/80 border border-dark-border rounded-xl p-3 mx-auto max-w-[220px]" style={{ minHeight: 110 }}>
          {slide.mockup}
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {slide.features.map(f => (
            <span key={f} className="text-[10px] px-2 py-0.5 bg-white/[0.04] border border-white/5 rounded-full text-white/40">{f}</span>
          ))}
        </div>

        {/* Play/pause */}
        <button onClick={() => setAutoPlay(!autoPlay)} className="absolute top-3 right-3 p-1.5 text-white/15 hover:text-white/40 transition-colors">
          {autoPlay ? <span className="text-[10px]">II</span> : <Play className="w-3 h-3" />}
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-3 border-t border-dark-border/50">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); setAutoPlay(false); }}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-electric' : 'w-1.5 bg-white/15 hover:bg-white/25'}`} />
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <div className="bg-gradient-to-r from-electric/10 to-neon/5 border border-electric/15 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-white font-bold text-sm">Comenz\u00e1 a transformar tu cuerpo hoy</p>
          <p className="text-white/30 text-xs mt-0.5">Acceso completo a todos los m\u00f3dulos por un a\u00f1o</p>
          <button onClick={onClose}
            className="mt-3 w-full py-3 bg-gradient-to-r from-electric to-neon text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Suscribirme Ahora <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
