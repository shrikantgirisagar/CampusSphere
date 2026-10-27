// public/js/admin-courses-syllabus.js
// CampusSphere Administrator Courses & Syllabus Script

document.addEventListener("DOMContentLoaded", () => {
  // Set Year
  const yearEl = document.getElementById("adminSyllabusCurrentYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const token = typeof getStoredAuthToken === "function" ? getStoredAuthToken() : (sessionStorage.getItem("portalAuthToken") || "");
  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("portalUser") || "null");
  } catch (_) {}

  const authGate = document.getElementById("adminAuthGate");
  const appWrap = document.getElementById("adminSyllabusApp");

  if (!token || !user || user.role !== "admin") {
    if (authGate) authGate.style.display = "block";
    if (appWrap) appWrap.style.display = "none";
    return;
  }

  if (authGate) authGate.style.display = "none";
  if (appWrap) appWrap.style.display = "block";

  // Initialize Syllabus Page
  if (typeof initSyllabusPage === "function") {
    initSyllabusPage();
  }
  if (typeof openSyllabusUploadModal === "function") {
    window.openSyllabusUploadModal = openSyllabusUploadModal;
  }
});
