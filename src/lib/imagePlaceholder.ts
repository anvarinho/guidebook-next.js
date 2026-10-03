// Only show a blur when it was generated from this image.
export function imagePlaceholder(blurDataURL?: string) {
  return blurDataURL
    ? { placeholder: 'blur' as const, blurDataURL }
    : { placeholder: 'empty' as const };
}
