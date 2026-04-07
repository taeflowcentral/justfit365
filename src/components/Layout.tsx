import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ConsentModal from './ConsentModal';
import PaymentModal from './PaymentModal';
import GymInactiveModal from './GymInactiveModal';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, AlertTriangle } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();

  const esGimnasio = user?.role === 'gimnasio';

  // Logica de vencimiento para usuarios (anual, recordatorio 10 dias antes)
  const diasParaVencerAnual = user?.fechaSuscripcion && !esGimnasio
    ? Math.ceil((new Date(new Date(user.fechaSuscripcion).setFullYear(new Date(user.fechaSuscripcion).getFullYear() + 1)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const mostrarRecordatorioAnual = diasParaVencerAnual !== null && diasParaVencerAnual <= 10 && diasParaVencerAnual > 0 && user?.suscripcionPagada;

  // Logica de vencimiento para gimnasios (mensual)
  const diasDesdeUltimoPagoGym = esGimnasio && user?.fechaUltimoPago
    ? Math.floor((Date.now() - new Date(user.fechaUltimoPago).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const mesesSinPagarGym = Math.floor(diasDesdeUltimoPagoGym / 30);
  const gymInactivo = esGimnasio && user?.suscripcionPagada && mesesSinPagarGym >= 2;
  const gymProximoVencimiento = esGimnasio && user?.suscripcionPagada && !gymInactivo && diasDesdeUltimoPagoGym >= 25;

  // Mostrar modal de pago si no pago aun
  const mostrarPayment = user && user.consentimiento && !user.suscripcionPagada && user.role !== 'admin';

  return (
    <div className="flex min-h-screen bg-black">
      {user && !user.consentimiento && <ConsentModal />}
      {mostrarPayment && <PaymentModal />}
      {gymInactivo && <GymInactiveModal />}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-dark-900/50 backdrop-blur border-b border-dark-border flex items-center justify-between px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/30 w-full max-w-80"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-electric rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-xl border border-dark-border">
              {user?.foto ? (
                <img src={user.foto} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-xs font-black">
                  {user?.nombre?.charAt(0)}
                </div>
              )}
              <span className="text-sm text-white/70 font-medium">{user?.nombre}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {/* Recordatorio anual (usuarios) */}
          {mostrarRecordatorioAnual && (
            <div className="mb-4 bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Tu suscripci&oacute;n vence en {diasParaVencerAnual} d&iacute;as</p>
                <p className="text-white/40 text-xs">Renov&aacute; tu plan anual para no perder acceso a JustFit365.</p>
              </div>
            </div>
          )}
          {/* Recordatorio mensual (gimnasios) */}
          {gymProximoVencimiento && (
            <div className="mb-4 bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Tu pago mensual vence pronto</p>
                <p className="text-white/40 text-xs">Renov&aacute; tu suscripci&oacute;n mensual. Al 2do mes impago tu cuenta se inactivar&aacute;.</p>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
