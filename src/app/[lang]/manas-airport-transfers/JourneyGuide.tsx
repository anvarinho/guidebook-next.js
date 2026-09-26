"use client";

import type { Locale } from "@/lib/i18n.config";
import { useTransferText } from "./TransferI18n";
import { destinationGuides } from "./content";

const arrivalSteps = [
  { title: "beforeFlightTitle", body: "beforeFlightBody", icon: "plane" },
  { title: "afterLandingTitle", body: "afterLandingBody", icon: "pin" },
  { title: "missingDriverTitle", body: "missingDriverBody", icon: "phone" },
] as const;

export function ArrivalGuide() {
  const t = useTransferText();
  return <section className="arrival-guide container" id="arrival-guide" aria-labelledby="arrival-title">
    <div className="section-heading"><h2 id="arrival-title">{t("arrivalTitle")}</h2></div>
    <p className="section-intro">{t("arrivalIntro")}</p>
    <ol className="arrival-steps">
      {arrivalSteps.map(({ title, body, icon }) => <li key={title}>
        <span className="arrival-icon" aria-hidden="true"><svg className="icon"><use href={`#${icon}`} /></svg></span>
        <h3>{t(title)}</h3><p>{t(body)}</p>
      </li>)}
    </ol>
  </section>;
}

export function OnwardGuides({ lang }: { lang: Locale }) {
  const t = useTransferText();
  return <section className="onward-guide container" aria-labelledby="onward-title">
    <h2 id="onward-title">{t("onwardTitle")}</h2>
    <div className="destination-links">{destinationGuides.map(({ slug, labelKey }) =>
      <a href={`/${lang}/places/${slug}`} key={slug}>{t("exploreDestination", { destination: t(labelKey) })}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
    )}</div>
    <div className="publisher-note"><p>{t("publisherText")}</p><a href={`/${lang}/about`}>{t("aboutPublisher")}</a></div>
  </section>;
}
