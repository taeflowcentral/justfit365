import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Fingerprint, UserPlus, Building2, User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', email: '', password: '', password2: '',
    role: 'usuario' as 'usuario' | 'gimnasio',
    gimnasioNombre: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password2) {
      setError('Las contrase\u00f1as no coinciden.');
      return;
    }
    if (form.role === 'gimnasio' && !form.gimnasioNombre.trim()) {
      setError('Ingres\u00e1 el nombre del gimnasio.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        email: form.email,
        password: form.password,
        role: form.role,
        gimnasioNombre: form.gimnasioNombre,
      });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Error al registrar.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-electric to-neon rounded-2xl shadow-2xl shadow-electric/20 mb-4">
            <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Just<span className="text-electric">Fit</span><span className="text-white">365</span></h1>
          <p className="text-white/40 mt-2 text-sm">Cre&aacute; tu cuenta y empez&aacute; a entrenar</p>
        </div>

        {/* Form */}
        <div className="bg-dark-800/80 backdrop-blur-2xl border border-dark-border rounded-3xl shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-electric" />
            <h2 className="text-lg font-bold text-white">Crear Cuenta</h2>
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

            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="tu@email.com" required
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm" />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Contrase&ntilde;a</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                    placeholder="M\u00edn. 6 caracteres" required minLength={6}
                    className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Repetir</label>
                <input type={showPassword ? 'text' : 'password'} value={form.password2} onChange={e => update('password2', e.target.value)}
                  placeholder="Repetir" required
                  className="w-full px-3 py-3 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm" />
              </div>
            </div>

            {form.role === 'gimnasio' && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-xs text-amber-400/60">
                <strong className="text-amber-400">Plan Gimnasio:</strong> USD 10.00/mes. Incluye gesti&oacute;n de clientes, rutinas y nutrici&oacute;n personalizada.
              </div>
            )}

            {form.role === 'usuario' && (
              <div className="bg-electric/5 border border-electric/15 rounded-xl p-3 text-xs text-electric/60">
                <strong className="text-electric">Plan Individual:</strong> USD 10.00/a&ntilde;o. Acceso completo a todos los m&oacute;dulos.
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-electric/20 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> Crear Cuenta</>}
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href="/login" className="text-white/30 text-sm hover:text-electric transition-colors">
              Ya tengo cuenta &mdash; <strong className="text-white/50">Iniciar Sesi&oacute;n</strong>
            </a>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-6 tracking-wider">&copy; 2026 JustFit365</p>
      </div>
    </div>
  );
}
