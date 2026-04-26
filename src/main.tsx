import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase'

// Ping a Supabase para evitar que el proyecto se pause por inactividad
supabase.from('usuarios').select('id', { count: 'exact', head: true }).then(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
