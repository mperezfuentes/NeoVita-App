self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// Red primero (siempre lo último de GitHub/Vercel); si no hay internet, se usa la copia guardada.
const CACHE = 'neovita-cache';
const HOSTS_OK = ['cdn.tailwindcss.com', 'unpkg.com'];   // librerías de la app, para que abra también sin internet
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    const propio = url.origin === self.location.origin;
    if (!propio && !HOSTS_OK.includes(url.hostname)) return;
    const guardar = res => { if (res && (res.ok || res.type === 'opaque')) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {}); } return res; };
    if (!propio) {   // librerías externas: primero la copia guardada (carga instantánea) y se actualiza en segundo plano
        event.respondWith(caches.match(req).then(hit => { const red = fetch(req).then(guardar).catch(() => hit); return hit || red; }));
        return;
    }
    // archivos propios: red primero (siempre lo último de GitHub/Vercel); sin internet, la copia guardada
    event.respondWith(fetch(req).then(guardar).catch(() => caches.match(req).then(r => r || caches.match('./') || caches.match('/'))));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const action = event.action;
    const d = event.notification.data || {};
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            if (list.length > 0) {
                const c = list[0];
                if (action && d.medId != null) c.postMessage({ type: 'NOTIF_ACTION', action, medId: d.medId, profileId: d.profileId });
                return c.focus();
            }
            const qs = (action && d.medId != null)
                ? `?accion=${action}&med=${encodeURIComponent(d.medId)}&perfil=${encodeURIComponent(d.profileId || 'principal')}` : '';
            return self.clients.openWindow('./' + qs);
        })
    );
});
