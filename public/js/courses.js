// public/js/courses.js
// CampusSphere Courses & Syllabus Client Script

document.addEventListener("DOMContentLoaded", () => {
  // Set Year
  const yearEl = document.getElementById("coursesCurrentYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const token = sessionStorage.getItem("portalAuthToken") || "";
  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("portalUser") || "null");
  } catch (_) {}

  // Contextual Admin/Faculty/Student Portal Ribbon
  const adminBanner = document.getElementById("coursesAdminBanner");
  const adminName = document.getElementById("coursesAdminName");
  const manageLink = document.getElementById("coursesManageLink");

  if (token && user) {
    if (adminBanner) adminBanner.style.display = "block";
    if (adminName) adminName.textContent = user.name || user.username || "User";

    if (user.role === "admin") {
      if (manageLink) {
        manageLink.textContent = "⚙️ Open Syllabus Management Studio";
        manageLink.href = "admin-courses-syllabus.html";
        manageLink.style.display = "inline-flex";
      }
    } else {
      if (manageLink) {
        manageLink.textContent = "← Return to CampusSphere Portal";
        manageLink.href = "index.html#portal";
        manageLink.style.display = "inline-flex";
      }
    }
  }

  // Toast Notification System
  const toast = document.getElementById("coursesToast");
  const toastMsg = document.getElementById("coursesToastMsg");
  let toastTimer = null;

  function showCoursesToast(message, isHtml = false, duration = 3500) {
    if (!toast || !toastMsg) return;
    clearTimeout(toastTimer);
    if (isHtml) {
      toastMsg.innerHTML = message;
    } else {
      toastMsg.textContent = message;
    }
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, duration);
  }

  // Query syllabus availability from server
  if (token) {
    fetch("/api/syllabus", {
      headers: { "Authorization": "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && Array.isArray(data.syllabi)) {
        data.syllabi.forEach(item => {
          const yr = item.yearLevel;
          const statusEl = document.getElementById("coursesStatusYear" + yr);
          const btn = document.getElementById("coursesBtnYear" + yr);
          if (statusEl && btn) {
            if (item.isUploaded) {
              statusEl.textContent = "✓ Available (" + (item.formattedSize || "PDF") + ")";
              statusEl.className = "courses-sem-status";
              btn.disabled = false;
            } else {
              statusEl.textContent = "⏳ Pending Upload";
              statusEl.className = "courses-sem-status pending";
              btn.disabled = true;
              btn.title = "Syllabus not yet published by department";
            }
          }
        });
      }
    })
    .catch(() => {});
  }

  async function handleCoursesPageDownload(yearLevel, title) {
    const currentToken = sessionStorage.getItem("portalAuthToken") || "";
    if (!currentToken) {
      showCoursesToast('<span>Please <a href="index.html#login" style="color:#60a5fa; text-decoration:underline; font-weight:700;">Login</a> to download official syllabus PDFs.</span>', true, 4500);
      return;
    }

    showCoursesToast("Downloading " + title + " Syllabus PDF...", false, 3500);

    try {
      const res = await fetch("/api/syllabus/" + yearLevel + "/download", {
        headers: {
          "Authorization": "Bearer " + currentToken
        }
      });

      if (!res.ok) {
        let errorMsg = "Failed to download syllabus.";
        if (res.status === 401) {
          errorMsg = "Your session has expired. Please log in again.";
          sessionStorage.removeItem("portalAuthToken");
          sessionStorage.removeItem("portalUser");
        } else {
          try {
            const errData = await res.json();
            if (errData && errData.message) errorMsg = errData.message;
          } catch (_) {}
        }
        showCoursesToast(errorMsg, false, 4000);
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "BCA_Year_" + yearLevel + "_Syllabus.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        try { URL.revokeObjectURL(objectUrl); } catch (_) {}
      }, 1000);
    } catch (fetchErr) {
      showCoursesToast(fetchErr.message || "Network error downloading syllabus.", false, 4000);
    }
  }

  // Delegated click handler for syllabus download buttons
  document.querySelectorAll("[data-action='download-courses-syllabus'], #coursesBtnYear1, #coursesBtnYear2, #coursesBtnYear3").forEach(btn => {
    btn.addEventListener("click", () => {
      let yr = btn.getAttribute("data-year");
      if (!yr) {
        if (btn.id === "coursesBtnYear1") yr = 1;
        else if (btn.id === "coursesBtnYear2") yr = 2;
        else if (btn.id === "coursesBtnYear3") yr = 3;
      }
      const title = btn.getAttribute("data-label") || ("Year " + yr + " BCA");
      handleCoursesPageDownload(Number(yr), title);
    });
  });

  window.handleCoursesPageDownload = handleCoursesPageDownload;
});
