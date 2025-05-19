const CACHE_NAME = 'schedule-cache-v2.2'; // Увеличивай версию при изменениях
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

// Установка: кэшируем начальные файлы
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Логика обработки запросов
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = req.url;

    // Network-first для CSS и JS
    if (url.endsWith('.css') || url.endsWith('.js')) {
        event.respondWith(
            fetch(req)
                .then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(req, response.clone());
                        return response;
                    });
                })
                .catch(() => caches.match(req))
        );
    } else {
        // Cache-first для остального
        event.respondWith(
            caches.match(req).then(response => response || fetch(req))
        );
    }
});

// Принудительная активация
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        console.log('[SW] SKIP_WAITING получен');
        self.skipWaiting();
    }
});
