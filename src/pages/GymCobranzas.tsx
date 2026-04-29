import { useState } from 'react';
import { DollarSign, Users, Search, Check, Clock, AlertTriangle, MessageCircle, Printer, ChevronDown, Plus, Trash2, Edit3, Save, Mail, Send } from 'lucide-react';
import { getUserItem, setUserItem } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { getPrecioMensualGym } from '../components/PaymentModal';
import { printContent } from '../components/ShareButtons';

interface Pago {
  id: number;
  clienteId: number;
  clienteNombre: string;
  monto: number;
  fecha: string;
  mes: string; // "04/2026"
  metodo: string;
  comprobante: string;
  nota: string;
}

interface ClienteBasico {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
}

const PAGOS_KEY = 'bc_gym_pagos';
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function GymCobranzas() {
  const { user } = useAuth();
  const gymName = user?.gimnasioNombre || 'Mi Gimnasio';
  const precioBase = getPrecioMensualGym();

  const [pagos, setPagos] = useState<Pago[]>(() => {
    try { const s = getUserItem(PAGOS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const guardarPagos = (p: Pago[]) => { setPagos(p); setUserItem(PAGOS_KEY, JSON.stringify(p)); };

  // Clientes del gym
  const clientes: ClienteBasico[] = (() => {
    try {
      const s = getUserItem('bc_gym_clientes');
      if (!s) return [];
      return JSON.parse(s).map((c: { id: number; nombre: string; telefono: string; email: string }) => ({ id: c.id, nombre: c.nombre, telefono: c.telefono || '', email: c.email || '' }));
    } catch { return []; }
  })();

  // Datos de cobro del gym
  const aliasGym = getUserItem('jf365_gym_alias') || '';
  const cvuGym = getUserItem('jf365_gym_cvu') || '';
  const titularGym = getUserItem('jf365_gym_titular') || '';
  const bancoGym = getUserItem('jf365_gym_banco') || '';

  const [busqueda, setBusqueda] = useState('');
  const [mesActivo, setMesActivo] = useState(() => {
    const h = new Date();
    return `${String(h.getMonth() + 1).padStart(2, '0')}/${h.getFullYear()}`;
  });
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showDetalle, setShowDetalle] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pagado' | 'pendiente'>('todos');
  const [nuevoPago, setNuevoPago] = useState({ clienteId: 0, monto: precioBase.toString(), metodo: 'Efectivo', comprobante: '', nota: '' });
  const [editandoCuota, setEditandoCuota] = useState(false);
  const [nuevaCuota, setNuevaCuota] = useState(precioBase.toString());
  const [showAvisoCuota, setShowAvisoCuota] = useState(false);

  const guardarCuota = () => {
    const val = parseFloat(nuevaCuota);
    if (!val || val < 0) return;
    localStorage.setItem('bc_precio_mensual_gym', val.toString());
    window.dispatchEvent(new Event('precios-actualizados'));
    setEditandoCuota(false);
  };

  const enviarAvisoCuotaWhatsApp = () => {
    const val = parseFloat(nuevaCuota) || precioBase;
    clientes.forEach(c => {
      const tel = c.telefono.replace(/\D/g, '');
      if (!tel) return;
      let text = `Hola ${c.nombre.split(' ')[0]}, te informamos que la cuota de *${gymName}* se actualizo a *$${val.toLocaleString('es-AR')}* por mes.`;
      if (aliasGym || cvuGym) {
        text += `\n\n*Datos para transferencia:*`;
        if (aliasGym) text += `\nAlias: ${aliasGym}`;
        if (cvuGym) text += `\nCVU: ${cvuGym}`;
        if (titularGym) text += `\nTitular: ${titularGym}`;
        if (bancoGym) text += `\n${bancoGym}`;
      }
      text += `\n\nEl cambio aplica a partir del proximo periodo. Saludos!`;
      window.open(`https://wa.me/${tel}?text=${encodeURIComponent(text)}`, '_blank');
    });
    setShowAvisoCuota(false);
  };

  const enviarAvisoCuotaEmail = () => {
    const val = parseFloat(nuevaCuota) || precioBase;
    const emails = clientes.filter(c => c.email).map(c => c.email).join(',');
    if (!emails) { alert('Ningun cliente tiene email cargado'); return; }
    const subject = `${gymName} - Actualizacion de cuota`;
    let body = `Hola,\n\nLes informamos que la cuota de ${gymName} se actualizo a $${val.toLocaleString('es-AR')} por mes.\n`;
    if (aliasGym || cvuGym) {
      body += `\nDatos para transferencia:\n`;
      if (aliasGym) body += `Alias: ${aliasGym}\n`;
      if (cvuGym) body += `CVU: ${cvuGym}\n`;
      if (titularGym) body += `Titular: ${titularGym}\n`;
      if (bancoGym) body += `${bancoGym}\n`;
    }
    body += `\nEl cambio aplica a partir del proximo periodo.\n\nSaludos,\n${gymName}`;
    window.open(`mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    setShowAvisoCuota(false);
  };

  // Pagos del mes activo
  const pagosMes = pagos.filter(p => p.mes === mesActivo);

  // Estado de cada cliente para el mes activo
  const estadoClientes = clientes.map(c => {
    const pago = pagosMes.find(p => p.clienteId === c.id);
    return { ...c, pago, estado: pago ? 'pagado' as const : 'pendiente' as const };
  });

  const filtrados = estadoClientes
    .filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(c => filtroEstado === 'todos' || c.estado === filtroEstado);

  const totalCobrado = pagosMes.reduce((a, p) => a + p.monto, 0);
  const totalPendiente = (clientes.length - pagosMes.length) * precioBase;
  const clientesPagados = pagosMes.length;
  const clientesPendientes = clientes.length - clientesPagados;

  // Registrar pago
  const registrarPago = () => {
    if (!nuevoPago.clienteId) return;
    const cliente = clientes.find(c => c.id === nuevoPago.clienteId);
    if (!cliente) return;
    const pago: Pago = {
      id: Date.now(),
      clienteId: nuevoPago.clienteId,
      clienteNombre: cliente.nombre,
      monto: parseFloat(nuevoPago.monto) || precioBase,
      fecha: new Date().toLocaleDateString('es-AR'),
      mes: mesActivo,
      metodo: nuevoPago.metodo,
      comprobante: nuevoPago.comprobante,
      nota: nuevoPago.nota,
    };
    guardarPagos([...pagos, pago]);
    setNuevoPago({ clienteId: 0, monto: precioBase.toString(), metodo: 'Efectivo', comprobante: '', nota: '' });
    setShowRegistrar(false);
  };

  const eliminarPago = (id: number) => {
    guardarPagos(pagos.filter(p => p.id !== id));
  };

  // WhatsApp recordatorio
  const enviarRecordatorio = (c: ClienteBasico) => {
    const tel = c.telefono.replace(/\D/g, '');
    if (!tel) return;
    const mesNombre = MESES[parseInt(mesActivo.split('/')[0]) - 1];
    let text = `Hola ${c.nombre.split(' ')[0]}, te recordamos que tu cuota de ${mesNombre} en *${gymName}* esta pendiente (*$${precioBase.toLocaleString('es-AR')}*).`;
    if (aliasGym || cvuGym) {
      text += `\n\n*Datos para transferencia:*`;
      if (aliasGym) text += `\nAlias: ${aliasGym}`;
      if (cvuGym) text += `\nCVU: ${cvuGym}`;
      if (titularGym) text += `\nTitular: ${titularGym}`;
      if (bancoGym) text += `\n${bancoGym}`;
    }
    text += `\n\nCualquier consulta no dudes en escribirnos. Saludos!`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // WhatsApp comprobante
  const enviarComprobante = (pago: Pago, cliente: ClienteBasico) => {
    const tel = cliente.telefono.replace(/\D/g, '');
    if (!tel) return;
    const mesNombre = MESES[parseInt(pago.mes.split('/')[0]) - 1];
    const text = `*${gymName} - Comprobante de Pago*\n\nCliente: ${pago.clienteNombre}\nMes: ${mesNombre} ${pago.mes.split('/')[1]}\nMonto: $${pago.monto.toLocaleString('es-AR')}\nFecha: ${pago.fecha}\nMetodo: ${pago.metodo}${pago.comprobante ? `\nComprobante: ${pago.comprobante}` : ''}\n\nGracias por tu pago!`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Imprimir resumen
  const imprimirResumen = () => {
    const mesNombre = MESES[parseInt(mesActivo.split('/')[0]) - 1];
    let html = `<p class="subtitle">${gymName} - Cobranzas ${mesNombre} ${mesActivo.split('/')[1]}</p>`;
    html += `<div class="note"><strong>Cobrado:</strong> $${totalCobrado.toLocaleString('es-AR')} | <strong>Pendiente:</strong> $${totalPendiente.toLocaleString('es-AR')} | <strong>Pagaron:</strong> ${clientesPagados} de ${clientes.length}</div>`;
    html += '<h2>Pagos registrados</h2><table><tr><th>Cliente</th><th>Monto</th><th>Fecha</th><th>Metodo</th><th>Comprobante</th></tr>';
    pagosMes.forEach(p => { html += `<tr><td>${p.clienteNombre}</td><td>$${p.monto.toLocaleString('es-AR')}</td><td>${p.fecha}</td><td>${p.metodo}</td><td>${p.comprobante || '-'}</td></tr>`; });
    html += '</table>';
    if (clientesPendientes > 0) {
      html += '<h2>Pendientes</h2><table><tr><th>Cliente</th><th>Monto</th></tr>';
      estadoClientes.filter(c => c.estado === 'pendiente').forEach(c => { html += `<tr><td>${c.nombre}</td><td>$${precioBase.toLocaleString('es-AR')}</td></tr>`; });
      html += '</table>';
    }
    printContent(`Cobranzas ${mesNombre} - ${gymName}`, html);
  };

  // Imprimir recibo individual
  const imprimirRecibo = (pago: Pago) => {
    const mesNombre = MESES[parseInt(pago.mes.split('/')[0]) - 1];
    const html = `<p class="subtitle">${gymName}</p><h2>Recibo de Pago</h2><table><tr><th>Campo</th><th>Detalle</th></tr><tr><td>Cliente</td><td><strong>${pago.clienteNombre}</strong></td></tr><tr><td>Periodo</td><td>${mesNombre} ${pago.mes.split('/')[1]}</td></tr><tr><td>Monto</td><td><strong>$${pago.monto.toLocaleString('es-AR')}</strong></td></tr><tr><td>Fecha de pago</td><td>${pago.fecha}</td></tr><tr><td>Metodo</td><td>${pago.metodo}</td></tr>${pago.comprobante ? `<tr><td>Comprobante</td><td>${pago.comprobante}</td></tr>` : ''}${pago.nota ? `<tr><td>Nota</td><td>${pago.nota}</td></tr>` : ''}</table>`;
    printContent(`Recibo ${pago.clienteNombre} - ${gymName}`, html);
  };

  // Navegacion de meses
  const cambiarMes = (dir: number) => {
    const [m, y] = mesActivo.split('/').map(Number);
    const fecha = new Date(y, m - 1 + dir, 1);
    setMesActivo(`${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`);
  };
  const mesNombre = MESES[parseInt(mesActivo.split('/')[0]) - 1] + ' ' + mesActivo.split('/')[1];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-lime" /> Cobranzas
        </h1>
        <p className="text-white/50 text-sm mt-1">Gestion de pagos y cuotas de {gymName}</p>
      </div>

      {/* Selector de mes */}
      <div className="flex items-center justify-between bg-dark-800 border border-dark-border rounded-2xl p-3">
        <button onClick={() => cambiarMes(-1)} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl text-sm font-bold transition-all">&larr;</button>
        <h2 className="text-white font-bold text-lg">{mesNombre}</h2>
        <button onClick={() => cambiarMes(1)} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl text-sm font-bold transition-all">&rarr;</button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
          <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-2"><DollarSign className="w-4 h-4 text-emerald-400" /></div>
          <p className="text-xl font-black text-emerald-400">${totalCobrado.toLocaleString('es-AR')}</p>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Cobrado</p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
          <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center mb-2"><Clock className="w-4 h-4 text-amber-400" /></div>
          <p className="text-xl font-black text-amber-400">${totalPendiente.toLocaleString('es-AR')}</p>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Pendiente</p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
          <div className="w-8 h-8 bg-electric/15 rounded-lg flex items-center justify-center mb-2"><Check className="w-4 h-4 text-electric" /></div>
          <p className="text-xl font-black text-white">{clientesPagados}<span className="text-white/30 text-sm">/{clientes.length}</span></p>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Pagaron</p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
          <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center mb-2"><AlertTriangle className="w-4 h-4 text-red-400" /></div>
          <p className="text-xl font-black text-white">{clientesPendientes}</p>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Deben</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
          <span>Avance de cobranza</span>
          <span>{clientes.length > 0 ? Math.round((clientesPagados / clientes.length) * 100) : 0}%</span>
        </div>
        <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-lime rounded-full transition-all" style={{ width: `${clientes.length > 0 ? (clientesPagados / clientes.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Cuota */}
      <div className="bg-dark-800 border border-dark-border rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-lime" />
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-wider">Valor de la cuota</p>
            {editandoCuota ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/50 text-lg">$</span>
                <input type="number" min="0" step="100" value={nuevaCuota} onChange={e => setNuevaCuota(e.target.value)}
                  className="w-28 px-3 py-1.5 bg-black/60 border border-electric/30 rounded-lg text-white text-lg font-black focus:outline-none focus:ring-2 focus:ring-electric/30" />
                <button onClick={guardarCuota} className="p-1.5 text-emerald-400 hover:text-emerald-300"><Save className="w-4 h-4" /></button>
              </div>
            ) : (
              <p className="text-white font-black text-xl">${precioBase.toLocaleString('es-AR')}<span className="text-white/30 text-sm font-normal"> /mes</span></p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editandoCuota ? (
            <>
              <button onClick={() => { setNuevaCuota(precioBase.toString()); setEditandoCuota(true); }} className="p-2 text-white/20 hover:text-electric transition-colors rounded-xl hover:bg-white/5">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => setShowAvisoCuota(true)} className="flex items-center gap-1.5 px-3 py-2 bg-lime/15 border border-lime/20 text-lime rounded-xl text-xs font-bold hover:bg-lime/25 transition-all">
                <Send className="w-3.5 h-3.5" /> Avisar cambio
              </button>
            </>
          ) : (
            <button onClick={() => setEditandoCuota(false)} className="px-3 py-1.5 text-white/40 text-xs">Cancelar</button>
          )}
        </div>
      </div>

      {/* Modal aviso cambio de cuota */}
      {showAvisoCuota && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAvisoCuota(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto mb-4 bg-lime/15 rounded-2xl flex items-center justify-center">
              <Send className="w-7 h-7 text-lime" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Avisar cambio de cuota</h3>
            <p className="text-white/50 text-sm mb-2">Cuota actual: <strong className="text-white">${precioBase.toLocaleString('es-AR')}/mes</strong></p>
            <p className="text-white/40 text-xs mb-5">Se enviara el aviso a {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} con los datos de pago incluidos.</p>
            <div className="space-y-2">
              <button onClick={enviarAvisoCuotaWhatsApp} className="w-full py-3 bg-emerald-500 text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
              </button>
              <button onClick={enviarAvisoCuotaEmail} className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Enviar por Email
              </button>
              <button onClick={() => setShowAvisoCuota(false)} className="w-full py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowRegistrar(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-lime text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-lime/80 transition-all">
          <Plus className="w-4 h-4" /> Registrar Pago
        </button>
        <button onClick={imprimirResumen} className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
          <Printer className="w-3.5 h-3.5" /> Imprimir Resumen
        </button>
        <div className="flex gap-1 ml-auto">
          {(['todos', 'pagado', 'pendiente'] as const).map(f => (
            <button key={f} onClick={() => setFiltroEstado(f)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filtroEstado === f ? 'bg-electric/15 text-electric border border-electric/20' : 'bg-white/5 text-white/30 border border-dark-border'}`}>
              {f === 'todos' ? 'Todos' : f === 'pagado' ? 'Pagados' : 'Pendientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Busqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/30" />
      </div>

      {/* Lista de clientes */}
      {clientes.length === 0 ? (
        <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
          <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No hay clientes registrados. Agrega clientes en "Mis Clientes" primero.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(c => (
            <div key={c.id} className={`bg-dark-800 border rounded-2xl overflow-hidden transition-all ${c.estado === 'pagado' ? 'border-emerald-500/15' : 'border-dark-border'}`}>
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowDetalle(showDetalle === c.id ? null : c.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${c.estado === 'pagado' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {c.estado === 'pagado' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{c.nombre}</p>
                    <p className={`text-xs ${c.estado === 'pagado' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {c.estado === 'pagado' ? `Pago $${c.pago!.monto.toLocaleString('es-AR')} - ${c.pago!.fecha}` : `Pendiente $${precioBase.toLocaleString('es-AR')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.estado === 'pendiente' && (
                    <button onClick={e => { e.stopPropagation(); enviarRecordatorio(c); }} className="p-2 text-amber-400/50 hover:text-amber-400 transition-colors" title="Enviar recordatorio">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${showDetalle === c.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {showDetalle === c.id && (
                <div className="px-4 pb-4 border-t border-dark-border/30">
                  {c.pago ? (
                    <div className="space-y-2 mt-3">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-white/40">Monto</span><span className="text-emerald-400 font-bold">${c.pago.monto.toLocaleString('es-AR')}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-white/40">Fecha</span><span className="text-white/70">{c.pago.fecha}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-white/40">Metodo</span><span className="text-white/70">{c.pago.metodo}</span></div>
                        {c.pago.comprobante && <div className="flex justify-between text-xs"><span className="text-white/40">Comprobante</span><span className="text-white/70">{c.pago.comprobante}</span></div>}
                        {c.pago.nota && <div className="flex justify-between text-xs"><span className="text-white/40">Nota</span><span className="text-white/70">{c.pago.nota}</span></div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => imprimirRecibo(c.pago!)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                          <Printer className="w-3.5 h-3.5" /> Recibo
                        </button>
                        <button onClick={() => enviarComprobante(c.pago!, c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all">
                          <MessageCircle className="w-3.5 h-3.5" /> Enviar
                        </button>
                        <button onClick={() => eliminarPago(c.pago!.id)} className="flex items-center justify-center gap-1 py-2 px-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="text-amber-400 text-xs font-medium">Cuota pendiente de ${precioBase.toLocaleString('es-AR')}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setNuevoPago(p => ({ ...p, clienteId: c.id })); setShowRegistrar(true); }}
                          className="flex-1 py-2 bg-lime text-black rounded-xl text-xs font-bold text-center">Registrar Pago</button>
                        <button onClick={() => enviarRecordatorio(c)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-medium">
                          <MessageCircle className="w-3.5 h-3.5" /> Recordatorio
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Historial de pagos de este cliente */}
                  {(() => {
                    const historial = pagos.filter(p => p.clienteId === c.id).slice(-6).reverse();
                    if (historial.length <= 1) return null;
                    return (
                      <div className="mt-3">
                        <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Historial</p>
                        <div className="space-y-1">
                          {historial.map(p => (
                            <div key={p.id} className="flex justify-between text-[11px] bg-black/20 rounded-lg px-2.5 py-1.5">
                              <span className="text-white/40">{MESES[parseInt(p.mes.split('/')[0]) - 1]} {p.mes.split('/')[1]}</span>
                              <span className="text-white/60">${p.monto.toLocaleString('es-AR')} - {p.metodo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal registrar pago */}
      {showRegistrar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowRegistrar(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2"><DollarSign className="w-5 h-5 text-lime" /> Registrar Pago</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Cliente</label>
                <select value={nuevoPago.clienteId} onChange={e => setNuevoPago(p => ({ ...p, clienteId: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                  <option value={0} className="bg-dark-800">Seleccionar cliente...</option>
                  {clientes.filter(c => !pagosMes.find(p => p.clienteId === c.id)).map(c => (
                    <option key={c.id} value={c.id} className="bg-dark-800">{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Monto ($)</label>
                  <input type="number" value={nuevoPago.monto} onChange={e => setNuevoPago(p => ({ ...p, monto: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Metodo</label>
                  <select value={nuevoPago.metodo} onChange={e => setNuevoPago(p => ({ ...p, metodo: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                    {['Efectivo', 'Transferencia', 'Mercado Pago', 'Debito', 'Credito', 'Otro'].map(m => <option key={m} value={m} className="bg-dark-800">{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Comprobante (opcional)</label>
                <input type="text" value={nuevoPago.comprobante} onChange={e => setNuevoPago(p => ({ ...p, comprobante: e.target.value }))} placeholder="N° de transferencia, recibo, etc"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Nota (opcional)</label>
                <input type="text" value={nuevoPago.nota} onChange={e => setNuevoPago(p => ({ ...p, nota: e.target.value }))} placeholder="Observaciones"
                  className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div className="bg-electric/5 border border-electric/10 rounded-xl p-3 text-center">
                <p className="text-white/40 text-xs">Periodo: <strong className="text-white/70">{mesNombre}</strong></p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRegistrar(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={registrarPago} disabled={!nuevoPago.clienteId}
                  className="flex-1 py-3 bg-lime text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
