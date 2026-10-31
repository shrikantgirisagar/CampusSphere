import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function setupScene(canvas) {
  const scene = new THREE.Scene();

  const width = canvas.clientWidth || 500;
  const height = canvas.clientHeight || 500;

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });

  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(maxDpr);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Environment PMREM
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environment = envTexture;
  roomEnv.dispose();
  pmremGenerator.dispose();

  // Studio Lighting
  // 1. Warm Key Directional Light
  const keyLight = new THREE.DirectionalLight(0xFFF8EE, 1.4);
  keyLight.position.set(4, 5, 4);
  scene.add(keyLight);

  // 2. Soft Cool Fill Light
  const fillLight = new THREE.DirectionalLight(0xE5EEF9, 0.75);
  fillLight.position.set(-4, 2, 2);
  scene.add(fillLight);

  // 3. Subtle Rim Light with Logo Cyan (#00c6ff) - as authorized
  const rimLight = new THREE.DirectionalLight(0x00c6ff, 0.45);
  rimLight.position.set(0, 4, -4);
  scene.add(rimLight);

  // 4. Ambient studio ground bounce
  const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFBF8F2, 0.4);
  scene.add(hemiLight);

  // Performance Monitoring: first 60 frames
  let frameCount = 0;
  let totalFrameTime = 0;
  let lastTime = performance.now();
  let qualityReduced = false;

  function monitorPerformance() {
    if (frameCount < 60) {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      totalFrameTime += delta;
      frameCount++;

      if (frameCount === 60) {
        const avg = totalFrameTime / 60;
        if (avg > 24 && !qualityReduced) {
          qualityReduced = true;
          renderer.setPixelRatio(1.0);
          console.warn('[3D Scene] Average frame time > 24ms; auto-reduced DPR to 1.0 for battery and smoothness.');
        }
      }
    }
  }

  // Teardown / GPU cleanup
  function destroy() {
    window.__campusSphere3DActive = false;
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);

    scene.traverse((obj) => {
      if (obj.isMesh || obj.isLine) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });

    if (scene.environment) {
      scene.environment.dispose();
    }

    renderer.dispose();
    renderer.forceContextLoss();

    if (canvas.parentElement) {
      canvas.parentElement.classList.remove('webgl-active');
    }
  }

  function handleContextLost(event) {
    event.preventDefault();
    console.warn('[3D Scene] WebGL Context Lost');
    if (canvas.parentElement) {
      canvas.parentElement.classList.remove('webgl-active');
    }
  }

  function handleContextRestored() {
    console.info('[3D Scene] WebGL Context Restored');
    if (canvas.parentElement) {
      canvas.parentElement.classList.add('webgl-active');
    }
  }

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  window.CampusSphereDestroy3D = destroy;

  return {
    scene,
    camera,
    renderer,
    monitorPerformance,
    destroy
  };
}
