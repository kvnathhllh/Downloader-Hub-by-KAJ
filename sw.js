// Service worker minimal untuk Downloader Hub by KAJ
// Tujuannya hanya memenuhi syarat installability PWA (Chrome/Edge),
// bukan untuk caching agresif — supaya hasil ekstraksi API selalu segar.

const CACHE_NAME = "downloader-hub-shell-v1";
const SHELL_FILES = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first, hanya untuk dokumen milik sendiri (index.html/manifest).
// Semua request lain — API downloader, gambar CDN, font, link unduhan —
// sengaja dibiarkan lewat tanpa disentuh SW sama sekali.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isOwnOrigin = url.origin === self.location.origin;
  const isShellDoc =
    isOwnOrigin &&
    (req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/manifest.json"));

  if (!isShellDoc) return;

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
