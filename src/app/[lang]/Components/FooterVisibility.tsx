"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

export default function FooterVisibility({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();

  // Intro and Manas provide their own page endings.
  return segment === null || segment === "manas" ? null : <>{children}</>;
}
