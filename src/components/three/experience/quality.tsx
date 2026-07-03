"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

type Quality = {
  /** High tier enables Bloom and full dpr. */
  high: boolean;
};

const QualityContext = createContext<Quality>({ high: true });

export function useQuality() {
  return useContext(QualityContext);
}

/**
 * Watches real frame rate: on sustained decline, drops dpr to 1 and turns
 * off the high tier (unmounting Bloom via useQuality consumers).
 */
export function QualityProvider({ children }: { children: ReactNode }) {
  const [high, setHigh] = useState(true);
  const setDpr = useThree((state) => state.setDpr);

  return (
    <QualityContext.Provider value={{ high }}>
      <PerformanceMonitor
        onDecline={() => {
          setHigh(false);
          setDpr(1);
        }}
        onIncline={() => setDpr(1.5)}
      >
        {children}
      </PerformanceMonitor>
    </QualityContext.Provider>
  );
}
