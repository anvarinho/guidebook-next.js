import Image from 'next/image';

export function weatherIconCode(icon?: string): string {
  return /^(01|02|03|04|09|10|11|13|50)[dn]$/.test(icon ?? '') ? icon! : '04d';
}

export default function WeatherIcon({ icon, size = 44 }: { icon?: string; size?: number }) {
  return <Image src={`/weather/${weatherIconCode(icon)}.svg`} alt="" width={size} height={size} />;
}
