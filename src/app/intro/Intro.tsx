/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, type CSSProperties } from "react";
import { useIntroAnimations } from "./useIntroAnimations";
import type { IntroMessages } from "./translations";
import "./intro.css";

export default function Intro({ messages: t, language }: { messages: IntroMessages; language: string }) {
  const introRef = useRef<HTMLDivElement>(null);
  useIntroAnimations(introRef, t);

  return (
    <div ref={introRef} className="kyrgyz-intro" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>

      <a className="skip-link" href="#journey">{t.skipLink}</a>
      <div
        className="journey-progress"
        id="journey-progress"
        aria-hidden="true"
      ></div>
      <div className="page-loader" id="page-loader" aria-hidden="true">
        <div className="page-loader-mark" role="img" aria-label={t.flagLabel}>
          <div className="page-loader-emblem">
            <img className="page-loader-brush" src="/intro/kyrgyz-flag-brush-v2.png" alt="" />
            <img className="page-loader-flag" src="/intro/flag.png" alt="" />
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
                className="bird bird-fly"
                style={{ "top": "55%", "animationDuration": "30s", "animationDelay": "-6s" } as CSSProperties}
              >
                <img src="/intro/eagle-flight-illustrated.png" alt="" />
              </div>
            </div>
          </div>
          <div
            className="layer hero-bird-foreground"
            data-speed="0.28"
            data-drift="0.16"
          >
            <div
              className="bird bird-fly"
              style={{ "top": "35%", "animationDuration": "27s", "animationDelay": "-10s" } as CSSProperties}
            >
              <img src="/intro/eagle-flight-illustrated.png" alt="" />
            </div>
          </div>
          <div className="content-wrap">
            <div className="hero-content">
              <div className="hero-award reveal is-visible" lang="en" dir="ltr">
                🏆 #1 adventure destination
              </div>
              <div className="hero-kicker reveal is-visible" style={{ "--d": "0.08s" } as CSSProperties}>{t.heroKicker}</div>
              <h1 className="reveal is-visible" style={{ "--d": "0.16s" } as CSSProperties}>{t.heroTitle}</h1>
              <p className="hero-tagline reveal is-visible" style={{ "--d": "0.15s" } as CSSProperties}>{t.heroDescription}</p>
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
                  src="/intro/issyk-cartoon-ship.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="lake-copy">
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
              <img src="/intro/jailoo-sky-layer.png" loading="lazy" decoding="async" width="1672" height="941" alt="" />
            </div>
            <div className="layer jailoo-mountains" data-speed="0.16" data-drift="-0.04">
              <img src="/intro/jailoo-mountains-layer.png" loading="lazy" decoding="async" width="1672" height="941" alt="" />
            </div>
            <div className="layer jailoo-foreground" data-speed="0.34" data-drift="0.06">
              <img src="/intro/jailoo-foreground-layer.png" loading="lazy" decoding="async" width="1672" height="941" alt="" />
            </div>
            <div className="layer jailoo-horses" data-speed="0.34" data-drift="0.06">
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/jailoo-run-1.png"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/jailoo-run-2.png"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/jailoo-run-3.png"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="jailoo-horse-frame"
                src="/intro/jailoo-run-4.png"
                alt=""
              />
            </div>
            <div className="layer jailoo-yurts" data-speed="0.34" data-drift="0.06">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/jailoo-cartoon-yurts.png"
                alt=""
              />
            </div>
          </div>
          <div className="content-wrap">
            <div className="steppe-copy">
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
                src="/intro/trekking-backpacker.png"
                alt=""
              />
            </div>
          </div>
          <div className="content-wrap">
            <div className="peaks-copy">
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
                src="/intro/silk-road-mountains-bold.png"
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
                src="/intro/silk-road-foreground-cutout.png"
                alt=""
              />
            </div>
            <div className="layer silk-tower" data-speed="0.38" data-drift="-0.04">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/silk-road-burana-tower.png"
                alt=""
              />
            </div>
            <div className="layer caravan-track" data-speed="0.45" data-drift="0.08">
              <div className="caravan caravan-move">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/silk-road-caravan-cutout.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="silk-copy">
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
                src="/intro/manas-warrior.png"
                alt=""
              />
            </div>
            <div className="layer manas-eagle" data-speed="0.48" data-drift="0.14">
              <img loading="lazy" decoding="async" src="/intro/manas-eagle.png" alt="" />
            </div>
          </div>
          <div className="content-wrap">
            <div className="manas-copy">
              <span className="eyebrow-fact reveal">{t.manasKicker}</span>
              <h2 className="reveal" style={{ "--d": "0.1s" } as CSSProperties}>{t.manasTitle}</h2>
              <p className="reveal" style={{ "--d": "0.2s" } as CSSProperties}>{t.manasDescription}</p>
              <div className="manas-meta reveal" style={{ "--d": "0.3s" } as CSSProperties}>
                <span>{t.manasEpic}</span><span>{t.manasRegion}</span
                ><span>{t.manasMemory}</span>
              </div>
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
                src="/intro/kok-boru-crowd-cartoon-v2.png"
                alt=""
              />
            </div>
            <div className="layer nomadic-action" data-speed="0.25" data-drift="0.06">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/kok-boru-riders-cartoon.png"
                alt=""
              />
            </div>
            <div className="layer nomadic-goal" data-speed="0.36" data-drift="-0.08">
              <img
                loading="lazy"
                decoding="async"
                src="/intro/kok-boru-goal-base.png"
                alt=""
              />
              <img
                loading="lazy"
                decoding="async"
                className="nomadic-goal-mark"
                src="/intro/kok-boru-source-emblem.png"
                alt=""
              />
            </div>
          </div>
          <div className="content-wrap">
            <div className="nomadic-copy">
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
                  src="/intro/bishkek-sky.png"
                  alt=""
                />
              </div>
              <div className="layer bishkek-road" data-speed="0.2" data-drift="-0.08">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/bishkek-road.png"
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
                  src="/intro/bishkek-mountains.png"
                  alt=""
                />
              </div>
              <div className="layer bishkek-city" data-speed="0.2" data-drift="-0.08">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/intro/bishkek-city-midground.png"
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
                  src="/intro/bishkek-foreground.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="bishkek-copy">
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
                <img src="/intro/yurt-doorway-view.png" loading="lazy" decoding="async" width="1672" height="941" alt="" />
              </div>
              <div className="layer hospitality-interior" data-speed="0.065" data-drift="0.005">
                <img src="/intro/yurt-interior-layer.png" loading="lazy" decoding="async" width="1672" height="941" alt="" />
              </div>
              <div className="layer hospitality-table" data-speed="-0.28" data-drift="-0.10" data-zoom="0.12">
                <img src="/intro/yurt-table-food.png" loading="lazy" decoding="async" width="1672" height="941" alt="" />
              </div>
              <div className="layer hospitality-light" data-speed="0.08" data-drift="-0.18"></div>
            </div>
          </div>
          <div className="content-wrap">
            <div className="hospitality-copy">
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
            <a className="cta-btn reveal" style={{ "--d": "0.2s" } as CSSProperties} href="#top"
            >{t.ctaButton}</a
            >
          </div>
        </section>
      </div>
    </div>
  );
}
