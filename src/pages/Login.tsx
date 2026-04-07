import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, ShieldCheck, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!apellido.trim() || !dni.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!/^\d{7,8}$/.test(dni)) {
      setError('El DNI debe tener 7 u 8 d\u00edgitos num\u00e9ricos.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (!login(apellido, dni, password)) {
        setError('Credenciales incorrectas. Verifique apellido, DNI y contrase\u00f1a.');
      }
      setLoading(false);
    }, 900);
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-electric to-neon rounded-2xl shadow-2xl shadow-electric/20 mb-5 relative">
            <Zap className="w-10 h-10 text-black" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-gradient-to-br from-electric to-neon rounded-2xl animate-ping opacity-20" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Just<span className="text-electric">Fit</span><span className="text-white">365</span></h1>
          <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">Fitness & Nutrici&oacute;n Inteligente</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-800/80 backdrop-blur-2xl border border-dark-border rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="w-5 h-5 text-electric" />
            <h2 className="text-lg font-bold text-white tracking-tight">Acceso Seguro</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                placeholder="Ingrese su apellido"
                required
                className="w-full px-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric/50 transition-all text-sm"
              />
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Contrase&ntilde;a</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contrase\u00f1a"
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

        <p className="text-center text-white/15 text-xs mt-8 tracking-wider">&copy; 2026 JustFit365 &mdash; All rights reserved</p>
      </div>
    </div>
  );
}
