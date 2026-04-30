import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CreditCard, Copy, CheckCircle, Shield, LogOut } from 'lucide-react';
import { getPrecioMensualGym } from './PaymentModal';

export default function GymInactiveModal() {
  const { updateUser, logout } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const precio = getPrecioMensualGym();

  const copyAlias = () => {
    navigator.clipboard.writeText('justfit365');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reactivar = () => {
    setProcessing(true);
    setTimeout(() => {
      updateUser({
        suscripcionActiva: true,
        fechaUltimoPago: new Date().toISOString().split('T')[0],
        mesesImpagos: 0,
      });
      setDone(true);
      setProcessing(false);
    }, 2000);
  };

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="bg-dark-800 border border-emerald-500/30 rounded-3xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Cuenta Reactivada</h2>
          <p className="text-white/50 text-sm">Tu suscripci&oacute;n de gimnasio est&aacute; activa nuevamente. Pr&oacute;ximo pago en 30 d&iacute;as.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-danger/30 rounded-3xl w-full max-w-md shadow-2xl shadow-danger/10 overflow-hidden">
        {/* Header */}
        <div className="bg-danger/10 border-b border-danger/20 px-6 py-5 text-center">
          <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-black text-white">Cuenta Inactiva</h2>
          <p className="text-white/40 text-sm mt-1">Tu suscripci&oacute;n de gimnasio fue suspendida por falta de pago.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-danger/5 border border-danger/10 rounded-xl p-4 text-sm text-white/60">
            <p>Tu cuenta acumula <strong className="text-danger">2 o m&aacute;s meses sin pago</strong>. Para reactivar el acceso, actualiz&aacute; tu pago mensual.</p>
          </div>

          <div className="bg-black/40 border border-dark-border rounded-xl p-4 space-y-3">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-electric" /> Datos para el pago
            </h4>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Alias Mercado Pago</p>
                <p className="text-electric font-mono font-bold">justfit365</p>
              </div>
              <button onClick={copyAlias} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-electric/10 text-electric hover:bg-electric/20'}`}>
                {copied ? <><CheckCircle className="w-3 h-3 inline mr-1" />Copiado</> : <><Copy className="w-3 h-3 inline mr-1" />Copiar</>}
              </button>
            </div>
            <div className="p-3 bg-dark-700 rounded-lg">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Titular</p>
              <p className="text-white font-medium text-sm">Carlos Federico Cuevas</p>
            </div>
            <div className="p-3 bg-dark-700 rounded-lg">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Monto mensual</p>
              <p className="text-emerald-400 font-black text-lg">USD {precio.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={logout}
              className="flex-1 py-3 bg-white/5 text-white/40 rounded-xl text-sm font-semibold border border-dark-border hover:bg-white/10 hover:text-white/60 transition-all flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Salir
            </button>
            <button onClick={reactivar} disabled={processing}
              className="flex-1 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg shadow-electric/20 flex items-center justify-center gap-2 disabled:opacity-40">
              {processing ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><CreditCard className="w-4 h-4" /> Reactivar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
