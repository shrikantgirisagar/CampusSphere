// src/3d/objects.js
// Procedural brand-matched objects for CampusSphere (No external 3D models or textures)
import {
  Group,
  Mesh,
  SphereGeometry,
  BoxGeometry,
  CylinderGeometry,
  TorusGeometry,
  ConeGeometry,
  PlaneGeometry,
  RingGeometry
} from 'three';

/**
 * 1. The Sphere (Brand Core)
 * Royal blue core sphere with a thin brass orbit ring and small satellite bead.
 */
export function createSphere(materials) {
  const group = new Group();
  group.name = 'sphereCore';

  // Core matte royal blue sphere
  const sphereGeo = new SphereGeometry(1.0, 48, 48);
  const sphere = new Mesh(sphereGeo, materials.royalBlue);
  group.add(sphere);

  // Elegant thin brass orbit ring
  const ringGeo = new TorusGeometry(1.52, 0.032, 16, 80);
  const ring = new Mesh(ringGeo, materials.brass);
  ring.rotation.x = Math.PI * 0.35;
  ring.rotation.y = Math.PI * 0.15;
  group.add(ring);

  // Orbiting satellite bead
  const beadGeo = new SphereGeometry(0.12, 24, 24);
  const bead = new Mesh(beadGeo, materials.brass);
  bead.position.set(1.52 * Math.cos(0.8), 0.45, 1.52 * Math.sin(0.8));
  group.add(bead);

  return group;
}

/**
 * 2. Mortarboard Graduation Cap (Students)
 * Navy skull base, diamond flat board, brass button and draped brass tassel.
 */
export function createGraduationCap(materials) {
  const group = new Group();
  group.name = 'graduationCap';

  // Skull cap base
  const skullGeo = new CylinderGeometry(0.48, 0.58, 0.38, 32);
  const skull = new Mesh(skullGeo, materials.navy);
  skull.position.y = 0.19;
  group.add(skull);

  // Diamond mortarboard top plate
  const boardGeo = new BoxGeometry(1.6, 0.045, 1.6);
  const board = new Mesh(boardGeo, materials.navy);
  board.position.y = 0.40;
  board.rotation.y = Math.PI * 0.25; // diamond orientation
  group.add(board);

  // Center button
  const buttonGeo = new CylinderGeometry(0.08, 0.08, 0.04, 16);
  const button = new Mesh(buttonGeo, materials.brass);
  button.position.y = 0.435;
  group.add(button);

  // Tassel ribbon (hanging down over edge)
  const ribbonGeo = new CylinderGeometry(0.016, 0.016, 0.65, 8);
  const ribbon = new Mesh(ribbonGeo, materials.brass);
  ribbon.position.set(0.42, 0.18, 0.42);
  ribbon.rotation.z = -0.35;
  group.add(ribbon);

  // Tassel fringe cone
  const fringeGeo = new ConeGeometry(0.065, 0.18, 16);
  const fringe = new Mesh(fringeGeo, materials.brass);
  fringe.position.set(0.56, -0.15, 0.56);
  fringe.rotation.x = Math.PI;
  group.add(fringe);

  return group;
}

/**
 * 3. Book Stack & One Open Book (Syllabus & Resources)
 */
