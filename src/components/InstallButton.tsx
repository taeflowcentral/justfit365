import { useState, useEffect } from 'react';
import { Download, X, Share, Plus, Smartphone, Monitor, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface Props {
  variant?: 'sidebar' | 'cta';
  collapsed?: boolean;
}

export default function InstallButton({ variant = 'sidebar', collapsed = false }: Props) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      setShowHelp(true);
    }
  };

  // Variante CTA (Landing) - boton prominente
  if (variant === 'cta') {
    if (installed) {
      return (
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm rounded-xl">
          <Check className="w-5 h-5" /> Ya tenés JustFit365 instalada
        </div>
      );
    }
    return (
      <>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-electric/10 border border-electric/30 text-electric font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-electric/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Download className="w-4 h-4" /> Bajar la app a mi dispositivo
        </button>
        {showHelp && <InstallHelpModal onClose={() => setShowHelp(false)} />}
      </>
    );
  }

  // Variante Sidebar - boton chiquito
  if (installed) {
    return collapsed ? (
      <div className="w-full flex items-center justify-center px-3 py-2.5 text-emerald-400/60" title="App instalada">
        <Check className="w-5 h-5" />
      </div>
    ) : (
      <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-emerald-400/60">
        <Check className="w-5 h-5 shrink-0" />
        <span>App instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm text-electric/80 hover:bg-electric/10 hover:text-electric transition-all`}
        title="Instalar JustFit365 como app"
      >
        <Download className="w-5 h-5 shrink-0" />
        {!collapsed && <span>Instalar app</span>}
      </button>
      {showHelp && <InstallHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}

function InstallHelpModal({ onClose }: { onClose: () => void }) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-border rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-800 z-10">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-electric" />
            <h3 className="text-white font-black text-base">Instalar JustFit365</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-white/70">
          <p>Tené el icono de JustFit365 directo en tu pantalla de inicio o escritorio. Sin abrir el navegador.</p>

          {isIOS && (
            <div className="bg-electric/5 border border-electric/15 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-electric" />
                <h4 className="text-white font-bold">iPhone / iPad (Safari)</h4>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside">
                <li>Tocá el botón <Share className="w-4 h-4 inline mx-1 text-electric" /> <strong className="text-white">Compartir</strong> abajo en Safari.</li>
                <li>Bajá hasta <strong className="text-white">"Agregar a inicio"</strong> (con el ícono <Plus className="w-3.5 h-3.5 inline" />).</li>
                <li>Confirmá con <strong className="text-white">Agregar</strong> arriba a la derecha.</li>
              </ol>
              <p className="text-white/45 text-xs">⚠️ En iOS solo funciona desde Safari, no desde Chrome o Firefox.</p>
            </div>
          )}

          {isAndroid && (
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h4 className="text-white font-bold">Android (Chrome)</h4>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside">
                <li>Tocá el menú <strong className="text-white">⋮</strong> arriba a la derecha en Chrome.</li>
                <li>Elegí <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Agregar a pantalla principal"</strong>.</li>
                <li>Confirmá con <strong className="text-white">Instalar</strong>.</li>
              </ol>
              <p className="text-white/45 text-xs">Si tocás "Instalar app" desde el menú de JustFit365 te debería aparecer el aviso directo.</p>
            </div>
          )}

          {!isMobile && (
            <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-violet-300" />
                <h4 className="text-white font-bold">Computadora (Chrome / Edge)</h4>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside">
                <li>En la barra de direcciones, buscá el ícono <Download className="w-4 h-4 inline mx-1 text-violet-300" /> <strong className="text-white">Instalar</strong> al final de la URL.</li>
                <li>Si no aparece, abrí el menú <strong className="text-white">⋮</strong> arriba a la derecha y elegí <strong className="text-white">"Instalar JustFit365"</strong>.</li>
                <li>Confirmá con <strong className="text-white">Instalar</strong>. Vas a tener un acceso directo en tu escritorio o menú de aplicaciones.</li>
              </ol>
              <p className="text-white/45 text-xs">En Firefox no se puede instalar como app. Usá Chrome, Edge o Brave.</p>
            </div>
          )}

          <p className="text-white/50 text-xs text-center pt-2">
            Una vez instalada, JustFit365 se abre como cualquier otra app, incluso sin conexión podés ver tus datos guardados.
          </p>
        </div>
      </div>
    </div>
  );
}
