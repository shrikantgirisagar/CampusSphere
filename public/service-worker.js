/* ============================================================================
   CampusSphere Service Worker
   - Real System-Level Web Push Notifications (Web Push API / Notifications API)
   - Versioned Safe Static Asset Caching (Never caches /api)
   ============================================================================ */

const CACHE_NAME = "campussphere-static-v5";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/courses.html",
  "/about.html",
  "/students.html",
  "/admin-courses-syllabus.html",
  "/tokens.css",
  "/base.css",
  "/layout.css",
  "/components.css",
  "/dashboard.css",
  "/css/home.css",
  "/style.css",
  "/script.js",
  "/vendor/motion.js",
  "/vendor/campus3d.js",
  "/js/motion-ui.js",
  "/js/scene.js",
  "/js/motion-system.js",
  "/js/home-stats.js",
  "/icons.svg",
  "/icons/sprite.svg",
  "/textures/grain.svg",
  "/fonts/outfit-variable.woff2",
  "/fonts/inter-variable.woff2",
  "/campus-students-480.webp",
  "/campus-students-768.webp",
  "/campus-students-1200.webp",
  "/images/hero-poster.webp",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/CampusSphere-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("campussphere-static-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Safe Fetch Handler: caches only static assets, never /api or non-GET requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Strictly skip non-GET, cross-origin, and all API endpoints
  if (event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first strategy for navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match("/index.html")))
    );
    return;
  }

  // Cache-first strategy with network fallback and background refresh for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes)).catch(() => {});
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return networkRes;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (_) {
      try {
        data = { body: event.data.text() };
      } catch (__) {
        data = {};
      }
    }
  }

  const title = (data.title && typeof data.title === "string")
    ? data.title.trim().slice(0, 120)
    : "CampusSphere";

  const body = (data.body && typeof data.body === "string")
    ? data.body.trim().slice(0, 300)
    : "You have a new academic update.";

  const tag = (data.tag && typeof data.tag === "string")
    ? data.tag.trim().slice(0, 100)
    : (data.type ? `campussphere-${data.type}` : "campussphere-notification");

  // Enforce same-origin relative paths to prevent open-redirect vulnerabilities
  let targetUrl = "/";
  if (data.url && typeof data.url === "string") {
    const raw = data.url.trim();
    if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("javascript:") && !raw.includes("data:")) {
      targetUrl = raw;
    }
  }

  const options = {
    body: body,
    icon: "/CampusSphere-logo.png?v=20261027_opt",
    badge: "/CampusSphere-logo.png?v=20261027_opt",
    tag: tag,
    renotify: true,
    data: {
      url: targetUrl,
      type: data.type || "general",
      eventId: data.eventId || "",
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  let targetUrl = "/";
  if (event.notification.data && event.notification.data.url) {
    const raw = event.notification.data.url;
    if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("javascript:") && !raw.includes("data:")) {
      targetUrl = raw;
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 1. If an existing CampusSphere window is open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          if (targetUrl !== "/" && "navigate" in client) {
            return client.navigate(targetUrl).then(() => client.focus());
          }
          return client.focus();
        }
      }
      // 2. Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
