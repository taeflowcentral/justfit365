import { CreditCard, CheckCircle, Calendar, Shield, Clock, Copy, Mail, DollarSign, Zap, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { getPrecioAnual, getPrecioMensualGym } from '../components/PaymentModal';

export default function Suscripcion() {
  const { user } = useAuth();
  const esGimnasio = user?.role === 'gimnasio';
  const precio = esGimnasio ? getPrecioMensualGym() : getPrecioAnual();
  const periodo = esGimnasio ? 'mes' : 'a\u00f1o';
  const planNombre = esGimnasio ? 'Plan Gimnasio Mensual' : 'Plan Anual Completo';
  const [copied, setCopied] = useState(false);

  const fechaInicio = user?.fechaSuscripcion ? new Date(user.fechaSuscripcion) : null;
  const fechaUltimoPago = user?.fechaUltimoPago ? new Date(user.fechaUltimoPago) : fechaInicio;

  // Calculo de vencimiento segun tipo
  let fechaVenc: Date | null = null;
  let diasRestantes = 0;
  let totalDias = 365;

  if (esGimnasio && fechaUltimoPago) {
    fechaVenc = new Date(fechaUltimoPago);
    fechaVenc.setMonth(fechaVenc.getMonth() + 1);
    diasRestantes = Math.ceil((fechaVenc.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    totalDias = 30;
  } else if (fechaInicio) {
    fechaVenc = new Date(fechaInicio);
    fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
    diasRestantes = Math.ceil((fechaVenc.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    totalDias = 365;
  }

  const porcentaje = fechaInicio ? Math.max(0, Math.min(100, ((totalDias - diasRestantes) / totalDias) * 100)) : 0;

  const copyAlias = () => {
    navigator.clipboard.writeText('ventanasdepapel');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <CreditCard className="w-7 h-7 text-electric" /> Mi Suscripci&oacute;n
        </h1>
      </div>

      {user?.suscripcionPagada ? (
        <>
          {/* Estado activo */}
          <div className="bg-gradient-to-br from-electric/10 to-neon/5 border border-electric/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-electric/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-electric" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">{planNombre}</h3>
                  <p className="text-white/40 text-sm">Todos los m&oacute;dulos incluidos</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold">Activa</span>
              </div>
            </div>

            {/* Tipo de renovacion */}
            {esGimnasio && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-4 flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-bold">Renovaci&oacute;n mensual</p>
                  <p className="text-white/40 text-xs">Tu suscripci&oacute;n se renueva cada mes. Se inactiva al 2do mes impago y se reactiva con la actualizaci&oacute;n del pago.</p>
                </div>
              </div>
            )}

            {/* Barra de progreso */}
            <div className="bg-black/30 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-xs text-white/40">
                <span>{(fechaUltimoPago || fechaInicio)?.toLocaleDateString('es-AR')}</span>
                <span>{fechaVenc?.toLocaleDateString('es-AR')}</span>
              </div>
              <div className="w-full h-2.5 bg-dark-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${diasRestantes <= (esGimnasio ? 5 : 10) ? 'bg-warning' : diasRestantes <= (esGimnasio ? 10 : 30) ? 'bg-amber-400' : 'bg-electric'}`}
                  style={{ width: `${porcentaje}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/30 text-xs">Transcurrido: {Math.round(porcentaje)}%</span>
                <span className={`text-sm font-bold ${diasRestantes <= (esGimnasio ? 5 : 10) ? 'text-warning' : 'text-white'}`}>
                  <Clock className="w-3 h-3 inline mr-1" />{diasRestantes} d&iacute;as restantes
                </span>
              </div>
            </div>
          </div>

          {/* Alerta proximo vencimiento gym */}
          {esGimnasio && diasRestantes <= 10 && diasRestantes > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-sm">Tu pago mensual vence en {diasRestantes} d&iacute;as</p>
                <p className="text-white/40 text-xs">Renov&aacute; antes del vencimiento para evitar la inactivaci&oacute;n de tu cuenta. Record&aacute; que al 2do mes impago tu cuenta se desactiva.</p>
              </div>
            </div>
          )}

          {/* Detalles */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Detalle de suscripci&oacute;n</h3>
            <div className="space-y-3">
              {[
                { icon: DollarSign, label: 'Monto', value: `USD ${precio.toFixed(2)} /${periodo}` },
                { icon: RotateCcw, label: 'Renovaci\u00f3n', value: esGimnasio ? 'Mensual' : 'Anual' },
                { icon: Calendar, label: esGimnasio ? '\u00daltimo pago' : 'Fecha de pago', value: (fechaUltimoPago || fechaInicio)?.toLocaleDateString('es-AR') || '-' },
                { icon: Calendar, label: 'Pr\u00f3ximo vencimiento', value: fechaVenc?.toLocaleDateString('es-AR') || '-' },
                { icon: Mail, label: 'Recordatorio', value: esGimnasio ? '5 d\u00edas antes del vencimiento mensual' : '10 d\u00edas antes del vencimiento anual' },
                { icon: Shield, label: 'M\u00e9todo', value: 'Mercado Pago / Transferencia' },
                ...(esGimnasio ? [{ icon: AlertTriangle, label: 'Pol\u00edtica de impago', value: 'Inactiva al 2do mes impago. Se reactiva al pagar.' }] : []),
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-dark-border/50 last:border-0">
                  <span className="text-white/40 text-sm flex items-center gap-2"><item.icon className="w-4 h-4" />{item.label}</span>
                  <span className="text-white text-sm font-medium text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Renovacion con Mercado Pago */}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">Renovar suscripci&oacute;n {esGimnasio ? 'mensual' : 'anual'}</h3>
            <p className="text-white/40 text-sm mb-4">Pag&aacute; directamente con Mercado Pago (tarjeta, transferencia o efectivo).</p>

            <a href={`https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${esGimnasio ? '298094579-44854631-17e8-4269-b03c-707f378f8780' : '298094579-058e0891-adc2-4205-8c67-336f50886771'}`} target="_blank" rel="noopener noreferrer"
              className="w-full py-4 bg-[#00b1ea] hover:bg-[#009dd4] text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00b1ea]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2"/><text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">MP</text></svg>
              Renovar con Mercado Pago (USD {precio.toFixed(2)})
            </a>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-xl">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">Alias alternativo</p>
                  <p className="text-electric font-mono font-bold">ventanasdepapel</p>
                </div>
                <button onClick={copyAlias} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-electric/10 text-electric hover:bg-electric/20'}`}>
                  {copied ? <><CheckCircle className="w-3 h-3 inline mr-1" />Copiado</> : <><Copy className="w-3 h-3 inline mr-1" />Copiar</>}
                </button>
              </div>
              <div className="p-3 bg-dark-700 rounded-xl">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Comprobante a</p>
                <p className="text-electric font-medium text-sm">carloscuevaslaplata@gmail.com</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
          <CreditCard className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">Sin suscripci&oacute;n activa</h3>
          <p className="text-white/40 text-sm">Complet&aacute; el pago para acceder a todos los m&oacute;dulos de JustFit365.</p>
        </div>
      )}
    </div>
  );
}
