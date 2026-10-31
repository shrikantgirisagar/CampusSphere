// public/js/home-stats.js
// Dynamic Registration Counts & Statistics Real-Time Synchronization
// Configurable minimum threshold: default 25
const STATS_MIN_THRESHOLD = 25;

(function () {
  function renderStats(students, faculty) {
    const elS = document.getElementById("homeStudentCountVal");
    const elF = document.getElementById("homeFacultyCountVal");
    const cardS = document.getElementById("studentStatCard");
    const cardF = document.getElementById("facultyStatCard");
    const grid = document.getElementById("statsCountGrid");
    const neutral = document.getElementById("statsNeutralStrip");
    const title = document.getElementById("statsCountTitle");
    const subtitle = document.getElementById("statsCountSubtitle");

    const sNum = typeof students === "number" ? students : parseInt(students, 10) || 0;
    const fNum = typeof faculty === "number" ? faculty : parseInt(faculty, 10) || 0;

    const threshold = typeof window.STATS_MIN_THRESHOLD === "number" ? window.STATS_MIN_THRESHOLD : STATS_MIN_THRESHOLD;
    const hasEnough = sNum >= threshold && fNum >= threshold;

    if (elS && typeof students === "number") {
      elS.textContent = Number(students).toLocaleString();
      elS.classList.remove("is-loading");
      if (cardS) cardS.setAttribute("aria-label", "Registered Students: " + elS.textContent);
    }
    if (elF && typeof faculty === "number") {
      elF.textContent = Number(faculty).toLocaleString();
      elF.classList.remove("is-loading");
      if (cardF) cardF.setAttribute("aria-label", "Registered Faculty Members: " + elF.textContent);
    }

    if (grid && neutral) {
      if (hasEnough) {
        grid.style.display = "";
        neutral.style.display = "none";
        if (title) title.textContent = "Our Students & Faculty Count";
        if (subtitle) subtitle.textContent = "Real-time strength of registered students and department faculty members.";
      } else {
        grid.style.display = "none";
        neutral.style.display = "grid";
        if (title) title.textContent = "Academic Community";
        if (subtitle) subtitle.textContent = "A unified collegiate operating platform for students, faculty, and administration.";
      }
    }
  }

  function syncCounts(force) {
    const base = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:3000";
    const url = base + "/api/stats/counts" + (force ? "?fresh=1" : "");
    fetch(url, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          renderStats(data.students, data.faculty);
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
      if (c && typeof c.students === "number" && typeof c.faculty === "number") {
        renderStats(c.students, c.faculty);
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
  window.STATS_MIN_THRESHOLD = STATS_MIN_THRESHOLD;
})();
