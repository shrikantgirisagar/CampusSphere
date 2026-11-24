/**
 * CampusSphere Ambient Background Foundation Component
 * 
 * Provides a clean, universal ambient visual foundation
 * for all portals, dashboards, section pages, and standalone views.
 */
(function () {
  "use strict";

  const AMBIENT_BG_TEMPLATE = "";

  /**
   * HTML Custom Element: <animated-background>
   */
  class AnimatedBackgroundElement extends (typeof HTMLElement !== "undefined" ? HTMLElement : Object) {
    connectedCallback() {
      if (!this.classList.contains("campus-ambient-bg")) {
        this.classList.add("campus-ambient-bg");
      }
      this.setAttribute("aria-hidden", "true");
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
      return `<animated-background class="campus-ambient-bg" aria-hidden="true"></animated-background>`;
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
        if (target.firstChild) {
          target.insertBefore(el, target.firstChild);
        } else {
          target.appendChild(el);
        }
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

