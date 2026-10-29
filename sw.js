self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "NeoVita VitalSync 🩺";
    const options = {
        body: data.body || "🔔 ¡Es hora de tomar tu medicamento!",
        icon: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
        vibrate: [500, 200, 500, 200, 1000],
        tag: 'neovita-alarm',
        requireInteraction: true,
        actions: [
            { action: 'tomado', title: '✔ Tomar' },
            { action: 'saltado', title: '❌ Saltar' }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                let client = clientList[0];
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});