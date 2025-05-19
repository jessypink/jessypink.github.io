const CACHE_NAME = 'schedule-cache-v1.15';
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

// Установка и кэширование файлов
self.addEventListener('install', (event) => {
    console.log('[SW] Установка');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // Мгновенная активация
});

// Активация: удаляем старые кэши
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Удаление старого кэша:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    return self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Получение сообщений от страницы
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        console.log('[SW] Получена команда SKIP_WAITING');
        self.skipWaiting();
    }
});
