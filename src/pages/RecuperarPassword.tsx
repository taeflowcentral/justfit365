import { useState } from 'react';
import { Zap, Mail, MessageCircle, Fingerprint, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const USERS_DB_KEY = 'jf365_users_db';

export default function RecuperarPassword() {
  const [step, setStep] = useState<'buscar' | 'codigo' | 'nueva' | 'listo'>('buscar');
  const [dni, setDni] = useState('');
  const [metodo, setMetodo] = useState<'email' | 'whatsapp'>('email');
  const [codigo, setCodigo] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailEncontrado, setEmailEncontrado] = useState('');
  const [nombreEncontrado, setNombreEncontrado] = useState('');

  const buscarUsuario = () => {
    setError('');
    if (!/^\d{7,8}$/.test(dni)) {
      setError('Ingres\u00e1 un DNI v\u00e1lido (7-8 d\u00edgitos).');
      return;
    }
    const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    const entry = db[dni];
    if (!entry) {
      setError('No se encontr\u00f3 un usuario con ese DNI.');
      return;
    }
    setEmailEncontrado(entry.user.email || '');
    setNombreEncontrado(entry.user.nombre || '');
    // Generar codigo de 6 digitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGenerado(code);
    setStep('codigo');
  };

  const enviarCodigo = () => {
    if (metodo === 'email') {
      // Simular envio de email
      alert(`Se envi\u00f3 el c\u00f3digo de recuperaci\u00f3n a ${emailEncontrado}\n\nC\u00f3digo: ${codigoGenerado}\n\n(En producci\u00f3n se enviar\u00eda por email real)`);
    } else {
      // Abrir WhatsApp con el codigo
      const msg = encodeURIComponent(`JustFit365 - C\u00f3digo de recuperaci\u00f3n de contrase\u00f1a: ${codigoGenerado}\n\nSi no solicitaste esto, ignor\u00e1 este mensaje.`);
      window.open(`https://wa.me/?text=${msg}`, '_blank');
      alert(`C\u00f3digo de recuperaci\u00f3n: ${codigoGenerado}\n\nEnviate el mensaje de WhatsApp que se abri\u00f3.`);
    }
  };

  const verificarCodigo = () => {
    setError('');
    if (codigo !== codigoGenerado) {
      setError('C\u00f3digo incorrecto. Intentalo de nuevo.');
      return;
    }
    setStep('nueva');
  };

  const cambiarPassword = () => {
    setError('');
    if (password.length < 6) {
      setError('La contrase\u00f1a debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      setError('Las contrase\u00f1as no coinciden.');
      return;
    }
    // Actualizar en DB
    const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    if (db[dni]) {
      db[dni].password = password;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      // Verificar que se guardo
      const verify = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
      if (verify[dni] && verify[dni].password === password) {
        setStep('listo');
      } else {
        setError('Error al guardar. Intent\u00e1 de nuevo.');
      }
    } else {
      setError('Usuario no encontrado en la base de datos.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
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
        </div>

        <div className="bg-dark-800/80 backdrop-blur-2xl border border-dark-border rounded-3xl shadow-2xl p-6">

          {/* STEP: Buscar usuario */}
          {step === 'buscar' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Recuperar contrase&ntilde;a</h2>
                <p className="text-white/40 text-sm">Ingres&aacute; tu DNI para buscar tu cuenta.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Tu DNI</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Ej: 30123456" maxLength={8}
                    className="w-full pl-10 pr-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm font-mono tracking-wider" />
                </div>
              </div>
              {error && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>}
              <button onClick={buscarUsuario}
                className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20">
                Buscar mi cuenta
              </button>
              <Link to="/login" className="w-full flex items-center justify-center gap-2 py-2 text-white/30 hover:text-electric text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al login
              </Link>
            </div>
          )}

          {/* STEP: Enviar y verificar codigo */}
          {step === 'codigo' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Verificar identidad</h2>
                <p className="text-white/40 text-sm">Cuenta encontrada: <strong className="text-white">{nombreEncontrado}</strong></p>
              </div>

              {/* Seleccionar metodo */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">\u00bfC\u00f3mo quer\u00e9s recibir el c\u00f3digo?</p>
                <div className="flex gap-2">
                  <button onClick={() => setMetodo('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      metodo === 'email' ? 'bg-electric/15 text-electric border border-electric/30' : 'bg-white/5 text-white/40 border border-dark-border'
                    }`}>
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button onClick={() => setMetodo('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      metodo === 'whatsapp' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/40 border border-dark-border'
                    }`}>
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>

              {metodo === 'email' && emailEncontrado && (
                <p className="text-white/30 text-xs">Se enviar&aacute; a: <strong className="text-white/50">{emailEncontrado.replace(/(.{3}).*(@.*)/, '$1***$2')}</strong></p>
              )}

              <button onClick={enviarCodigo}
                className={`w-full py-3 font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                  metodo === 'email' ? 'bg-electric/15 text-electric border border-electric/20 hover:bg-electric/25' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25'
                }`}>
                {metodo === 'email' ? <Mail className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                Enviar c\u00f3digo por {metodo === 'email' ? 'email' : 'WhatsApp'}
              </button>

              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">Ingres&aacute; el c\u00f3digo de 6 d\u00edgitos</label>
                <input type="text" value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------" maxLength={6}
                  className="w-full px-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-electric/50" />
              </div>

              {error && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>}

              <button onClick={verificarCodigo} disabled={codigo.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20 disabled:opacity-30">
                Verificar c\u00f3digo
              </button>

              <button onClick={() => { setStep('buscar'); setError(''); }}
                className="w-full flex items-center justify-center gap-2 py-2 text-white/30 hover:text-white/50 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            </div>
          )}

          {/* STEP: Nueva contraseña */}
          {step === 'nueva' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Nueva contrase&ntilde;a</h2>
                <p className="text-white/40 text-sm">Cre&aacute; una nueva contrase&ntilde;a para <strong className="text-white">{nombreEncontrado}</strong></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Nueva contrase&ntilde;a</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="M\u00ednimo 6 caracteres" minLength={6}
                    className="w-full px-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Repetir contrase&ntilde;a</label>
                <input type={showPassword ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)}
                  placeholder="Repetir"
                  className="w-full px-4 py-3.5 bg-black/60 border border-dark-border rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm" />
              </div>
              {error && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">{error}</div>}
              <button onClick={cambiarPassword}
                className="w-full py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20">
                Guardar nueva contrase&ntilde;a
              </button>
            </div>
          )}

          {/* STEP: Listo */}
          {step === 'listo' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-black text-white">Contrase&ntilde;a actualizada</h2>
              <p className="text-white/40 text-sm">Ya pod&eacute;s iniciar sesi&oacute;n con tu nueva contrase&ntilde;a.</p>
              <Link to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-electric to-neon text-black font-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-electric/20">
                Ir al Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-white/15 text-xs mt-6 tracking-wider">&copy; 2026 JustFit365</p>
      </div>
    </div>
  );
}
