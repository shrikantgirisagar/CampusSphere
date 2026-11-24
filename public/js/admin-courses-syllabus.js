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

  // Navigation Menu Toggle on Mobile
  const menuToggle = document.getElementById("adminMenuToggle") || document.querySelector(".public-menu-toggle");
  const nav = document.querySelector(".public-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });
    nav.querySelectorAll(".public-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }

  // Initialize Syllabus Page
  if (typeof initSyllabusPage === "function") {
    initSyllabusPage();
  }
  if (typeof openSyllabusUploadModal === "function") {
    window.openSyllabusUploadModal = openSyllabusUploadModal;
  }
});
