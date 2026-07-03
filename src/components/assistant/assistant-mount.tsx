"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AssistantWidget = dynamic(
  () => import("./assistant-widget").then((mod) => mod.AssistantWidget),
  { ssr: false }
);

export function AssistantMount() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <AssistantWidget />;
}
