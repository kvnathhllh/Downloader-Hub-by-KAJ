// Service worker minimal untuk Downloader Hub by KAJ
// Tujuannya hanya memenuhi syarat installability PWA (Chrome/Edge),
// bukan untuk caching agresif — supaya hasil ekstraksi API selalu segar.

const CACHE_NAME = "downloader-hub-shell-v3";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/style.css",
  "./assets/js/app.js",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Network-first, dan hanya untuk aset milik sendiri (dokumen, manifest, css, js).
// Request lintas-origin — API downloader, gambar CDN, font, link unduhan —
// langsung dilewatkan di baris paling atas, tidak pernah disentuh SW sama sekali.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  const isCacheableAsset =
    req.mode === "navigate" ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/manifest.json") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js");

  if (!isCacheableAsset) return;

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
