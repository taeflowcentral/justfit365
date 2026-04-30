import { Zap, Dumbbell, Utensils, TrendingUp, Timer, MessageSquare, Users, ChevronDown, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LanguageSelector from '../components/LanguageSelector';

const features = [
  { icon: Utensils, title: 'Plan Nutricional', desc: 'Planes personalizados según tu peso, objetivo y condiciones. Base de 400+ alimentos de 8 países. Avalado por profesionales UNLP y UCA.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Dumbbell, title: 'Rutinas Inteligentes', desc: 'Ejercicios adaptados a tu nivel. Push, Pull, Piernas, HIIT, Yoga y más. Se ajustan automáticamente.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: MessageSquare, title: 'JustFit Coach', desc: 'Tu coach virtual 24/7. Consultá sobre suplementos, ayuno, nutrición, lesiones y más.', color: 'text-electric', bg: 'bg-electric/10' },
  { icon: TrendingUp, title: 'Progreso Real', desc: 'Seguimiento de peso, medidas y fotos. Gráficos de evolución con metas y proyecciones.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Timer, title: 'Workout Timer', desc: 'Cronómetro, Tabata, EMOM, For Time. Sonidos automáticos para entrenar sin mirar el celular.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Users, title: 'Panel Gimnasios', desc: 'Gestión de clientes, rutinas, nutrición, cobranzas y marca blanca. Todo en un solo lugar.', color: 'text-lime', bg: 'bg-lime/10' },
];

const testimonios = [
  { nombre: 'Laura M.', texto: 'En 3 meses bajé 8kg siguiendo los planes. El coach me ayudó a entender los ayunos.', estrellas: 5 },
  { nombre: 'Martín R.', texto: 'Como entrenador uso el panel de gimnasio para todos mis clientes. Ahorro horas de trabajo.', estrellas: 5 },
  { nombre: 'Sofía L.', texto: 'La base de alimentos es increíble. Puedo armar mis comidas y ver los macros al instante.', estrellas: 5 },
];

const screenshots = [
  { title: 'Dashboard', desc: 'Tu resumen diario con calorías, entreno, hidratación y progreso de peso.' },
  { title: 'Nutrición', desc: 'Plan completo con desayuno, almuerzo, merienda y cena. Macros automáticos.' },
  { title: 'Rutinas', desc: 'Ejercicios por día con series, reps, peso y descanso. Editable al 100%.' },
  { title: 'JustFit Coach', desc: '55+ temas: ayuno, secado, lesiones, tendones, recomposición, microbiota, sueño, hidratación y más.' },
  { title: 'Timer', desc: '5 modos: Cronómetro, Cuenta regresiva, Tabata, EMOM, For Time.' },
  { title: 'Gimnasios', desc: 'Clientes, rutinas, nutrición, cobranzas y marca blanca para tu gym.' },
];

export default function Landing() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lime rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-sm tracking-tighter">JustFit<span className="text-lime">365</span></span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link to="/login" className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs font-bold rounded-lg hover:bg-white/10 transition-all">Ingresar</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-lime/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-electric/6 rounded-full blur-[150px]" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime/10 border border-lime/20 rounded-full text-lime text-xs font-bold uppercase tracking-wider mb-8">
            <Zap className="w-3.5 h-3.5" /> Fitness &amp; Nutrici&oacute;n Inteligente
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
            JustFit<span className="text-lime">365</span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/50 max-w-2xl mx-auto mb-4 leading-relaxed">
            Tu cuerpo necesita un plan. Nosotros te damos <strong className="text-white">la ciencia, la tecnolog&iacute;a y el acompa&ntilde;amiento</strong> para lograrlo.
          </p>

          <p className="text-white/30 text-sm mb-4 max-w-lg mx-auto">
            Planes nutricionales personalizados, rutinas inteligentes, coach virtual 24/7, seguimiento de progreso y mucho m&aacute;s. Todo en una sola app.
          </p>
          <p className="text-white/20 text-xs mb-10 max-w-md mx-auto">
            Contenido avalado por profesionales en Nutrici&oacute;n y Ciencias del Deporte de la <strong className="text-white/40">UNLP</strong> y <strong className="text-white/40">UCA</strong>
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-16 text-center mb-16">
            <div><p className="text-3xl sm:text-4xl font-black text-lime">400+</p><p className="text-white/30 text-xs uppercase tracking-wider">Alimentos<br/><span className="text-white/40 text-[10px] normal-case tracking-normal">de 8 países</span></p></div>
            <div><p className="text-3xl sm:text-4xl font-black text-white">55+</p><p className="text-white/30 text-xs uppercase tracking-wider">Temas Coach</p></div>
            <div><p className="text-3xl sm:text-4xl font-black text-white">5</p><p className="text-white/30 text-xs uppercase tracking-wider">Modos Timer</p></div>
            <div><p className="text-3xl sm:text-4xl font-black text-lime">24/7</p><p className="text-white/30 text-xs uppercase tracking-wider">Disponible</p></div>
          </div>

          <div className="mt-8 animate-bounce">
            <ChevronDown className="w-8 h-8 text-lime mx-auto drop-shadow-[0_0_12px_rgba(140,207,46,0.6)]" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-lime text-xs font-bold uppercase tracking-widest mb-3">Todo lo que necesit&aacute;s</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Una app, infinitas posibilidades</h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto">Dise&ntilde;ada para personas que quieren resultados reales. Sin humo, con ciencia.</p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-dark-800 border border-dark-border rounded-2xl p-6 hover:border-white/10 transition-all group">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section className="py-20 px-4 bg-dark-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-lime text-xs font-bold uppercase tracking-widest mb-3">As&iacute; se ve por dentro</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Conoc&eacute; cada m&oacute;dulo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((s, i) => (
              <div key={s.title} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden group hover:border-lime/20 transition-all">
                <div className={`h-40 flex items-center justify-center ${
                  i === 0 ? 'bg-gradient-to-br from-electric/10 to-neon/5' :
                  i === 1 ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/5' :
                  i === 2 ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/5' :
                  i === 3 ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5' :
                  i === 4 ? 'bg-gradient-to-br from-red-500/10 to-rose-500/5' :
                  'bg-gradient-to-br from-lime/10 to-emerald-500/5'
                }`}>
                  <div className="text-center">
                    <p className="text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors">{s.title}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold mb-1">{s.title}</h3>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lime text-xs font-bold uppercase tracking-widest mb-3">Resultados reales</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Lo que dicen nuestros usuarios</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonios.map(t => (
              <div key={t.nombre} className="bg-dark-800 border border-dark-border rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.estrellas }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">"{t.texto}"</p>
                <p className="text-white font-bold text-sm">{t.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES Y PRECIOS */}
      <section className="py-20 px-4 bg-dark-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lime text-xs font-bold uppercase tracking-widest mb-3">Planes accesibles</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Eleg&iacute; el plan que se adapte a vos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Individual */}
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-6 relative">
              <h3 className="text-white font-bold text-lg mb-1">Plan Individual</h3>
              <p className="text-white/40 text-xs mb-4">Acceso completo a todos los m&oacute;dulos</p>
              <p className="text-3xl sm:text-4xl font-black text-white mb-1">$57.000 <span className="text-lime text-base sm:text-lg font-bold">/ 1 A&ntilde;o</span></p>
              <p className="text-white/30 text-xs mb-6">Menos de $5.000 por mes</p>
              <ul className="space-y-2 mb-6">
                {['Plan nutricional personalizado', 'Rutinas inteligentes', 'JustFit Coach 24/7', 'Progreso y mediciones', 'Workout Timer', 'Análisis médicos'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white/60 text-sm"><CheckCircle className="w-4 h-4 text-lime shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/registro" className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold flex items-center justify-center hover:bg-white/10 transition-all">
                Crear cuenta
              </Link>
            </div>

            {/* Gimnasio */}
            <div className="bg-dark-800 border-2 border-lime/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-lime text-black text-[10px] font-black uppercase tracking-wider rounded-full">Popular</div>
              <h3 className="text-white font-bold text-lg mb-1">Plan Gimnasio</h3>
              <p className="text-white/40 text-xs mb-4">Marca blanca + gesti&oacute;n de clientes</p>
              <p className="text-4xl font-black text-lime mb-1">$19.000<span className="text-white/30 text-sm font-normal">/mes</span></p>
              <p className="text-white/30 text-xs mb-6">Clientes ilimitados</p>
              <ul className="space-y-2 mb-6">
                {['Todo lo del Plan Individual', 'Panel de gestión de clientes', 'Rutinas y nutrición por cliente', 'Sistema de cobranzas', 'Marca blanca (tu logo)', 'WhatsApp y Email integrado'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white/60 text-sm"><CheckCircle className="w-4 h-4 text-lime shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/registro" className="w-full py-3 bg-lime text-black rounded-xl text-sm font-black flex items-center justify-center hover:bg-lime/80 transition-all">
                Empezar ahora
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/60 font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all">
              Ya tengo cuenta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-2">
            {[
              { q: '¿Necesito experiencia para usar la app?', a: 'No. JustFit365 está diseñada tanto para principiantes como para avanzados. El sistema se adapta a tu nivel y objetivo.' },
              { q: '¿Puedo usarla en el celular?', a: 'Sí. Es una app web que funciona en cualquier dispositivo: celular, tablet o PC. Podés instalarla como app desde el navegador.' },
              { q: '¿Cómo funciona el Coach virtual?', a: 'Es un asistente inteligente con más de 40 temas de nutrición, suplementación, entrenamiento y salud. Le preguntás y te responde con información personalizada según tu perfil.' },
              { q: '¿Sirve para gimnasios?', a: 'Sí. El Plan Gimnasio incluye gestión de clientes, rutinas y nutrición personalizadas, sistema de cobranzas y marca blanca con tu logo.' },
              { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. No hay permanencia mínima. Tu suscripción se mantiene activa hasta el vencimiento del período pagado.' },
              { q: '¿Qué métodos de pago aceptan?', a: 'Mercado Pago (tarjeta, transferencia, efectivo en puntos de pago) y transferencia bancaria directa.' },
            ].map((faq, i) => (
              <button key={i} onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full text-left bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-sm">{faq.q}</p>
                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform shrink-0 ml-2 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </div>
                {faqOpen === i && <p className="text-white/50 text-sm mt-3 leading-relaxed">{faq.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-lime/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-electric/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Empez&aacute; hoy.<br />Tu cuerpo te lo va a agradecer.</h2>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">No importa si reci&eacute;n arranc&aacute;s o si entren&aacute;s hace a&ntilde;os. JustFit365 se adapta a vos.</p>
          <Link to="/registro"
            className="inline-flex items-center gap-2 px-10 py-5 bg-lime text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-lime/80 transition-all shadow-lg shadow-lime/20 hover:scale-[1.02]">
            <Zap className="w-5 h-5" /> Crear Cuenta
          </Link>
          <p className="text-white/20 text-xs mt-4">Sin tarjeta de cr&eacute;dito. Empez&aacute; a explorar ahora.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-dark-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black tracking-tighter">JustFit<span className="text-lime">365</span></span>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-xs">
            <Link to="/login" className="hover:text-white transition-colors">Iniciar sesi&oacute;n</Link>
            <Link to="/registro" className="hover:text-white transition-colors">Registrarse</Link>
            <a href="mailto:justfit365.com@gmail.com" className="hover:text-white transition-colors">Contacto</a>
          </div>
          <p className="text-white/15 text-xs">&copy; 2026 JustFit365</p>
        </div>
      </footer>
    </div>
  );
}
