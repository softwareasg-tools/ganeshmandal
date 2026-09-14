/**
 * Service Worker for Anonymous Golden Darshan Window Alerts
 * GaneshMandal.in Devotee Intelligence
 */

const CACHE_NAME = 'ganeshmandal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '🚩 सुवर्ण दर्शन संधी!', body: event.data ? event.data.text() : 'कमी गर्दीची वेळ सुरू झाली आहे.' };
  }

  const title = data.title || '🚩 सुवर्ण दर्शन संधी! (Golden Darshan Window)';
  const options = {
    body: data.body || 'प्रमुख गणेश मंडळांमध्ये गर्दी कमी झाली आहे. थेट दर्शन रांग तपासा.',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: data.url || 'https://ganeshmandal.in?src=push'
    },
    actions: [
      { action: 'open', title: '👁️ थेट रांग पहा (Check Queue)' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
