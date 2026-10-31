import * as THREE from 'three';

/**
 * Procedural Academic 3D Objects
 * Under 80k triangles total, crafted with clean primitives
 */

// (a) Armillary Sphere
export function createArmillarySphere(materials) {
  const group = new THREE.Group();
  group.name = 'armillarySphere';

  // Navy matte core sphere
  const sphereGeo = new THREE.SphereGeometry(1.2, 32, 24);
  const coreSphere = new THREE.Mesh(sphereGeo, materials.navy);
  group.add(coreSphere);

  // Lat / Long wireframe rings
  const wireGeo = new THREE.WireframeGeometry(sphereGeo);
  const wireLines = new THREE.LineSegments(wireGeo, materials.line);
  wireLines.scale.set(1.002, 1.002, 1.002);
  group.add(wireLines);

  // 3 Tilted Brass Rings (Armillary)
  const ring1Geo = new THREE.TorusGeometry(1.48, 0.04, 16, 48);
  const ring1 = new THREE.Mesh(ring1Geo, materials.brass);
  ring1.rotation.x = Math.PI * 0.15;
  ring1.rotation.y = Math.PI * 0.1;
  group.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(1.62, 0.04, 16, 48);
  const ring2 = new THREE.Mesh(ring2Geo, materials.brass);
  ring2.rotation.y = Math.PI * 0.45;
  ring2.rotation.z = Math.PI * 0.2;
  group.add(ring2);

  const ring3Geo = new THREE.TorusGeometry(1.76, 0.04, 16, 48);
  const ring3 = new THREE.Mesh(ring3Geo, materials.brass);
  ring3.rotation.x = -Math.PI * 0.25;
  ring3.rotation.y = Math.PI * 0.35;
  group.add(ring3);

  // Contact shadow under sphere
  const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.8;
  group.add(shadow);

  return group;
}

// (b) Graduation Cap
export function createGraduationCap(materials) {
  const group = new THREE.Group();
  group.name = 'graduationCap';

  // Mortarboard top (square)
  const boardGeo = new THREE.BoxGeometry(1.3, 0.05, 1.3);
  const board = new THREE.Mesh(boardGeo, materials.navy);
  board.position.y = 0.28;
  group.add(board);

  // Skull cap underneath
  const skullGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.3, 24);
  const skull = new THREE.Mesh(skullGeo, materials.navy);
  skull.position.y = 0.12;
  group.add(skull);

  // Brass button on top
  const buttonGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12);
  const button = new THREE.Mesh(buttonGeo, materials.brass);
  button.position.y = 0.32;
  group.add(button);

  // Hanging tassel (brass)
  const tasselLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.32, 0),
    new THREE.Vector3(0.5, 0.28, 0.3),
    new THREE.Vector3(0.65, 0.05, 0.4)
  ]);
  const tasselLine = new THREE.Line(tasselLineGeo, materials.brass);
  group.add(tasselLine);

  const tasselTipGeo = new THREE.ConeGeometry(0.06, 0.16, 12);
  const tasselTip = new THREE.Mesh(tasselTipGeo, materials.brass);
  tasselTip.position.set(0.65, 0.0, 0.4);
  tasselTip.rotation.x = Math.PI;
  group.add(tasselTip);

  // Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.15;
  group.add(shadow);

  return group;
}

// (c) Stack of 3 Books
export function createBookStack(materials) {
  const group = new THREE.Group();
  group.name = 'bookStack';

  const bookData = [
    { y: 0.1, rot: 0, colorMat: materials.navy },
    { y: 0.32, rot: -0.12, colorMat: materials.royalBlue },
    { y: 0.54, rot: 0.08, colorMat: materials.ivory }
  ];

  bookData.forEach(({ y, rot, colorMat }) => {
    const book = new THREE.Group();
    book.position.y = y;
    book.rotation.y = rot;

    // Cover
    const coverGeo = new THREE.BoxGeometry(1.2, 0.18, 0.85);
    const cover = new THREE.Mesh(coverGeo, colorMat);
    book.add(cover);

    // Inner paper pages
    const pagesGeo = new THREE.BoxGeometry(1.16, 0.14, 0.78);
    const pages = new THREE.Mesh(pagesGeo, materials.ivory);
    pages.position.x = 0.03;
    book.add(pages);

    // Brass spine bands
    const band1Geo = new THREE.BoxGeometry(0.04, 0.19, 0.86);
    const band1 = new THREE.Mesh(band1Geo, materials.brass);
    band1.position.x = -0.35;
    book.add(band1);

    const band2 = band1.clone();
    band2.position.x = -0.15;
    book.add(band2);

    group.add(book);
  });

  // Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 1.4);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0;
  group.add(shadow);

  return group;
}

