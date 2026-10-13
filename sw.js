// Keeps the page itself on the phone, so Dog Cam opens even when github.io can't be reached (the stream never goes
// through here: only this site's own files do). The saved copy is shown at once and refreshed behind it.
const CACHE = 'dogcam-1';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'icon.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const had = await c.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; });
    if (had) { fresh.catch(() => {}); return had; }
    return fresh;
  }));
});
