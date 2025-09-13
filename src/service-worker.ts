import { register } from 'workbox-window';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache dynamic assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images'
  })
);

// Cache API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10
  })
);

// Handle navigation requests for SPA
const handler = new StaleWhileRevalidate();
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

// Fallback for offline scenarios
self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    fetch(fetchEvent.request).catch(() => caches.match(fetchEvent.request).then(response => {
      return response || caches.match('/offline.html');
    }))
  );
});