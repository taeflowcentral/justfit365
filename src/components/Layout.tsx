import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ConsentModal from './ConsentModal';
import PaymentModal from './PaymentModal';
import GymInactiveModal from './GymInactiveModal';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, Menu } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const esGimnasio = user?.role === 'gimnasio';

  const diasParaVencerAnual = user?.fechaSuscripcion && !esGimnasio
    ? Math.ceil((new Date(new Date(user.fechaSuscripcion).setFullYear(new Date(user.fechaSuscripcion).getFullYear() + 1)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const mostrarRecordatorioAnual = diasParaVencerAnual !== null && diasParaVencerAnual <= 10 && diasParaVencerAnual > 0 && user?.suscripcionPagada;

  const diasDesdeUltimoPagoGym = esGimnasio && user?.fechaUltimoPago
    ? Math.floor((Date.now() - new Date(user.fechaUltimoPago).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const mesesSinPagarGym = Math.floor(diasDesdeUltimoPagoGym / 30);
  const gymInactivo = esGimnasio && user?.suscripcionPagada && mesesSinPagarGym >= 2;
  const gymProximoVencimiento = esGimnasio && user?.suscripcionPagada && !gymInactivo && diasDesdeUltimoPagoGym >= 25;

  const mostrarPayment = user && user.consentimiento && !user.suscripcionPagada && user.role !== 'admin';
  const cuentaDeshabilitada = user && user.suscripcionPagada && user.suscripcionActiva === false && user.role !== 'admin';

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-black">
      {user && !user.consentimiento && <ConsentModal />}
      {mostrarPayment && <PaymentModal />}
      {gymInactivo && <GymInactiveModal />}
      {cuentaDeshabilitada && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-danger/30 rounded-3xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-white font-black text-xl mb-2">Cuenta Deshabilitada</h2>
            <p className="text-white/60 text-sm mb-6">Tu cuenta fue deshabilitada por el administrador. Para reactivarla, contactate con soporte.</p>
            <a href="mailto:carloscuevaslaplata@gmail.com?subject=JustFit365%20-%20Cuenta%20Deshabilitada"
              className="block w-full py-3 bg-electric/15 text-electric rounded-xl text-sm font-bold border border-electric/30 hover:bg-electric/25 transition-colors mb-2">
              Contactar Soporte
            </a>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar onNavigate={() => {}} />
      </div>

      {/* Sidebar mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-10">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 md:h-16 bg-dark-900/50 backdrop-blur border-b border-dark-border flex items-center justify-between px-3 md:px-6 shrink-0">
          <div className="flex items-center gap-2">
            {/* Hamburger mobile */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-white/40 hover:text-white rounded-xl transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <span className="md:hidden text-white font-black text-sm tracking-tighter">JustFit<span className="text-lime">365</span></span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-electric rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-dark-800 rounded-xl border border-dark-border">
              {user?.foto ? (
                <img src={user.foto} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-xs font-black">
                  {user?.nombre?.charAt(0)}
                </div>
              )}
              <span className="text-sm text-white/70 font-medium hidden sm:inline">{user?.nombre}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 overflow-auto">
          {mostrarRecordatorioAnual && (
            <div className="mb-4 bg-warning/10 border border-warning/20 rounded-2xl p-3 md:p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Tu suscripci&oacute;n vence en {diasParaVencerAnual} d&iacute;as</p>
                <p className="text-white/40 text-xs">Renov&aacute; tu plan para no perder acceso.</p>
              </div>
            </div>
          )}
          {gymProximoVencimiento && (
            <div className="mb-4 bg-warning/10 border border-warning/20 rounded-2xl p-3 md:p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Tu pago mensual vence pronto</p>
                <p className="text-white/40 text-xs">Al 2do mes impago tu cuenta se inactivar&aacute;.</p>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Boton flotante Claude - solo admin */}
      {user?.role === 'admin' && (
        <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-[#d97706] to-[#b45309] rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
          title="Abrir Claude Code">
          <svg className="w-5 h-5 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.45 4.5 3.68 5.83L5 21l4.53-2.27c.8.17 1.62.27 2.47.27 4.97 0 9-3.13 9-7s-4.03-7-9-7z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
