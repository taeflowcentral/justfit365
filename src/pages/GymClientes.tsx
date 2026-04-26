import { useState } from 'react';
import { Users, Plus, Search, Dumbbell, Utensils, Trash2, User, Phone, Target, Activity, MessageCircle, Printer, Mail, History, Save, Clock } from 'lucide-react';
import { getUserItem, setUserItem } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { buscarAlimentos } from '../lib/foodDB';
import { printContent } from '../components/ShareButtons';

interface ClienteRutina {
  id: number;
  nombre: string;
  series: number;
  reps: string;
  descanso: string;
  peso: string;
  musculo: string;
  notas: string;
}

interface ClienteComida {
  id: number;
  nombre: string;
  hora: string;
  items: { id: number; alimento: string; porcion: string; cal: number; prot: number; carb: number; grasa: number }[];
}

interface HistorialEntry {
  id: number;
  fecha: string;
  tipo: 'rutina' | 'nutricion';
  datos: ClienteRutina[] | ClienteComida[];
  nota: string;
}

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  objetivo: string;
  nivel: string;
  peso: number;
  altura: number;
  edad: number;
  rutina: ClienteRutina[];
  nutricion: ClienteComida[];
  notas: string;
  historial: HistorialEntry[];
}

const CLIENTES_KEY = 'bc_gym_clientes';

