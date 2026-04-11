import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getFraseDelDia } from '../lib/frases';

export default function FraseDelDia() {
  const [frase, setFrase] = useState('');

  useEffect(() => {
    setFrase(getFraseDelDia());
  }, []);

  const cambiarFrase = () => {
    setFrase(getFraseDelDia());
  };

  return (
    <div className="bg-gradient-to-r from-electric/10 via-purple-500/5 to-neon/10 border border-electric/20 rounded-2xl p-5 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-electric/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-neon/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-electric to-neon rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-electric/20">
          <Sparkles className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-electric/60 uppercase tracking-widest font-bold mb-1">Tu motivaci&oacute;n del d&iacute;a</p>
          <p className="text-white font-bold text-base md:text-lg leading-snug italic">"{frase}"</p>
        </div>
        <button onClick={cambiarFrase}
          className="p-2 text-white/30 hover:text-electric hover:bg-white/5 rounded-xl transition-all shrink-0"
          title="Otra frase">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
