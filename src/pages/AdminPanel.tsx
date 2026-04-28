import { useState, useEffect } from 'react';
import { Settings, DollarSign, Users, Mail, Send, CheckCircle, AlertTriangle, Shield, Bell, KeyRound, Trash2, FileText, Eye, Power, PowerOff } from 'lucide-react';
import { getPrecioAnual, setPrecioAnual, getPrecioMensualGym, setPrecioMensualGym } from '../components/PaymentModal';
import { getAllUsers, type User } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getPagos } from '../lib/pagos';

interface Pago {
  id: string;
  dni: string;
  nombre: string;
  email: string;
  plan: string;
  monto: number;
  comprobante_base64: string;
  comprobante_nombre: string;
  fecha: string;
  estado: string;
}

async function blanquearUsuario(dni: string): Promise<boolean> {
  const { error } = await supabase.from('usuarios').delete().eq('dni', dni).neq('role', 'admin');
  return !error;
}

async function resetPasswordDB(dni: string, newPassword: string): Promise<boolean> {
  const { error } = await supabase.from('usuarios').update({ password_hash: newPassword }).eq('dni', dni).neq('role', 'admin');
  return !error;
}

async function togglePagoUsuario(dni: string, nuevoEstado: boolean): Promise<boolean> {
  const updates: Record<string, unknown> = { suscripcion_pagada: nuevoEstado };
  if (nuevoEstado) {
    updates.fecha_ultimo_pago = new Date().toISOString().split('T')[0];
    if (!updates.fecha_suscripcion) updates.fecha_suscripcion = new Date().toISOString().split('T')[0];
  }
  const { error } = await supabase.from('usuarios').update(updates).eq('dni', dni).neq('role', 'admin');
  return !error;
}

async function toggleActivoUsuario(dni: string, nuevoEstado: boolean): Promise<boolean> {
  const { error } = await supabase.from('usuarios').update({ suscripcion_activa: nuevoEstado }).eq('dni', dni).neq('role', 'admin');
  return !error;
}

