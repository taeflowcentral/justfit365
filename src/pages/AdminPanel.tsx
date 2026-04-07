import { useState } from 'react';
import { Settings, DollarSign, Users, Mail, Send, CheckCircle, AlertTriangle, Shield, Bell } from 'lucide-react';
import { getPrecioAnual, setPrecioAnual, getPrecioMensualGym, setPrecioMensualGym } from '../components/PaymentModal';
import { getAllUsers } from '../context/AuthContext';

export default function AdminPanel() {
  const allUsers = getAllUsers().filter(u => u.role !== 'admin');
  const [precio, setPrecio] = useState(getPrecioAnual().toString());
  const [precioSaved, setPrecioSaved] = useState(false);
  const [emailsSent, setEmailsSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirmPrecio, setShowConfirmPrecio] = useState(false);

  const [precioGym, setPrecioGymState] = useState(getPrecioMensualGym().toString());
  const [precioGymSaved, setPrecioGymSaved] = useState(false);

  const handleSavePrecio = () => {
    const nuevoPrecio = parseFloat(precio);
    if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) return;
    setPrecioAnual(nuevoPrecio);
    setPrecioSaved(true);
    setShowConfirmPrecio(false);
    setTimeout(() => setPrecioSaved(false), 3000);
  };

  const handleSavePrecioGym = () => {
    const val = parseFloat(precioGym);
    if (isNaN(val) || val <= 0) return;
    setPrecioMensualGym(val);
    setPrecioGymSaved(true);
    setTimeout(() => setPrecioGymSaved(false), 3000);
  };

  const enviarNotificacion = () => {
    setSending(true);
    setTimeout(() => {
      setEmailsSent(true);
      setSending(false);
      setTimeout(() => setEmailsSent(false), 4000);
    }, 2000);
  };

  const precioActual = getPrecioAnual();
  const nuevoPrecio = parseFloat(precio);
  const precioCambio = !isNaN(nuevoPrecio) && nuevoPrecio !== precioActual;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-amber-400" /> Panel de Administraci&oacute;n
        </h1>
        <p className="text-white/40 text-sm mt-1">Carlos Federico Cuevas &mdash; Administrador de JustFit365</p>
      </div>

      {/* Configurar precio */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" /> Precio de Suscripci&oacute;n Anual
        </h3>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Precio en USD</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">USD</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                className="w-full pl-16 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
            </div>
            <p className="text-white/20 text-xs mt-1">Precio actual: USD {precioActual.toFixed(2)}</p>
          </div>

          {precioCambio ? (
            <button onClick={() => setShowConfirmPrecio(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm uppercase tracking-wider rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/20">
              Actualizar Precio
            </button>
          ) : precioSaved ? (
            <div className="px-6 py-3.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Guardado
            </div>
          ) : (
            <div className="px-6 py-3.5 bg-white/5 text-white/20 rounded-xl text-sm font-bold border border-dark-border">
              Sin cambios
            </div>
          )}
        </div>

        {precioCambio && (
          <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs">
              Al cambiar el precio de <strong className="text-white">USD {precioActual.toFixed(2)}</strong> a <strong className="text-amber-400">USD {nuevoPrecio.toFixed(2)}</strong>, se recomienda notificar a todos los usuarios.
            </p>
          </div>
        )}
      </div>

      {/* Precio mensual gimnasios */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" /> Precio Mensual Gimnasios
        </h3>
        <p className="text-white/30 text-xs mb-4">Los gimnasios pagan mensualmente. Se inactivan al 2do mes impago y se reactivan al actualizar el pago.</p>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Precio mensual USD</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">USD</span>
              <input type="number" min="1" step="0.01" value={precioGym} onChange={e => setPrecioGymState(e.target.value)}
                className="w-full pl-16 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <p className="text-white/20 text-xs mt-1">Actual: USD {getPrecioMensualGym().toFixed(2)}/mes</p>
          </div>
          <button onClick={handleSavePrecioGym}
            className={`px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
              precioGymSaved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]'
            }`}>
            {precioGymSaved ? <><CheckCircle className="w-4 h-4 inline mr-1" /> Guardado</> : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Notificaciones masivas */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-electric" /> Notificaciones a Usuarios
        </h3>
        <div className="space-y-3">
          <div className="bg-black/40 border border-dark-border rounded-xl p-4">
            <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">Destinatarios</p>
            <p className="text-white text-sm">{allUsers.length} usuarios registrados recibir&aacute;n la notificaci&oacute;n por email</p>
          </div>
          <div className="bg-black/40 border border-dark-border rounded-xl p-4">
            <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">Vista previa del email</p>
            <div className="bg-dark-700 rounded-lg p-4 text-sm text-white/60 space-y-2 border border-dark-border">
              <p className="text-white font-bold">Asunto: Actualizaci&oacute;n de Suscripci&oacute;n JustFit365</p>
              <hr className="border-dark-border" />
              <p>Hola [nombre del usuario],</p>
              <p>Te informamos que el precio de la suscripci&oacute;n anual de JustFit365 ha sido actualizado a <strong className="text-electric">USD {(parseFloat(precio) || precioActual).toFixed(2)}</strong>.</p>
              <p>Este cambio aplica a partir de tu pr&oacute;xima renovaci&oacute;n. Tu suscripci&oacute;n actual contin&uacute;a vigente hasta su fecha de vencimiento.</p>
              <p>Datos de pago:<br />
                Alias: <strong className="text-electric">ventanasdepapel</strong><br />
                Titular: Carlos Federico Cuevas<br />
                Comprobante a: carloscuevaslaplata@gmail.com
              </p>
              <p className="text-white/30">Saludos,<br />Equipo JustFit365</p>
            </div>
          </div>
          <button onClick={enviarNotificacion} disabled={sending || emailsSent}
            className={`w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              emailsSent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              sending ? 'bg-electric/20 text-electric border border-electric/30' :
              'bg-gradient-to-r from-electric to-neon text-black shadow-lg shadow-electric/20 hover:scale-[1.01]'
            }`}>
            {sending ? (
              <><div className="w-4 h-4 border-2 border-electric/30 border-t-electric rounded-full animate-spin" /> Enviando...</>
            ) : emailsSent ? (
              <><CheckCircle className="w-4 h-4" /> Emails enviados a {allUsers.length} usuarios</>
            ) : (
              <><Send className="w-4 h-4" /> Enviar Notificaci&oacute;n a Todos los Usuarios</>
            )}
          </button>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Usuarios Registrados
          </h3>
          <span className="text-white/30 text-xs">{allUsers.length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Nombre', 'Email', 'DNI', 'Tipo', 'Fecha Pago', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {allUsers.map(u => (
                <tr key={u.dni} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{u.nombre}</td>
                  <td className="px-4 py-3 text-sm text-white/50 font-mono text-xs">{u.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white/40 font-mono">{u.dni}</td>
                  <td className="px-4 py-3 text-sm text-white/40">{u.role === 'gimnasio' ? 'Gym' : 'Individual'}</td>
                  <td className="px-4 py-3 text-sm text-white/40">{u.fechaSuscripcion || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.suscripcionPagada ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.suscripcionPagada ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info de la cuenta */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" /> Cuenta de Cobro
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-dark-700 rounded-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">Alias Mercado Pago</p>
            <p className="text-electric font-mono font-bold">ventanasdepapel</p>
          </div>
          <div className="p-3 bg-dark-700 rounded-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">Titular</p>
            <p className="text-white font-medium text-sm">Carlos Federico Cuevas</p>
          </div>
          <div className="p-3 bg-dark-700 rounded-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">Email de notificaciones</p>
            <p className="text-white font-medium text-sm">carloscuevaslaplata@gmail.com</p>
          </div>
          <div className="p-3 bg-dark-700 rounded-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">Recordatorio autom&aacute;tico</p>
            <p className="text-white font-medium text-sm flex items-center gap-1"><Bell className="w-3 h-3 text-warning" /> 10 d&iacute;as antes del vencimiento</p>
          </div>
        </div>
      </div>

      {/* Modal confirmar precio */}
      {showConfirmPrecio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmPrecio(false)}>
          <div className="bg-dark-800 border border-amber-500/30 rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h2 className="text-lg font-black text-white">Confirmar Cambio de Precio</h2>
              <p className="text-white/40 text-sm mt-1">Esta acci&oacute;n cambiar&aacute; el precio para todos los nuevos pagos.</p>
            </div>
            <div className="bg-black/40 border border-dark-border rounded-xl p-4 mb-5 flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-white/30 text-xs">Actual</p>
                <p className="text-white/50 text-lg font-bold line-through">USD {precioActual.toFixed(2)}</p>
              </div>
              <span className="text-white/20 text-2xl">&rarr;</span>
              <div className="text-center">
                <p className="text-amber-400 text-xs">Nuevo</p>
                <p className="text-amber-400 text-lg font-black">USD {nuevoPrecio.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmPrecio(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={handleSavePrecio} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
