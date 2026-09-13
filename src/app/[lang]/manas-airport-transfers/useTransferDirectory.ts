"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type FocusEvent } from "react";
import { destinations, vehicleNames, sortedIds, fareFor, tripMessage, contactHref, type Destination, type Vehicle, type Sort, type ProviderId, type TripDetails } from "./transfer-data";

import type { Translate } from "./translations";

type Route = { destination: Destination; vehicle: Vehicle; sort: Sort };
const defaultRoute: Route = { destination: "bishkek", vehicle: "all", sort: "featured" };
const scrollBehavior = (): ScrollBehavior => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export function useTransferDirectory(t: Translate) {
  const [route, setRoute] = useState<Route>(defaultRoute);
  const [details, setDetails] = useState<TripDetails>({ passengers: "2", bags: "2" });
  const [shortlist, setShortlist] = useState<ProviderId[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [handoff, setHandoff] = useState(false);
  const [today, setToday] = useState("");
  const [year, setYear] = useState(2026);
  const [menuOpen, setMenuOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const comparisonRef = useRef<HTMLElement>(null);
  const compareButtonRef = useRef<HTMLButtonElement>(null);
  const copyRef = useRef<HTMLTextAreaElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { destination, vehicle, sort } = route;
  const ids = sortedIds(destination, vehicle, sort);
  const message = tripMessage(destination, vehicle, details);
  const startingFare = fareFor("central", destination, vehicle);
  const published = ids.filter(id => fareFor(id, destination, vehicle) !== null).length;

  function applyRoute(next: Route) {
    setRoute(next);
    const visible = sortedIds(next.destination, next.vehicle, next.sort);
    setShortlist(current => current.filter(id => visible.includes(id)));
    setHandoff(false);
    setStatus("");
  }
  function routeUrl(next = route) {
    const url = new URL(window.location.href);
    url.search = "";
    Object.entries(next).forEach(([key, value]) => url.searchParams.set(key, value));
    url.hash = "providers";
    return url;
  }
  function changeRoute(update: Partial<Route>) {
    const next = { ...route, ...update };
    applyRoute(next);
    window.history.replaceState(window.history.state, "", routeUrl(next));
  }
  useEffect(() => {
    function restoreRoute() {
      const params = new URLSearchParams(window.location.search);
      const destination = params.get("destination") ?? "";
      const vehicle = params.get("vehicle") ?? "";
      const sort = params.get("sort") ?? "";
      applyRoute({
        destination: Object.prototype.hasOwnProperty.call(destinations, destination) ? destination as Destination : "bishkek",
        vehicle: Object.prototype.hasOwnProperty.call(vehicleNames, vehicle) ? vehicle as Vehicle : "all",
        sort: ["featured", "price", "name"].includes(sort) ? sort as Sort : "featured",
      });
    }
    restoreRoute();
    setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bishkek", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
    setYear(new Date().getFullYear());
    window.addEventListener("popstate", restoreRoute);
    return () => window.removeEventListener("popstate", restoreRoute);
  }, []);
  useEffect(() => { if (shortlist.length < 2) setComparisonOpen(false); }, [shortlist]);
  useEffect(() => {
    if (comparisonOpen) {
      comparisonRef.current?.focus({ preventScroll: true });
      comparisonRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
  }, [comparisonOpen]);
  useEffect(() => { if (copyFallback) { copyRef.current?.focus(); copyRef.current?.select(); } }, [copyFallback]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 601px)");
    const updateInert = () => navRef.current?.toggleAttribute("inert", !desktop.matches && !menuOpen);
    const onResize = () => { setMenuOpen(false); updateInert(); };
    updateInert();
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    const onClick = (event: globalThis.MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [menuOpen]);
  function handleNavBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== menuButtonRef.current) setMenuOpen(false);
  }
  function toggleProvider(id: ProviderId) {
    const next = shortlist.includes(id) ? shortlist.filter(value => value !== id) : shortlist.length < 3 ? [...shortlist, id] : shortlist;
    setShortlist(next);
    setStatus(next.length === 3 ? t("Three selected. Remove one to choose another company.") : next.length === 1 ? t("Choose one more company to compare.") : "");
  }
  function updateTrip(event: FormEvent<HTMLFormElement>) {
    const input = event.target;
    // Native selects emit input before change. Updating the form on that input
    // re-renders controlled selects with their old value before onChange runs.
    // Route selects manage their own state; only collect the trip detail fields here.
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;
    input.setCustomValidity("");
    setDetails(Object.fromEntries(new FormData(event.currentTarget).entries()) as TripDetails);
    setHandoff(false);
  }
  function validTrip() {
    const form = formRef.current;
    if (!form) return false;
    for (const name of ["name", "address"]) {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      input.setCustomValidity(input.value.trim() ? "" : name === "name" ? t("Please enter your name.") : t("Please enter your hotel or drop-off address."));
    }
    return form.reportValidity();
  }
  function currentMessage() {
    return tripMessage(destination, vehicle, Object.fromEntries(new FormData(formRef.current!).entries()) as TripDetails);
  }
  function submitTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validTrip()) return;
    setHandoff(true);
    window.open(contactHref("central", currentMessage()), "_blank", "noopener,noreferrer");
  }
  async function copyText(text: string, success: string) {
    setCopyFallback("");
    try { await navigator.clipboard.writeText(text); setStatus(success); }
    catch { setStatus(t("Copy the selected text below:")); setCopyFallback(text); }
  }
  function copyTrip() { if (validTrip()) void copyText(currentMessage(), t("Enquiry copied. Paste it into your provider’s booking form or message.")); }
  function shareRoute() { void copyText(routeUrl().href, t("Route link copied. Personal trip details are not included.")); }
  function openComparison() { if (shortlist.length >= 2) setComparisonOpen(true); }
  function closeComparison() { setComparisonOpen(false); compareButtonRef.current?.focus(); }
  function navigateRoute(event: MouseEvent<HTMLAnchorElement>, destination: Destination, booking: boolean) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    changeRoute({ destination, vehicle: "all" });
    const target = booking ? formRef.current : document.getElementById("providers");
    target?.scrollIntoView({ behavior: scrollBehavior() });
    const focus = document.getElementById(booking ? "trip-name" : "providers-title");
    if (focus) { if (!booking) focus.tabIndex = -1; focus.focus({ preventScroll: true }); }
  }
  return { ...route, ids, startingFare, published, message, shortlist, comparing, setComparing, toggleProvider, status, comparisonOpen, openComparison, closeComparison, formRef, submitTrip, updateTrip, changeRoute, today, handoff, copyTrip, shareRoute, copyFallback, copyRef, compareButtonRef, comparisonRef, menuOpen, setMenuOpen, menuButtonRef, navRef, headerRef, handleNavBlur, navigateRoute, year };
}
