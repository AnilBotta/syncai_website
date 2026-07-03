"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ChapterProps = {
  children: ReactNode;
  /** Which side the copy panel sits on (opposite the 3D focal point). */
  align?: "left" | "right" | "center";
};

/** One viewport-height overlay block that fades/rises as it enters view. */
export function Chapter({ children, align = "left" }: ChapterProps) {
  return (
    <div
      className={cn(
        "pointer-events-none relative flex h-screen items-center px-5 sm:px-10 lg:px-20",
        align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.45 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn("pointer-events-auto w-full max-w-xl", align === "center" && "text-center")}
      >
        {children}
      </motion.div>
    </div>
  );
}
