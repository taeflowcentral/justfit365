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
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid;
  // En iOS, solo Safari permite Agregar a inicio. Chrome iOS = "CriOS", Firefox iOS = "FxiOS"
  const isIOSChrome = isIOS && /CriOS/.test(ua);
  const isIOSFirefox = isIOS && /FxiOS/.test(ua);
  const isIOSOtherBrowser = isIOS && (isIOSChrome || isIOSFirefox);

  const copiarURL = () => {
    navigator.clipboard.writeText(window.location.origin).then(() => {
      alert('URL copiada. Ahora abrila en Safari.');
    });
  };

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

        <div className="p-5 space-y-4 text-sm text-white/75">
          {isIOSOtherBrowser && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h4 className="text-white font-black text-base">Estás en {isIOSChrome ? 'Chrome' : 'Firefox'}</h4>
              </div>
              <p className="text-white text-sm">
                En iPhone, el "Agregar a inicio" solo funciona desde <strong className="text-amber-400">Safari</strong>. Apple bloquea esta función en otros navegadores.
              </p>
              <div className="bg-black/40 rounded-xl p-3 space-y-2">
                <p className="text-white/80 text-sm font-bold">¿Qué hago ahora?</p>
                <ol className="space-y-1.5 list-decimal list-inside text-sm">
                  <li>Copiá esta URL → tocá el botón abajo</li>
                  <li>Abrí <strong className="text-amber-400">Safari</strong> en tu iPhone</li>
                  <li>Pegá la URL en la barra de direcciones</li>
                  <li>Volvé a tocar "Bajar la app"</li>
                </ol>
              </div>
              <button onClick={copiarURL}
                className="w-full py-3 bg-amber-500 text-black rounded-xl text-sm font-black uppercase tracking-wider hover:bg-amber-400">
                Copiar URL para Safari
              </button>
            </div>
          )}

          {isIOS && !isIOSOtherBrowser && (
            <div className="bg-electric/5 border-2 border-electric/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-electric" />
                <h4 className="text-white font-black text-base">Cómo instalar en iPhone</h4>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-amber-400 text-xs font-bold mb-1">⚠️ ¿Por qué no hay botón automático?</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  Apple no deja que las webs instalen apps con un botón en iPhone. Solo se puede hacer manualmente desde el menú de Safari. Es así para todas las webs (Twitter/X, Instagram, etc.), no es algo que podamos cambiar.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-electric text-black rounded-full flex items-center justify-center font-black text-base shrink-0">1</div>
                  <div className="flex-1 pt-1">
                    <p className="text-white text-sm font-bold mb-1">Tocá el botón <span className="inline-flex items-center justify-center w-7 h-7 bg-electric/20 border border-electric/40 rounded-md mx-1 align-middle"><Share className="w-4 h-4 text-electric" /></span> Compartir</p>
                    <p className="text-white/60 text-xs">Está <strong className="text-white">en la barra de abajo de Safari</strong> (centro). Si no ves la barra, deslizá un poquito para abajo en la página.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-electric text-black rounded-full flex items-center justify-center font-black text-base shrink-0">2</div>
                  <div className="flex-1 pt-1">
                    <p className="text-white text-sm font-bold mb-1">Deslizá y buscá <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-electric/15 border border-electric/30 rounded-md mx-1 align-middle text-electric text-xs font-bold"><Plus className="w-3 h-3" />Agregar a inicio</span></p>
                    <p className="text-white/60 text-xs">Está en la lista de opciones, hacia abajo. Tocalo.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-electric text-black rounded-full flex items-center justify-center font-black text-base shrink-0">3</div>
                  <div className="flex-1 pt-1">
                    <p className="text-white text-sm font-bold mb-1">Tocá <span className="inline-flex items-center px-2 py-0.5 bg-electric text-black rounded-md mx-1 align-middle text-xs font-black">Agregar</span> arriba a la derecha</p>
                    <p className="text-white/60 text-xs">El icono de JustFit365 aparece en tu pantalla de inicio como cualquier otra app.</p>
                  </div>
                </div>
              </div>

              <p className="text-white/45 text-xs text-center italic pt-1">
                Tip: tenés que estar en <strong className="text-white/70">Safari</strong> (no Chrome ni Firefox) y la página tiene que estar <strong className="text-white/70">cargada</strong>.
              </p>
            </div>
          )}

          {isAndroid && (
            <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <h4 className="text-white font-black text-base">Android (Chrome)</h4>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside">
                <li>Tocá el menú <strong className="text-white">⋮</strong> arriba a la derecha en Chrome.</li>
                <li>Elegí <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Agregar a pantalla principal"</strong>.</li>
                <li>Confirmá con <strong className="text-white">Instalar</strong>.</li>
              </ol>
              <p className="text-white/45 text-xs">Si tocás "Bajar la app" desde el menú de JustFit365 te aparece el aviso directo de Chrome.</p>
            </div>
          )}

          {!isMobile && (
            <div className="bg-violet-500/5 border-2 border-violet-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-violet-300" />
                <h4 className="text-white font-black text-base">Computadora (Chrome / Edge)</h4>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside">
                <li>En la barra de direcciones, buscá el ícono <Download className="w-4 h-4 inline mx-1 text-violet-300" /> <strong className="text-white">Instalar</strong> al final de la URL.</li>
                <li>Si no aparece, abrí el menú <strong className="text-white">⋮</strong> y elegí <strong className="text-white">"Instalar JustFit365"</strong>.</li>
                <li>Confirmá con <strong className="text-white">Instalar</strong>. Tenés acceso directo en escritorio o menú de apps.</li>
              </ol>
              <p className="text-white/45 text-xs">En Firefox no se puede instalar como app. Usá Chrome, Edge o Brave.</p>
            </div>
          )}

          <p className="text-white/50 text-xs text-center pt-2">
            Una vez instalada, JustFit365 se abre como cualquier app nativa.
          </p>
        </div>
      </div>
    </div>
  );
}
