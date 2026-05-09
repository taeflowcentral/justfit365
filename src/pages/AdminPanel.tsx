import { useState, useEffect } from 'react';
import { Settings, DollarSign, Users, Mail, Send, CheckCircle, AlertTriangle, Shield, Bell, KeyRound, Trash2, FileText, Eye, Power, PowerOff, Megaphone, MessageCircle, X, Plus } from 'lucide-react';
import { type Comunicado, type Audiencia, type DestinatarioWA, AUDIENCIA_LABEL, listarComunicados, crearComunicado, actualizarComunicado, eliminarComunicado, destinatariosWhatsApp } from '../lib/comunicados';
import { getPrecioAnual, setPrecioAnual, getPrecioMensualGym, setPrecioMensualGym } from '../components/PaymentModal';
import { getPlanesGym as loadPlanesGym, setPlanesGym as savePlanesGym } from '../pages/Suscripcion';
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

  void getPrecioMensualGym; void setPrecioMensualGym;
  const [precioGymSaved, setPrecioGymSaved] = useState(false);
  const [planesGym, setPlanesGymState] = useState(loadPlanesGym);

  const handleSavePrecio = () => {
    const nuevoPrecio = parseFloat(precio);
    if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) return;
    setPrecioAnual(nuevoPrecio);
    setPrecioSaved(true);
    setShowConfirmPrecio(false);
    setTimeout(() => setPrecioSaved(false), 3000);
  };

  // Planes gym se guardan con savePlanesGym

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
        `Hola,\n\nTe informamos que el precio de la suscripci\u00f3n de JustFit365 ha sido actualizado a $${(parseFloat(precio) || precioActual).toLocaleString('es-AR')}.\n\nEste cambio aplica a partir de tu pr\u00f3xima renovaci\u00f3n. Tu suscripci\u00f3n actual contin\u00faa vigente hasta su fecha de vencimiento.\n\nDatos de pago:\nAlias: justfit365\nTitular: Carlos Federico Cuevas\nComprobante a: justfit365.com@gmail.com\n\nSaludos,\nEquipo JustFit365`
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

      {/* Planes de gimnasios */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" /> Planes Gimnasios (Marca Blanca)
        </h3>
        <p className="text-white/30 text-xs mb-4">Configura los precios de cada plan. Los gimnasios ven estos planes al momento de pagar su suscripcion.</p>

        <div className="space-y-3 mb-4">
          {planesGym.map((plan, idx) => (
            <div key={plan.id} className="flex items-center gap-3 bg-black/30 border border-dark-border rounded-xl p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-sm">{plan.nombre}</span>
                  <span className="text-white/30 text-xs">({plan.clientes} clientes)</span>
                  {plan.popular && <span className="text-[9px] px-1.5 py-0.5 bg-electric/15 text-electric rounded-full font-bold">Popular</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white/30 text-sm">$</span>
                <input type="number" min="0" step="1000" value={plan.precio}
                  onChange={e => {
                    const updated = [...planesGym];
                    updated[idx] = { ...plan, precio: parseInt(e.target.value) || 0 };
                    setPlanesGymState(updated);
                  }}
                  className="w-24 px-2 py-1.5 bg-black/60 border border-dark-border rounded-lg text-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-electric/30" />
                <span className="text-white/20 text-xs">/mes</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            savePlanesGym(planesGym);
            setPrecioGymSaved(true);
            setTimeout(() => setPrecioGymSaved(false), 3000);
          }}
            className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
              precioGymSaved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]'
            }`}>
            {precioGymSaved ? <><CheckCircle className="w-4 h-4 inline mr-1" /> Guardado</> : 'Guardar Planes'}
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
                Alias: <strong className="text-electric">justfit365</strong><br />
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

      {/* Lista de gimnasios */}
      {allUsers.filter(u => u.role === 'gimnasio').length > 0 && (
        <div className="bg-dark-800 border border-lime/15 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-lime/5">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-lime" /> Gimnasios (Marca Blanca)
            </h3>
            <span className="text-lime/50 text-xs">{allUsers.filter(u => u.role === 'gimnasio').length} gimnasio{allUsers.filter(u => u.role === 'gimnasio').length > 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Gimnasio', 'Email', 'DNI', 'Pago', 'Acceso', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {allUsers.filter(u => u.role === 'gimnasio').map(u => (
                  <tr key={u.dni} className="hover:bg-lime/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-bold text-sm">{u.gimnasioNombre || u.nombre}</p>
                        <p className="text-white/30 text-xs">{u.nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50 font-mono text-xs">{u.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-white/40 font-mono">{u.dni}</td>
                    <td className="px-4 py-3">
                      <button onClick={async () => {
                        const accion = u.suscripcionPagada ? 'marcar como PENDIENTE' : 'marcar como PAGADO';
                        if (confirm(`${accion} a ${u.gimnasioNombre || u.nombre}?`)) {
                          if (await togglePagoUsuario(u.dni, !u.suscripcionPagada)) {
                            getAllUsers().then(users => setAllUsers(users));
                          }
                        }
                      }} className={`text-xs px-2 py-1 rounded-full font-bold transition-all hover:scale-105 ${u.suscripcionPagada ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.suscripcionPagada ? '\u2713 Pagado' : '\u2717 Pendiente'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={async () => {
                        const accion = u.suscripcionActiva ? 'DESHABILITAR' : 'HABILITAR';
                        if (confirm(`${accion} el acceso de ${u.gimnasioNombre || u.nombre}?`)) {
                          if (await toggleActivoUsuario(u.dni, !u.suscripcionActiva)) {
                            getAllUsers().then(users => setAllUsers(users));
                          }
                        }
                      }} className={`text-xs px-2 py-1 rounded-full font-bold transition-all hover:scale-105 flex items-center gap-1 ${u.suscripcionActiva ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/40'}`}>
                        {u.suscripcionActiva ? <><Power className="w-3 h-3" /> Activo</> : <><PowerOff className="w-3 h-3" /> Inactivo</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={async () => {
                          const np = prompt(`Nueva contrasena para ${u.nombre} (DNI: ${u.dni}):`);
                          if (np && np.length >= 6) {
                            if (await resetPasswordDB(u.dni, np)) { alert(`Contrasena reseteada.`); }
                          }
                        }} className="p-1.5 text-white/20 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5" title="Resetear contrasena">
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={async () => {
                          if (confirm(`Blanquear ${u.gimnasioNombre || u.nombre}? Se elimina la cuenta.`)) {
                            if (await blanquearUsuario(u.dni)) {
                              alert('Blanqueado.');
                              getAllUsers().then(users => setAllUsers(users));
                            }
                          }
                        }} className="p-1.5 text-white/20 hover:text-danger transition-colors rounded-lg hover:bg-white/5" title="Blanquear">
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
      )}

      {/* Lista de usuarios individuales */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Usuarios Individuales
          </h3>
          <span className="text-white/30 text-xs">{allUsers.filter(u => u.role !== 'gimnasio').length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Nombre', 'Email', 'DNI', 'Pago', 'Acceso', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {allUsers.filter(u => u.role !== 'gimnasio').map(u => (
                <tr key={u.dni} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{u.nombre}</td>
                  <td className="px-4 py-3 text-sm text-white/50 font-mono text-xs">{u.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white/40 font-mono">{u.dni}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      const accion = u.suscripcionPagada ? 'marcar como PENDIENTE' : 'marcar como PAGADO';
                      if (confirm(`${accion} a ${u.nombre}?`)) {
                        if (await togglePagoUsuario(u.dni, !u.suscripcionPagada)) {
                          getAllUsers().then(users => setAllUsers(users));
                        }
                      }
                    }} className={`text-xs px-2 py-1 rounded-full font-bold transition-all hover:scale-105 ${u.suscripcionPagada ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.suscripcionPagada ? '\u2713 Pagado' : '\u2717 Pendiente'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      const accion = u.suscripcionActiva ? 'DESHABILITAR' : 'HABILITAR';
                      if (confirm(`${accion} el acceso de ${u.nombre}?`)) {
                        if (await toggleActivoUsuario(u.dni, !u.suscripcionActiva)) {
                          getAllUsers().then(users => setAllUsers(users));
                        }
                      }
                    }} className={`text-xs px-2 py-1 rounded-full font-bold transition-all hover:scale-105 flex items-center gap-1 ${u.suscripcionActiva ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/40'}`}>
                      {u.suscripcionActiva ? <><Power className="w-3 h-3" /> Activo</> : <><PowerOff className="w-3 h-3" /> Inactivo</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={async () => {
                        const np = prompt(`Nueva contrasena para ${u.nombre} (DNI: ${u.dni}):`);
                        if (np && np.length >= 6) {
                          if (await resetPasswordDB(u.dni, np)) { alert(`Contrasena reseteada.`); }
                        }
                      }} className="p-1.5 text-white/20 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/5" title="Resetear contrasena">
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={async () => {
                        if (confirm(`Blanquear a ${u.nombre} (DNI: ${u.dni})? Se elimina la cuenta.`)) {
                          if (await blanquearUsuario(u.dni)) {
                            alert('Blanqueado.');
                            getAllUsers().then(users => setAllUsers(users));
                          }
                        }
                      }} className="p-1.5 text-white/20 hover:text-danger transition-colors rounded-lg hover:bg-white/5" title="Blanquear">
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
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-3 bg-dark-700 rounded-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">Alias Mercado Pago</p>
            <p className="text-electric font-mono font-bold">justfit365</p>
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

        {/* Barrera de Promocion */}
        {(() => {
          const promoUntil = localStorage.getItem('jf365_promo_free_until');
          const promoActiva = promoUntil && new Date(promoUntil) > new Date();
          const diasRestantes = promoActiva ? Math.ceil((new Date(promoUntil!).getTime() - Date.now()) / 86400000) : 0;
          return (
            <div className={`border rounded-2xl p-4 ${promoActiva ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-dark-700 border-dark-border'}`}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{promoActiva ? '🎁' : '🚪'}</span>
                  <div>
                    <p className="text-white font-bold text-sm">Barrera de Pago</p>
                    <p className={`text-xs ${promoActiva ? 'text-emerald-400' : 'text-white/40'}`}>
                      {promoActiva
                        ? `Promoción FREE activa · ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restantes`
                        : 'Promoción inactiva · usuarios pagan normalmente'}
                    </p>
                  </div>
                </div>
                {promoActiva && (
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/15 rounded-full">
                    Hasta {new Date(promoUntil!).toLocaleDateString('es-AR')}
                  </span>
                )}
              </div>
              <p className="text-white/50 text-xs mb-3">
                {promoActiva
                  ? 'Los nuevos usuarios que se registren en este período podrán usar la app sin pagar la suscripción hasta el vencimiento de la promoción.'
                  : 'Activá una promoción FREE para que nuevos usuarios accedan sin pagar durante el período que decidas.'}
              </p>
              <div className="flex gap-2 flex-wrap">
                {!promoActiva ? (
                  <>
                    <button onClick={() => {
                      const dias = prompt('¿Cuántos días dura la promoción FREE?\n(7, 15, 30, 60, 90 días)', '30');
                      if (!dias) return;
                      const num = parseInt(dias);
                      if (!num || num < 1 || num > 365) { alert('Ingresá un número entre 1 y 365'); return; }
                      const until = new Date(Date.now() + num * 86400000);
                      localStorage.setItem('jf365_promo_free_until', until.toISOString());
                      alert(`✓ Promoción FREE activada hasta el ${until.toLocaleDateString('es-AR')}\n\nLos usuarios que se registren en este período no necesitan pagar.`);
                      window.location.reload();
                    }} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black uppercase tracking-wider transition-all">
                      🟢 Subir barrera (FREE)
                    </button>
                  </>
                ) : (
                  <button onClick={() => {
                    if (!confirm('¿Bajar la barrera y terminar la promoción FREE?\n\nLos usuarios actuales mantienen su acceso. Los nuevos volverán a pagar.')) return;
                    localStorage.removeItem('jf365_promo_free_until');
                    alert('🚪 Barrera bajada. Promoción terminada. Nuevos usuarios pagan normalmente.');
                    window.location.reload();
                  }} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all">
                    🔴 Bajar barrera (cobrar)
                  </button>
                )}
                <div className="flex gap-1 ml-auto">
                  {[7, 15, 30, 60].map(d => (
                    <button key={d} onClick={() => {
                      if (promoActiva && !confirm(`Reemplazar promoción actual por una de ${d} días?`)) return;
                      const until = new Date(Date.now() + d * 86400000);
                      localStorage.setItem('jf365_promo_free_until', until.toISOString());
                      window.location.reload();
                    }} className="px-2.5 py-1 bg-white/5 border border-dark-border text-white/40 hover:text-white hover:border-white/20 rounded-lg text-[10px] font-bold transition-all">
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
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

      <ComunicadosSection />
    </div>
  );
}

// ====================================================================
// COMUNICADOS — broadcast in-app + helper de WhatsApp
// ====================================================================
function ComunicadosSection() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [draft, setDraft] = useState({
    titulo: '', mensaje: '', ctaLabel: '', ctaUrl: '',
    audiencia: 'todos' as Audiencia, activo: true, expiraDias: '14',
  });
  const [error, setError] = useState('');
  const [destinatarios, setDestinatarios] = useState<DestinatarioWA[]>([]);
  const [audienciaWA, setAudienciaWA] = useState<Audiencia>('todos');
  const [mensajeWA, setMensajeWA] = useState('');
  const [copiado, setCopiado] = useState('');

  useEffect(() => { cargar(); }, []);
  useEffect(() => { cargarDestinatarios(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [audienciaWA]);

  async function cargar() {
    setCargando(true);
    setComunicados(await listarComunicados());
    setCargando(false);
  }

  async function cargarDestinatarios() {
    setDestinatarios(await destinatariosWhatsApp(audienciaWA));
  }

  function abrirNuevo() {
    setDraft({ titulo: '', mensaje: '', ctaLabel: '', ctaUrl: '', audiencia: 'todos', activo: true, expiraDias: '14' });
    setEditandoId(null);
    setShowForm(true);
  }

  function abrirEdicion(c: Comunicado) {
    const dias = c.expira ? Math.max(0, Math.round((new Date(c.expira).getTime() - Date.now()) / 86400000)) : 14;
    setDraft({
      titulo: c.titulo, mensaje: c.mensaje,
      ctaLabel: c.ctaLabel || '', ctaUrl: c.ctaUrl || '',
      audiencia: c.audiencia, activo: c.activo,
      expiraDias: String(dias),
    });
    setEditandoId(c.id);
    setShowForm(true);
  }

  async function guardar() {
    setError('');
    if (!draft.titulo.trim()) { setError('Ingresá un título.'); return; }
    if (!draft.mensaje.trim()) { setError('Ingresá un mensaje.'); return; }
    const dias = parseInt(draft.expiraDias) || 0;
    const expira = dias > 0 ? new Date(Date.now() + dias * 86400000).toISOString() : undefined;
    if (editandoId) {
      const ok = await actualizarComunicado(editandoId, {
        titulo: draft.titulo, mensaje: draft.mensaje,
        ctaLabel: draft.ctaLabel, ctaUrl: draft.ctaUrl,
        audiencia: draft.audiencia, activo: draft.activo, expira,
      });
      if (!ok) { setError('Error al actualizar.'); return; }
    } else {
      const r = await crearComunicado({
        titulo: draft.titulo, mensaje: draft.mensaje,
        ctaLabel: draft.ctaLabel || undefined, ctaUrl: draft.ctaUrl || undefined,
        audiencia: draft.audiencia, activo: draft.activo, expira,
      });
      if (!r.ok) { setError('Error: ' + (r.error || 'desconocido')); return; }
    }
    setShowForm(false);
    cargar();
  }

  async function toggle(c: Comunicado) {
    await actualizarComunicado(c.id, { activo: !c.activo });
    cargar();
  }

  async function borrar(c: Comunicado) {
    if (!confirm(`¿Eliminar el comunicado "${c.titulo}"?`)) return;
    await eliminarComunicado(c.id);
    cargar();
  }

  function copiarTelefonos() {
    const tels = destinatarios.map(d => d.telefono).join('\n');
    navigator.clipboard.writeText(tels).then(() => {
      setCopiado(`${destinatarios.length} teléfonos copiados`);
      setTimeout(() => setCopiado(''), 3000);
    });
  }

  function copiarMensaje() {
    if (!mensajeWA.trim()) { alert('Escribí primero el mensaje.'); return; }
    navigator.clipboard.writeText(mensajeWA).then(() => {
      setCopiado('Mensaje copiado');
      setTimeout(() => setCopiado(''), 3000);
    });
  }

  function abrirEnEmail() {
    if (destinatarios.length === 0) { alert('No hay destinatarios con teléfono cargado.'); return; }
    // Solo emails que tengan @ — de momento usamos partner_telefono asi que skip
    alert('Próximamente: envío masivo por email. Por ahora usá el copiado de teléfonos para WhatsApp Broadcast.');
  }

  return (
    <div className="bg-dark-800 border border-dark-border rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-pink-400" />
          <h3 className="text-white font-bold text-lg">Comunicados a usuarios</h3>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-sm font-black">
          <Plus className="w-4 h-4" /> Nuevo comunicado
        </button>
      </div>

      <p className="text-white/55 text-xs">
        Los comunicados aparecen como banner arriba del Dashboard de los usuarios destinatarios. También podés usar el helper de WhatsApp para mandarlo por mensajería.
      </p>

      {/* Lista de comunicados */}
      {cargando ? (
        <div className="text-center py-6 text-white/40 text-sm">Cargando...</div>
      ) : comunicados.length === 0 ? (
        <div className="bg-black/40 border border-dark-border rounded-xl p-6 text-center">
          <Megaphone className="w-10 h-10 text-white/10 mx-auto mb-2" />
          <p className="text-white/55 text-sm">Sin comunicados aún. Creá el primero para anunciar nuevas funcionalidades.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comunicados.map(c => {
            const expirado = c.expira && new Date(c.expira) < new Date();
            return (
              <div key={c.id} className={`bg-black/40 border rounded-xl p-3 ${c.activo && !expirado ? 'border-pink-500/30' : 'border-dark-border opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{c.titulo}</p>
                      <span className="px-2 py-0.5 bg-pink-500/15 text-pink-300 text-[10px] font-bold rounded-full">{AUDIENCIA_LABEL[c.audiencia]}</span>
                      {!c.activo && <span className="px-2 py-0.5 bg-white/5 text-white/40 text-[10px] font-bold rounded-full">DESACTIVADO</span>}
                      {expirado && <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-bold rounded-full">EXPIRADO</span>}
                    </div>
                    <p className="text-white/55 text-xs mt-1 line-clamp-2">{c.mensaje}</p>
                    {c.expira && <p className="text-white/35 text-[10px] mt-1">Expira: {new Date(c.expira).toLocaleDateString('es-AR')}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggle(c)} className="p-1.5 text-white/45 hover:text-electric rounded-lg hover:bg-white/5" title={c.activo ? 'Desactivar' : 'Activar'}>
                      {c.activo ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => abrirEdicion(c)} className="p-1.5 text-white/45 hover:text-electric rounded-lg hover:bg-white/5" title="Editar">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => borrar(c)} className="p-1.5 text-white/45 hover:text-danger rounded-lg hover:bg-white/5" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helper WhatsApp */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <h4 className="text-white font-bold text-sm">Helper de WhatsApp Broadcast</h4>
        </div>
        <p className="text-white/55 text-xs">
          WhatsApp no permite envíos masivos automáticos desde la web (es restricción de Meta). Usá este helper:
          <br />
          <strong className="text-white/75">1.</strong> Elegí audiencia y copiá los teléfonos.
          <strong className="text-white/75 ml-2">2.</strong> Abrí WhatsApp en tu celu → Crear Lista de difusión → pegá los contactos → enviá tu mensaje.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-white/55 mb-1 font-semibold">Audiencia</label>
            <select value={audienciaWA} onChange={e => setAudienciaWA(e.target.value as Audiencia)}
              className="w-full px-3 py-2 bg-black/60 border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none">
              {Object.entries(AUDIENCIA_LABEL).map(([k, v]) => <option key={k} value={k} className="bg-dark-800">{v}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-white/65 text-sm">
              <strong className="text-emerald-400 text-lg">{destinatarios.length}</strong> con WhatsApp cargado
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/55 mb-1 font-semibold">Mensaje (opcional, para copiar y pegar)</label>
          <textarea
            value={mensajeWA}
            onChange={e => setMensajeWA(e.target.value)}
            rows={3}
            placeholder={`Hola! Te cuento una novedad de JustFit365: …\n\nLink: https://justfit365.com`}
            className="w-full px-3 py-2 bg-black/60 border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder-white/30 resize-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={copiarTelefonos} disabled={destinatarios.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black disabled:opacity-40">
            <Send className="w-3.5 h-3.5" /> Copiar {destinatarios.length} teléfonos
          </button>
          <button onClick={copiarMensaje}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold">
            <FileText className="w-3.5 h-3.5" /> Copiar mensaje
          </button>
          <button onClick={abrirEnEmail}
            className="flex items-center gap-1.5 px-3 py-2 bg-electric/10 border border-electric/30 text-electric rounded-lg text-xs font-bold">
            <Mail className="w-3.5 h-3.5" /> Email blast
          </button>
          {copiado && <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {copiado}</span>}
        </div>
        <p className="text-white/35 text-[10px] italic">
          Nota: por ahora solo aparecen usuarios que activaron Partner Match (y por eso cargaron su WhatsApp). Si querés cobertura total, podemos agregar un campo de teléfono general en el perfil.
        </p>
      </div>

      {/* Modal de form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-pink-400" /> {editandoId ? 'Editar comunicado' : 'Nuevo comunicado'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/65 mb-1 font-semibold">Título</label>
                <input type="text" value={draft.titulo} onChange={e => setDraft({ ...draft, titulo: e.target.value })}
                  placeholder="Ej: Nuevo: Partner Match disponible"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
              </div>
              <div>
                <label className="block text-xs text-white/65 mb-1 font-semibold">Mensaje</label>
                <textarea value={draft.mensaje} onChange={e => setDraft({ ...draft, mensaje: e.target.value })} rows={4}
                  placeholder="Contale a tus usuarios qué novedad implementaste."
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-white/65 mb-1 font-semibold">Botón (opcional)</label>
                  <input type="text" value={draft.ctaLabel} onChange={e => setDraft({ ...draft, ctaLabel: e.target.value })}
                    placeholder="Ej: Probar ahora"
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
                </div>
                <div>
                  <label className="block text-xs text-white/65 mb-1 font-semibold">Link del botón</label>
                  <input type="text" value={draft.ctaUrl} onChange={e => setDraft({ ...draft, ctaUrl: e.target.value })}
                    placeholder="/partner ó https://..."
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-white/65 mb-1 font-semibold">Audiencia</label>
                  <select value={draft.audiencia} onChange={e => setDraft({ ...draft, audiencia: e.target.value as Audiencia })}
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 appearance-none">
                    {Object.entries(AUDIENCIA_LABEL).map(([k, v]) => <option key={k} value={k} className="bg-dark-800">{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/65 mb-1 font-semibold">Expira en (días)</label>
                  <input type="number" min="0" value={draft.expiraDias} onChange={e => setDraft({ ...draft, expiraDias: e.target.value })}
                    placeholder="14"
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 placeholder-white/30" />
                </div>
              </div>
              <label className="flex items-center justify-between gap-2 bg-black/40 rounded-xl p-3 cursor-pointer">
                <div className="flex-1">
                  <p className="text-white text-sm font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-pink-400" /> Activo</p>
                  <p className="text-white/55 text-xs mt-0.5">Si está apagado se guarda como borrador y no se muestra a usuarios.</p>
                </div>
                <input type="checkbox" checked={draft.activo} onChange={e => setDraft({ ...draft, activo: e.target.checked })}
                  className="w-5 h-5 accent-pink-500" />
              </label>
              {error && <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm">{error}</div>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 text-white/55 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={guardar} className="flex-1 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-sm font-black">
                  {editandoId ? 'Guardar cambios' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
