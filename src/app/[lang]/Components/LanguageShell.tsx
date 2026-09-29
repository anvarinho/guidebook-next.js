"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import styles from "../page.module.css";
import FlagSun from "./FlagSun";
import sunStyles from "./FlagSun.module.css";

export default function LanguageShell({ children, navbar, footer, controls }: {
  children: ReactNode; navbar: ReactNode; footer: ReactNode; controls: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const showSun = segment === "places" || segment === "tours" || segment === "articles" || segment === "about";
  if (segment === "manas-airport-transfers" || segment === "contact") return <>{children}</>;
  return <main className={styles.main} data-page={segment === "manas" ? "manas" : undefined}>
    {navbar}
    <section data-page-motion={showSun ? '' : undefined} className={[styles.section, showSun && sunStyles.page, segment === "about" && sunStyles.aboutPage].filter(Boolean).join(" ")}>
      {showSun && <FlagSun />}
      {children}
    </section>
    {footer}
    {controls}
  </main>;
}
