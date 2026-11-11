"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import styles from "../page.module.css";
import FlagSun from "./FlagSun";
import sunStyles from "./FlagSun.module.css";
import PlaceScrollReset from "./PlaceScrollReset";
import MotionController from "./motion/MotionController";
import RouteLoader from "./RouteLoader";

export default function LanguageShell({ children, navbar, footer, controls, loadingLabel }: {
  children: ReactNode; navbar: ReactNode; footer: ReactNode; controls: ReactNode; loadingLabel: string;
}) {
  const segment = useSelectedLayoutSegment();
  const showSun = segment === "places" || segment === "tours" || segment === "articles" || segment === "about";
  if (segment === "manas-airport-transfers" || segment === "contact") return <>{children}</>;
  return <main className={styles.main} data-page={segment === "manas" ? "manas" : undefined}>
    <PlaceScrollReset />
    {navbar}
    <section className={[styles.section, showSun && sunStyles.page, segment === "about" && sunStyles.aboutPage].filter(Boolean).join(" ")}>
      {showSun && <><FlagSun /><MotionController /><RouteLoader label={loadingLabel} /></>}
      {children}
    </section>
    {footer}
    {controls}
  </main>;
}
