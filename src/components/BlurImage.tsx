'use client';

import Image, { type ImageProps } from 'next/image';

/** next/image that sharpens from its blur placeholder once loaded (styles in motion.css). */
export default function BlurImage({ alt, onLoad, ...props }: ImageProps) {
  return <Image {...props} alt={alt} data-blur-up="" onLoad={event => {
    event.currentTarget.setAttribute('data-loaded', '');
    onLoad?.(event);
  }}/>;
}
