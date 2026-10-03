import getBase64 from './getLocalBase64';

export default function getBlurredDataUrls(images: string[]): string[] {
  return images.map(getBase64);
}
