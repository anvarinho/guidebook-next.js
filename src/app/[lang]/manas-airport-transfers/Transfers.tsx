/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */
"use client";

import { useRouter } from "next/navigation";
import { useTransferText } from "./TransferI18n";
import { transferLanguages } from "./translations";
import type { Locale } from "@/lib/i18n.config";
import { useTransferDirectory } from "./useTransferDirectory";
import styles from "./transfers.module.css";
import { getTransferFaq } from "./content";
import { ArrivalGuide, OnwardGuides } from "./JourneyGuide";
import { ComparisonTable, ProviderPrice } from "./TransferComparison";
import { PlacesReveal } from "../places/components/PlacesMotion";
import { contactHref, destinations, type Destination, type Vehicle, type Sort, type ProviderId } from "./transfer-data";

type ProviderCardProps = {
  id: ProviderId; destination: Destination; vehicle: Vehicle; message: string;
  comparing: boolean; shortlist: ProviderId[]; onToggle: (id: ProviderId) => void; lang: string;
};
function ProviderCard({ id, destination, vehicle, message, comparing, shortlist, onToggle, lang }: ProviderCardProps) {
  const t = useTransferText();
  switch (id) {
case "central": return (
<article data-provider="central" id="provider-central" aria-labelledby="name-central" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="central" aria-label={t("Add Central Asia to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-central"><svg className="icon" aria-hidden="true">
                        <use href="#mountain" /></svg></span>
                    <div>
                      <p className="provider-category">{t("LOCAL TRANSFER SERVICE")}</p>
                      <h3 id="name-central">{t("Central Asia")}</h3>
                      <p className="provider-domain">{t("central-asia.live")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="provider-description">{" "}{t("s5")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+996500490806"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +996 500 490 806</a><a className="website-link" target="_blank" rel="noopener noreferrer" href={`/${lang}/tours/manas-airport-transfers`}>{t("Transfer details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a><a className="button button-orange booking-link" data-channel="whatsapp" target="_blank" rel="noopener noreferrer" href={contactHref(id, message)}><svg className="icon" aria-hidden="true">
                      <use href="#chat" />
                    </svg>{" "}{t("Book on WhatsApp")}</a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#plane" />
                    </svg>{" "}{t("Flight monitoring")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#users" />
                    </svg>{" "}{t("Child seats on request")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#clock" />
                    </svg>{" "}{t("24/7 support")}</span>
                </div>
                    <p>{" "}{t("s12")}{" "}</p>
                    <a target="_blank" rel="noopener noreferrer" href={`/${lang}/tours/manas-airport-transfers`}>{t("View published service information")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a>
                  </div>
                </details>
              </article>
);
case "compass": return (
<article data-provider="compass" id="provider-compass" aria-labelledby="name-compass" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="compass" aria-label={t("Add Compass Transfer to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-compass"><svg className="icon" aria-hidden="true">
                        <use href="#compass" /></svg></span>
                    <div>
                      <p className="provider-category">{t("TRANSFER CONTACT")}</p>
                      <h3 id="name-compass">{t("Compass Transfer")}</h3>
                      <p className="provider-domain">{t("Contact directly")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="provider-description">{" "}{t("s18")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+996990312321"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +996 990 312 321</a><span className="website-link">{t("Direct booking by phone")}</span><a className="button button-outline booking-link" href={contactHref(id, message)}>{t("Call Compass")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#phone" /></svg></a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>{" "}{t("Direct phone contact")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#car" />
                    </svg>{" "}{t("Vehicle options on request")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#pin" />
                    </svg>{" "}{t("Confirm your route")}</span>
                </div>
                    <p>{" "}{t("s24")}{" "}</p>
                  </div>
                </details>
              </article>
);
case "manas": return (
<article data-provider="manas" id="provider-manas" aria-labelledby="name-manas" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="manas" aria-label={t("Add Manas Taxi to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-manas"><svg className="icon" aria-hidden="true">
                        <use href="#car" /></svg></span>
                    <div>
                      <p className="provider-category">{t("AIRPORT TAXI SERVICE")}</p>
                      <h3 id="name-manas">{t("Manas Taxi")}</h3>
                      <p className="provider-domain">{t("manastaxi.kg")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="contact-update">{" "}{t("Contact number updated by the directory owner.")}{" "}</p>
                <p className="provider-description">{" "}{t("s30")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+996999693000"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +996 999 693 000</a><a className="website-link" href="https://manastaxi.kg/en" target="_blank" rel="noopener noreferrer">{t("Transfer details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a><a className="button button-outline booking-link" data-channel="whatsapp" target="_blank" rel="noopener noreferrer" href={contactHref(id, message)}><svg className="icon" aria-hidden="true">
                      <use href="#chat" />
                    </svg>{" "}{t("Contact provider")}</a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#pin" />
                    </svg>{" "}{t("City & regional routes")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#plane" />
                    </svg>{" "}{t("Flight tracking")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#clock" />
                    </svg>{" "}{t("24/7 service")}</span>
                </div>
                    <p>{" "}{t("s35")}{" "}</p>
                    <a href="https://manastaxi.kg/en" target="_blank" rel="noopener noreferrer">{t("View published service information")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a><a href="https://manastaxi.kg/en/contacts" target="_blank" rel="noopener noreferrer">{t("Contact source")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a>
                  </div>
                </details>
              </article>
);
case "advantour": return (
<article data-provider="advantour" id="provider-advantour" aria-labelledby="name-advantour" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="advantour" aria-label={t("Add Advantour to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-advantour">{t("a")}<span>.</span></span>
                    <div>
                      <p className="provider-category">{" "}{t("TOUR & TRANSPORT OPERATOR")}{" "}</p>
                      <h3 id="name-advantour">{t("Advantour")}</h3>
                      <p className="provider-domain">{t("advantour.com")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="provider-description">{" "}{t("s42")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+996312909357"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +996 312 909 357</a><a className="website-link" href="https://www.advantour.com/kyrgyzstan/transfers/manas_airport-bishkek.htm" target="_blank" rel="noopener noreferrer">{t("Transfer details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a><a className="button button-outline booking-link" data-channel="whatsapp" target="_blank" rel="noopener noreferrer" href={contactHref(id, message)}><svg className="icon" aria-hidden="true">
                      <use href="#chat" />
                    </svg>{" "}{t("Contact provider")}</a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#users" />
                    </svg>{" "}{t("Group vehicle options")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#clock" />
                    </svg>{" "}{t("20-minute waiting allowance")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#bag" />
                    </svg>{" "}{t("Meet & greet")}</span>
                </div>
                    <p>{" "}{t("s46")}{" "}</p>
                    <a href="https://www.advantour.com/kyrgyzstan/transfers.htm" target="_blank" rel="noopener noreferrer">{t("View published route prices")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a><a href="https://www.advantour.com/kyrgyzstan/contacts.htm" target="_blank" rel="noopener noreferrer">{t("Contact source")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a>
                  </div>
                </details>
              </article>
);
case "concept": return (
<article data-provider="concept" id="provider-concept" aria-labelledby="name-concept" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="concept" aria-label={t("Add Kyrgyz Concept to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-concept">{t("KC")}</span>
                    <div>
                      <p className="provider-category">{" "}{t("TRAVEL & TRANSPORT COMPANY")}{" "}</p>
                      <h3 id="name-concept">{t("Kyrgyz Concept")}</h3>
                      <p className="provider-domain">{t("kyrgyzconcept.kg")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="provider-description">{" "}{t("s53")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+996312900883"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +996 312 900 883</a><a className="website-link" href="https://kyrgyzconcept.kg/en/trp/transfer/" target="_blank" rel="noopener noreferrer">{t("Transfer details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a><a className="button button-outline booking-link" target="_blank" rel="noopener noreferrer" href={contactHref(id, message)}>{t("Request a quote")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#pin" />
                    </svg>{" "}{t("Name-sign pickup")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#clock" />
                    </svg>{" "}{t("2-hour flight-delay wait")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#bag" />
                    </svg>{" "}{t("Luggage assistance")}</span>
                </div>
                    <p>{" "}{t("s58")}{" "}</p>
                    <a href="https://kyrgyzconcept.kg/en/trp/transfer/" target="_blank" rel="noopener noreferrer">{t("View published service information")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a>
                  </div>
                </details>
              </article>
);
case "welcome": return (
<article data-provider="welcome" id="provider-welcome" aria-labelledby="name-welcome" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="welcome" aria-label={t("Add WelcomeTaxi to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-welcome">{t("W")}</span>
                    <div>
                      <p className="provider-category">{t("TRANSFER BOOKING SERVICE")}</p>
                      <h3 id="name-welcome">{t("WelcomeTaxi")}</h3>
                      <p className="provider-domain">{t("welcome.taxi")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="provider-description">{" "}{t("s64")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+447893930990"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +44 7893 930990</a><a className="website-link" href="https://welcome.taxi/en/airports/bsz" target="_blank" rel="noopener noreferrer">{t("Transfer details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a><a className="button button-outline booking-link" href={contactHref(id, message)}>{t("Get an online quote")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#globe" />
                    </svg>{" "}{t("Online booking")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#pin" />
                    </svg>{" "}{t("Karakol & lakeside routes")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#users" />
                    </svg>{" "}{t("Vehicle choice when booking")}</span>
                </div>
                    <p>{" "}{t("s69")}{" "}</p>
                    <a href="https://welcome.taxi/en/airports/bsz" target="_blank" rel="noopener noreferrer">{t("WelcomeTaxi service information")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a><a href="https://welcome.taxi/en/contacts" target="_blank" rel="noopener noreferrer">{t("Contact source")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a>
                  </div>
                </details>
              </article>
);
case "cat": return (
<article data-provider="cat" id="provider-cat" aria-labelledby="name-cat" className={`provider-card${shortlist.includes(id) ? " is-selected" : ""}`}>
                <label className="compare-choice" hidden={!comparing}><input type="checkbox" value="cat" aria-label={t("Add C.A.T. Company to comparison")} checked={shortlist.includes(id)} disabled={shortlist.length === 3 && !shortlist.includes(id)} onChange={() => onToggle(id)} />{" "}{t("Compare")}</label>
                <div className="provider-main">
                  <div className="provider-identity">
                    <span className="provider-logo logo-cat">{t("CAT")}</span>
                    <div>
                      <p className="provider-category">{" "}{t("TRAVEL & TRANSPORT COMPANY")}{" "}</p>
                      <h3 id="name-cat">{t("C.A.T. Company")}</h3>
                      <p className="provider-domain">{t("cat.kg")}</p>
                    </div>
                  </div>
                  <ProviderPrice id={id} destination={destination} vehicle={vehicle} />
                </div>
                <p className="provider-description">{" "}{t("s75")}{" "}</p>
                
                
                <div className="provider-footer">
                  <a className="phone-link" href="tel:+996312663664"><svg className="icon" aria-hidden="true">
                      <use href="#phone" />
                    </svg>
                    +996 312 663 664</a><a className="website-link" href="https://cat.kg/en/" target="_blank" rel="noopener noreferrer">{t("Transfer details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#external" /></svg></a><a className="button button-outline booking-link" href={contactHref(id, message)}>{t("Call for a quote")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#phone" /></svg></a>
                </div>
                <details className="provider-details">
                  <summary>{" "}{t("Vehicles & booking details")}{" "}<svg className="icon" aria-hidden="true">
                      <use href="#chevron" />
                    </svg>
                  </summary>
                  <div>
<div className="features">
                  <span><svg className="icon" aria-hidden="true">
                      <use href="#plane" />
                    </svg>{" "}{t("Airport transfers")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#pin" />
                    </svg>{" "}{t("Regional transport enquiries")}</span><span><svg className="icon" aria-hidden="true">
                      <use href="#users" />
                    </svg>{" "}{t("Group transport enquiries")}</span>
                </div>
                    <p>{" "}{t("s80")}{" "}</p>
                    <a href="https://cat.kg/en/" target="_blank" rel="noopener noreferrer">{t("C.A.T. Company service information")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a><a href="https://cat.kg/en/" target="_blank" rel="noopener noreferrer">{t("Contact source")}{" "}<svg className="icon" aria-hidden="true">
                        <use href="#external" /></svg></a>
                  </div>
                </details>
              </article>
);
  }
}

export default function Transfers({ lang }: { lang: Locale }) {
  const t = useTransferText();
  const router = useRouter();
  const { destination, vehicle, sort, ids, startingFare, published, message, shortlist, comparing, setComparing, toggleProvider, status, comparisonOpen, openComparison, closeComparison, formRef, submitTrip, updateTrip, changeRoute, today, handoff, copyTrip, shareRoute, copyFallback, copyRef, compareButtonRef, comparisonRef, menuOpen, setMenuOpen, menuButtonRef, navRef, headerRef, handleNavBlur, navigateRoute, year } = useTransferDirectory(t);
  return (<div className={styles["transfers-page"]} lang={transferLanguages[lang].tag} dir={lang === "ae" ? "rtl" : "ltr"}>

    <a className="skip-link" href="#route-search">{t("Skip to transfer booking")}</a>
    <svg className="symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <symbol id="mountain" viewBox="0 0 32 32">
        <path d="m2 25 10-17 7 12 4-7 7 12H2Z" />
        <path d="m8 15 4 3 3-4m5 4 3 2 2-3" />
      </symbol>
      <symbol id="arrow" viewBox="0 0 24 24">
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </symbol>
      <symbol id="external" viewBox="0 0 24 24">
        <path d="M6 18 18 6M6 6h12v12" />
      </symbol>
      <symbol id="chevron" viewBox="0 0 24 24">
        <path d="m8 10 4 4 4-4" />
      </symbol>
      <symbol id="plane" viewBox="0 0 24 24">
        <path d="m21 3-6 18-4-8-8-4 18-6ZM11 13 21 3" />
      </symbol>
      <symbol id="pin" viewBox="0 0 24 24">
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
        <circle cx="12" cy="10" r="2.3" />
      </symbol>
      <symbol id="car" viewBox="0 0 24 24">
        <path d="m4 9 2-5h12l2 5M3 10h18v8H3v-8ZM5 18v2m14-2v2M6 13h2m8 0h2M3 9H1m20 0h2" />
      </symbol>
      <symbol id="check" viewBox="0 0 24 24">
        <path d="m5 12 4 4L19 6" />
      </symbol>
      <symbol id="phone" viewBox="0 0 24 24">
        <path d="m8 3 3 5-3 2c1 3 3 5 6 6l2-3 5 3-1 4C10 23 1 14 4 4l4-1Z" />
      </symbol>
      <symbol id="chat" viewBox="0 0 24 24">
        <path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5A9 9 0 1 1 21 11.5Z" />
        <path d="M8 9h8m-8 4h5" />
      </symbol>
      <symbol id="globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </symbol>
      <symbol id="clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </symbol>
      <symbol id="info" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v.1" />
      </symbol>
      <symbol id="bag" viewBox="0 0 24 24">
        <rect x="5" y="6" width="14" height="14" rx="2" />
        <path d="M9 6V3h6v3M9 10v6m6-6v6M8 20v1m8-1v1" />
      </symbol>
      <symbol id="users" viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3" />
      </symbol>
      <symbol id="shield" viewBox="0 0 24 24">
        <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z" />
        <path d="m8 12 3 3 5-6" />
      </symbol>
      <symbol id="compass" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-3 5-5 3 3-5 5-3Z" />
      </symbol>
      <symbol id="search" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </symbol>
    </svg>

    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <a className="brand" aria-label={t("Central Asia home")} href={`/${lang}`}><span className="brand-mark"><svg className="icon" aria-hidden="true">
              <use href="#mountain" /></svg></span><span>{t("central asia")}<span className="brand-period">.</span><small>{t("GO FURTHER. FEEL CLOSER.")}</small></span></a>
        <button className="menu-toggle" type="button" aria-controls="main-nav" aria-expanded={menuOpen} aria-label={menuOpen ? t("Close navigation") : t("Open navigation")} onClick={() => setMenuOpen(!menuOpen)} ref={menuButtonRef}>
          <span></span><span></span><span></span>
        </button>
        <nav id="main-nav" aria-label={t("Main navigation")} className={menuOpen ? "is-open" : ""} ref={navRef} onClick={() => setMenuOpen(false)} onBlur={handleNavBlur}>
          <a href="#route-prices">{t("Routes & prices")}</a>
          <a href="#providers">{t("Compare companies")}</a>
          <a href="#questions">{t("FAQs")}</a>
          <a className="nav-help" href="#route-search">{t("Book a transfer")}{" "}<svg className="icon" aria-hidden="true"><use href="#chat" /></svg></a>
        </nav>
        <label className="transfer-language">
          <span className="sr-only">{t("Language")}</span>
          <select aria-label={t("Language")} value={lang} onChange={event => {
            const query = new URLSearchParams({ destination, vehicle, sort });
            router.push(`/${event.target.value}/manas-airport-transfers?${query}`);
          }}>
            {Object.entries(transferLanguages).map(([locale, language]) => <option key={locale} value={locale}>{language.name}</option>)}
          </select>
        </label>
      </div>
    </header>

    <main id="main">
      <section className="hero-section">
        <div className="container">
          <nav className="breadcrumbs" aria-label={t("Breadcrumb")}>
            <a href={`/${lang}`}>{t("Home")}</a><span>/</span><a href={`/${lang}/places`}>{t("Kyrgyzstan")}</a><span>/</span><span aria-current="page">{t("Airport transfers")}</span>
          </nav>
          <div className="hero-grid">
            <PlacesReveal className="hero-copy">
              <p className="eyebrow">{t("PRIVATE AIRPORT TRANSFERS · KYRGYZSTAN")}</p>
              <h1>{t("Manas Airport transfers to Bishkek & beyond")}</h1>
              <p className="hero-description">{t("s98")}</p>
              <div className="hero-actions"><a className="button button-orange" href="#providers">{t("Compare companies")}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a><a className="text-link" href="#route-search">{t("Book a transfer")}</a></div>
              <div className="hero-points"><span><svg className="icon" aria-hidden="true"><use href="#check" /></svg>{" "}{t("City & regional routes")}</span><span><svg className="icon" aria-hidden="true"><use href="#check" /></svg>{" "}{t("Contact directly")}</span></div>
            </PlacesReveal>
            <PlacesReveal className="hero-visual" order={1}>
              <img src="/manas-airport-transfers/airport-pickup.webp" srcSet="                   /manas-airport-transfers/airport-pickup-640.webp  640w,                   /manas-airport-transfers/airport-pickup.webp     1280w                 " sizes="(max-width: 600px) calc(100vw - 36px), 580px" width="1280" height="853" alt={t("s99")} fetchPriority="high" />
              <div className="photo-shade"></div>
              <div className="hero-photo-caption"><span className="photo-icon"><svg className="icon" aria-hidden="true"><use href="#plane" /></svg></span><div><span>{t("Airport transfers")}</span><strong>{t("Manas Airport")}</strong></div><span className="photo-arrow" aria-hidden="true">↗</span></div>
              <span className="photo-credit">{t("AI-generated travel illustration")}</span>
            </PlacesReveal>
          </div>

          
          
        </div>
      </section>
<section className="route-guide container" id="route-prices" aria-labelledby="route-prices-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("PLAN YOUR AIRPORT JOURNEY")}</p>
            <h2 id="route-prices-title">{t("Airport transfer routes & starting prices")}</h2>
          </div>
        </div>
        <p className="section-intro">{t("s133")}</p>
        
        <div className="route-tips">
          <article>
            <figure className="route-tip-photo">
              <img src="/manas-airport-transfers/bishkek-city-640.webp" srcSet="/manas-airport-transfers/bishkek-city-640.webp 640w, /manas-airport-transfers/bishkek-city.webp 1280w" sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 900px) 30vw, 382px" width="640" height="427" alt={t("s134")} loading="lazy" decoding="async" fetchPriority="auto" />
              <figcaption>{t("AI-generated travel illustration")}</figcaption>
            </figure>
            <h3>{t("Manas Airport to Bishkek")}</h3>
            <p>{" "}{t("s136")}{" "}</p>
            
            <p className="route-starting-price">{t("Central Asia · from $18 per transfer")}</p><a className="text-link route-book" href="?destination=bishkek&vehicle=all&sort=featured#route-search" data-destination="bishkek" onClick={(event) => navigateRoute(event, "bishkek", true)}>{t("Book a Bishkek transfer")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
            <a className="text-link route-filter" href="?destination=bishkek&vehicle=all&sort=featured#providers" data-destination="bishkek" onClick={(event) => navigateRoute(event, "bishkek", false)} aria-current={destination === "bishkek" ? "true" : undefined}>{t("Compare Bishkek transfers")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
          </article>
          <article className="karakol-tip">
            <figure className="route-tip-photo">
              <img src="/manas-airport-transfers/karakol-road-640.webp" srcSet="/manas-airport-transfers/karakol-road-640.webp 640w, /manas-airport-transfers/karakol-road.webp 1280w" sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 900px) 30vw, 382px" width="640" height="427" alt={t("s140")} loading="lazy" fetchPriority="auto" />
              <figcaption>{t("AI-generated travel illustration")}</figcaption>
            </figure>
            <h3>{t("Manas Airport to Karakol")}</h3>
            <p>{" "}{t("s142")}{" "}</p>
            
            <p className="route-starting-price">{t("Central Asia · from $160 per transfer")}</p><a className="text-link route-book" href="?destination=karakol&vehicle=all&sort=featured#route-search" data-destination="karakol" onClick={(event) => navigateRoute(event, "karakol", true)}>{t("Book a Karakol transfer")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
            <a className="text-link route-filter" href="?destination=karakol&vehicle=all&sort=featured#providers" data-destination="karakol" onClick={(event) => navigateRoute(event, "karakol", false)} aria-current={destination === "karakol" ? "true" : undefined}>{t("Compare Karakol transfers")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
          </article>
          <article>
            <figure className="route-tip-photo">
              <img src="/manas-airport-transfers/cholpon-ata-lake-640.webp" srcSet="/manas-airport-transfers/cholpon-ata-lake-640.webp 640w, /manas-airport-transfers/cholpon-ata-lake.webp 1280w" sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 900px) 30vw, 382px" width="640" height="427" alt={t("s146")} loading="lazy" decoding="async" fetchPriority="auto" />
              <figcaption>{t("AI-generated travel illustration")}</figcaption>
            </figure>
            <h3>{t("Manas Airport to Cholpon-Ata")}</h3>
            <p>{" "}{t("s148")}{" "}</p>
            
            <p className="route-starting-price">{t("Central Asia · from $120 per transfer")}</p><a className="text-link route-book" href="?destination=cholpon&vehicle=all&sort=featured#route-search" data-destination="cholpon" onClick={(event) => navigateRoute(event, "cholpon", true)}>{t("Book a Cholpon-Ata transfer")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
            <a className="text-link route-filter" href="?destination=cholpon&vehicle=all&sort=featured#providers" data-destination="cholpon" onClick={(event) => navigateRoute(event, "cholpon", false)} aria-current={destination === "cholpon" ? "true" : undefined}>{t("Compare Cholpon-Ata transfers")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
          </article>
        </div>
      <details className="all-prices"><summary>{t("Compare starting prices from all seven companies")}</summary><div className="table-scroll" role="region" aria-label={t("s153")} tabIndex={0}>
          <table className="price-table">
            <caption>{" "}{t("s154")}{" "}</caption>
            <thead>
              <tr>
                <th scope="col">{t("Destination")}</th>
                <th scope="col">
                  <a href="#provider-central">{t("Central Asia")}</a>
                </th>
                <th scope="col">
                  <a href="#provider-compass">{t("Compass Transfer")}</a>
                </th>
                <th scope="col"><a href="#provider-manas">{t("Manas Taxi")}</a></th>
                <th scope="col"><a href="#provider-advantour">{t("Advantour")}</a></th>
                <th scope="col">
                  <a href="#provider-concept">{t("Kyrgyz Concept")}</a>
                </th>
                <th scope="col"><a href="#provider-welcome">{t("WelcomeTaxi")}</a></th>
                <th scope="col"><a href="#provider-cat">{t("C.A.T. Company")}</a></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{t("Bishkek city")}</th>
                <td>$18</td>
                <td>{t("Request quote")}</td>
                <td>$10</td>
                <td>$60</td>
                <td>{t("Request quote")}</td>
                <td>{t("Request quote")}</td>
                <td>{t("Request quote")}</td>
              </tr>
              <tr>
                <th scope="row">{t("Karakol")}</th>
                <td>$160</td>
                <td>{t("Request quote")}</td>
                <td>$106</td>
                <td>$210</td>
                <td>{t("Request quote")}</td>
                <td>{t("Request quote")}</td>
                <td>{t("Request quote")}</td>
              </tr>
              <tr>
                <th scope="row">{t("Cholpon-Ata")}</th>
                <td>$120</td>
                <td>{t("Request quote")}</td>
                <td>$71</td>
                <td>$140</td>
                <td>{t("Request quote")}</td>
                <td>{t("Request quote")}</td>
                <td>{t("Request quote")}</td>
              </tr>
            </tbody>
          </table>
        </div></details>
        <p className="table-note">{" "}{t("s156")}{" "}</p>
</section>

      
      

      <section className="directory-section container" id="providers" aria-labelledby="providers-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("EXPLORE YOUR OPTIONS")}</p>
            <h2 id="providers-title">{destination === "bishkek" ? t("Compare airport transfer companies") : t("Compare {destination} transfers", { destination: t(destinations[destination]) })}</h2>
          </div>
          <a href="#how-it-works" className="text-link">{t("How it works")}{" "}<svg className="icon" aria-hidden="true"><use href="#arrow" /></svg></a>
        </div>
        <p className="section-intro comparison-intro">{t("s251")}</p>
        <fieldset className="company-filters">
          <legend className="sr-only">{t("Compare companies")}</legend>
          <label htmlFor="compare-destination">{t("Destination")}
            <select id="compare-destination" value={destination} onChange={event => changeRoute({ destination: event.currentTarget.value as Destination })}>
              <option value="bishkek">{t("Bishkek city")}</option><option value="karakol">{t("Karakol")}</option><option value="cholpon">{t("Cholpon-Ata")}</option>
            </select>
          </label>
          <label htmlFor="compare-vehicle">{t("Vehicle")}
            <select id="compare-vehicle" value={vehicle} onChange={event => changeRoute({ vehicle: event.currentTarget.value as Vehicle })}>
              <option value="all">{t("Any suitable vehicle")}</option><option value="sedan">{t("Sedan")}</option><option value="minivan">{t("Minivan")}</option><option value="suv">{t("SUV")}</option>
            </select>
          </label>
        </fieldset>
        <div className="route-context" id="route-context" hidden={destination === "bishkek"}>
          
          <div>
            <p className="eyebrow">{t("YOUR SELECTED JOURNEY")}</p>
            <h3 id="route-context-title">{t("Manas Airport to")}{" "}{t(destinations[destination])}</h3>
            <p id="route-context-description">{destination === "karakol" ? t("s219") : t("s220")}</p>
            <div className="route-facts" id="route-facts"><span>{published}{" "}{t("published fares")}</span><span>{ids.length - published}{" "}{t("quotes on request")}</span></div>
          </div>
        </div>
        <details className="comparison-options" open={comparing} onToggle={(event) => setComparing(event.currentTarget.open)}><summary>{t("Compare companies side by side")}</summary><div className="comparison-tools" id="comparison-tools">
          <p>{t("Select up to three companies to compare.")}</p>
          <div>
            <button className="button button-outline" id="compare-open" type="button" disabled={shortlist.length < 2} onClick={openComparison} ref={compareButtonRef}>{t("Compare selected (")}{shortlist.length})</button><button className="utility-button" id="share-route" type="button" onClick={shareRoute}>{" "}{t("Copy route link")}</button><button className="utility-button" id="copy-trip" type="button" onClick={copyTrip}>{" "}{t("Copy trip enquiry")}{" "}</button>
          </div>
          <p id="compare-status" role="status" aria-live="polite">{status}</p>
        {copyFallback && <textarea id="copy-fallback" aria-label={t("Text to copy")} readOnly value={copyFallback} ref={copyRef} onFocus={event => event.currentTarget.select()} />}</div></details>
        <section className="comparison-panel" id="comparison-panel" aria-labelledby="comparison-title" tabIndex={-1} hidden={!comparisonOpen} ref={comparisonRef}>
          <div className="comparison-heading">
            <h3 id="comparison-title">{t("Your transfer shortlist")}</h3>
            <button className="utility-button" id="compare-close" type="button" onClick={closeComparison}>{" "}{t("Close comparison")}{" "}</button>
          </div>
          <div className="table-scroll" tabIndex={0} role="region" aria-label={t("Selected transfer company comparison")}>
            <ComparisonTable ids={shortlist} destination={destination} vehicle={vehicle} message={message} />
          </div>
          <p>{" "}{t("s172")}{" "}</p>
        </section>
        <div className="directory-layout">
          <div className="results-column">
            <div className="results-toolbar">
              <p id="result-count" role="status" aria-live="polite"><strong>{ids.length}{" "}{t("companies")}</strong>{" "}{t("· Manas Airport to")}{" "}{t(destinations[destination])}</p>
              <label className="sort-label">{t("Sort by")}{" "}<select id="sort" value={sort} onChange={(event) => changeRoute({ sort: event.target.value as Sort })}>
                  <option value="featured">{t("Default order")}</option>
                  <option value="name">{t("Name: A–Z")}</option>
                  <option value="price">{t("Starting price: low to high")}</option>
                </select></label>
            </div>
            <div className="provider-list" id="provider-list">{ids.map((id, index) => <PlacesReveal key={id} order={index}><ProviderCard lang={lang} id={id} destination={destination} vehicle={vehicle} message={message} comparing={comparing} shortlist={shortlist} onToggle={toggleProvider} /></PlacesReveal>)}</div>
            <p className="results-note">{" "}{t("s180")}{" "}</p>
            <noscript><p className="noscript-note">{" "}{t("s181")}{" "}</p></noscript>
          </div>

          
        </div>
      </section>

      

      <section className="booking-section container" aria-labelledby="booking-title">
          <form className="route-search booking-form" id="route-search" action="https://wa.me/996500490806" aria-labelledby="booking-title" ref={formRef} onSubmit={submitTrip} onChange={updateTrip}>
            <div className="booking-heading">
              <div className="booking-title-group">
                <span className="booking-emblem" aria-hidden="true"><svg className="icon"><use href="#plane" /></svg></span>
                <div><h2 id="booking-title">{t("Request your transfer with Central Asia")}</h2><p>{t("From Manas Airport · with Central Asia")}</p></div>
              </div>
              <p id="booking-fare" aria-live="polite">{startingFare === null ? t("Request your vehicle price") : t("{destination} · from ${price} per transfer", { destination: t(destinations[destination]), price: startingFare })}</p>
            </div>
            <div className="booking-fields">
              <label htmlFor="destination">{t("Destination")}<select id="destination" name="destination" value={destination} onChange={(event) => { const city = event.currentTarget.value; if (city === "bishkek" || city === "karakol" || city === "cholpon") changeRoute({ destination: city }); }}><option value="bishkek">{t("Bishkek city")}</option><option value="karakol">{t("Karakol")}</option><option value="cholpon">{t("Cholpon-Ata")}</option></select></label>
              <label htmlFor="vehicle">{t("Vehicle")}<select id="vehicle" name="vehicle" aria-describedby={vehicle === "all" ? "vehicle-help" : undefined} value={vehicle} onChange={(event) => { const selected = event.target.value as Vehicle; changeRoute({ vehicle: selected }); }}><option value="all">{t("Help me choose")}</option><option value="sedan">{t("Sedan")}</option><option value="minivan">{t("Minivan")}</option><option value="suv">{t("SUV")}</option></select>{vehicle === "all" && <small className="vehicle-help" id="vehicle-help">{t("We'll suggest a vehicle from your passenger and luggage details.")}</small>}</label>
              <label htmlFor="trip-name">{t("Your name")}<input id="trip-name" autoComplete="name" maxLength={100} required placeholder={t("Full name")} name="name" /></label>
              <label htmlFor="trip-date">{t("Arrival date")}<input type="date" id="trip-date" required name="date" min={today} /></label>
              <label htmlFor="trip-time">{t("Arrival time")}{" "}<span>{t("(Kyrgyzstan time)")}</span><input type="time" id="trip-time" required name="time" /></label>
              <label htmlFor="trip-passengers">{t("Passengers")}<input type="number" id="trip-passengers" min="1" max="50" step="1" required inputMode="numeric" name="passengers" defaultValue="2" /></label>
              <label htmlFor="trip-bags">{t("Suitcases")}<input type="number" id="trip-bags" min="0" max="50" step="1" required inputMode="numeric" name="bags" defaultValue="2" /></label>
              <label htmlFor="trip-flight">{t("Flight number")}{" "}<span>{t("(optional)")}</span><input id="trip-flight" maxLength={30} placeholder={t("e.g. KC 109")} autoComplete="off" name="flight" /></label>
              <label htmlFor="trip-address" className="booking-wide">{t("Hotel or drop-off address")}<input id="trip-address" maxLength={180} placeholder={t("Hotel name or full address")} autoComplete="off" required name="address" /></label>
              <label htmlFor="trip-notes" className="booking-wide">{t("Extra requirements")}{" "}<span>{t("(optional)")}</span><textarea id="trip-notes" maxLength={300} rows={2} placeholder={t("Child seats, ski equipment, extra stops…")} name="notes"></textarea></label>
            </div>
            <div className="booking-actions"><button className="button button-orange" id="book-transfer" type="submit">{t("Book a transfer")}{" "}<svg className="icon" aria-hidden="true"><use href="#chat" /></svg></button><p id="booking-note">{t("s125")}</p></div>
            <div id="booking-handoff" role="status" hidden={!handoff}><p>{t("s126")}</p><a id="booking-whatsapp" target="_blank" rel="noopener noreferrer" href={contactHref("central", message)}>{t("Continue to WhatsApp")}</a></div>
            <noscript><p>{t("To send the form details, enable JavaScript. You can also")}{" "}<a href="https://wa.me/996500490806">{t("contact Central Asia on WhatsApp")}</a>{" "}{t("and share your trip details directly.")}</p></noscript>
          </form>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("HOW BOOKING WORKS")}</p>
              <h2>{t("How to book your airport transfer")}</h2>
            </div>
          </div>
          <p className="section-intro">{t("s252")}</p>
          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <h3>{t("Share your trip")}</h3>
              <p>{" "}{t("s185")}{" "}</p>
            </article>
            <article>
              <span className="step-number">02</span>
              <h3>{t("Send on WhatsApp")}</h3>
              <p>{" "}{t("s187")}{" "}</p>
            </article>
            <article>
              <span className="step-number">03</span>
              <h3>{t("Confirm your pickup")}</h3>
              <p>{" "}{t("s189")}{" "}</p>
            </article>
          </div>
        </div>
      </section>

      <ArrivalGuide />

      <section className="faq-section container" id="questions">
        <div>
          <p className="eyebrow">{t("GOOD TO KNOW BEFORE YOU GO")}</p>
          <h2>{t("Manas Airport transfer questions")}</h2>
          <p className="faq-intro">{" "}{t("Prices, booking details and what to confirm before you travel.")}{" "}</p>
        </div>
        <div className="faq-list">{getTransferFaq(t).map(({ id, question, answer }) => (
          <details id={id} key={id}>
            <summary>{question}<svg className="icon" aria-hidden="true"><use href="#chevron" /></svg></summary>
            <p>{answer}</p>
          </details>
        ))}</div>
      </section>

      <OnwardGuides lang={lang} />

      <section className="booking-reminder container" aria-label={t("Book your airport transfer")}><div><h2>{t("Ready to arrange your pickup?")}</h2><p>{t("s205")}</p></div><a className="button button-orange" href="#route-search">{t("Book a transfer")}</a></section>
    </main>

    <footer className="site-footer container">
      <div className="footer-top">
        <a className="brand" href={`/${lang}`}><span className="brand-mark"><svg className="icon" aria-hidden="true">
              <use href="#mountain" /></svg></span><span>{t("central asia")}<span className="brand-period">.</span></span></a>
        <p>{t("Local knowledge. More meaningful journeys.")}</p>
        <a href="https://wa.me/996500490806" target="_blank" rel="noopener noreferrer">{t("Get in touch")}{" "}<svg className="icon" aria-hidden="true"><use href="#external" /></svg></a>
      </div>
      <div className="footer-bottom">
        <p>
          © <span id="year">{year}</span>{" "}{t("Central Asia · GuideBook of Kyrgyzstan")}{" "}</p>
        <div>
          <a href="mailto:anvarinho@gmail.com?subject=Transfer%20directory%20correction">{t("Suggest a correction")}</a><a href="#">{t("Back to top")}{" "}<svg className="icon up-arrow" aria-hidden="true">
              <use href="#arrow" /></svg></a>
        </div>
      </div>
    </footer>

    <a className="floating-book button button-orange" href="#route-search" aria-label={t("Book your airport transfer")}>
      <svg className="icon" aria-hidden="true"><use href="#chat" /></svg>
      <span>{t("Book a transfer")}</span>
    </a>
  
</div>);
}
