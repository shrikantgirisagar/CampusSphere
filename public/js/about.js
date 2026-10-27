// public/js/about.js
// CampusSphere About Page Client Script

document.addEventListener("DOMContentLoaded", () => {
  // Set dynamic current year in footer
  const yearEl = document.getElementById("aboutCopyrightYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Navigation Menu Toggle on Mobile
  const menuToggle = document.getElementById("aboutMenuToggle");
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
});
