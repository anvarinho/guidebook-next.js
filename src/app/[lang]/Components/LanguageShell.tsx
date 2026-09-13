"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import styles from "../page.module.css";

export default function LanguageShell({ children, navbar, footer, controls }: {
  children: ReactNode; navbar: ReactNode; footer: ReactNode; controls: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  if (segment === "manas-airport-transfers") return <>{children}</>;
  return <main className={styles.main}>
    {navbar}
    <section className={styles.section}>{children}</section>
    {footer}
    {controls}
  </main>;
}
