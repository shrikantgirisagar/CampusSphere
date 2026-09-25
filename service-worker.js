/* ============================================================================
   CampusSphere Service Worker
   Real System-Level Web Push Notifications (Web Push API / Notifications API)
   Works in background, minimized, locked screen, and when tab/PWA is closed.
   ============================================================================ */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
    icon: "/CampusSphere-logo.png?v=20260915_hq1",
    badge: "/CampusSphere-logo.png?v=20260915_hq1",
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
