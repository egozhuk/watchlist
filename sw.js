// Указываем версию кеша
const cacheName = 'my-pwa-cache-v1';

// В этот массив добавляем файлы, которые хотим кешировать
const filesToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Установка Service Worker и кеширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

// Активация Service Worker и удаление старых кешей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Обработка сетевых запросов и загрузка из кеша при отсутствии интернета
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});