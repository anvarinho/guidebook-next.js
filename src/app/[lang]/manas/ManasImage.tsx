/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";
import assets from "./assets.json";

export default function ManasImage({ src, sizes, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const asset = (assets as Record<string, { width: number; height: number; srcSet: string }>)[src];
  return <img {...props} alt={alt ?? ""} src={src} width={asset?.width} height={asset?.height}
    srcSet={asset?.srcSet} sizes={sizes ?? "(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) 45vw, 600px"}
    decoding="async" />;
}
