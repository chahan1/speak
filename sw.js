// 道地口說轉譯器 - Service Worker（讓 App 可安裝、可離線開啟）
// 更新 index.html 後，把下面的版本號改掉，手機下次開啟就會拿到新版
const CACHE_NAME = 'speak-v1.5';
const APP_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './maskable-192.png', './maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.all(APP_FILES.map(f => cache.add(f).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('speak-') && k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // AI 服務不快取
  // 網頁本體：先上網拿新版，沒網路才用快取
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE_NAME).then(x => x.put(req, c)); return res; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
