/**
 * CampusSphere Reusable Animated Background Component
 * 
 * Provides a universal, GPU-accelerated ambient animated background
 * for all portals, dashboards, section pages, and standalone views.
 */
(function () {
  "use strict";

  const AMBIENT_BG_TEMPLATE = `
    <div class="ambient-blob blob-blue" aria-hidden="true"></div>
    <div class="ambient-blob blob-indigo" aria-hidden="true"></div>
    <div class="ambient-blob blob-cyan" aria-hidden="true"></div>
    <div class="ambient-blob blob-emerald" aria-hidden="true"></div>
    <div class="ambient-blob blob-violet" aria-hidden="true"></div>
    <div class="ambient-grid-overlay" aria-hidden="true"></div>
    <div class="ambient-shapes" aria-hidden="true">
      <span class="ambient-ring ring-1"></span>
      <span class="ambient-ring ring-2"></span>
      <span class="ambient-ring ring-3"></span>
    </div>
  `.trim();

  /**
   * HTML Custom Element: <animated-background>
   */
  class AnimatedBackgroundElement extends (typeof HTMLElement !== "undefined" ? HTMLElement : Object) {
    connectedCallback() {
      if (!this.classList.contains("campus-ambient-bg")) {
        this.classList.add("campus-ambient-bg");
      }
      this.setAttribute("aria-hidden", "true");
      if (!this.firstElementChild) {
        this.innerHTML = AMBIENT_BG_TEMPLATE;
      }
    }
  }

  if (typeof window !== "undefined" && typeof customElements !== "undefined" && !customElements.get("animated-background")) {
    customElements.define("animated-background", AnimatedBackgroundElement);
  }

  /**
   * Global AnimatedBackground API
   */
  const AnimatedBackground = {
    template: AMBIENT_BG_TEMPLATE,

    /**
     * Return markup as a string
     */
    render() {
      return `<animated-background class="campus-ambient-bg" aria-hidden="true">${AMBIENT_BG_TEMPLATE}</animated-background>`;
    },

    /**
     * Ensure a single instance of the background exists in the DOM
     */
    ensure(target = (typeof document !== "undefined" ? document.body : null)) {
      if (!target || typeof document === "undefined") return null;

      let el = document.querySelector("animated-background, .campus-ambient-bg");
      if (!el) {
        el = document.createElement("animated-background");
        el.className = "campus-ambient-bg";
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = AMBIENT_BG_TEMPLATE;
        if (target.firstChild) {
          target.insertBefore(el, target.firstChild);
        } else {
          target.appendChild(el);
        }
      } else if (!el.firstElementChild) {
        el.innerHTML = AMBIENT_BG_TEMPLATE;
      }
      return el;
    },

    init() {
      return this.ensure();
    }
  };

  if (typeof window !== "undefined") {
    window.AnimatedBackground = AnimatedBackground;

    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          AnimatedBackground.ensure();
        });
      } else {
        AnimatedBackground.ensure();
      }
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AnimatedBackground;
  }
})();

