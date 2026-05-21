import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase'

// Ping a Supabase para evitar que el proyecto se pause por inactividad
supabase.from('usuarios').select('id', { count: 'exact', head: true }).then(() => {});

// Registrar Service Worker para PWA (instalar en pantalla de inicio)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Forzar update check al cargar (no esperar 24hs por default)
    reg.update().catch(() => {});
  }).catch(() => {});

  // Cuando el SW dispara mensaje de actualizacion, recargar para tomar el codigo nuevo
  let reloaded = false;
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED' && !reloaded) {
      reloaded = true;
      // Pequeno delay para que termine de aplicar
      setTimeout(() => window.location.reload(), 100);
    }
  });

  // Tambien recargar cuando cambia el SW controller (nuevo SW tomo control)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloaded) {
      reloaded = true;
      window.location.reload();
    }
  });
}

// Cleanup defensivo: borrar entradas viejas de hidratacion de dias pasados.
// Esto evita que se vean valores fantasmas si por alguna razon el storage
// quedo con keys de fechas anteriores (por ej. bug de fecha UTC vs local).
(() => {
  try {
    const d = new Date();
    const hoyLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      // matches hidratacion_YYYY-MM-DD__DNI o sin DNI
      const m = k.match(/^hidratacion_(\d{4}-\d{2}-\d{2})/);
      if (m && m[1] !== hoyLocal) keysToDelete.push(k);
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
