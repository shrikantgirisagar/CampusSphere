// src/3d/main.js
// CampusSphere 3D Scene Entry Point
// Tree-shaken Three.js procedural scene with lazy-loading, capability gates, and teardown

import { createMaterials } from './materials.js';
import {
  createSphere,
  createGraduationCap,
  createBooks,
  createCalendar,
  createBarPillars,
  createShield,
  createSpeechBubble,
  createBell,
  createContactShadow
} from './objects.js';
import { createEnvironment } from './environment.js';
import { setupChoreography } from './choreography.js';

let activeInstance = null;

/**
 * Capability detection:
 * Gated on WebGL2, !prefersReducedMotion, !saveData, and (width >= 900px || hardwareConcurrency >= 6)
 */
export function canRun3D() {
  // 1. WebGL2 check
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
  } catch (_) {
    return false;
  }

  // 2. prefers-reduced-motion check
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // 3. Save-Data mode check
  if (navigator.connection && navigator.connection.saveData === true) {
    return false;
  }

  // 4. Device capability check (width >= 900px or hardwareConcurrency >= 6)
  const isWide = window.innerWidth >= 900;
  const isMultiCore = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency >= 6;
  if (!isWide && !isMultiCore) {
    return false;
  }

  return true;
}

export function init3D() {
  if (activeInstance) {
    return activeInstance;
  }

  const canvas = document.getElementById('campus3d') || document.getElementById('heroCanvas');
  const poster = document.getElementById('heroStaticPoster') || document.querySelector('.hero-poster');

  if (!canvas) {
    return null;
  }

  // Check capability
  if (!canRun3D()) {
    console.info('[CampusSphere 3D] Capability gate or preference: using static poster fallback.');
    if (canvas) canvas.style.display = 'none';
    if (poster) poster.style.display = 'block';
    document.body.classList.add('poster-fallback-active');
    return null;
  }

  const preset = canvas.getAttribute('data-3d-preset') || 'home';

  // Create environment (renderer, camera, room environment, lighting)
  const env = createEnvironment(canvas);
  const materials = createMaterials();

  // Create procedural objects
  const sphere = createSphere(materials);
  const cap = createGraduationCap(materials);
  const books = createBooks(materials);
  const calendar = createCalendar(materials);
  const pillars = createBarPillars(materials);
  const shield = createShield(materials);
  const speech = createSpeechBubble(materials);
  const bell = createBell(materials);
  const shadow = createContactShadow(materials);

  env.scene.add(sphere, cap, books, calendar, pillars, shield, speech, bell, shadow);

  // Setup scroll and pointer choreography
  const ch = setupChoreography(
    { sphere, cap, books, calendar, pillars, shield, speech, bell, shadow },
    env.camera,
    canvas,
    preset
  );

  window.__campusSphere3DActive = true;
  canvas.style.display = 'block';
  if (poster) poster.style.display = 'none';
  document.body.classList.add('webgl-active');
  if (canvas.parentElement) {
    canvas.parentElement.classList.add('webgl-active');
  }

  let isIntersecting = true;
  let isTabVisible = !document.hidden;
  let animId = null;
  let lastTime = performance.now();
  const startTime = lastTime;

  function renderFrame(now) {
    if (!window.__campusSphere3DActive) return;
    animId = requestAnimationFrame(renderFrame);

    if (!isIntersecting || !isTabVisible) return;

    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const elapsed = (now - startTime) / 1000;

    env.monitorPerformance();
    ch.update(elapsed, delta);
    env.renderer.render(env.scene, env.camera);
  }

  animId = requestAnimationFrame(renderFrame);

  // Resize handler
  function handleResize() {
    if (!canvas || !window.__campusSphere3DActive) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    env.camera.aspect = w / (h || 1);
    env.camera.updateProjectionMatrix();
    env.renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', handleResize, { passive: true });

  // IntersectionObserver
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  // Visibility change
  function handleVisibility() {
    isTabVisible = !document.hidden;
  }
  document.addEventListener('visibilitychange', handleVisibility);

  // Teardown function
  function destroy() {
    window.__campusSphere3DActive = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }

    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibility);

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    ch.destroy();
    env.destroy();

    document.body.classList.remove('webgl-active');
    if (canvas && canvas.parentElement) {
      canvas.parentElement.classList.remove('webgl-active');
    }

    activeInstance = null;
    console.info('[CampusSphere 3D] Renderer destroyed and GPU memory released.');
  }

  activeInstance = {
    destroy,
    env,
    ch
  };

  window.CampusSphereDestroy3D = destroy;
  window.CampusSphereInit3D = init3D;

  return activeInstance;
}

function defaultDestroy() {
  if (activeInstance) {
    activeInstance.destroy();
  } else {
    window.__campusSphere3DActive = false;
    document.body.classList.remove('webgl-active');
    const canvas = document.getElementById('campus3d') || document.getElementById('heroCanvas');
    if (canvas && canvas.parentElement) {
      canvas.parentElement.classList.remove('webgl-active');
    }
  }
}

// Global teardown binding on login/portal open
function bindAuthTeardown() {
  const originalOpenPortal = window.openPortal;
  if (typeof originalOpenPortal === 'function' && !window.__portalTeardownHooked) {
    window.__portalTeardownHooked = true;
    window.openPortal = function (...args) {
      if (typeof window.CampusSphereDestroy3D === 'function') {
        window.CampusSphereDestroy3D();
      }
      return originalOpenPortal.apply(this, args);
    };
  }

  window.addEventListener('campussphere:auth-login', () => {
    if (typeof window.CampusSphereDestroy3D === 'function') {
      window.CampusSphereDestroy3D();
    }
  });
}

// Lazy initialization after window load via requestIdleCallback
function scheduleStart() {
  bindAuthTeardown();
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => init3D());
  } else {
    setTimeout(init3D, 100);
  }
}

if (typeof window !== 'undefined') {
  window.CampusSphereInit3D = init3D;
  window.CampusSphereCanRun3D = canRun3D;
  window.CampusSphereDestroy3D = defaultDestroy;

  if (document.readyState === 'complete') {
    scheduleStart();
  } else {
    window.addEventListener('load', scheduleStart, { once: true });
  }
}
