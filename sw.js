// Service worker tối giản: lưu sẵn khung trang và biểu tượng để mở nhanh, cho phép cài đặt như ứng dụng.
// Dữ liệu không lưu ở đây: phần mềm luôn tải trực tiếp từ Google khi mở.
const CACHE = 'kiatang-v1';
const SHELL = ['/', '/index.html', '/cai-dat.html', '/manifest.webmanifest', '/icon-180.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Trang của mình: lấy bản mới qua mạng trước, mất mạng thì dùng bản đã lưu.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});
