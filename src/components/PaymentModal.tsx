import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Zap, Shield, CheckCircle, Copy, Mail, Calendar, Play } from 'lucide-react';
import DemoShowcase from './DemoShowcase';

const PRECIO_ANUAL_KEY = 'bc_precio_anual';
const PRECIO_MENSUAL_GYM_KEY = 'bc_precio_mensual_gym';

export function getPrecioAnual(): number {
  const saved = localStorage.getItem(PRECIO_ANUAL_KEY);
  return saved ? parseFloat(saved) : 10;
}

export function setPrecioAnual(precio: number) {
  localStorage.setItem(PRECIO_ANUAL_KEY, precio.toString());
}

export function getPrecioMensualGym(): number {
  const saved = localStorage.getItem(PRECIO_MENSUAL_GYM_KEY);
  return saved ? parseFloat(saved) : 10;
}

export function setPrecioMensualGym(precio: number) {
  localStorage.setItem(PRECIO_MENSUAL_GYM_KEY, precio.toString());
}

export default function PaymentModal() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState<'demo' | 'info' | 'datos' | 'confirmado'>('demo');
  const [email, setEmail] = useState(user?.email || '');
  const [nombre, setNombre] = useState(`${user?.nombre || ''}`);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const esGimnasio = user?.role === 'gimnasio';
  const precio = esGimnasio ? getPrecioMensualGym() : getPrecioAnual();
  const periodo = esGimnasio ? '/mes' : '/a\u00f1o';
  const planNombre = esGimnasio ? 'Plan Gimnasio Mensual' : 'Plan Anual Completo';

  const alias = 'ventanasdepapel';
  const titular = 'Carlos Federico Cuevas';
  const emailDestino = 'carloscuevaslaplata@gmail.com';

  const vencimiento = new Date();
  if (esGimnasio) {
    vencimiento.setMonth(vencimiento.getMonth() + 1);
  } else {
    vencimiento.setFullYear(vencimiento.getFullYear() + 1);
  }
  const fechaVenc = vencimiento.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const copyAlias = () => {
    navigator.clipboard.writeText(alias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmarPago = () => {
    setProcessing(true);
    setTimeout(() => {
      updateUser({
        suscripcionPagada: true,
        suscripcionActiva: true,
        email: email,
        fechaSuscripcion: new Date().toISOString().split('T')[0],
        fechaUltimoPago: new Date().toISOString().split('T')[0],
        mesesImpagos: 0,
      });
      setStep('confirmado');
      setProcessing(false);
    }, 2000);
  };

  if (step === 'confirmado') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="bg-dark-800 border border-emerald-500/30 rounded-3xl w-full max-w-md p-8 text-center shadow-2xl shadow-emerald-500/10">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Pago Registrado</h2>
          <p className="text-white/50 text-sm mb-4">Tu suscripci&oacute;n a JustFit365 est&aacute; activa.</p>
          <div className="bg-black/40 border border-dark-border rounded-xl p-4 space-y-2 text-sm text-left mb-6">
            <div className="flex justify-between"><span className="text-white/40">Plan:</span><span className="text-white font-bold">{planNombre}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Monto:</span><span className="text-emerald-400 font-bold">USD {precio.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Vencimiento:</span><span className="text-white">{fechaVenc}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Comprobante a:</span><span className="text-white">{email}</span></div>
          </div>
          <div className="bg-electric/5 border border-electric/10 rounded-xl p-3 mb-6">
            <p className="text-electric/60 text-xs flex items-center gap-2 justify-center">
              <Mail className="w-3 h-3" />
              Se enviar&aacute; confirmaci&oacute;n a {email} y a {emailDestino}
            </p>
          </div>
          <p className="text-white/20 text-xs">Te recordaremos 10 d&iacute;as antes del vencimiento.</p>
        </div>
      </div>
    );
  }

  // Step DEMO
  if (step === 'demo') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md">
          <DemoShowcase onClose={() => setStep('info')} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg shadow-2xl shadow-electric/10 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-electric/20 to-neon/10 border-b border-dark-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-electric/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-electric" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Suscripci&oacute;n {esGimnasio ? 'Mensual Gimnasio' : 'Anual'}</h2>
              <p className="text-white/40 text-sm">Activ&aacute; tu acceso completo a JustFit365</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {step === 'info' && (
            <div className="space-y-5">
              {/* Plan */}
              <div className="bg-gradient-to-br from-electric/10 to-neon/5 border border-electric/20 rounded-2xl p-5 text-center">
                <Zap className="w-8 h-8 text-electric mx-auto mb-3" />
                <h3 className="text-white font-black text-lg">{planNombre}</h3>
                <p className="text-4xl font-black text-white mt-2">
                  USD {precio.toFixed(2)}<span className="text-white/30 text-sm font-normal"> {periodo}</span>
                </p>
                {esGimnasio && (
                  <p className="text-warning/60 text-xs mt-2">Pago mensual renovable. Se inactiva al 2do mes impago.</p>
                )}
                <div className="mt-4 space-y-1 text-sm text-white/60">
                  {['Todos los m\u00f3dulos incluidos', 'JustFit Coach ilimitado', 'An\u00e1lisis m\u00e9dicos con IA', 'Galer\u00eda de progreso', 'Planes personalizados', 'Soporte completo'].map(f => (
                    <div key={f} className="flex items-center gap-2 justify-center">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30 justify-center">
                <Calendar className="w-3 h-3" />
                Vencimiento: {fechaVenc} &mdash; Recordatorio autom&aacute;tico {esGimnasio ? '5' : '10'} d&iacute;as antes
              </div>

              <button onClick={() => setStep('datos')}
                className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20">
                Continuar al Pago
              </button>

              <button onClick={() => setStep('demo')}
                className="w-full py-2.5 text-white/30 hover:text-electric text-xs flex items-center justify-center gap-1.5 transition-colors">
                <Play className="w-3 h-3" /> Volver a ver el demo
              </button>
            </div>
          )}

          {step === 'datos' && (
            <div className="space-y-5">
              {/* Datos del usuario */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Tu nombre completo</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1">Tu email (para comprobante)</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
                </div>
              </div>

              {/* Datos de pago */}
              <div className="bg-black/40 border border-dark-border rounded-xl p-4 space-y-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> Datos para transferir
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider">Alias Mercado Pago</p>
                      <p className="text-electric font-mono font-bold text-lg">{alias}</p>
                    </div>
                    <button onClick={copyAlias} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-electric/10 text-electric hover:bg-electric/20'}`}>
                      {copied ? <><CheckCircle className="w-3 h-3 inline mr-1" />Copiado</> : <><Copy className="w-3 h-3 inline mr-1" />Copiar</>}
                    </button>
                  </div>
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Titular</p>
                    <p className="text-white font-medium text-sm">{titular}</p>
                  </div>
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Monto</p>
                    <p className="text-emerald-400 font-black text-lg">USD {precio.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Boton Mercado Pago - Pago directo */}
              <a href={esGimnasio ? 'https://mpago.la/1Cs5Cfe' : 'https://mpago.la/2Y1yV4Z'} target="_blank" rel="noopener noreferrer"
                className="w-full py-4 bg-[#00b1ea] hover:bg-[#009dd4] text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00b1ea]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2"/><text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">MP</text></svg>
                Pagar USD {precio.toFixed(2)} con Mercado Pago
              </a>

              <div className="bg-electric/5 border border-electric/10 rounded-xl p-3 text-xs text-white/40 space-y-1">
                <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-electric" /> Envi&aacute; el comprobante a: <strong className="text-electric">{emailDestino}</strong></p>
                <p className="flex items-center gap-1"><Calendar className="w-3 h-3 text-electric" /> Recordatorio: <strong className="text-white/60">{esGimnasio ? '5' : '10'} d&iacute;as antes del vencimiento</strong></p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('info')} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors border border-dark-border">
                  Volver
                </button>
                <button onClick={confirmarPago} disabled={!email || !nombre || processing}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Ya Transfer&iacute;</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