export function createBooks(materials) {
  const group = new Group();
  group.name = 'academicBooks';

  // --- Stack Base (2 Closed Volumes) ---
  // Volume 1: Oxford Navy cover with Ivory pages
  const book1Cover = new Mesh(new BoxGeometry(1.6, 0.24, 1.15), materials.navy);
  book1Cover.position.set(-0.35, 0.12, 0);
  const book1Pages = new Mesh(new BoxGeometry(1.52, 0.18, 1.08), materials.ivory);
  book1Pages.position.set(-0.32, 0.12, 0);
  group.add(book1Cover, book1Pages);

  // Volume 2: Royal Blue cover, rotated slightly for organic academic feel
  const book2Cover = new Mesh(new BoxGeometry(1.5, 0.22, 1.1), materials.royalBlue);
  book2Cover.position.set(-0.32, 0.35, 0);
  book2Cover.rotation.y = 0.12;
  const book2Pages = new Mesh(new BoxGeometry(1.42, 0.16, 1.03), materials.ivory);
  book2Pages.position.set(-0.30, 0.35, 0);
  book2Pages.rotation.y = 0.12;
  group.add(book2Cover, book2Pages);

  // --- Open Book (Mounted on top/side) ---
  const openBookGroup = new Group();
  openBookGroup.position.set(0.65, 0.48, 0.15);
  openBookGroup.rotation.x = 0.25;
  openBookGroup.rotation.y = -0.20;

  // Left page wing
  const leftPage = new Mesh(new BoxGeometry(0.62, 0.06, 0.85), materials.ivory);
  leftPage.position.set(-0.30, 0, 0);
  leftPage.rotation.z = 0.14;

  // Right page wing
  const rightPage = new Mesh(new BoxGeometry(0.62, 0.06, 0.85), materials.ivory);
  rightPage.position.set(0.30, 0, 0);
  rightPage.rotation.z = -0.14;

  // Spine back
  const spine = new Mesh(new BoxGeometry(0.12, 0.08, 0.86), materials.deepBlue);
  spine.position.set(0, -0.04, 0);

  openBookGroup.add(leftPage, rightPage, spine);
  group.add(openBookGroup);

  return group;
}

/**
 * 4. Calendar Slab (Timetable & Attendance)
 * White slab with royal blue header and brass binder rings.
 */
export function createCalendar(materials) {
  const group = new Group();
  group.name = 'calendarSlab';

  // White base card
  const slab = new Mesh(new BoxGeometry(1.3, 1.5, 0.10), materials.paper);
  group.add(slab);

  // Royal blue header band
  const header = new Mesh(new BoxGeometry(1.3, 0.38, 0.12), materials.royalBlue);
  header.position.set(0, 0.56, 0.01);
  group.add(header);

  // Brass binder rings (2 rings at top)
  const ringGeo = new TorusGeometry(0.09, 0.022, 12, 24);
  const ringL = new Mesh(ringGeo, materials.brass);
  ringL.position.set(-0.38, 0.78, 0);
  ringL.rotation.y = Math.PI * 0.5;

  const ringR = new Mesh(ringGeo, materials.brass);
  ringR.position.set(0.38, 0.78, 0);
  ringR.rotation.y = Math.PI * 0.5;

  group.add(ringL, ringR);

  // Procedural date indicator dots on the white body
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const dot = new Mesh(new CylinderGeometry(0.04, 0.04, 0.11, 12), materials.deepBlue);
      dot.position.set(-0.38 + c * 0.25, 0.22 - r * 0.24, 0.01);
      dot.rotation.x = Math.PI * 0.5;
      group.add(dot);
    }
  }

  return group;
}

/**
 * 5. Bar Pillars (Marks & Analytics)
 * Stepped pillars with royal-to-sky graduation that scale dynamically on scroll.
 */
export function createBarPillars(materials) {
  const group = new Group();
  group.name = 'barPillars';

  const configs = [
    { x: -0.66, height: 0.65, mat: materials.navy },
    { x: -0.22, height: 1.15, mat: materials.deepBlue },
    { x: 0.22, height: 1.65, mat: materials.royalBlue },
    { x: 0.66, height: 2.15, mat: materials.sky }
  ];

  const pillarMeshes = [];

  configs.forEach(cfg => {
    // Center the geometry origin at the base so scaling Y grows upward
    const geo = new BoxGeometry(0.34, cfg.height, 0.34);
    geo.translate(0, cfg.height / 2, 0);
    const pillar = new Mesh(geo, cfg.mat);
    pillar.position.set(cfg.x, 0, 0);
    pillar.userData.baseHeight = cfg.height;
    group.add(pillar);
    pillarMeshes.push(pillar);
  });

  group.userData.pillars = pillarMeshes;
  return group;
}

