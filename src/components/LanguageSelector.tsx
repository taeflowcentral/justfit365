import { useState } from 'react';
import { Globe } from 'lucide-react';

const idiomas = [
  { code: 'es', label: 'Espanol', flag: '🇦🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Portugues', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

function setLanguage(lang: string) {
  // Trigger Google Translate
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
  }
}

function getCurrentLang(): string {
  try {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('googtrans='));
    if (cookie) {
      const val = cookie.split('=')[1];
      return val.split('/').pop() || 'es';
    }
  } catch { /* ignore */ }
  return 'es';
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const current = getCurrentLang();
  const currentIdioma = idiomas.find(i => i.code === current) || idiomas[0];

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-dark-border rounded-lg text-white/50 text-xs hover:text-white hover:bg-white/10 transition-all">
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentIdioma.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-dark-800 border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden w-44">
            {idiomas.map(lang => (
              <button key={lang.code} onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all ${
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
