// public/js/home-stats.js
// Dynamic Registration Counts & Statistics Real-Time Synchronization

(function () {
  function syncCounts(force) {
    const base = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:3000";
    const url = base + "/api/stats/counts" + (force ? "?fresh=1" : "");
    fetch(url, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          const elS = document.getElementById("homeStudentCountVal");
          const elF = document.getElementById("homeFacultyCountVal");
          const cardS = document.getElementById("studentStatCard");
          const cardF = document.getElementById("facultyStatCard");
          if (elS && typeof data.students === "number") {
            elS.textContent = Number(data.students).toLocaleString();
            elS.classList.remove("is-loading");
            if (cardS) cardS.setAttribute("aria-label", "Registered Students: " + elS.textContent);
          }
          if (elF && typeof data.faculty === "number") {
            elF.textContent = Number(data.faculty).toLocaleString();
            elF.classList.remove("is-loading");
            if (cardF) cardF.setAttribute("aria-label", "Registered Faculty Members: " + elF.textContent);
          }
          try {
            localStorage.setItem("campussphere_stats_counts", JSON.stringify({
              students: data.students,
              faculty: data.faculty,
              time: Date.now()
            }));
          } catch (_) {}
        }
      })
      .catch(() => {});
  }

  try {
    const raw = localStorage.getItem("campussphere_stats_counts");
    if (raw) {
      const c = JSON.parse(raw);
      if (c && typeof c.students === "number") {
        const elS = document.getElementById("homeStudentCountVal");
        if (elS) elS.textContent = Number(c.students).toLocaleString();
      }
      if (c && typeof c.faculty === "number") {
        const elF = document.getElementById("homeFacultyCountVal");
        if (elF) elF.textContent = Number(c.faculty).toLocaleString();
      }
    }
  } catch (_) {}

  // Immediate background sync
  syncCounts();

  // 1. Cross-tab real-time listener: when admin creates or removes accounts in another tab
  window.addEventListener("storage", function (e) {
    if (e.key === "campussphere_stats_trigger") {
      syncCounts(true);
    }
  });

  // 2. Tab focus listener: re-verify when switching back to this tab
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) syncCounts(true);
  });
  window.addEventListener("focus", function () {
    syncCounts(true);
  });

  // 3. Periodic heartbeat poller: ensures updates from other devices appear automatically
  setInterval(function () {
    if (!document.hidden) syncCounts();
  }, 12000);

  window.CampusSphereSyncCounts = syncCounts;
})();