// (d) Laptop
export function createLaptop(materials) {
  const group = new THREE.Group();
  group.name = 'laptop';

  // Base
  const baseGeo = new THREE.BoxGeometry(1.3, 0.05, 0.9);
  const base = new THREE.Mesh(baseGeo, materials.navy);
  group.add(base);

  // Keyboard inset
  const kbGeo = new THREE.BoxGeometry(1.1, 0.02, 0.5);
  const kb = new THREE.Mesh(kbGeo, materials.ivory);
  kb.position.set(0, 0.03, -0.05);
  group.add(kb);

  // Trackpad
  const tpGeo = new THREE.BoxGeometry(0.4, 0.015, 0.25);
  const tp = new THREE.Mesh(tpGeo, materials.brass);
  tp.position.set(0, 0.03, 0.28);
  group.add(tp);

  // Screen Lid (Tilted at 65 deg)
  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 0.02, -0.44);
  screenGroup.rotation.x = -Math.PI * 0.38;

  const lidGeo = new THREE.BoxGeometry(1.3, 0.85, 0.04);
  const lid = new THREE.Mesh(lidGeo, materials.navy);
  lid.position.set(0, 0.425, 0);
  screenGroup.add(lid);

  // Screen display bezel
  const displayGeo = new THREE.BoxGeometry(1.18, 0.74, 0.02);
  const display = new THREE.Mesh(displayGeo, materials.royalBlue);
  display.position.set(0, 0.425, 0.025);
  screenGroup.add(display);

  group.add(screenGroup);

  // Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 1.4);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.04;
  group.add(shadow);

  return group;
}

// (e) Shield with Keyhole
export function createShield(materials) {
  const group = new THREE.Group();
  group.name = 'shield';

  // Shield shape via ExtrudeGeometry
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.8);
  shape.lineTo(0.55, 0.65);
  shape.lineTo(0.55, 0.0);
  shape.bezierCurveTo(0.55, -0.4, 0.25, -0.7, 0, -0.85);
  shape.bezierCurveTo(-0.25, -0.7, -0.55, -0.4, -0.55, 0.0);
  shape.lineTo(-0.55, 0.65);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4
  };

  const shieldGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const shield = new THREE.Mesh(shieldGeo, materials.navy);
  shield.position.z = -0.06;
  group.add(shield);

  // Brass inner border/emblem
  const innerShape = new THREE.Shape();
  innerShape.moveTo(0, 0.62);
  innerShape.lineTo(0.42, 0.5);
  innerShape.lineTo(0.42, 0.0);
  innerShape.bezierCurveTo(0.42, -0.3, 0.2, -0.52, 0, -0.66);
  innerShape.bezierCurveTo(-0.2, -0.52, -0.42, -0.3, -0.42, 0.0);
  innerShape.lineTo(-0.42, 0.5);
  innerShape.closePath();

  const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
    steps: 1,
    depth: 0.03,
    bevelEnabled: false
  });
  const innerEmblem = new THREE.Mesh(innerGeo, materials.brass);
  innerEmblem.position.z = 0.08;
  group.add(innerEmblem);

  // Keyhole detail in brass
  const keyholeCircleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
  const keyholeCircle = new THREE.Mesh(keyholeCircleGeo, materials.navy);
  keyholeCircle.rotation.x = Math.PI / 2;
  keyholeCircle.position.set(0, 0.12, 0.11);
  group.add(keyholeCircle);

  const keyholeSlotGeo = new THREE.BoxGeometry(0.06, 0.14, 0.06);
  const keyholeSlot = new THREE.Mesh(keyholeSlotGeo, materials.navy);
  keyholeSlot.position.set(0, 0.04, 0.11);
  group.add(keyholeSlot);

  // Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.5, 1.5);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.95;
  group.add(shadow);

  return group;
}

// (f) Node Network (Connected Campus)
export function createNodeNetwork(materials) {
  const group = new THREE.Group();
  group.name = 'nodeNetwork';

  const nodePositions = [
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(-0.6, 0.1, 0.3),
    new THREE.Vector3(0.65, 0.2, -0.2),
    new THREE.Vector3(-0.35, -0.4, -0.3),
    new THREE.Vector3(0.45, -0.45, 0.35),
    new THREE.Vector3(0, 0.0, 0.6)
  ];

  const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
  nodePositions.forEach((pos, idx) => {
    const mat = idx % 2 === 0 ? materials.brass : materials.royalBlue;
    const node = new THREE.Mesh(nodeGeo, mat);
    node.position.copy(pos);
    group.add(node);
  });

  // Connecting lines
  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [0, 5], [1, 5], [4, 5]
  ];

  const linePoints = [];
  connections.forEach(([i, j]) => {
    linePoints.push(nodePositions[i], nodePositions[j]);
  });

  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lines = new THREE.LineSegments(lineGeo, materials.line);
  group.add(lines);

  // Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.7;
  group.add(shadow);

  return group;
}

// (g) Rising Bar Columns (Stats strip)
export function createBarColumns(materials) {
  const group = new THREE.Group();
  group.name = 'barColumns';

  const bars = [
    { x: -0.5, h: 0.8, mat: materials.navy },
    { x: 0, h: 1.4, mat: materials.royalBlue },
    { x: 0.5, h: 1.1, mat: materials.brass }
  ];

  bars.forEach(({ x, h, mat }) => {
    const colGeo = new THREE.BoxGeometry(0.32, h, 0.32);
    const col = new THREE.Mesh(colGeo, mat);
    col.position.set(x, h / 2, 0);
    group.add(col);

    // Brass cap on top
    const capGeo = new THREE.BoxGeometry(0.34, 0.04, 0.34);
    const cap = new THREE.Mesh(capGeo, materials.brass);
    cap.position.set(x, h + 0.02, 0);
    group.add(cap);
  });

  // Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 1.2);
  const shadow = new THREE.Mesh(shadowGeo, materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0;
  group.add(shadow);

  return group;
}
