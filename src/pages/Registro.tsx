import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Fingerprint, UserPlus, Building2, User, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getPrecioAnual, getPrecioMensualGym } from '../components/PaymentModal';
import { usePromoActiva } from '../lib/appConfig';

export default function Registro() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', email: '', password: '', password2: '',
    role: 'usuario' as 'usuario' | 'gimnasio',
    gimnasioNombre: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const promo = usePromoActiva();

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setError('No se pudo registrar con Google. Probá de nuevo.');
      setGoogleLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
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
    const result = await register({
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime rounded-2xl shadow-2xl shadow-lime/20 mb-4">
            <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">JustFit<span className="text-lime">365</span></h1>
          <p className="text-white/40 mt-2 text-sm">Cre&aacute; tu cuenta y empez&aacute; a entrenar</p>
        </div>

        {/* Form */}
        <div className="bg-dark-800/80 backdrop-blur-2xl border border-dark-border rounded-3xl shadow-2xl p-6">
          {/* Banner promocion FREE */}
          {promo.activa && promo.until && (
            <div className="mb-5 bg-gradient-to-r from-emerald-500/15 to-lime/15 border border-emerald-500/30 rounded-2xl p-4 text-center">
              <span className="text-3xl">🎁</span>
              <p className="text-emerald-400 font-black text-lg mt-1">¡PROMOCIÓN FREE ACTIVA!</p>
              <p className="text-white/70 text-xs mt-1">Registrate ahora y accedé GRATIS hasta el {promo.until.toLocaleDateString('es-AR')}</p>
              <p className="text-white/40 text-[10px] mt-1">Quedan {Math.ceil((promo.until.getTime() - Date.now()) / 86400000)} día{Math.ceil((promo.until.getTime() - Date.now()) / 86400000) !== 1 ? 's' : ''} de promoción</p>
            </div>
          )}
          <div className="flex items-center gap-2 mb-5">
            <UserPlus className="w-5 h-5 text-electric" />
            <h2 className="text-lg font-bold text-white">Crear Cuenta</h2>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full py-3 bg-white hover:bg-white/90 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                Continuar con Google
              </>
            )}
          </button>

          {/* Separador */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-white/30 text-[10px] uppercase tracking-wider">o registrate manual</span>
            <div className="flex-1 h-px bg-dark-border" />
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
                    placeholder="Min. 6 caracteres" required minLength={6}
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
                <strong className="text-amber-400">Plan Gimnasio:</strong> ${getPrecioMensualGym().toLocaleString('es-AR')}/mes. Incluye gesti&oacute;n de clientes, rutinas y nutrici&oacute;n personalizada.
              </div>
            )}

            {form.role === 'usuario' && (
              <div className="bg-electric/5 border border-electric/15 rounded-xl p-3 text-xs text-electric/60">
                <strong className="text-electric">Plan Individual:</strong> ${getPrecioAnual().toLocaleString('es-AR')}/a&ntilde;o. Acceso completo a todos los m&oacute;dulos.
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
            <Link to="/login" className="text-white/30 text-sm hover:text-electric transition-colors">
              Ya tengo cuenta &mdash; <strong className="text-white/50">Iniciar Sesi&oacute;n</strong>
            </Link>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-6 tracking-wider">&copy; 2026 JustFit365</p>
      </div>
    </div>
  );
}
