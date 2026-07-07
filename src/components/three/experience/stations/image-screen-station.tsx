"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Group, Texture } from "three";
import * as THREE from "three";

type ImageScreenStationProps = {
  src: string;
  /** World-space height of the screen; width derives from the image aspect. */
  height?: number;
};

/**
 * A glowing framed "screen" that displays a static image as a flat plane in
 * the 3D tour. The camera flies to it; a gentle float + pointer-tilt keeps it
 * alive. Dark images blend into the tour's dark space.
 */
export function ImageScreenStation({ src, height = 3.0 }: ImageScreenStationProps) {
  const group = useRef<Group>(null);
  // Tag the texture sRGB on load (off-render) for correct unlit color display.
  const texture = useTexture(src, (loaded) => {
    const tex = (Array.isArray(loaded) ? loaded[0] : loaded) as Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  const width = useMemo(() => {
    const image = texture.image as { width: number; height: number } | undefined;
    const aspect = image && image.height ? image.width / image.height : 1.5;
    return height * aspect;
  }, [texture, height]);

  useFrame((state) => {
    if (!group.current) {
      return;
    }
    const t = state.clock.elapsedTime;
    // Gentle float + subtle pointer-driven tilt.
    group.current.position.y = Math.sin(t * 0.6) * 0.12;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.12, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.08, 0.05);
  });

  return (
    <group ref={group}>
      {/* Bare image plane — no frame, no glow, floating cleanly. */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}
