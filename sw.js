// Keeps the page itself on the phone, so Dog Cam opens even when its host can't be reached (the stream never goes
// through here: only this site's own files do).
// (13 Oct 2026: Maxis' DNS refuses *.github.io, so the phone opens the copy on nightmew-dogcam.pages.dev. Each file
// is saved by itself and none is required, so the page installs wherever it is hosted.)
// (15 Oct 2026: the newest page first, the saved copy only if the site doesn't answer in 4 s. Saved-copy-first kept
// the old player on the phone after the WebRTC change, and it sat on "Waking the camera" for minutes.)
const CACHE = 'dogcam-6';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(['index.html', './'].map((u) => fetch(u, { cache: 'no-store' }).then((r) => (r.ok && !r.redirected ? c.put(u, r) : null)).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(new URL('./', location.href).pathname)) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const fresh = fetch(e.request, { cache: 'no-store' }).then((r) => { if (r.ok && !r.redirected) c.put(e.request, r.clone()); return r; });
    const late = new Promise((r) => setTimeout(r, 4000));
    const got = await Promise.race([fresh.catch(() => null), late]);
    if (got) return got;
    const had = await c.match(e.request, { ignoreSearch: true });
    return had || fresh;
  }));
});
