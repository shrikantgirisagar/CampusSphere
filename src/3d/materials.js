// src/3d/materials.js
// Brand-matched physical materials: Navy, Royal Blue, Ivory, Brass
import {
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  DoubleSide
} from 'three';

export function createMaterials() {
  const materials = {
    // Oxford Navy: deep structural surfaces
    navy: new MeshPhysicalMaterial({
      color: 0x0A2540,
      roughness: 0.35,
      metalness: 0.12,
      clearcoat: 0.25,
      clearcoatRoughness: 0.15
    }),

    // Deep Blue: secondary academic structure
    deepBlue: new MeshPhysicalMaterial({
      color: 0x0D2B67,
      roughness: 0.30,
      metalness: 0.18,
      clearcoat: 0.20
    }),

    // Royal Blue: brand primary core (The Sphere)
    royalBlue: new MeshPhysicalMaterial({
      color: 0x1459D9,
      roughness: 0.38,
      metalness: 0.10,
      clearcoat: 0.32,
      clearcoatRoughness: 0.18
    }),

    // Ivory: warm academic parchment / pages
    ivory: new MeshPhysicalMaterial({
      color: 0xFAF8F3,
      roughness: 0.55,
      metalness: 0.04,
      clearcoat: 0.12
    }),

    // Paper White: cards and calendar body
    paper: new MeshPhysicalMaterial({
      color: 0xFFFFFF,
      roughness: 0.60,
      metalness: 0.02,
      clearcoat: 0.08
    }),

    // Brass Accent: orbit ring, tassel, bell (≤5% highlight)
    brass: new MeshPhysicalMaterial({
      color: 0xB38B3F,
      roughness: 0.22,
      metalness: 0.88,
      clearcoat: 0.40,
      clearcoatRoughness: 0.12
    }),

    // Sky Accent: pillar gradients / support highlights
    sky: new MeshPhysicalMaterial({
      color: 0x3B82F6,
      roughness: 0.30,
      metalness: 0.15,
      clearcoat: 0.25
    }),

    // Contact shadow plane (blurred dark shadow under active objects)
    shadow: new MeshBasicMaterial({
      color: 0x0A2540,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      side: DoubleSide
    })
  };

  return materials;
}
