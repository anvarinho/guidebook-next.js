// Keep public content URLs aligned with the Rust API's slug contract.
export function isValidContentSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
