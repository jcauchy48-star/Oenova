const cacheName = "cave-a-vin-v25";
const cachedFiles = [
  "./",
  "./index.html",
  "./styles.css",
  "./cloud-config-loader.js",
  "./cloud-config.js",
  "./cloud-config.example.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(cachedFiles))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const networkFirstPaths = new Set([
    "/",
    "/index.html",
    "/app.js",
    "/styles.css",
    "/cloud-config.js",
    "/cloud-config-loader.js",
    "/service-worker.js"
  ]);
  const shouldUseNetworkFirst = requestUrl.origin === self.location.origin
    && (event.request.mode === "navigate" || networkFirstPaths.has(requestUrl.pathname));

  event.respondWith(
    (shouldUseNetworkFirst
      ? fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(cacheName).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
      : caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(cacheName).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match("./index.html"));
      }))
  );
});