/**
 * 6. Shield with Ivory Check (Secure Platform)
 */
export function createShield(materials) {
  const group = new Group();
  group.name = 'secureShield';

  // Main shield body
  const bodyGeo = new BoxGeometry(1.2, 1.4, 0.12);
  const body = new Mesh(bodyGeo, materials.navy);
  group.add(body);

  // Tapered base cone
  const baseGeo = new ConeGeometry(0.6, 0.65, 4);
  const base = new Mesh(baseGeo, materials.navy);
  base.position.set(0, -0.92, 0);
  base.rotation.y = Math.PI * 0.25;
  base.rotation.x = Math.PI;
  group.add(base);

  // Ivory checkmark bar 1 (short leg)
  const leg1 = new Mesh(new BoxGeometry(0.24, 0.09, 0.16), materials.ivory);
  leg1.position.set(-0.16, -0.06, 0.05);
  leg1.rotation.z = Math.PI * 0.25;

  // Ivory checkmark bar 2 (long leg)
  const leg2 = new Mesh(new BoxGeometry(0.55, 0.09, 0.16), materials.ivory);
  leg2.position.set(0.12, 0.06, 0.05);
  leg2.rotation.z = -Math.PI * 0.32;

  group.add(leg1, leg2);
  return group;
}

/**
 * 7. Speech Bubble (Student Support)
 */
export function createSpeechBubble(materials) {
  const group = new Group();
  group.name = 'speechBubble';

  // Main bubble disk
  const body = new Mesh(new CylinderGeometry(0.75, 0.75, 0.16, 32), materials.royalBlue);
  body.rotation.x = Math.PI * 0.5;
  group.add(body);

  // Tail cone pointing down-left
  const tail = new Mesh(new ConeGeometry(0.25, 0.5, 16), materials.royalBlue);
  tail.position.set(-0.45, -0.65, 0);
  tail.rotation.z = Math.PI * 0.75;
  group.add(tail);

  // Inner ivory accent circle
  const innerDot = new Mesh(new CylinderGeometry(0.45, 0.45, 0.18, 24), materials.ivory);
  innerDot.rotation.x = Math.PI * 0.5;
  group.add(innerDot);

  return group;
}

/**
 * 8. Bell (Notices)
 * Brass bell dome with top ring handle and clapper.
 */
export function createBell(materials) {
  const group = new Group();
  group.name = 'noticesBell';

  // Bell dome (stepped cylinder + cone)
  const dome = new Mesh(new CylinderGeometry(0.25, 0.75, 0.95, 32), materials.brass);
  dome.position.y = 0.45;
  group.add(dome);

  // Bell lip rim
  const rim = new Mesh(new TorusGeometry(0.75, 0.08, 16, 48), materials.brass);
  rim.position.y = -0.02;
  rim.rotation.x = Math.PI * 0.5;
  group.add(rim);

  // Top hanger ring
  const ring = new Mesh(new TorusGeometry(0.18, 0.04, 12, 24), materials.brass);
  ring.position.y = 1.05;
  group.add(ring);

  // Clapper ball
  const clapper = new Mesh(new SphereGeometry(0.16, 20, 20), materials.brass);
  clapper.position.y = -0.08;
  group.add(clapper);

  return group;
}

/**
 * Blurred Contact Shadow Plane
 * Avoids expensive shadow maps; renders a soft radial gradient shadow beneath active objects.
 */
export function createContactShadow(materials) {
  const geo = new PlaneGeometry(4.5, 4.5);
  const mesh = new Mesh(geo, materials.shadow);
  mesh.name = 'contactShadow';
  mesh.rotation.x = -Math.PI * 0.5;
  mesh.position.y = -1.6;
  return mesh;
}
