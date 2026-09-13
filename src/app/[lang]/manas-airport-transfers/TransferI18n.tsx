"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type TransferMessages, type Translate } from "./translations";

const TranslationContext = createContext<Translate>((text) => text);
export function TransferI18n({ messages, children }: { messages: TransferMessages; children: ReactNode }) {
  const translate = useMemo(() => createTranslator(messages), [messages]);
  return <TranslationContext.Provider value={translate}>{children}</TranslationContext.Provider>;
}
export const useTransferText = () => useContext(TranslationContext);
