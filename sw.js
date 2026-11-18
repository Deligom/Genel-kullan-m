/* Fiş Dikte service worker — arayüzü çevrimdışı açar.
 * Sayfa: önce ağ (güncellemeler hemen gelsin), yoksa önbellek.
 * Diğer dosyalar: önbellekten ver, arkada tazele.
 * Sürüm değişince CACHE adını artır. */
const CACHE = 'fis-dikte-v1.0.0';
const ASSETS = ['./', 'index.html', 'tr-sayi.js', 'manifest.json',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html', { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
