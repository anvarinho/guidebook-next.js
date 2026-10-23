/** Build a localized content URL from a slug or an existing localized path. */
export function localizedContentHref(reference: string, lang: string): string {
  const value = reference.trim();
  const suffixIndex = value.search(/[?#]/);
  const suffix = suffixIndex === -1 ? "" : value.slice(suffixIndex);
  const path = (suffixIndex === -1 ? value : value.slice(0, suffixIndex))
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/");
  const segments = path.split("/").filter(Boolean);
  const sectionIndex = segments.findIndex(segment =>
    ["places", "tours", "articles"].includes(segment.toLowerCase()),
  );
  const section = sectionIndex >= 0 ? segments[sectionIndex].toLowerCase() : "places";
  const slug = sectionIndex >= 0
    ? segments.slice(sectionIndex + 1).join("/")
    : segments.at(-1);

  if (!slug) return `/${lang}/${section}${suffix}`;
  const encodedSlug = slug.split("/").map(segment => encodeURIComponent(segment)).join("/");
  return `/${lang}/${section}/${encodedSlug}${suffix}`;
}
