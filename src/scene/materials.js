import * as THREE from 'three';

// Create procedural baked contact shadow canvas
function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(10, 37, 64, 0.45)');
  gradient.addColorStop(0.35, 'rgba(10, 37, 64, 0.22)');
  gradient.addColorStop(0.7, 'rgba(10, 37, 64, 0.06)');
  gradient.addColorStop(1, 'rgba(10, 37, 64, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createMaterials() {
  const shadowTexture = createContactShadowTexture();

  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x0A2540,
    roughness: 0.65,
    metalness: 0.12
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xB38B3F,
    roughness: 0.28,
    metalness: 0.85
  });

  const ivoryMat = new THREE.MeshStandardMaterial({
    color: 0xFBF8F2,
    roughness: 0.75,
    metalness: 0.05
  });

  const royalBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1459d9,
    roughness: 0.42,
    metalness: 0.25
  });

  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.6,
    depthWrite: false
  });

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x1459d9,
    transparent: true,
    opacity: 0.45
  });

  return {
    navy: navyMat,
    brass: brassMat,
    ivory: ivoryMat,
    royalBlue: royalBlueMat,
    shadow: shadowMat,
    line: lineMat
  };
}
