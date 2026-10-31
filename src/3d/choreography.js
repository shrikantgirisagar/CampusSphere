// src/3d/choreography.js
// Smooth damped scroll lerping, anchor positioning, pointer parallax and safe zones
import { Vector3 } from 'three';

export function setupChoreography(objects, camera, canvas, preset = 'home') {
  const {
    sphere,
    cap,
    books,
    calendar,
    pillars,
    shield,
    speech,
    bell,
    shadow
  } = objects;

  // Damped pointer coordinates (-1 to +1)
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const maxParallaxAngle = Math.PI * (6 / 180); // Strict 6-degree maximum parallax

  // Scroll tracking (0 to 1 across document)
  let scrollProgress = 0;
  let targetScroll = 0;

  // Track hovered/focused feature card
  let activeHoveredCard = null;

  // Safe zone bounds (DOM text container rect in normalized 3D space)
  let safeZoneRight = 0.5;

  function updateSafeZones() {
    if (preset !== 'home') return;
    const heroCopy = document.querySelector('.home-hero-copy') || document.querySelector('.hero-copy');
    if (heroCopy && canvas) {
      const rect = heroCopy.getBoundingClientRect();
      const ndcRight = (rect.right / window.innerWidth) * 2 - 1;
      // Convert NDC right edge to camera-plane coordinate at z=0
      const visibleWidthAtZ0 = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      safeZoneRight = (ndcRight * visibleWidthAtZ0) / 2 + 0.35;
    }
  }

  // Bind mouse / pointer movement for parallax
  function onPointerMove(e) {
    pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  // Bind scroll
  function onScroll() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  }

  // Feature card hover / focus bindings
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.setAttribute('data-3d-anchor', `feature-${index + 1}`);
    card.addEventListener('mouseenter', () => { activeHoveredCard = index; });
    card.addEventListener('mouseleave', () => { if (activeHoveredCard === index) activeHoveredCard = null; });
    card.addEventListener('focusin', () => { activeHoveredCard = index; });
    card.addEventListener('focusout', () => { if (activeHoveredCard === index) activeHoveredCard = null; });
  });

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateSafeZones, { passive: true });
  updateSafeZones();

  // Animation update per frame
  function update(elapsedTime, deltaTime) {
    // 1. Damped pointer lerp (smooth 0.06 factor)
    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;

    // 2. Damped scroll lerp (smooth 0.08 factor)
    scrollProgress += (targetScroll - scrollProgress) * 0.08;

    // --- HOME PAGE CHOREOGRAPHY ---
    if (preset === 'home') {
      const t = scrollProgress; // 0.0 (hero) to 1.0 (footer)

      // Section 1: Hero (t: 0.0 -> 0.22)
      // The Sphere floats right of copy; cap and books slowly orbit.
      if (t < 0.22) {
        const heroT = t / 0.22;
        const targetX = Math.max(safeZoneRight + 0.4, 1.85);

        sphere.position.set(targetX, 0.2 - heroT * 0.4, 0);
        sphere.scale.setScalar(1.05);
        sphere.rotation.y = elapsedTime * 0.25;
        sphere.rotation.x = pointer.y * maxParallaxAngle;
        sphere.rotation.z = -pointer.x * maxParallaxAngle;

        // Orbiting Graduation Cap
        const capAngle = elapsedTime * 0.45;
        cap.position.set(
          targetX + Math.cos(capAngle) * 1.7,
          0.8 + Math.sin(capAngle * 0.8) * 0.35,
          Math.sin(capAngle) * 1.1
        );
        cap.rotation.y = elapsedTime * 0.35;
        cap.scale.setScalar(0.72);

        // Orbiting Books Stack
        const booksAngle = capAngle + Math.PI;
        books.position.set(
          targetX + Math.cos(booksAngle) * 1.8,
          -0.6 + Math.sin(booksAngle * 0.8) * 0.3,
          Math.sin(booksAngle) * 1.2
        );
        books.rotation.y = -elapsedTime * 0.25;
        books.scale.setScalar(0.68);

        // Others idle or parked offscreen
        calendar.position.set(targetX + 4, 0, -5);
        pillars.position.set(targetX + 4, -4, -5);
        shield.position.set(targetX + 4, 0, -5);
        bell.position.set(targetX + 4, 0, -5);
        speech.position.set(targetX + 4, 0, -5);

        if (shadow) {
          shadow.position.set(targetX, -1.8, 0);
          shadow.scale.setScalar(1.0);
        }
      }

      // Section 2: Features Grid (t: 0.22 -> 0.52)
      // Objects glide to anchor positions beside feature cards
      else if (t >= 0.22 && t < 0.52) {
        const featT = (t - 0.22) / 0.30;

        // Sphere retreats slightly
        sphere.position.set(2.4, 0.8 - featT * 0.5, -1.5);
        sphere.scale.setScalar(0.65);
        sphere.rotation.y = elapsedTime * 0.2;

        // 4 Key Objects active near features:
        // Feature 1 (Academics): Books
        books.position.set(-2.2, 0.4 - featT * 0.3, 0);
        books.scale.setScalar(0.78);
        books.rotation.y = activeHoveredCard === 0 ? elapsedTime * 0.8 : elapsedTime * 0.2;

        // Feature 2 (Community): Graduation Cap
        cap.position.set(2.1, 0.3 - featT * 0.3, 0);
        cap.scale.setScalar(0.80);
        cap.rotation.y = activeHoveredCard === 1 ? elapsedTime * 0.8 : elapsedTime * 0.25;

        // Feature 3 (Schedule/Timetable): Calendar
        calendar.position.set(-2.1, -0.6 - featT * 0.2, 0);
        calendar.scale.setScalar(0.75);
        calendar.rotation.y = activeHoveredCard === 2 ? elapsedTime * 0.8 : 0.15 + Math.sin(elapsedTime * 0.5) * 0.1;

        // Feature 4 (Notices): Bell
        bell.position.set(2.2, -0.7 - featT * 0.2, 0);
        bell.scale.setScalar(0.75);
        bell.rotation.z = activeHoveredCard === 3 ? Math.sin(elapsedTime * 6) * 0.15 : Math.sin(elapsedTime * 1.5) * 0.05;

        // Shield & speech rest
        shield.position.set(0, -5, -5);
        speech.position.set(0, -5, -5);
        pillars.position.set(0, -5, -5);

        if (shadow) {
          shadow.position.set(0, -1.8, -1.0);
        }
      }

      // Section 3: Stats & Analytics (t: 0.52 -> 0.75)
      // Bar pillars rise in sync with stats
      else if (t >= 0.52 && t < 0.75) {
        const statsT = Math.min(1, Math.max(0, (t - 0.52) / 0.18));

        // Pillars placed at center-right
        pillars.position.set(1.6, -1.4, 0);
        pillars.scale.set(0.9, 0.2 + statsT * 0.8, 0.9);
        pillars.rotation.y = -0.35 + elapsedTime * 0.1;

        // Sphere floats peacefully overhead
        sphere.position.set(-2.1, 0.6, -0.8);
        sphere.scale.setScalar(0.68);
        sphere.rotation.y = elapsedTime * 0.2;

        // Cap rests beside
        cap.position.set(-1.8, -0.6, -0.5);
        cap.scale.setScalar(0.65);
        cap.rotation.y = elapsedTime * 0.2;

        books.position.set(4, 0, -5);
        calendar.position.set(4, 0, -5);
        shield.position.set(4, 0, -5);
        bell.position.set(4, 0, -5);

        if (shadow) {
          shadow.position.set(1.6, -1.45, 0);
          shadow.scale.setScalar(0.8);
        }
      }

      // Section 4: Community & Footer (t: 0.75 -> 1.0)
      // Objects rest, sphere small at margin, gentle fade
      else {
        const footT = (t - 0.75) / 0.25;
        sphere.position.set(-2.2, -0.4 - footT * 0.4, -0.5);
        sphere.scale.setScalar(0.55 * (1 - footT * 0.4));
        sphere.rotation.y = elapsedTime * 0.15;

        cap.position.set(2.3, -0.5 - footT * 0.4, -0.5);
        cap.scale.setScalar(0.55 * (1 - footT * 0.4));

        shield.position.set(0, -0.8 - footT * 0.5, 0);
        shield.scale.setScalar(0.65 * (1 - footT * 0.3));
        shield.rotation.y = Math.sin(elapsedTime * 0.6) * 0.2;

        books.position.set(0, -6, -5);
        calendar.position.set(0, -6, -5);
        pillars.position.set(0, -6, -5);
        bell.position.set(0, -6, -5);
        speech.position.set(0, -6, -5);

        if (shadow) {
          shadow.position.set(0, -2.2, 0);
          shadow.scale.setScalar(0.5 * (1 - footT * 0.5));
        }
      }
    }

    // --- OTHER PUBLIC PAGES PRESETS (Compact Single/Dual Object Hero Band) ---
    else if (preset === 'courses') {
      // Preset: Open book and graduation cap
      books.position.set(-0.7, 0, 0);
      books.scale.setScalar(0.95);
      books.rotation.y = -0.3 + pointer.x * maxParallaxAngle;
      books.rotation.x = pointer.y * maxParallaxAngle;

      cap.position.set(0.9, 0.25, 0);
      cap.scale.setScalar(0.85);
      cap.rotation.y = elapsedTime * 0.3;

      sphere.position.set(0, 10, 0);
      calendar.position.set(0, 10, 0);
      pillars.position.set(0, 10, 0);
      shield.position.set(0, 10, 0);
      bell.position.set(0, 10, 0);
      speech.position.set(0, 10, 0);
    }
    else if (preset === 'about') {
      // Preset: The Sphere and Shield
      sphere.position.set(-0.75, 0, 0);
      sphere.scale.setScalar(0.95);
      sphere.rotation.y = elapsedTime * 0.25 + pointer.x * maxParallaxAngle;
      sphere.rotation.x = pointer.y * maxParallaxAngle;

      shield.position.set(0.85, 0, 0);
      shield.scale.setScalar(0.92);
      shield.rotation.y = -0.2 + Math.sin(elapsedTime * 0.8) * 0.15;

      cap.position.set(0, 10, 0);
      books.position.set(0, 10, 0);
      calendar.position.set(0, 10, 0);
      pillars.position.set(0, 10, 0);
      bell.position.set(0, 10, 0);
      speech.position.set(0, 10, 0);
    }
    else if (preset === 'students') {
      // Preset: Graduation cap and Bar columns
      cap.position.set(-0.65, 0.1, 0);
      cap.scale.setScalar(0.95);
      cap.rotation.y = elapsedTime * 0.35 + pointer.x * maxParallaxAngle;
      cap.rotation.x = pointer.y * maxParallaxAngle;

      pillars.position.set(0.85, -0.65, 0);
      pillars.scale.setScalar(0.85);
      pillars.rotation.y = -0.35;

      sphere.position.set(0, 10, 0);
      books.position.set(0, 10, 0);
      calendar.position.set(0, 10, 0);
      shield.position.set(0, 10, 0);
      bell.position.set(0, 10, 0);
      speech.position.set(0, 10, 0);
    }
  }

  function destroy() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', updateSafeZones);
  }

  return { update, destroy };
}
