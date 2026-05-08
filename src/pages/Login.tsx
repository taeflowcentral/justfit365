import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, ShieldCheck, Fingerprint, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';

type Modo = 'normal' | 'gym-client';

export default function Login() {
  const { login, loginWithGoogle, loginGymClient } = useAuth();
  const [modo, setModo] = useState<Modo>('normal');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [gimnasio, setGimnasio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setError('No se pudo iniciar sesión con Google. Probá de nuevo.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (modo === 'gym-client') {
      const r = await loginGymClient(gimnasio, dni);
      if (!r.success) setError(r.error || 'No se pudo iniciar sesi\u00f3n.');
      setLoading(false);
      return;
    }
    if (!apellido.trim() || !dni.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }
    if (!/^\d{7,8}$/.test(dni)) {
      setError('El DNI debe tener 7 u 8 d\u00edgitos num\u00e9ricos.');
      setLoading(false);
      return;
    }
    const ok = await login(apellido, dni, password);
    if (!ok) {
      setError('Credenciales incorrectas. Verifique apellido, DNI y contrase\u00f1a.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,153,255,0.1) 50px, rgba(0,153,255,0.1) 51px),
                            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,153,255,0.1) 50px, rgba(0,153,255,0.1) 51px)`
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime rounded-2xl shadow-2xl shadow-lime/20 mb-5 relative">
            <Zap className="w-10 h-10 text-black" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-lime rounded-2xl animate-ping opacity-20" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">JustFit<span className="text-lime">365</span></h1>
          <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">Fitness & Nutrici&oacute;n Inteligente</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-800/80 backdrop-blur-2xl border border-dark-border rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5 text-electric" />
            <h2 className="text-lg font-bold text-white tracking-tight">Acceso Seguro</h2>
          </div>

          {/* Toggle modo */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-dark-border mb-5">
            <button type="button" onClick={() => { setModo('normal'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${modo === 'normal' ? 'bg-electric/15 text-electric' : 'text-white/40 hover:text-white/60'}`}>
              <User className="w-3.5 h-3.5" /> Mi cuenta
            </button>
            <button type="button" onClick={() => { setModo('gym-client'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${modo === 'gym-client' ? 'bg-amber-500/15 text-amber-400' : 'text-white/40 hover:text-white/60'}`}>
              <Building2 className="w-3.5 h-3.5" /> Cliente de gimnasio
            </button>
          </div>

          {modo === 'gym-client' && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-5 text-amber-400/80 text-xs">
              <p className="font-bold mb-1">¿Sos cliente de un gimnasio?</p>
              <p className="text-amber-400/65">Si tu gimnasio te dio de alta en JustFit365, accedé gratis con el nombre de tu gimnasio y tu DNI. Tu entrenador puede ver y editar tus rutinas y nutrición.</p>
            </div>
          )}

          {/* Google OAuth - solo en modo normal */}
          {modo === 'normal' && (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full py-3.5 bg-white hover:bg-white/90 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
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
          )}

          {/* Separador */}
          {modo === 'normal' && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-white/30 text-[10px] uppercase tracking-wider">o usá tu DNI</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {modo === 'gym-client' ? (
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Nombre del gimnasio</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
                  <input
                    type="text"
                    value={gimnasio}
                    onChange={e => setGimnasio(e.target.value)}
                    placeholder="Ej: Iron Gym"
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                  />
                </div>
              </div>
            ) : (
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Usuario</label>
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                placeholder="Ingrese su usuario (apellido)"
                required
                className="w-full px-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric/50 transition-all text-sm"
              />
            </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">DNI</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={dni}
                  onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Ej: 30123456"
                  required
                  maxLength={8}
                  className="w-full pl-10 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric/50 transition-all text-sm font-mono tracking-wider"
                />
              </div>
            </div>

            {modo === 'normal' && (
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Contrase&ntilde;a</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contrase&ntilde;a"
                  required
                  className="w-full px-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric/50 transition-all pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Link to="/recuperar" className="text-electric/60 hover:text-electric text-xs transition-colors">
                &iquest;Olvidaste tu contrase&ntilde;a?
              </Link>
            </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-electric/20 hover:shadow-electric/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Registro */}
          <div className="mt-6 pt-6 border-t border-dark-border text-center">
            <p className="text-white/30 text-sm mb-3">&iquest;No ten&eacute;s cuenta?</p>
            <Link to="/registro"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-electric/10 text-white/60 hover:text-electric border border-dark-border hover:border-electric/20 rounded-xl text-sm font-bold transition-all">
              Crear cuenta nueva
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <LanguageSelector />
          <p className="text-white/15 text-xs tracking-wider">&copy; 2026 JustFit365</p>
        </div>
      </div>
    </div>
  );
}
