/**
 * Darbar Flavors Spices - Service Worker for PWA
 */

const CACHE_NAME = 'darbar-spices-v16';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './shop.html',
  './product-detail.html',
  './deals.html',
  './recipes.html',
  './about.html',
  './contact.html',
  './cart.html',
  './checkout.html',
  './order-success.html',
  './track-order.html',
  './admin.html',
  './manifest.json',
  './assets/images/hero-banner.jpg',
  './assets/css/style.css',
  './assets/css/responsive.css',
  './assets/css/toast.css',
  './assets/css/theme-switcher.css',
  './assets/css/theme-presets.css',
  './assets/js/theme-switcher.js',
  './assets/js/products-data.js',
  './assets/js/app.js',
  './assets/js/shop.js',
  './assets/js/product-detail.js',
  './assets/js/cart.js',
  './assets/js/checkout.js',
  './assets/js/admin.js',
  './assets/images/logo.png',
  './assets/images/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Let video requests stream natively without service worker range buffering
  if (event.request.url.includes('.mp4') || event.request.headers.has('range')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Fallback
        return caches.match('./index.html');
      });
    })
  );
});
