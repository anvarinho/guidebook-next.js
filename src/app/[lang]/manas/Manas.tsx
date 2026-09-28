"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initializeManas } from "./motion";
import type { ManasMessages } from "./translations";

export default function Manas({ children, messages, language }: {
  children: ReactNode; messages: ManasMessages; language: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (root.current) return initializeManas(root.current, messages);
  }, [messages]);

  return <div ref={root} className="manas-page" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>{children}</div>;
}
