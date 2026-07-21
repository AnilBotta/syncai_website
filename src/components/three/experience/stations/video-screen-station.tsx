"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import type { Group, MeshBasicMaterial } from "three";
import * as THREE from "three";

type VideoScreenStationProps = {
  src: string;
  /** World-space height of the screen; width derives from the video aspect. */
  height?: number;
};

/**
 * Like ImageScreenStation, but plays a looping muted video as the "screen"
 * texture. The camera flies to it; a gentle float + pointer-tilt keeps it
 * alive. The video autoplays (muted, inline) so browsers allow it.
 */
export function VideoScreenStation({ src, height = 3.0 }: VideoScreenStationProps) {
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const texture = useVideoTexture(src, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: "anonymous",
  });

  // Tag the map sRGB (via the material, not the hook's texture) and track the
  // real video aspect once its metadata loads.
  const [aspect, setAspect] = useState(16 / 9);
  useEffect(() => {
    if (material.current?.map) {
      material.current.map.colorSpace = THREE.SRGBColorSpace;
      material.current.needsUpdate = true;
    }
    const video = texture.image as HTMLVideoElement | undefined;
    if (!video) return;
    const update = () => {
      if (video.videoHeight) setAspect(video.videoWidth / video.videoHeight);
    };
    update();
    video.addEventListener("loadedmetadata", update);
    return () => video.removeEventListener("loadedmetadata", update);
  }, [texture]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.6) * 0.12;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.12, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.08, 0.05);
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[height * aspect, height]} />
        <meshBasicMaterial ref={material} map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
