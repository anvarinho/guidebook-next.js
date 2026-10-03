/* eslint-disable @next/next/no-img-element */
"use client";
import ArrowIcon from '@/components/ArrowIcon';


import { useRef, type CSSProperties } from "react";
import { useIntroAnimations } from "./useIntroAnimations";
import HeroEagle from "./HeroEagle";
import Link from "next/link";
import type { Locale } from "@/lib/i18n.config";
import type { IntroMessages } from "./translations";
import "./intro.css";
import "./intro-content.css";

export default function Intro({ messages: t, language, locale, links, heroBlurDataURL }: {
  messages: IntroMessages; language: string; locale: Locale;
  links: { label: string; href: string }[];
  heroBlurDataURL?: string;
}) {
  const introRef = useRef<HTMLDivElement>(null);
  useIntroAnimations(introRef, t);

  return (
    <div ref={introRef} className="kyrgyz-intro home-refresh" lang={language} dir={language === "ar" ? "rtl" : "ltr"}
      style={heroBlurDataURL ? { "--hero-blur": `url("${heroBlurDataURL}")` } as CSSProperties : undefined}>

      <a className="skip-link" href="#journey">{t.skipLink}</a>
      <div
        className="journey-progress"
        id="journey-progress"
        aria-hidden="true"
      ></div>
      <div className="page-loader" id="page-loader" aria-hidden="true">
        <div className="page-loader-mark" role="img" aria-label={t.flagLabel}>
          <div className="page-loader-emblem">
            <img className="page-loader-brush" src="/intro/optimized/kyrgyz-flag-brush-v2.webp" alt="" />
            <img className="page-loader-flag" src="/intro/optimized/flag.webp" alt="" />
          </div>
        </div>
      </div>
      <noscript>
        <style>{`.kyrgyz-intro .page-loader { display: none; } .kyrgyz-intro .hero-content { visibility: visible; animation: none; } .kyrgyz-intro [data-scene-background] { background-image: var(--scene-image) !important; }`}</style>
      </noscript>
      <nav
        className="section-dots"
        id="section-dots"
        aria-label={t.sectionsLabel}
      ></nav>

      {/* ============ HERO ============ */}
      <div id="journey" tabIndex={-1}>
        <header className="section hero" id="top" data-parallax="">
          <div className="layers">
            <div
              className="layer sky-glow"
              data-speed="0.05"
              data-drift="-0.04"
            ></div>
            <div className="layer stars" data-speed="0.05" data-drift="-0.02"></div>
            <div className="layer sun" data-speed="0.12" data-drift="0.08"></div>
            <div className="layer peak-far" data-speed="0.2" data-drift="-0.12"></div>
            <div className="layer peak-mid" data-speed="0.35" data-drift="0.24"></div>
            <div
              className="layer peak-near"
              data-speed="0.55"
              data-drift="-0.36"
            ></div>
            <div className="layer hero-birds" data-speed="0.4" data-drift="0.3">
              <div
                className="bird bird-fly hero-eagle hero-eagle--distant"
                style={{ "top": "55%", "animationDuration": "26s", "animationDelay": "-6s" } as CSSProperties}
              >
                <HeroEagle />
              </div>
            </div>
          </div>
          <div
            className="layer hero-bird-foreground"
            data-speed="0.28"
            data-drift="0.16"
          >
            <div
              className="bird bird-fly hero-eagle hero-eagle--near"
              style={{ "top": "35%", "animationDuration": "23.5s", "animationDelay": "-10s" } as CSSProperties}
            >
              <HeroEagle />
            </div>
          </div>
          <div className="content-wrap">
            <div className="hero-content">
              <div className="hero-kicker reveal is-visible" style={{ "--d": "0.08s" } as CSSProperties}>{t.heroKicker}</div>
              <h1 className="reveal is-visible" style={{ "--d": "0.16s" } as CSSProperties}>{t.heroTitle}</h1>
              <p className="hero-tagline reveal is-visible" style={{ "--d": "0.15s" } as CSSProperties}>{t.heroDescription}</p>
              <div className="home-actions reveal is-visible" style={{ "--d": "0.24s" } as CSSProperties}>
                {links.slice(0, 2).map((link, index) => <Link href={link.href} className={index === 0 ? "home-button home-button-primary" : "home-button"} key={link.href}>
                  <span className="home-button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {index === 0 ? <><path d="m2 19 7-12 5 8 3-5 5 9H2Z"/><path d="m6.5 11.3 2.5 2 2.5-2"/><circle cx="17" cy="5" r="2"/></> : <><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/></>}
                    </svg>
                  </span>
                  <span className="home-button-label">{link.label}</span>
                  <span className="home-button-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18 18 6M6 6h12v12"/></svg>
                  </span>
                </Link>)}
              </div>
              <div className="hero-stats reveal is-visible" style={{ "--d": "0.3s" } as CSSProperties}>
                <div className="hero-stat">
                  <strong>{t.populationValue}</strong><span>{t.populationLabel}</span>
                </div>
                <div className="hero-stat">
                  <strong>{t.areaValue}</strong><span>{t.areaLabel}</span>
                </div>
                <div className="hero-stat">
                  <strong>{t.capitalValue}</strong><span>{t.capitalLabel}</span>
                </div>
                <div className="hero-stat">
                  <strong>{t.highestValue}</strong><span>{t.highestLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============ ISSYK-KUL ============ */}
        <section className="section lake" data-scene-background="" id="lake" data-parallax="">
          <div className="layers">
            <div
              className="layer issyk-mountains" data-scene-background=""
              data-speed="0.15"
              data-drift="-0.06"
            ></div>
            <div
              className="layer issyk-lakefront" data-scene-background=""
              data-speed="0.4"
              data-drift="0.14"
              data-zoom="0.07"
            >
              <div className="lake-ship" aria-hidden="true">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/issyk-cartoon-ship.webp"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="lake-copy story-panel">
              <span className="eyebrow-fact reveal">{t.lakeKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.lakeTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.lakeDescription}</p>
              <div className="lake-facts reveal" style={{ "--d": "0.3s" } as CSSProperties}>
                <div className="lake-fact">
                  <strong>{t.lakeAltitudeValue}</strong>{t.lakeAltitudeLabel}</div>
                <div className="lake-fact">
                  <strong>{t.lakeLengthValue}</strong>{t.lakeLengthLabel}</div>
                <div className="lake-fact">
                  <strong>{t.lakeFreezeValue}</strong>{t.lakeFreezeLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STEPPE / NOMAD LIFE ============ */}
        <section className="section steppe" id="steppe" data-parallax="">
          <div className="layers" aria-hidden="true">
            <div className="layer jailoo-background" data-speed="0.04" data-drift="-0.015">
              <img src="/intro/optimized/jailoo-sky-layer.webp" loading="lazy" decoding="async" width="1024" height="576" alt="" />
            </div>
            <div className="layer jailoo-mountains" data-speed="0.16" data-drift="-0.04">
              <img src="/intro/optimized/jailoo-mountains-layer.webp" loading="lazy" decoding="async" width="1024" height="576" alt="" />
            </div>
            <div className="layer jailoo-foreground" data-speed="0.34" data-drift="0.06">
              <img src="/intro/optimized/jailoo-foreground-layer.webp" loading="lazy" decoding="async" width="1024" height="576" alt="" />
            </div>
            <div className="layer jailoo-horses" data-speed="0.34" data-drift="0.06">
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/optimized/jailoo-run-1.webp"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/optimized/jailoo-run-2.webp"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/optimized/jailoo-run-3.webp"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/optimized/jailoo-run-4.webp"
                alt=""
              />
            </div>
            <div className="layer jailoo-yurts" data-speed="0.34" data-drift="0.06">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/jailoo-cartoon-yurts.webp"
                alt=""
              />
            </div>
          </div>
          <div className="content-wrap">
            <div className="steppe-copy story-panel">
              <span className="eyebrow-fact reveal">{t.steppeKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.steppeTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.steppeDescription}</p>
            </div>
          </div>
          <div
            className="pattern-divider"
            style={{ "position": "absolute", "bottom": "0", "left": "0", "right": "0" } as CSSProperties}
          ></div>
        </section>

        {/* ============ TIEN SHAN PEAKS ============ */}
        <section className="section peaks" id="peaks" data-parallax="">
          <div className="layers">
            <div
              className="layer trek-clouds" data-scene-background=""
              data-speed="0.05"
              data-drift="-0.03"
            ></div>
            <div
              className="layer trek-mountains" data-scene-background=""
              data-speed="0.16"
              data-drift="-0.06"
            ></div>
            <div
              className="layer trek-foreground" data-scene-background=""
              data-speed="0.42"
              data-drift="0.14"
              data-zoom="0.15"
            ></div>
            <div
              className="layer trek-backpacker"
              data-speed="0.56"
              data-drift="0.18"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/trekking-backpacker.webp"
                alt=""
              />
            </div>
          </div>
          <div className="content-wrap">
            <div className="peaks-copy story-panel">
              <span className="eyebrow-fact reveal"
              >{t.peaksKicker}</span
              >
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.peaksTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.peaksDescription}</p>
            </div>
          </div>
        </section>

        {/* ============ SILK ROAD ============ */}
        <section className="section silk" id="silk" data-parallax="">
          <div className="layers">
            <div
              className="layer silk-sky" data-scene-background=""
              data-speed="0.06"
              data-drift="-0.03"
            ></div>
            <div className="layer silk-mountains" data-speed="0.18" data-drift="0.04">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/silk-road-mountains-bold.webp"
                alt=""
              />
            </div>
            <div
              className="layer silk-foreground"
              data-speed="0.34"
              data-drift="-0.06"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/silk-road-foreground-cutout.webp"
                alt=""
              />
            </div>
            <div className="layer silk-tower" data-speed="0.38" data-drift="-0.04">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/silk-road-burana-tower.webp"
                alt=""
              />
            </div>
            <div className="layer caravan-track" data-speed="0.45" data-drift="0.08">
              <div className="caravan caravan-move">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/silk-road-caravan-cutout.webp"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="silk-copy story-panel">
              <span className="eyebrow-fact reveal">{t.silkKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.silkTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.silkDescription}</p>
            </div>
          </div>
        </section>

        {/* ============ MANAS / LIVING HERITAGE ============ */}
        <section className="section manas" id="manas" data-parallax="">
          <div className="layers" aria-hidden="true">
            <div
              className="layer manas-warrior"
              data-speed="0.2"
              data-drift="0"
              data-zoom="0.35"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/manas-warrior.webp"
                alt=""
              />
            </div>
            <div className="layer manas-eagle" data-speed="0.48" data-drift="0.14">
              <img loading="lazy" decoding="async" src="/intro/optimized/manas-eagle.webp" alt="" />
            </div>
          </div>
          <div className="content-wrap">
            <div className="manas-copy story-panel">
              <span className="eyebrow-fact reveal">{t.manasKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.manasTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.manasDescription}</p>
              <div className="manas-meta reveal" style={{ "--d": "0.3s" } as CSSProperties}>
                <span>{t.manasEpic}</span><span>{t.manasRegion}</span
                ><span>{t.manasMemory}</span>
              </div>
              <Link href={`/${locale}/manas`} className="manas-read-more reveal" style={{ "--d": "0.4s" } as CSSProperties}>
                {t.manasReadMore} <span aria-hidden="true"><ArrowIcon direction="up-right"/></span>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ NOMADIC TRADITION ============ */}
        <section className="section nomadic" id="nomadic" data-parallax="">
          <div className="layers" aria-hidden="true">
            <div
              className="layer nomadic-crowd"
              data-speed="0.08"
              data-drift="-0.025"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/kok-boru-crowd-cartoon-v2.webp"
                alt=""
              />
            </div>
            <div className="layer nomadic-action" data-speed="0.25" data-drift="0.06">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/kok-boru-riders-cartoon.webp"
                alt=""
              />
            </div>
            <div className="layer nomadic-goal" data-speed="0.36" data-drift="-0.08">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/optimized/kok-boru-goal-base.webp"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="nomadic-goal-mark"
                src="/intro/optimized/kok-boru-source-emblem.webp"
                alt=""
              />
            </div>
          </div>
          <div className="content-wrap">
            <div className="nomadic-copy story-panel">
              <span className="eyebrow-fact reveal">{t.nomadicKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.nomadicTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.nomadicDescription}</p>
              <div className="nomadic-meta reveal" style={{ "--d": "0.3s" } as CSSProperties}>
                <span>{t.nomadicCountries}</span><span>{t.nomadicSports}</span
                ><span>{t.nomadicGames}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ BISHKEK ============ */}
        <section className="section bishkek" id="bishkek" data-parallax="">
          <div className="layers" aria-hidden="true">
            <div className="bishkek-scene">
              <div
                className="layer bishkek-sky"
                data-speed="0.04"
                data-drift="-0.025"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/bishkek-sky.webp"
                  alt=""
                />
              </div>
              <div className="layer bishkek-road" data-speed="0.2" data-drift="-0.08">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/bishkek-road.webp"
                  alt=""
                />
              </div>
              <div
                className="layer bishkek-mountains"
                data-speed="0.12"
                data-drift="-0.06"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/bishkek-mountains.webp"
                  alt=""
                />
              </div>
              <div className="layer bishkek-city" data-speed="0.2" data-drift="-0.08">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/bishkek-city-midground.webp"
                  alt=""
                />
              </div>
              <div
                className="layer bishkek-foreground"
                data-speed="0.46"
                data-drift="0.16"
                data-zoom="0.06"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/optimized/bishkek-foreground.webp"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="bishkek-copy story-panel">
              <span className="eyebrow-fact reveal">{t.bishkekKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.bishkekTitle}</h2>
              <p className="bishkek-lead reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.bishkekDescription}</p>
              <div className="bishkek-highlights reveal" style={{ "--d": "0.3s" } as CSSProperties}>
                <article className="bishkek-card">
                  <h3>{t.arenaTitle}</h3>
                  <p>{t.arenaDescription}</p>
                </article>
                <article className="bishkek-card">
                  <h3>{t.bazaarTitle}</h3>
                  <p>{t.bazaarDescription}</p>
                </article>
                <article className="bishkek-card">
                  <h3>{t.squareTitle}</h3>
                  <p>{t.squareDescription}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section hospitality"
          id="hospitality"
          data-parallax=""
          aria-labelledby="hospitality-title"
        >
          <div className="layers" aria-hidden="true">
            <div className="hospitality-scene">
              <div className="layer hospitality-outside" data-speed="0.012" data-drift="-0.008">
                <img src="/intro/optimized/yurt-doorway-view.webp" loading="lazy" decoding="async" width="1024" height="576" alt="" />
              </div>
              <div className="layer hospitality-interior" data-speed="0.065" data-drift="0.005">
                <img src="/intro/optimized/yurt-interior-layer.webp" loading="lazy" decoding="async" width="1024" height="576" alt="" />
              </div>
              <div className="layer hospitality-table" data-speed="-0.28" data-drift="-0.10" data-zoom="0.12">
                <img src="/intro/optimized/yurt-table-food.webp" loading="lazy" decoding="async" width="1024" height="576" alt="" />
              </div>
              <div className="layer hospitality-light" data-speed="0.08" data-drift="-0.18"></div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="hospitality-copy story-panel">
              <span className="eyebrow-fact reveal">{t.hospitalityKicker}</span>
              <h2 className="reveal" id="hospitality-title" style={{ "--d": "0.1s" } as CSSProperties}>{t.hospitalityTitleFirst}<br />{t.hospitalityTitleSecond}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.hospitalityDescription}</p>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="cta" id="begin">
          <div className="content-wrap">
            <span className="cta-kicker reveal">{t.ctaKicker}</span>
            <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.ctaTitleFirst}<br />{t.ctaTitleSecond}</h2>
            <p className="lead reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.ctaDescription}</p>
            <Link href={`/${locale}/tours`} className="home-tours-link reveal" style={{ "--d": "0.2s" } as CSSProperties}>
              <span>{links[1].label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
