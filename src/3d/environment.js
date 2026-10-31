// src/3d/environment.js
// Three.js renderer, PMREM RoomEnvironment, studio lighting and cleanup
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
  AmbientLight,
  PMREMGenerator,
  Color,
  PCFSoftShadowMap
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createEnvironment(canvas) {
  const scene = new Scene();

  // 1. Camera: Narrow elegant FOV (38°) for editorial, non-distorted perspective
  const aspect = canvas.clientWidth / (canvas.clientHeight || 1);
  const camera = new PerspectiveCamera(38, aspect, 0.1, 50);
  camera.position.set(0, 0, 7.5);

  // 2. WebGL Renderer with performance caps
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });

  const maxDPR = 1.75;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDPR);
  renderer.setPixelRatio(dpr);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // 3. PMREM Studio Environment (Zero external HDR files)
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environment = envMap;
  roomEnv.dispose();
  pmremGenerator.dispose();

  // 4. Studio Lighting
  // Soft Ivory Key Light from upper-left
  const keyLight = new DirectionalLight(0xFAF8F3, 1.3);
  keyLight.position.set(4, 7, 5);
  scene.add(keyLight);

  // Subtle ambient foundation
  const ambientLight = new AmbientLight(0xFBF8F2, 0.55);
  scene.add(ambientLight);

  // Restrained Cyan Rim Light from behind-left (brand cap gradient accent)
  const rimLight = new DirectionalLight(0x00C6FF, 0.65);
  rimLight.position.set(-5, 2, -4);
  scene.add(rimLight);

  // 5. Performance Monitor (Rolling frame times)
  const frameTimes = [];
  let lastTime = performance.now();
  let frameCount = 0;

  function monitorPerformance() {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    frameCount++;

    if (delta > 0 && delta < 200) {
      frameTimes.push(delta);
      if (frameTimes.length > 60) frameTimes.shift();
    }

    if (frameCount === 180) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / (frameTimes.length || 1);
      const fps = Math.round(1000 / avg);
      console.info(`[CampusSphere 3D] Running at ~${fps} FPS (avg frame time: ${avg.toFixed(2)}ms)`);
    }
  }

  // 6. Context Loss & Recovery
  function onContextLost(event) {
    event.preventDefault();
    console.warn('[CampusSphere 3D] WebGL Context Lost');
    if (canvas.parentElement) {
      canvas.parentElement.classList.remove('webgl-active');
    }
  }

  function onContextRestored() {
    console.info('[CampusSphere 3D] WebGL Context Restored');
    if (canvas.parentElement) {
      canvas.parentElement.classList.add('webgl-active');
    }
  }

  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);

  // 7. Teardown & Resource Disposal
  function destroy() {
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);

    scene.traverse((obj) => {
      if (obj.isMesh) {
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
      scene.environment = null;
    }

    renderer.dispose();
    renderer.forceContextLoss();

    if (canvas.parentElement) {
      canvas.parentElement.classList.remove('webgl-active');
    }
  }

  return {
    scene,
    camera,
    renderer,
    monitorPerformance,
    destroy
  };
}
