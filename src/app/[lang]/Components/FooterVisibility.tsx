"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

export default function FooterVisibility({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();

  // The language root renders the intro; all child routes keep the footer.
  return segment === null ? null : <>{children}</>;
}
