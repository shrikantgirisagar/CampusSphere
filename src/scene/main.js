import * as THREE from 'three';
import { setupScene } from './setup.js';
import { createMaterials } from './materials.js';
import {
  createArmillarySphere,
  createGraduationCap,
  createBookStack,
  createLaptop,
  createShield,
  createNodeNetwork,
  createBarColumns
} from './objects.js';
import { initChoreography } from './choreography.js';

function canRun3D() {
  // 1. WebGL2 support
  try {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext('webgl2')) return false;
  } catch (_) {
    return false;
  }

  // 2. Accessibility: prefers-reduced-motion check
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // 3. Network Save-Data mode check
  if (navigator.connection && navigator.connection.saveData === true) {
    return false;
  }

  // 4. Device Memory check (>= 4GB RAM if exposed)
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) {
    return false;
  }

  return true;
}

function init() {
  const canvas = document.getElementById('heroCanvas');
  const container = document.getElementById('hero3dWrap') || (canvas ? canvas.parentElement : null);

  if (!canvas || !container) return;

  if (!canRun3D()) {
    console.info('[3D Scene] Environment or user preference requested static fallback.');
    return;
  }

  const isMobile = window.innerWidth <= 768;

  const { scene, camera, renderer, monitorPerformance, destroy } = setupScene(canvas);
  const materials = createMaterials();

  // Create Objects
  const sphere = createArmillarySphere(materials);
  scene.add(sphere);

  const cap = createGraduationCap(materials);
  scene.add(cap);

  const books = createBookStack(materials);
  scene.add(books);

  let laptop = null;
  let shield = null;
  let network = null;
  let bars = null;

  if (!isMobile) {
    laptop = createLaptop(materials);
    scene.add(laptop);

    shield = createShield(materials);
    scene.add(shield);

    network = createNodeNetwork(materials);
    scene.add(network);

    bars = createBarColumns(materials);
    scene.add(bars);
  }

  const { tick } = initChoreography({
    scene,
    camera,
    objects: { sphere, cap, books, laptop, shield, network, bars },
    isMobile
  });

  // Mark container active
  container.classList.add('webgl-active');
  window.__campusSphere3DActive = true;

  // Render loop with pause conditions
  let isIntersecting = true;
  let isTabVisible = !document.hidden;
  let animId = null;
  let lastTime = performance.now();

  function animate(now) {
    if (!window.__campusSphere3DActive) return;

    animId = requestAnimationFrame(animate);

    if (!isIntersecting || !isTabVisible) return;

    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    monitorPerformance();
    tick(delta);
    renderer.render(scene, camera);
  }

  animId = requestAnimationFrame(animate);

  // Resize handler
  function handleResize() {
    if (!canvas || !window.__campusSphere3DActive) return;
    const w = canvas.clientWidth || 500;
    const h = canvas.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', handleResize, { passive: true });

  // IntersectionObserver: pause when canvas scrolled out of view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isIntersecting = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  // Visibilitychange: pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
  });

  // Teardown upon dashboard login (Free GPU memory!)
  const authTriggers = document.querySelectorAll('[data-open-login], [data-open-signup]');
  authTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      // Keep scene if only switching to public login card, but destroy when openPortal is invoked
    });
  });

  // Listen to openPortal or login success
  const originalOpenPortal = window.openPortal;
  if (typeof originalOpenPortal === 'function') {
    window.openPortal = function (...args) {
      if (typeof window.CampusSphereDestroy3D === 'function') {
        window.CampusSphereDestroy3D();
      }
      return originalOpenPortal.apply(this, args);
    };
  }
}

// Lazy Load after First Paint
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => init());
  } else {
    setTimeout(init, 100);
  }
} else {
  window.addEventListener('DOMContentLoaded', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => init());
    } else {
      setTimeout(init, 100);
    }
  });
}
