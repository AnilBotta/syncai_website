"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "./scroll-progress";
import { cameraCurve, lookCurve } from "./layout";

const position = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

/**
 * Damps scroll progress and drives the camera along the tour curve —
 * the ScrollTrigger `scrub:1` feel without GSAP.
 */
export function CameraRig() {
  const smoothed = useRef(0);

  useFrame((state, delta) => {
    // Exponential damping toward the live scroll position (~scrub lag).
    const k = 1 - Math.exp(-3.5 * delta);
    smoothed.current += (scrollProgress.current - smoothed.current) * k;
    const t = THREE.MathUtils.clamp(smoothed.current, 0, 1);

    cameraCurve.getPointAt(t, position);
    // Gentle pointer parallax on top of the path.
    position.x += state.pointer.x * 0.5;
    position.y += state.pointer.y * 0.3;
    state.camera.position.copy(position);

    lookCurve.getPointAt(t, lookTarget);
    state.camera.lookAt(lookTarget);
  });

  return null;
}
