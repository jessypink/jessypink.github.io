const CACHE_NAME = 'schedule-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/arrow-left.svg',
    '/style.css',
    '/script.js',
    '/moon.png',
    '/sun.png',
    '/manifest.json',
    '/icon.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    // Emoji images
    '/src/emoji-1.png',
    '/src/emoji-2.png',
    '/src/emoji-3.png',
    '/src/emoji-4.png',
    '/src/emoji-5.png',
    '/src/emoji-6.png',
    '/src/emoji-7.png',
    '/src/emoji-8.png',
    '/src/emoji-9.png',
    '/src/emoji-10.png',
    '/src/emoji-11.png',
    '/src/emoji-12.png',
    '/src/emoji-13.png',
    '/src/emoji-14.png',
    '/src/emoji-15.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener('install', event => {
    self.skipWaiting(); // Активируем сразу после установки
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim()); // Контролируем все вкладки
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        console.log('[SW] Received SKIP_WAITING message');
        self.skipWaiting();
    }
});


//ver 1.12
