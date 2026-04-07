import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertTriangle, CheckSquare, Square, FileText } from 'lucide-react';

export default function ConsentModal() {
  const { acceptConsent, logout } = useAuth();
  const [checks, setChecks] = useState({ mayor: false, aptitud: false, responsabilidad: false });

  const allChecked = checks.mayor && checks.aptitud && checks.responsabilidad;

  const toggle = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-lg shadow-2xl shadow-electric/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-electric/20 to-neon/10 border-b border-dark-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-electric/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-electric" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Consentimiento Informado</h2>
              <p className="text-white/40 text-sm">Documento legalmente vinculante</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-white/70 leading-relaxed">
                Antes de utilizar la plataforma <strong className="text-white">JustFit365</strong>, es obligatorio que lea y acepte
                los siguientes t&eacute;rminos. El uso de la plataforma implica la aceptaci&oacute;n total de estas condiciones.
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-dark-border rounded-xl p-4 text-sm text-white/60 leading-relaxed space-y-3">
            <p><strong className="text-white/80">1. Naturaleza del servicio:</strong> JustFit365 proporciona planes de entrenamiento y nutrici&oacute;n generados con asistencia de inteligencia artificial. Estos planes son de car&aacute;cter orientativo y no reemplazan el consejo m&eacute;dico profesional.</p>
            <p><strong className="text-white/80">2. Responsabilidad m&eacute;dica:</strong> El usuario declara haber consultado con un profesional de la salud antes de iniciar cualquier programa de ejercicio f&iacute;sico o plan alimenticio.</p>
            <p><strong className="text-white/80">3. Limitaci&oacute;n de responsabilidad:</strong> JustFit365 y sus socios comerciales (gimnasios adheridos) no ser&aacute;n responsables por lesiones, da&ntilde;os o perjuicios derivados del uso de la plataforma.</p>
            <p><strong className="text-white/80">4. Protecci&oacute;n de datos:</strong> Los datos personales y m&eacute;tricos ser&aacute;n tratados conforme a la Ley 25.326 de Protecci&oacute;n de Datos Personales de Argentina.</p>
            <p><strong className="text-white/80">5. Suscripci&oacute;n:</strong> Los planes de suscripci&oacute;n se renuevan autom&aacute;ticamente. El usuario puede cancelar en cualquier momento desde su perfil.</p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            {[
              { key: 'mayor' as const, label: 'Declaro ser mayor de 18 a\u00f1os de edad', icon: ShieldCheck },
              { key: 'aptitud' as const, label: 'Confirmo poseer aptitud f\u00edsica para realizar actividad deportiva, avalada por un profesional m\u00e9dico', icon: ShieldCheck },
              { key: 'responsabilidad' as const, label: 'Acepto la responsabilidad plena sobre el uso que haga de los planes y recomendaciones de la plataforma', icon: ShieldCheck },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => toggle(item.key)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                  checks[item.key]
                    ? 'bg-electric/10 border-electric/30 text-white'
                    : 'bg-black/20 border-dark-border text-white/50 hover:border-white/20'
                }`}
              >
                {checks[item.key]
                  ? <CheckSquare className="w-5 h-5 text-electric shrink-0 mt-0.5" />
                  : <Square className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                }
                <span className="text-sm leading-relaxed">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-dark-border flex gap-3">
          <button
            onClick={logout}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm font-semibold transition-all border border-dark-border"
          >
            No acepto &mdash; Salir
          </button>
          <button
            onClick={acceptConsent}
            disabled={!allChecked}
            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              allChecked
                ? 'bg-gradient-to-r from-electric to-neon text-black shadow-lg shadow-electric/20 hover:shadow-electric/40 hover:scale-[1.02]'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-dark-border'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Acepto y Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
