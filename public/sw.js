// Service Worker para JustFit365 PWA
// Bump esta version cada vez que cambies este archivo o quieras invalidar cache
const CACHE_VERSION = 'v6-rescue';
const CACHE_NAME = `justfit365-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Borrar TODOS los caches viejos de versiones anteriores
    const names = await caches.keys();
    await Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    );
    await clients.claim();
    // Notificar a las pestañas abiertas que hay version nueva
    const allClients = await clients.matchAll({ type: 'window' });
    allClients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION }));
  })());
});

self.addEventListener('fetch', (event) => {
  // Network first SIN fallback a cache para HTML y JS (siempre fresco)
  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate' || event.request.destination === 'document';
  const isJS = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isHTML || isJS) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Para imágenes y otros: network first con fallback
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
