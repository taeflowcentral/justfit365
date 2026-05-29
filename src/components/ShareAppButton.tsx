import { useState } from 'react';
import { Share2, MessageCircle, Send, Copy, X, Check } from 'lucide-react';
import { usePromoActiva } from '../lib/appConfig';

interface Props { compact?: boolean }
export default function ShareAppButton({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const promo = usePromoActiva();

  const url = typeof window !== 'undefined' ? `${window.location.origin}/landing` : 'https://justfit365.com/landing';
  const promoTexto = promo.activa && promo.until
    ? ` 🎁 Hasta el ${promo.until.toLocaleDateString('es-AR')} es GRATIS.`
    : '';
  const mensaje = `Mirá esta app que estoy usando: JustFit365. Plan nutricional personalizado, rutinas, coach virtual 24/7 y comunidad para encontrar gente para entrenar.${promoTexto} ${url}`;

  const handleShare = async () => {
    // Si el dispositivo soporta share nativo, usarlo directo
    if (navigator.share) {
      try {
        await navigator.share({ title: 'JustFit365', text: mensaje, url });
        return;
      } catch {
        // Si el usuario cancelo, no hacer nada. Si fallo, abrir el menu.
      }
    }
    setOpen(true);
  };

  const copiar = () => {
    navigator.clipboard.writeText(mensaje);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {compact ? (
        <button onClick={handleShare}
          title="Compartir JustFit365"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-dark-border rounded-lg text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Share2 className="w-4 h-4" /> Compartir JustFit365
        </button>
      )}

      {/* Modal fallback para desktop o si navigator.share falla */}
      {open && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-black text-base">Compartir JustFit365</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="bg-black/40 border border-dark-border rounded-xl p-3 mb-4 text-white/75 text-sm leading-relaxed whitespace-pre-line">
              {mensaje}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black transition-colors">
                <MessageCircle className="w-4 h-4" /> Compartir por WhatsApp
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(mensaje)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-bold transition-colors">
                <Send className="w-4 h-4" /> Compartir por Telegram
              </a>
              <a href={`mailto:?subject=${encodeURIComponent('Conocé JustFit365')}&body=${encodeURIComponent(mensaje)}`}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-dark-border text-white/70 rounded-xl text-sm font-semibold transition-colors">
                ✉️ Mandar por Email
              </a>
              <button onClick={copiar}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 border border-dark-border text-white/70'}`}>
                {copied ? <><Check className="w-4 h-4" /> Copiado al portapapeles</> : <><Copy className="w-4 h-4" /> Copiar mensaje + link</>}
              </button>
            </div>

            {promo.activa && promo.until && (
              <p className="text-emerald-400/70 text-[11px] text-center mt-3">
                🎁 Aprovechá: la promo FREE incluye este link hasta el {promo.until.toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
