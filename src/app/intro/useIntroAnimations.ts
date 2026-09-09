"use client";

import { useEffect, type RefObject } from "react";
import type { IntroMessages } from "./translations";

export function useIntroAnimations(introRef: RefObject<HTMLDivElement>, messages: IntroMessages) {
  useEffect(() => {
    const root = introRef.current;
    if (!root) return;

    const sectionNames = [
      messages.heroTitle, messages.lakeTitle, messages.steppeKicker,
      messages.navPeaks, messages.navSilk, messages.navManas,
      messages.nomadicKicker, messages.capitalValue,
      messages.navHospitality, messages.navBegin,
    ];

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pageLoader = root.querySelector<HTMLElement>("#page-loader")!;
    const progressBar = root.querySelector<HTMLElement>("#journey-progress")!;
    const sectionDots = root.querySelector<HTMLElement>("#section-dots")!;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax], .cta"));
    const timers: number[] = [];
    let disposed = false;
    let frameId = 0;
    let activeIndex = -1;
    let loaderDismissed = false;
    let introReady = false;
    let boundsDirty = true;
    let journeyHeight = 0;
    let revealObserver: IntersectionObserver | undefined;
    let sceneObserver: IntersectionObserver | undefined;
    let imageObserver: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;

    // A fresh intro always starts on the hero. Keep browser scroll restoration
    // and user scrolling from changing the scene underneath the glass loader.
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    document.documentElement.classList.add("intro-loading");
    function resetIntroScroll() {
      if (!introReady) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
    resetIntroScroll();
    root.classList.add("intro-enhanced");
    const motionEnabled = () => !motionPreference.matches;
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay);
      timers.push(timer);
      return timer;
    };

    function dismissLoader() {
      if (loaderDismissed) return;
      loaderDismissed = true;
      pageLoader.classList.add("done");
      schedule(() => {
        resetIntroScroll();
        introReady = true;
        document.documentElement.classList.remove("intro-loading");
        root!.classList.add("is-ready");
        resizeScene();
      }, motionEnabled() ? 750 : 0);
    }

    // Show the landscape as soon as its images decode, including on a warm cache.
    const heroLoaded = () => {
      if (!disposed) dismissLoader();
    };
    schedule(dismissLoader, 2500);
    if (motionPreference.matches) dismissLoader();
    else {
      const heroSources = [
        "/intro/sky-clouds-hero.png",
        "/intro/mountain-midground-v3.png",
        "/intro/mountain-foreground-v3.png",
        "/intro/eagle-flight-illustrated.png",
        "/intro/kyrgyz-flag-brush-v2.png",
        "/intro/flag.png",
      ];
      Promise.all(heroSources.map(src => {
        const image = new Image();
        image.src = src;
        return image.decode().catch(() => undefined);
      })).then(heroLoaded);
    }

    // This empty navigation container is owned by the effect and cleared on unmount.
    const dotButtons = sections.map((section, index) => {
      const button = document.createElement("button");
      const label = document.createElement("span");
      button.type = "button";
      button.setAttribute("aria-label", messages.goToSection.replace("{section}", sectionNames[index]));
      label.className = "section-dot-label";
      label.textContent = sectionNames[index];
      label.setAttribute("aria-hidden", "true");
      button.appendChild(label);
      button.onclick = () => section.scrollIntoView({
        behavior: motionEnabled() ? "smooth" : "instant" as ScrollBehavior,
        block: "start",
      });
      sectionDots.appendChild(button);
      return button;
    });

    const groups = sections.map(section => ({
      section,
      layers: Array.from(section.querySelectorAll<HTMLElement>(".layer[data-speed]")).map(element => ({
        element,
        speed: Number(element.dataset.speed) || 0,
        drift: Number(element.dataset.drift) || 0,
        zoom: Number(element.dataset.zoom) || 0,
      })),
    }));

    function updateFrame() {
      frameId = 0;
      // Restoration can happen after mount or load; measure only after resetting.
      if (!introReady && (window.scrollX || window.scrollY)) resetIntroScroll();
      const viewportHeight = window.innerHeight;
      const intensity = window.innerWidth <= 760 ? 0.22 : 0.42;
      const bounds = groups.map(group => group.section.getBoundingClientRect());
      if (boundsDirty) {
        journeyHeight = root!.offsetHeight;
        groups.forEach((group, index) => {
          if (group.section.id === "bishkek" || group.section.id === "hospitality") {
            group.section.style.setProperty("--scene-height", `${bounds[index].height}px`);
          }
        });
        boundsDirty = false;
      }
      let nextActive = 0;
      bounds.forEach((rect, index) => {
        if (rect.top <= viewportHeight * 0.5) nextActive = index;
      });
      if (nextActive !== activeIndex) {
        activeIndex = nextActive;
        dotButtons.forEach((button, index) => {
          button.classList.toggle("active", index === activeIndex);
          if (index === activeIndex) button.setAttribute("aria-current", "location");
          else button.removeAttribute("aria-current");
        });
      }
      const rect = root!.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, journeyHeight - viewportHeight)));
      progressBar.style.transform = `scaleX(${progress})`;
      // The surrounding site has its own footer; stop showing intro controls there.
      sectionDots.hidden = rect.bottom <= 0 || rect.top >= viewportHeight;
      progressBar.hidden = sectionDots.hidden;
      if (!motionEnabled() || document.hidden) return;

      groups.forEach((group, index) => {
        const rect = bounds[index];
        if (rect.bottom < -viewportHeight * 0.25 || rect.top > viewportHeight * 1.25) return;
        const travel = Math.max(-viewportHeight, Math.min(viewportHeight, -rect.top));
        const sectionProgress = Math.max(0, Math.min(1, -rect.top / viewportHeight));
        group.layers.forEach(layer => {
          if (!layer.speed && !layer.drift && !layer.zoom) return;
          let vertical = -travel * layer.speed * intensity;
          if (group.section.id === "bishkek") {
            vertical = Math.max(-rect.height * 0.1, Math.min(rect.height * 0.1, vertical));
          }
          layer.element.style.setProperty("--parallax-y", `${vertical.toFixed(2)}px`);
          layer.element.style.setProperty("--parallax-x", `${(travel * layer.drift * intensity).toFixed(2)}px`);
          if (layer.zoom) layer.element.style.setProperty("--parallax-scale", String(1 + sectionProgress * layer.zoom));
        });
      });
    }

    function requestFrame() {
      if (!frameId) frameId = window.requestAnimationFrame(updateFrame);
    }
    function resizeScene() {
      boundsDirty = true;
      requestFrame();
    }
    function onVisibilityChange() {
      root!.classList.toggle("page-hidden", document.hidden);
      if (!document.hidden) requestFrame();
    }
    function onPageShow(event: PageTransitionEvent) {
      resetIntroScroll();
      if (event.persisted) dismissLoader();
      resizeScene();
    }
    function onMotionChange() {
      if (!motionEnabled()) dismissLoader();
      requestFrame();
    }

    if ("IntersectionObserver" in window) {
      // CSS backgrounds have no native lazy loading. Fetch each scene shortly
      // before it enters the viewport, then retain it for scrolling back.
      imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("images-ready");
          imageObserver!.unobserve(entry.target);
        });
      }, { rootMargin: "600px 0px" });
      sections.filter(section => !section.classList.contains("hero"))
        .forEach(section => imageObserver!.observe(section));
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver!.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -8%" });
      root.classList.add("reveal-ready");
      root.querySelectorAll(".reveal:not(.is-visible)").forEach(element => revealObserver!.observe(element));
      sceneObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle("scene-offscreen", !entry.isIntersecting));
      }, { rootMargin: "20% 0px" });
      sections.forEach(section => sceneObserver!.observe(section));
    } else {
      sections.forEach(section => section.classList.add("images-ready"));
    }
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(resizeScene);
      sections.forEach(section => resizeObserver!.observe(section));
    }

    motionPreference.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", resizeScene, { passive: true });
    window.addEventListener("load", resizeScene, { once: true });
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    onVisibilityChange();
    requestFrame();

    return () => {
      disposed = true;
      window.history.scrollRestoration = previousScrollRestoration;
      document.documentElement.classList.remove("intro-loading");
      timers.forEach(timer => window.clearTimeout(timer));
      window.cancelAnimationFrame(frameId);
      revealObserver?.disconnect();
      sceneObserver?.disconnect();
      imageObserver?.disconnect();
      resizeObserver?.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", resizeScene);
      window.removeEventListener("load", resizeScene);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      dotButtons.forEach(button => { button.onclick = null; button.remove(); });
      root.classList.remove("intro-enhanced", "is-ready", "reveal-ready", "page-hidden");
      pageLoader.classList.remove("done");
      groups.forEach(group => {
        group.section.classList.remove("scene-offscreen");
        group.section.style.removeProperty("--scene-height");
        group.layers.forEach(({ element }) => {
          element.style.removeProperty("--parallax-x");
          element.style.removeProperty("--parallax-y");
          element.style.removeProperty("--parallax-scale");
        });
      });
    };
  }, [introRef, messages]);
}
