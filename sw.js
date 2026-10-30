self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});   // requerido por Chrome para que la app sea instalable

// Aviso push enviado desde un servidor (para uso futuro)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(self.registration.showNotification(data.title || "NeoVita VitalSync 🩺", {
        body: data.body || "🔔 ¡Es hora de tomar tu medicamento!",
        icon: "icon-192.png", badge: "icon-192.png",
        vibrate: [500, 200, 500, 200, 1000],
        tag: data.tag || 'neovita-alarm', renotify: true, requireInteraction: true,
        data: data.data || {},
        actions: [{ action: 'tomado', title: '✔ Tomar' }, { action: 'saltado', title: '❌ Saltar' }]
    }));
});

// Toque en la notificación o en sus botones Tomar / Saltar
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
