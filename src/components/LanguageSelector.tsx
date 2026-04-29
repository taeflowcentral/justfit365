import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const idiomas = [
  { code: 'es', label: 'Espanol', flag: '\ud83c\udde6\ud83c\uddf7' },
  { code: 'en', label: 'English', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { code: 'pt', label: 'Portugues', flag: '\ud83c\udde7\ud83c\uddf7' },
  { code: 'de', label: 'Deutsch', flag: '\ud83c\udde9\ud83c\uddea' },
  { code: 'ko', label: '\ud55c\uad6d\uc5b4', flag: '\ud83c\uddf0\ud83c\uddf7' },
  { code: 'ru', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', flag: '\ud83c\uddf7\ud83c\uddfa' },
  { code: 'fr', label: 'Francais', flag: '\ud83c\uddeb\ud83c\uddf7' },
  { code: 'it', label: 'Italiano', flag: '\ud83c\uddee\ud83c\uddf9' },
];

// Cargar Google Translate una sola vez
let gtLoaded = false;
function loadGoogleTranslate() {
  if (gtLoaded) return;
  gtLoaded = true;

  // Crear el div contenedor
  let el = document.getElementById('google_translate_element');
  if (!el) {
    el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.display = 'none';
    document.body.appendChild(el);
  }

  // Definir callback
  (window as unknown as Record<string, unknown>).googleTranslateElementInit = () => {
    const g = (window as unknown as Record<string, { TranslateElement: new (config: Record<string, unknown>, id: string) => void }>).google;
    if (g?.translate?.TranslateElement) {
      new g.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: 'es,en,pt,de,ko,ru,fr,it',
        autoDisplay: false,
      }, 'google_translate_element');
    }
  };

  // Cargar script
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(script);
}

function setLanguage(lang: string) {
  // Metodo 1: usar el combo de Google Translate
  const tryCombo = () => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  };

  if (tryCombo()) return;

  // Metodo 2: cookie + reload si el combo no esta listo
  document.cookie = `googtrans=/es/${lang};path=/;`;
  document.cookie = `googtrans=/es/${lang};path=/;domain=${window.location.hostname}`;

  // Intentar de nuevo despues de un momento
  setTimeout(() => {
    if (!tryCombo()) {
      // Si sigue sin funcionar, recargar la pagina
      window.location.reload();
    }
  }, 500);
}

function getCurrentLang(): string {
  // Leer de cookie
  try {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const trimmed = c.trim();
      if (trimmed.startsWith('googtrans=')) {
        const val = trimmed.split('=')[1];
        const lang = val.split('/').filter(Boolean).pop();
        if (lang && lang !== 'es') return lang;
      }
    }
  } catch { /* ignore */ }
  return 'es';
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(getCurrentLang);

  useEffect(() => {
    loadGoogleTranslate();
  }, []);

  const currentIdioma = idiomas.find(i => i.code === current) || idiomas[0];

  const handleSelect = (code: string) => {
    if (code === 'es') {
      // Volver a espanol: limpiar cookies y recargar
      document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = `googtrans=;path=/;domain=${window.location.hostname};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      window.location.reload();
      return;
    }
    setCurrent(code);
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative notranslate">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-dark-border rounded-lg text-white/50 text-xs hover:text-white hover:bg-white/10 transition-all">
        <Globe className="w-3.5 h-3.5" />
        <span>{currentIdioma.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-dark-800 border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden w-44">
            {idiomas.map(lang => (
              <button key={lang.code} onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all notranslate ${
                  current === lang.code ? 'bg-lime/10 text-lime' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}>
                <span className="text-base">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
