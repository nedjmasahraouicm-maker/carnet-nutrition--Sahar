// Service worker minimaliste : cache du shell, network-first ailleurs.
const CACHE = 'carnet-shell-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Ne JAMAIS cacher les appels API Supabase
  if (url.hostname.endsWith('supabase.co')) return;

  // Shell : cache-first
  if (req.mode === 'navigate' || SHELL.includes(url.pathname)) {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match('/index.html')))
    );
    return;
  }
  // Reste : network-first, fallback cache
  e.respondWith(fetch(req).then(resp => {
    if (resp.ok && (url.origin === location.origin || req.destination === 'font' || req.destination === 'style')) {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return resp;
  }).catch(() => caches.match(req)));
});