export default function AdminPanel() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [comprobanteVer, setComprobanteVer] = useState<Pago | null>(null);
  const [precio, setPrecio] = useState(getPrecioAnual().toString());

  useEffect(() => {
    getAllUsers().then(users => setAllUsers(users));
    getPagos().then(p => setPagos(p as Pago[]));
  }, []);
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

  const enviarNotificacion = async () => {
    setSending(true);
    try {
      // Obtener todos los emails de los usuarios
      const emails = allUsers.map(u => u.email).filter((e): e is string => !!e);

      if (emails.length === 0) {
        alert('No hay usuarios con email registrado.');
        setSending(false);
        return;
      }

      // Construir el mensaje
      const asunto = encodeURIComponent('JustFit365 - Actualizaci\u00f3n de Suscripci\u00f3n');
      const cuerpo = encodeURIComponent(
        `Hola,\n\nTe informamos que el precio de la suscripci\u00f3n de JustFit365 ha sido actualizado a $${(parseFloat(precio) || precioActual).toLocaleString('es-AR')}.\n\nEste cambio aplica a partir de tu pr\u00f3xima renovaci\u00f3n. Tu suscripci\u00f3n actual contin\u00faa vigente hasta su fecha de vencimiento.\n\nDatos de pago:\nAlias: ventanasdepapel\nTitular: Carlos Federico Cuevas\nComprobante a: justfit365.com@gmail.com\n\nSaludos,\nEquipo JustFit365`
      );

      // Guardar registro de la notificacion en Supabase
      try {
        await supabase.from('notificaciones').insert({
          asunto: 'JustFit365 - Actualizaci\u00f3n de Suscripci\u00f3n',
          mensaje: decodeURIComponent(cuerpo),
          destinatarios: emails,
          fecha: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Error guardando notificacion:', e);
      }

      // Abrir el cliente de email del admin con todos los destinatarios en BCC
      const bcc = emails.join(',');
      window.open(`mailto:?bcc=${bcc}&subject=${asunto}&body=${cuerpo}`, '_blank');

      setEmailsSent(true);
      setSending(false);
      setTimeout(() => setEmailsSent(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Error al preparar las notificaciones');
      setSending(false);
    }
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
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Precio en ARS ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                className="w-full pl-16 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-electric/30"
              />
            </div>
            <p className="text-white/20 text-xs mt-1">Precio actual: ${precioActual.toLocaleString('es-AR')}</p>
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
              Al cambiar el precio de <strong className="text-white">$ {precioActual.toFixed(2)}</strong> a <strong className="text-amber-400">$ {nuevoPrecio.toFixed(2)}</strong>, se recomienda notificar a todos los usuarios.
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
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Precio mensual ARS ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">$</span>
              <input type="number" min="1" step="0.01" value={precioGym} onChange={e => setPrecioGymState(e.target.value)}
                className="w-full pl-16 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <p className="text-white/20 text-xs mt-1">Actual: ${getPrecioMensualGym().toLocaleString('es-AR')}/mes</p>
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
            <p className="text-white text-sm">{allUsers.filter(u => u.email).length} usuarios con email registrado</p>
            <p className="text-white/30 text-xs mt-1">Al hacer click se abre tu cliente de email (Gmail/Outlook) con todos los destinatarios en BCC y el mensaje listo. Solo tenes que confirmar el envio.</p>
          </div>
          <div className="bg-black/40 border border-dark-border rounded-xl p-4">
            <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">Vista previa del email</p>
            <div className="bg-dark-700 rounded-lg p-4 text-sm text-white/60 space-y-2 border border-dark-border">
              <p className="text-white font-bold">Asunto: Actualizaci&oacute;n de Suscripci&oacute;n JustFit365</p>
              <hr className="border-dark-border" />
              <p>Hola [nombre del usuario],</p>
              <p>Te informamos que el precio de la suscripci&oacute;n anual de JustFit365 ha sido actualizado a <strong className="text-electric">${(parseFloat(precio) || precioActual).toLocaleString('es-AR')}</strong>.</p>
              <p>Este cambio aplica a partir de tu pr&oacute;xima renovaci&oacute;n. Tu suscripci&oacute;n actual contin&uacute;a vigente hasta su fecha de vencimiento.</p>
              <p>Datos de pago:<br />
                Alias: <strong className="text-electric">ventanasdepapel</strong><br />
                Titular: Carlos Federico Cuevas<br />
                Comprobante a: justfit365.com@gmail.com
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
              <><div className="w-4 h-4 border-2 border-electric/30 border-t-electric rounded-full animate-spin" /> Preparando...</>
            ) : emailsSent ? (
              <><CheckCircle className="w-4 h-4" /> Email abierto en tu cliente. Confirm&aacute; el env&iacute;o.</>
            ) : (
              <><Send className="w-4 h-4" /> Abrir Email para Enviar a Todos</>
            )}
          </button>
        </div>
      </div>

      {/* Comprobantes de pago recibidos */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Comprobantes de Pago Recibidos
          </h3>
          <span className="text-white/30 text-xs">{pagos.length} pagos</span>
        </div>
        {pagos.length === 0 ? (
          <div className="px-6 py-8 text-center text-white/30 text-sm">
            Sin comprobantes de pago todav&iacute;a. Cuando un usuario complete su pago, vas a verlo ac&aacute;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Fecha', 'Nombre', 'DNI', 'Email', 'Plan', 'Monto', 'Estado', 'Comprobante'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {pagos.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-white/40">{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-white/40 font-mono">{p.dni}</td>
                    <td className="px-4 py-3 text-sm text-white/50 font-mono text-xs">{p.email}</td>
                    <td className="px-4 py-3 text-sm text-white/40">{p.plan}</td>
                    <td className="px-4 py-3 text-sm text-emerald-400 font-bold">${p.monto?.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setComprobanteVer(p)} className="flex items-center gap-1 px-2 py-1 bg-electric/10 text-electric rounded-lg text-xs font-medium hover:bg-electric/20 transition-colors">
                        <Eye className="w-3 h-3" /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ver comprobante */}
      {comprobanteVer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setComprobanteVer(null)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-black text-lg">Comprobante de Pago</h3>
                <p className="text-white/40 text-sm">{comprobanteVer.nombre} &middot; DNI: {comprobanteVer.dni}</p>
              </div>
              <button onClick={() => setComprobanteVer(null)} className="p-2 text-white/30 hover:text-white">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black/40 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-white/40">Email:</span> <span className="text-white">{comprobanteVer.email}</span></div>
              <div><span className="text-white/40">Plan:</span> <span className="text-white">{comprobanteVer.plan}</span></div>
              <div><span className="text-white/40">Monto:</span> <span className="text-emerald-400 font-bold">${comprobanteVer.monto?.toLocaleString('es-AR')}</span></div>
              <div><span className="text-white/40">Fecha:</span> <span className="text-white">{new Date(comprobanteVer.fecha).toLocaleString('es-AR')}</span></div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden">
              {comprobanteVer.comprobante_base64?.startsWith('data:image') ? (
                <img src={comprobanteVer.comprobante_base64} alt="Comprobante" className="w-full" />
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-bold mb-2">{comprobanteVer.comprobante_nombre}</p>
                  <a href={comprobanteVer.comprobante_base64} download={comprobanteVer.comprobante_nombre} className="inline-block px-4 py-2 bg-electric text-white rounded-xl text-sm font-bold">
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={async () => {
                await supabase.from('pagos').update({ estado: 'aprobado' }).eq('id', comprobanteVer.id);
                getPagos().then(p => setPagos(p as Pago[]));
                setComprobanteVer(null);
              }} className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                <CheckCircle className="w-4 h-4 inline mr-1" /> Aprobar pago
              </button>
              <button onClick={async () => {
                if (confirm('\u00bfEliminar este comprobante?')) {
                  await supabase.from('pagos').delete().eq('id', comprobanteVer.id);
                  getPagos().then(p => setPagos(p as Pago[]));
                  setComprobanteVer(null);
                }
              }} className="flex-1 py-3 bg-danger/10 text-danger/70 rounded-xl text-sm font-bold border border-danger/20 hover:bg-danger/20 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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
                {['Nombre', 'Email', 'DNI', 'Tipo', 'Pago', 'Acceso', 'Acciones'].map(h => (
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
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      const accion = u.suscripcionPagada ? 'marcar como PENDIENTE' : 'marcar como PAGADO';
                      if (confirm(`\u00bf${accion} a ${u.nombre}?`)) {
                        if (await togglePagoUsuario(u.dni, !u.suscripcionPagada)) {
                          getAllUsers().then(users => setAllUsers(users));
                        }
                      }
                    }} className={`text-xs px-2 py-1 rounded-full font-bold transition-all hover:scale-105 ${u.suscripcionPagada ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                      {u.suscripcionPagada ? '\u2713 Pagado' : '\u2717 Pendiente'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      const accion = u.suscripcionActiva ? 'DESHABILITAR' : 'HABILITAR';
                      if (confirm(`\u00bf${accion} el acceso de ${u.nombre}?`)) {
                        if (await toggleActivoUsuario(u.dni, !u.suscripcionActiva)) {
                          getAllUsers().then(users => setAllUsers(users));
                        }
                      }
                    }} className={`text-xs px-2 py-1 rounded-full font-bold transition-all hover:scale-105 flex items-center gap-1 ${u.suscripcionActiva ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                      {u.suscripcionActiva ? <><Power className="w-3 h-3" /> Activo</> : <><PowerOff className="w-3 h-3" /> Inactivo</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={async () => {
                        const np = prompt(`Nueva contrase\u00f1a para ${u.nombre} (DNI: ${u.dni}):`);
                        if (np && np.length >= 6) {
                          if (await resetPasswordDB(u.dni, np)) {
                            alert(`Contrase\u00f1a de ${u.nombre} reseteada.`);
                          } else {
                            alert('Error al resetear.');
                          }
                        } else if (np) {
                          alert('La contrase\u00f1a debe tener al menos 6 caracteres.');
                        }
                      }} className="p-1.5 text-white/20 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5" title="Resetear contrase\u00f1a">
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={async () => {
                        if (confirm(`\u00bfBlanquear a ${u.nombre} (DNI: ${u.dni})? Se elimina su cuenta y deber\u00e1 registrarse de nuevo.`)) {
                          if (await blanquearUsuario(u.dni)) {
                            alert(`${u.nombre} fue blanqueado.`);
                            getAllUsers().then(users => setAllUsers(users));
                          }
                        }
                      }} className="p-1.5 text-white/20 hover:text-danger transition-colors rounded-lg hover:bg-white/5" title="Blanquear (eliminar usuario)">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            <p className="text-white font-medium text-sm">justfit365.com@gmail.com</p>
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
                <p className="text-white/50 text-lg font-bold line-through">$ {precioActual.toFixed(2)}</p>
              </div>
              <span className="text-white/20 text-2xl">&rarr;</span>
              <div className="text-center">
                <p className="text-amber-400 text-xs">Nuevo</p>
                <p className="text-amber-400 text-lg font-black">$ {nuevoPrecio.toFixed(2)}</p>
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
