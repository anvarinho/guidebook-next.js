"use client";

import { isRtlLocale } from '@/lib/localeMetadata';
import { useEffect, useRef, type ReactNode } from "react";
import { initializeManas } from "./motion";
import type { InteractiveMessages } from "./interactive-messages";

export default function Manas({ children, messages, language, className = "" }: {
  children: ReactNode; messages: InteractiveMessages; language: string; className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (root.current) return initializeManas(root.current, messages);
  }, [messages]);

  return <div ref={root} className={`manas-page ${className}`} lang={language} dir={isRtlLocale(language) ? "rtl" : "ltr"}>{children}</div>;
}
