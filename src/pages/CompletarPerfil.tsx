import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Fingerprint, User, Building2, UserPlus, LogOut } from 'lucide-react';

export default function CompletarPerfil() {
  const { pendingGoogle, completeGoogleRegistration, logout } = useAuth();
  const navigate = useNavigate();
  const nombreInicial = pendingGoogle?.nombre?.split(' ')[0] || '';
  const apellidoInicial = pendingGoogle?.nombre?.split(' ').slice(1).join(' ') || '';

  const [form, setForm] = useState({
    nombre: nombreInicial,
    apellido: apellidoInicial,
    dni: '',
    role: 'usuario' as 'usuario' | 'gimnasio',
    gimnasioNombre: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!pendingGoogle) {
    navigate('/');
    return null;
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.role === 'gimnasio' && !form.gimnasioNombre.trim()) {
      setError('Ingresá el nombre del gimnasio.');
      return;
    }
    setLoading(true);
    const result = await completeGoogleRegistration({
      nombre: form.nombre,
      apellido: form.apellido,
      dni: form.dni,
      role: form.role,
      gimnasioNombre: form.gimnasioNombre,
    });
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Error al completar el perfil.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime rounded-2xl shadow-2xl shadow-lime/20 mb-4">
            <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">JustFit<span className="text-lime">365</span></h1>
          <p className="text-white/40 mt-2 text-sm">Un &uacute;ltimo paso para activar tu cuenta</p>
        </div>

        <div className="bg-dark-800 border border-dark-border rounded-3xl shadow-2xl p-6">
          {/* Identidad de Google */}
          <div className="flex items-center gap-3 mb-5 p-3 bg-white/[0.03] border border-dark-border rounded-2xl">
            {pendingGoogle.foto ? (
              <img src={pendingGoogle.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black font-black">
                {pendingGoogle.nombre.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{pendingGoogle.nombre}</p>
              <p className="text-white/40 text-xs truncate">{pendingGoogle.email}</p>
            </div>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Google</span>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <UserPlus className="w-5 h-5 text-electric" />
            <h2 className="text-lg font-bold text-white">Complet&aacute; tus datos</h2>
          </div>

          {/* Tipo de cuenta */}
          <div className="flex gap-2 mb-5">
            <button type="button" onClick={() => update('role', 'usuario')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                form.role === 'usuario' ? 'bg-electric/15 text-electric border border-electric/30' : 'bg-white/5 text-white/40 border border-dark-border'
              }`}>
              <User className="w-4 h-4" /> Individual
            </button>
            <button type="button" onClick={() => update('role', 'gimnasio')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                form.role === 'gimnasio' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/40 border border-dark-border'
              }`}>
              <Building2 className="w-4 h-4" /> Gimnasio
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Nombre</label>
                <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} required
                  className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Apellido</label>
                <input type="text" value={form.apellido} onChange={e => update('apellido', e.target.value)} required
                  className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">DNI</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input type="text" value={form.dni} onChange={e => update('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Ej: 30123456" required maxLength={8}
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm font-mono tracking-wider" />
              </div>
            </div>

            {form.role === 'gimnasio' && (
              <div>
                <label className="block text-xs font-semibold text-amber-400/60 mb-1.5 uppercase tracking-wider">Nombre del Gimnasio</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/30" />
                  <input type="text" value={form.gimnasioNombre} onChange={e => update('gimnasioNombre', e.target.value)}
                    placeholder="Ej: Iron Gym" required={form.role === 'gimnasio'}
                    className="w-full pl-10 pr-4 py-3 bg-black/60 border border-amber-500/20 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm" />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-electric/20 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> Activar mi cuenta</>}
            </button>
          </form>

          <button onClick={logout}
            className="w-full mt-4 py-2.5 text-white/30 text-xs hover:text-white/60 transition-colors flex items-center justify-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Cancelar y cerrar sesi&oacute;n
          </button>
        </div>
      </div>
    </div>
  );
}
