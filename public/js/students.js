// public/js/students.js
// CampusSphere Students Page Script

// Optional redirect to anchor
try {
  window.location.replace("index.html#students-faculty-count");
} catch (_) {}

document.addEventListener("DOMContentLoaded", () => {
  // Set dynamic current year in footer
  const yearEl = document.getElementById("studentsCurrentYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Navigation Menu Toggle on Mobile
  const menuToggle = document.getElementById("studentsMenuToggle");
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

  // Prevent default on placeholder footer links
  document.querySelectorAll("[data-footer-placeholder]").forEach(link => {
    link.addEventListener("click", e => e.preventDefault());
  });

  loadStudentCount();
});

// Fetch and display real student count from backend MongoDB
let isFetching = false;
async function loadStudentCount() {
  if (isFetching) return;
  isFetching = true;

  const countEl = document.getElementById("studentCountVal");
  const cardEl = document.getElementById("studentStatCard");

  try {
    const response = await fetch("/api/students/count", { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data && data.success && typeof data.count === "number") {
      const formatted = Number(data.count).toLocaleString();
      if (countEl) {
        countEl.textContent = formatted;
        countEl.classList.remove("is-loading");
      }
      if (cardEl) cardEl.setAttribute("aria-label", "Total registered students: " + formatted);
    } else {
      if (countEl) {
        countEl.textContent = "—";
        countEl.classList.remove("is-loading");
      }
      if (cardEl) cardEl.setAttribute("aria-label", "Total registered students: unavailable");
    }
  } catch (err) {
    if (countEl) {
      countEl.textContent = "—";
      countEl.classList.remove("is-loading");
    }
    if (cardEl) cardEl.setAttribute("aria-label", "Total registered students: unavailable");
  } finally {
    isFetching = false;
  }
}
