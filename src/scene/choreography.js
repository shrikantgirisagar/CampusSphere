import * as THREE from 'three';

/**
 * Choreography: Idle Orbit, Pointer Parallax (±6°), Scroll Interpolation, Card Hover Reactions
 */

export function initChoreography({ scene, camera, objects, isMobile }) {
  const { sphere, cap, books, laptop, shield, network, bars } = objects;

  // Pointer Parallax (max ±6 degrees = ~0.105 radians)
  const pointerTarget = { x: 0, y: 0 };
  const pointerCurrent = { x: 0, y: 0 };
  const MAX_TILT = 0.105;

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerTarget.x = nx * MAX_TILT;
      pointerTarget.y = -ny * MAX_TILT;
    }, { passive: true });
  }

  // Feature Card Hover Lift Tracking
  const activeHover = {
    books: 0,
    network: 0,
    laptop: 0,
    shield: 0
  };

  const featureCards = document.querySelectorAll('.feature-card');
  const cardKeys = ['books', 'network', 'laptop', 'shield'];

  featureCards.forEach((card, idx) => {
    const key = cardKeys[idx];
    if (!key) return;

    card.addEventListener('mouseenter', () => { activeHover[key] = 0.25; });
    card.addEventListener('mouseleave', () => { activeHover[key] = 0.0; });
    card.addEventListener('focus', () => { activeHover[key] = 0.25; });
    card.addEventListener('blur', () => { activeHover[key] = 0.0; });
  });

  // Object Base Placements
  // Hero State
  const heroPositions = {
    sphere: new THREE.Vector3(0, 0, 0),
    cap: new THREE.Vector3(-1.8, 1.2, 0.5),
    books: new THREE.Vector3(1.7, -1.0, 0.4),
    laptop: new THREE.Vector3(1.8, 1.1, -0.2),
    shield: new THREE.Vector3(-1.9, -1.1, -0.4),
    network: new THREE.Vector3(0, 2.0, -1.0),
    bars: new THREE.Vector3(0, -2.4, -0.5)
  };

  // Scroll Progress Normalization
  let scrollProgress = 0;
  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Animation Loop Update
  let time = 0;
  function tick(delta) {
    time += delta;

    // Smooth Damped Pointer Parallax
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.06;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.06;

    scene.rotation.y = pointerCurrent.x;
    scene.rotation.x = pointerCurrent.y;

    // Idle Rotations
    sphere.rotation.y = time * 0.15;
    sphere.rotation.x = Math.sin(time * 0.1) * 0.08;

    // Orbiting Satellites in Hero
    if (cap) {
      cap.position.x = heroPositions.cap.x + Math.sin(time * 0.4) * 0.18;
      cap.position.y = heroPositions.cap.y + Math.cos(time * 0.35) * 0.15;
      cap.rotation.y = time * 0.2;
    }

    if (books) {
      const lift = activeHover.books;
      books.position.x = heroPositions.books.x + Math.cos(time * 0.38) * 0.15;
      books.position.y = heroPositions.books.y + Math.sin(time * 0.32) * 0.12 + lift;
      books.rotation.y = time * 0.18;
    }

    if (laptop && !isMobile) {
      const lift = activeHover.laptop;
      laptop.position.x = heroPositions.laptop.x + Math.sin(time * 0.35 + 1) * 0.15;
      laptop.position.y = heroPositions.laptop.y + Math.cos(time * 0.3 + 1) * 0.12 + lift;
      laptop.rotation.y = time * 0.16;
    }

    if (shield && !isMobile) {
      const lift = activeHover.shield;
      shield.position.x = heroPositions.shield.x + Math.cos(time * 0.32 + 2) * 0.15;
      shield.position.y = heroPositions.shield.y + Math.sin(time * 0.28 + 2) * 0.12 + lift;
      shield.rotation.y = time * 0.14;
    }

    if (network && !isMobile) {
      const lift = activeHover.network;
      network.position.x = heroPositions.network.x + Math.sin(time * 0.25 + 3) * 0.2;
      network.position.y = heroPositions.network.y + Math.cos(time * 0.25 + 3) * 0.15 + lift;
      network.rotation.y = time * 0.12;
    }

    if (bars && !isMobile) {
      // Bar columns rising with scroll progress
      const targetScaleY = 0.6 + scrollProgress * 1.4;
      bars.scale.y += (targetScaleY - bars.scale.y) * 0.08;
    }
  }

  return { tick };
}