export default function GymClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = getUserItem(CLIENTES_KEY);
    if (saved) {
      // Migrar clientes viejos que no tengan email/historial
      const parsed = JSON.parse(saved);
      return parsed.map((c: Cliente) => ({ ...c, email: c.email || '', historial: c.historial || [] }));
    }
    return [];
  });
  const [busqueda, setBusqueda] = useState('');
  const [clienteActivo, setClienteActivo] = useState<number | null>(null);
  const [tab, setTab] = useState<'rutina' | 'nutricion' | 'perfil' | 'historial'>('rutina');
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [showAddEj, setShowAddEj] = useState(false);
  const [showAddComida, setShowAddComida] = useState(false);
  const [showAddAlimento, setShowAddAlimento] = useState<number | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '', objetivo: 'Hipertrofia', nivel: 'Principiante', peso: '', altura: '', edad: '' });
  const [nuevoEj, setNuevoEj] = useState({ nombre: '', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Pecho', notas: '' });
  const [nuevaComida, setNuevaComida] = useState({ nombre: '', hora: '12:00' });
  const [nuevoAlimento, setNuevoAlimento] = useState({ alimento: '', porcion: '', cal: 0, prot: 0, carb: 0, grasa: 0 });

  const guardar = (c: Cliente[]) => { setClientes(c); setUserItem(CLIENTES_KEY, JSON.stringify(c)); };

  const cliente = clientes.find(c => c.id === clienteActivo);
  const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const updateCliente = (id: number, data: Partial<Cliente>) => {
    guardar(clientes.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const addCliente = () => {
    if (!nuevoCliente.nombre.trim()) return;
    const nuevo: Cliente = {
      id: Date.now(), nombre: nuevoCliente.nombre, telefono: nuevoCliente.telefono, email: nuevoCliente.email,
      objetivo: nuevoCliente.objetivo, nivel: nuevoCliente.nivel,
      peso: parseFloat(nuevoCliente.peso) || 70, altura: parseInt(nuevoCliente.altura) || 170, edad: parseInt(nuevoCliente.edad) || 25,
      notas: '', rutina: [], nutricion: [], historial: [],
    };
    guardar([...clientes, nuevo]);
    setNuevoCliente({ nombre: '', telefono: '', email: '', objetivo: 'Hipertrofia', nivel: 'Principiante', peso: '', altura: '', edad: '' });
    setShowAddCliente(false);
    setClienteActivo(nuevo.id);
  };

  const deleteCliente = (id: number) => {
    guardar(clientes.filter(c => c.id !== id));
    if (clienteActivo === id) setClienteActivo(null);
  };

  // Rutina
  const addEjercicioCliente = () => {
    if (!cliente || !nuevoEj.nombre.trim()) return;
    const ej: ClienteRutina = { id: Date.now(), ...nuevoEj };
    updateCliente(cliente.id, { rutina: [...cliente.rutina, ej] });
    setNuevoEj({ nombre: '', series: 3, reps: '10-12', descanso: '60', peso: '', musculo: 'Pecho', notas: '' });
    setShowAddEj(false);
  };

  const deleteEjCliente = (ejId: number) => {
    if (!cliente) return;
    updateCliente(cliente.id, { rutina: cliente.rutina.filter(e => e.id !== ejId) });
  };

  // Nutricion
  const addComidaCliente = () => {
    if (!cliente || !nuevaComida.nombre.trim()) return;
    const comida: ClienteComida = { id: Date.now(), nombre: nuevaComida.nombre, hora: nuevaComida.hora, items: [] };
    updateCliente(cliente.id, { nutricion: [...cliente.nutricion, comida] });
    setNuevaComida({ nombre: '', hora: '12:00' });
    setShowAddComida(false);
  };

  const addItemComida = (comidaId: number) => {
    if (!cliente || !nuevoAlimento.alimento.trim()) return;
    const nutricion = cliente.nutricion.map(c => c.id === comidaId ? { ...c, items: [...c.items, { id: Date.now(), ...nuevoAlimento }] } : c);
    updateCliente(cliente.id, { nutricion });
    setNuevoAlimento({ alimento: '', porcion: '', cal: 0, prot: 0, carb: 0, grasa: 0 });
    setShowAddAlimento(null);
  };

  const deleteItemComida = (comidaId: number, itemId: number) => {
    if (!cliente) return;
    const nutricion = cliente.nutricion.map(c => c.id === comidaId ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c);
    updateCliente(cliente.id, { nutricion });
  };

  const deleteComidaCliente = (comidaId: number) => {
    if (!cliente) return;
    updateCliente(cliente.id, { nutricion: cliente.nutricion.filter(c => c.id !== comidaId) });
  };

  // Guardar en historial
  const guardarEnHistorial = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const entry: HistorialEntry = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-AR'),
      tipo,
      datos: tipo === 'rutina' ? [...cliente.rutina] : [...cliente.nutricion],
      nota: `${tipo === 'rutina' ? 'Rutina' : 'Plan nutricional'} guardado`,
    };
    updateCliente(cliente.id, { historial: [...(cliente.historial || []), entry] });
  };

  // Generar texto para compartir
  const generarTexto = (tipo: 'rutina' | 'nutricion'): string => {
    if (!cliente) return '';
    const gym = user?.gimnasioNombre || 'JustFit365';
    let text = `*${gym} - ${cliente.nombre}*\n\n`;
    if (tipo === 'rutina') {
      text += '*Rutina de Entrenamiento:*\n';
      cliente.rutina.forEach((e, i) => {
        text += `${i + 1}. *${e.nombre}* (${e.musculo})\n   ${e.series}x${e.reps} | ${e.peso}kg | Desc: ${e.descanso}s\n`;
        if (e.notas) text += `   \u2192 ${e.notas}\n`;
      });
    } else {
      text += '*Plan Nutricional:*\n';
      let totalCal = 0;
      cliente.nutricion.forEach(c => {
        const comidaCal = c.items.reduce((a, it) => a + it.cal, 0);
        totalCal += comidaCal;
        text += `\n*${c.nombre}* (${c.hora}) - ${comidaCal} kcal\n`;
        c.items.forEach(it => { text += `  \u2022 ${it.alimento} (${it.porcion}) - ${it.cal}cal | ${it.prot}gP | ${it.carb}gC | ${it.grasa}gG\n`; });
      });
      text += `\n*Total:* ${totalCal} kcal`;
    }
    text += `\n\n_Generado por ${gym} + JustFit365_`;
    return text;
  };

  // WhatsApp
  const enviarWhatsApp = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const text = generarTexto(tipo);
    const tel = cliente.telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Email
  const enviarEmail = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const gym = user?.gimnasioNombre || 'JustFit365';
    const subject = `${gym} - ${tipo === 'rutina' ? 'Rutina' : 'Plan Nutricional'} - ${cliente.nombre}`;
    const body = generarTexto(tipo).replace(/\*/g, '');
    const mailto = `mailto:${cliente.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  // Imprimir
  const imprimir = (tipo: 'rutina' | 'nutricion') => {
    if (!cliente) return;
    const gym = user?.gimnasioNombre || 'JustFit365';
    let html = `<p class="subtitle">${gym} - ${cliente.nombre} | ${cliente.objetivo} | ${cliente.peso}kg | ${cliente.edad} a\u00f1os</p>`;

    if (tipo === 'rutina') {
      html += '<table><tr><th>#</th><th>Ejercicio</th><th>M\u00fasculo</th><th>Series</th><th>Reps</th><th>Peso</th><th>Desc.</th><th>Notas</th></tr>';
      cliente.rutina.forEach((e, i) => {
        html += `<tr><td>${i + 1}</td><td>${e.nombre}</td><td>${e.musculo}</td><td>${e.series}</td><td>${e.reps}</td><td>${e.peso}kg</td><td>${e.descanso}s</td><td>${e.notas || '-'}</td></tr>`;
      });
      html += '</table>';
    } else {
      cliente.nutricion.forEach(c => {
        const cal = c.items.reduce((a, it) => a + it.cal, 0);
        html += `<h2>${c.nombre} (${c.hora}) - ${cal} kcal</h2>`;
        html += '<table><tr><th>Alimento</th><th>Porci\u00f3n</th><th>Cal</th><th>Prot</th><th>Carb</th><th>Grasa</th></tr>';
        c.items.forEach(it => { html += `<tr><td>${it.alimento}</td><td>${it.porcion}</td><td>${it.cal}</td><td>${it.prot}g</td><td>${it.carb}g</td><td>${it.grasa}g</td></tr>`; });
        html += '</table>';
      });
      const total = cliente.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.cal, 0), 0);
      html += `<div class="note"><strong>Total:</strong> ${total} kcal</div>`;
    }
    html += `<p style="margin-top:20px;font-size:11px;color:#888">Fecha: ${new Date().toLocaleDateString('es-AR')} | ${gym} + JustFit365</p>`;
    printContent(`${tipo === 'rutina' ? 'Rutina' : 'Plan Nutricional'} - ${cliente.nombre}`, html);
  };

  // Vista lista
  if (!clienteActivo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-electric" /> Mis Clientes
            </h1>
            <p className="text-white/50 text-sm mt-1">{clientes.length} clientes registrados</p>
          </div>
          <button onClick={() => setShowAddCliente(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-electric/20">
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/30" />
        </div>

        {clientes.length === 0 && (
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Sin clientes</h3>
            <p className="text-white/40 text-sm mb-4">Agreg&aacute; tu primer cliente para crear rutinas y planes nutricionales.</p>
            <button onClick={() => setShowAddCliente(true)} className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-bold">
              <Plus className="w-4 h-4 inline mr-1" /> Agregar Cliente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map(c => (
            <div key={c.id} className="bg-dark-800 border border-dark-border rounded-2xl p-5 hover:border-electric/20 transition-all cursor-pointer" onClick={() => { setClienteActivo(c.id); setTab('rutina'); }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black text-sm font-black">
                    {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{c.nombre}</p>
                    <p className="text-white/40 text-xs">{c.objetivo} &middot; {c.nivel}</p>
                  </div>
                </div>
                <button onClick={(ev) => { ev.stopPropagation(); deleteCliente(c.id); }} className="p-1.5 text-white/15 hover:text-danger transition-colors rounded-lg hover:bg-white/5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {c.rutina.length} ej.</span>
                <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> {c.nutricion.length} comidas</span>
                <span>{c.peso}kg &middot; {c.altura}cm &middot; {c.edad}a</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal nuevo cliente */}
        {showAddCliente && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddCliente(false)}>
            <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-electric" /> Nuevo Cliente</h2>
              <div className="space-y-3">
                <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Nombre completo</label>
                  <input type="text" value={nuevoCliente.nombre} onChange={e => setNuevoCliente(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre y Apellido" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Tel&eacute;fono (WhatsApp)</label>
                    <input type="tel" value={nuevoCliente.telefono} onChange={e => setNuevoCliente(p => ({ ...p, telefono: e.target.value }))} placeholder="5492211234567" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Email</label>
                    <input type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente(p => ({ ...p, email: e.target.value }))} placeholder="cliente@email.com" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Objetivo</label>
                    <select value={nuevoCliente.objetivo} onChange={e => setNuevoCliente(p => ({ ...p, objetivo: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                      {['Hipertrofia', 'Tonificacion', 'Perdida de grasa', 'Fuerza', 'Resistencia', 'Salud general'].map(o => <option key={o} value={o} className="bg-dark-800">{o}</option>)}
                    </select></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Nivel</label>
                    <select value={nuevoCliente.nivel} onChange={e => setNuevoCliente(p => ({ ...p, nivel: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                      {['Principiante', 'Intermedio', 'Avanzado'].map(n => <option key={n} value={n} className="bg-dark-800">{n}</option>)}
                    </select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Peso (kg)</label>
                    <input type="number" value={nuevoCliente.peso} onChange={e => setNuevoCliente(p => ({ ...p, peso: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Altura (cm)</label>
                    <input type="number" value={nuevoCliente.altura} onChange={e => setNuevoCliente(p => ({ ...p, altura: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                  <div><label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Edad</label>
                    <input type="number" value={nuevoCliente.edad} onChange={e => setNuevoCliente(p => ({ ...p, edad: e.target.value }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddCliente(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                  <button onClick={addCliente} disabled={!nuevoCliente.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-electric to-neon text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Crear</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista detalle
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setClienteActivo(null)} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black font-black">
              {cliente!.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{cliente!.nombre}</h1>
              <p className="text-white/40 text-xs">{cliente!.objetivo} &middot; {cliente!.nivel} &middot; {cliente!.peso}kg &middot; {cliente!.edad}a</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl border border-dark-border">
        {[
          { key: 'rutina' as const, label: 'Rutina', icon: Dumbbell },
          { key: 'nutricion' as const, label: 'Nutrici\u00f3n', icon: Utensils },
          { key: 'perfil' as const, label: 'Datos', icon: User },
          { key: 'historial' as const, label: 'Historial', icon: History },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === t.key ? 'bg-electric/15 text-electric' : 'text-white/30 hover:text-white/50'
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Rutina */}
      {tab === 'rutina' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-white/50 text-sm">{cliente!.rutina.length} ejercicios</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { guardarEnHistorial('rutina'); }} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-medium hover:bg-amber-500/20 transition-all" title="Guardar en historial">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
              <button onClick={() => imprimir('rutina')} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button onClick={() => enviarWhatsApp('rutina')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button onClick={() => enviarEmail('rutina')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-all">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button onClick={() => setShowAddEj(true)} className="flex items-center gap-1.5 px-3 py-2 bg-electric/15 border border-electric/20 text-electric rounded-xl text-xs font-bold hover:bg-electric/25 transition-all">
                <Plus className="w-3.5 h-3.5" /> Ejercicio
              </button>
            </div>
          </div>

          {cliente!.rutina.length === 0 ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <Dumbbell className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Sin ejercicios. Agreg&aacute; ejercicios para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cliente!.rutina.map((e, i) => (
                <div key={e.id} className="bg-dark-800 border border-dark-border rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-purple-500/15 text-purple-400 rounded-lg flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{e.nombre}</p>
                      <p className="text-white/40 text-xs">{e.musculo} &middot; {e.series}x{e.reps} &middot; {e.peso}kg &middot; {e.descanso}s</p>
                      {e.notas && <p className="text-electric/50 text-xs mt-0.5">{e.notas}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteEjCliente(e.id)} className="p-1.5 text-white/15 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Nutricion */}
      {tab === 'nutricion' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-white/50 text-sm">{cliente!.nutricion.length} comidas</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { guardarEnHistorial('nutricion'); }} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-medium hover:bg-amber-500/20 transition-all">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
              <button onClick={() => imprimir('nutricion')} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-dark-border text-white/50 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button onClick={() => enviarWhatsApp('nutricion')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button onClick={() => enviarEmail('nutricion')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-all">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button onClick={() => setShowAddComida(true)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition-all">
                <Plus className="w-3.5 h-3.5" /> Comida
              </button>
            </div>
          </div>

          {cliente!.nutricion.length === 0 ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <Utensils className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Sin plan nutricional. Agreg&aacute; comidas para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cliente!.nutricion.map(c => (
                <div key={c.id} className="bg-dark-800 border border-dark-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border/50">
                    <div>
                      <p className="text-white font-bold text-sm">{c.nombre}</p>
                      <p className="text-white/40 text-xs">{c.hora} hs &middot; {c.items.reduce((a, it) => a + it.cal, 0)} kcal</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setShowAddAlimento(c.id)} className="p-1.5 text-white/20 hover:text-emerald-400 transition-colors"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => deleteComidaCliente(c.id)} className="p-1.5 text-white/15 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {c.items.length > 0 && (
                    <div className="divide-y divide-dark-border/30">
                      {c.items.map(it => (
                        <div key={it.id} className="px-4 py-2 text-sm flex items-center justify-between">
                          <div>
                            <p className="text-white/80">{it.alimento} <span className="text-white/30">({it.porcion})</span></p>
                            <p className="text-[11px] text-white/40">{it.cal}cal &middot; {it.prot}gP &middot; {it.carb}gC &middot; {it.grasa}gG</p>
                          </div>
                          <button onClick={() => deleteItemComida(c.id, it.id)} className="p-1 text-white/10 hover:text-danger transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Totales */}
              <div className="bg-dark-800 border border-electric/10 rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/50 text-xs font-bold uppercase">Total del d&iacute;a</span>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-orange-400">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.cal, 0), 0)} kcal</span>
                  <span className="text-electric">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.prot, 0), 0)}g P</span>
                  <span className="text-amber-400">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.carb, 0), 0)}g C</span>
                  <span className="text-pink-400">{cliente!.nutricion.reduce((a, c) => a + c.items.reduce((b, it) => b + it.grasa, 0), 0)}g G</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Perfil */}
      {tab === 'perfil' && (
        <div className="space-y-4">
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Datos del cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Peso', value: `${cliente!.peso} kg`, icon: Activity },
                { label: 'Altura', value: `${cliente!.altura} cm`, icon: User },
                { label: 'Edad', value: `${cliente!.edad} a\u00f1os`, icon: User },
                { label: 'Objetivo', value: cliente!.objetivo, icon: Target },
                { label: 'Nivel', value: cliente!.nivel, icon: Activity },
                { label: 'Tel\u00e9fono', value: cliente!.telefono || '-', icon: Phone },
              ].map(d => (
                <div key={d.label} className="bg-black/30 border border-dark-border/50 rounded-xl p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider flex items-center gap-1"><d.icon className="w-3 h-3" />{d.label}</p>
                  <p className="text-white font-bold text-sm mt-1">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
          {cliente!.email && (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
              <p className="text-white font-bold text-sm mt-1">{cliente!.email}</p>
            </div>
          )}
          <div className="bg-dark-800 border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-2">Notas del entrenador</h3>
            <textarea value={cliente!.notas} onChange={e => updateCliente(cliente!.id, { notas: e.target.value })} rows={4} placeholder="Lesiones, restricciones, observaciones..."
              className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none" />
          </div>
        </div>
      )}

      {/* Tab Historial */}
      {tab === 'historial' && (
        <div className="space-y-4">
          {(!cliente!.historial || cliente!.historial.length === 0) ? (
            <div className="bg-dark-800 border border-dark-border rounded-2xl p-8 text-center">
              <History className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Sin historial. Us&aacute; el bot&oacute;n "Guardar" en Rutina o Nutrici&oacute;n para crear una entrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...(cliente!.historial || [])].reverse().map(h => (
                <div key={h.id} className="bg-dark-800 border border-dark-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {h.tipo === 'rutina' ? <Dumbbell className="w-4 h-4 text-purple-400" /> : <Utensils className="w-4 h-4 text-emerald-400" />}
                      <span className={`text-xs font-bold uppercase ${h.tipo === 'rutina' ? 'text-purple-400' : 'text-emerald-400'}`}>{h.tipo === 'rutina' ? 'Rutina' : 'Nutrici\u00f3n'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30 text-xs">
                      <Clock className="w-3 h-3" /> {h.fecha}
                    </div>
                  </div>
                  {h.tipo === 'rutina' ? (
                    <div className="space-y-1">
                      {(h.datos as ClienteRutina[]).map((e, i) => (
                        <p key={i} className="text-white/60 text-xs">{i + 1}. {e.nombre} ({e.musculo}) - {e.series}x{e.reps} {e.peso}kg</p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(h.datos as ClienteComida[]).map((c, i) => (
                        <p key={i} className="text-white/60 text-xs">{c.nombre} ({c.hora}) - {c.items.reduce((a, it) => a + it.cal, 0)} kcal</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal agregar ejercicio */}
      {showAddEj && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddEj(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4"><Plus className="w-5 h-5 text-purple-400 inline mr-2" />Agregar Ejercicio</h2>
            <div className="space-y-3">
              <input type="text" value={nuevoEj.nombre} onChange={e => setNuevoEj(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del ejercicio"
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <div className="grid grid-cols-2 gap-3">
                <select value={nuevoEj.musculo} onChange={e => setNuevoEj(p => ({ ...p, musculo: e.target.value }))} className="px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 appearance-none">
                  {['Pecho', 'Espalda', 'Hombro anterior', 'Hombro lateral', 'B\u00edceps', 'Tr\u00edceps', 'Cu\u00e1driceps', 'Isquiotibiales', 'Gl\u00fateos', 'Pantorrillas', 'Core', 'Full Body'].map(g => <option key={g} value={g} className="bg-dark-800">{g}</option>)}
                </select>
                <input type="text" value={nuevoEj.peso} onChange={e => setNuevoEj(p => ({ ...p, peso: e.target.value }))} placeholder="Peso (kg)" className="px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[10px] text-white/30 mb-0.5">Series</label>
                <input type="number" min="1" value={nuevoEj.series} onChange={e => setNuevoEj(p => ({ ...p, series: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" /></div>
                <div><label className="block text-[10px] text-white/30 mb-0.5">Reps</label>
                <input type="text" value={nuevoEj.reps} onChange={e => setNuevoEj(p => ({ ...p, reps: e.target.value }))} placeholder="10-12" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
                <div><label className="block text-[10px] text-white/30 mb-0.5">Desc (s)</label>
                <input type="text" value={nuevoEj.descanso} onChange={e => setNuevoEj(p => ({ ...p, descanso: e.target.value }))} placeholder="60" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" /></div>
              </div>
              <input type="text" value={nuevoEj.notas} onChange={e => setNuevoEj(p => ({ ...p, notas: e.target.value }))} placeholder="Notas (opcional)" className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddEj(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={addEjercicioCliente} disabled={!nuevoEj.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar comida */}
      {showAddComida && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddComida(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4"><Plus className="w-5 h-5 text-emerald-400 inline mr-2" />Nueva Comida</h2>
            <div className="space-y-3">
              <input type="text" value={nuevaComida.nombre} onChange={e => setNuevaComida(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Desayuno, Almuerzo, Merienda"
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder-white/15" />
              <input type="time" value={nuevaComida.hora} onChange={e => setNuevaComida(p => ({ ...p, hora: e.target.value }))}
                className="w-full px-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddComida(false)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={addComidaCliente} disabled={!nuevaComida.nombre.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar alimento a comida */}
      {showAddAlimento !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setShowAddAlimento(null)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Agregar Alimento</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Buscar alimento</label>
                <div className="relative">
                  <input type="text" value={nuevoAlimento.alimento}
                    onChange={e => setNuevoAlimento(p => ({ ...p, alimento: e.target.value }))}
                    placeholder="Empez\u00e1 a escribir... ej: Pollo, Avena, Banana"
                    className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  {nuevoAlimento.alimento.length >= 2 && buscarAlimentos(nuevoAlimento.alimento).length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-10">
                      {buscarAlimentos(nuevoAlimento.alimento).map((a, i) => (
                        <button key={i} type="button"
                          onClick={() => setNuevoAlimento({ alimento: a.nombre, porcion: a.porcionDefault, cal: a.cal, prot: a.prot, carb: a.carb, grasa: a.grasa })}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-500/10 transition-colors border-b border-dark-border/30 last:border-0">
                          <p className="text-white text-sm">{a.nombre}</p>
                          <p className="text-white/40 text-[10px]">{a.porcionDefault} &middot; {a.cal} cal &middot; {a.prot}g P</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1">Porci&oacute;n</label>
                <input type="text" value={nuevoAlimento.porcion} onChange={e => setNuevoAlimento(p => ({ ...p, porcion: e.target.value }))} placeholder="Ej: 200g, 1 unidad"
                  className="w-full px-3 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { field: 'cal' as const, label: 'Cal', color: 'text-orange-400' },
                  { field: 'prot' as const, label: 'g P', color: 'text-electric' },
                  { field: 'carb' as const, label: 'g C', color: 'text-amber-400' },
                  { field: 'grasa' as const, label: 'g G', color: 'text-pink-400' },
                ].map(f => (
                  <div key={f.field}>
                    <label className={`block text-[10px] ${f.color} uppercase tracking-wider mb-1`}>{f.label}</label>
                    <input type="number" min="0" value={nuevoAlimento[f.field] || ''} onChange={e => setNuevoAlimento(p => ({ ...p, [f.field]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-2 py-2.5 bg-black/60 border border-dark-border rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] text-center">Los valores se completan al elegir un alimento de la lista.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddAlimento(null)} className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl text-sm font-semibold border border-dark-border">Cancelar</button>
                <button onClick={() => addItemComida(showAddAlimento)} disabled={!nuevoAlimento.alimento.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-black rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-30">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
