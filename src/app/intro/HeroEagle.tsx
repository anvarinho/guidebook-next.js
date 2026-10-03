"use client";

import { useId } from "react";

// Animate the existing detailed artwork in overlapping shoulder sections.
// All three image references share one cached asset; the head and body stay still.
export default function HeroEagle() {
  const id = `hero-eagle-${useId().replace(/:/g, "")}`;
  const artwork = "/intro/optimized/eagle-flight-illustrated.webp";
  return (
    <svg className="hero-eagle-art" viewBox="0 0 1024 682" width="1024" height="682" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${id}-illustrated`} colorInterpolationFilters="sRGB">
          {/* Blend a little flatter color into the detailed feathers. */}
          <feComponentTransfer in="SourceGraphic" result="flat-colors">
            <feFuncR type="discrete" tableValues="0 .16 .3 .44 .58 .72 .86 1" />
            <feFuncG type="discrete" tableValues="0 .16 .3 .44 .58 .72 .86 1" />
            <feFuncB type="discrete" tableValues="0 .16 .3 .44 .58 .72 .86 1" />
          </feComponentTransfer>
          <feComposite in="flat-colors" in2="SourceGraphic" operator="arithmetic" k1="0" k2=".15" k3=".85" k4="0" />
          <feColorMatrix type="saturate" values="1.08" />
        </filter>
        <clipPath id={`${id}-far`}>
          <path d="M0 0H430L448 250Q414 355 365 428H0Z" />
        </clipPath>
        <clipPath id={`${id}-near`}>
          <path d="M522 346H1024V682H472L430 490Q486 395 522 346Z" />
        </clipPath>
        <clipPath id={`${id}-body`}>
          <path d="M420 180H1024V350H584Q550 420 470 510L480 682H0V416H318Q402 346 420 180Z" />
        </clipPath>
      </defs>
      <g filter={`url(#${id}-illustrated)`}>
        <g className="hero-eagle-wing hero-eagle-wing--far">
          <image href={artwork} width="1024" height="682" clipPath={`url(#${id}-far)`} />
        </g>
        <g className="hero-eagle-wing hero-eagle-wing--near">
          <image href={artwork} width="1024" height="682" clipPath={`url(#${id}-near)`} />
        </g>
        <image href={artwork} width="1024" height="682" clipPath={`url(#${id}-body)`} />
      </g>
    </svg>
  );
}
