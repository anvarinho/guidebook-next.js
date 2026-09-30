import Image from 'next/image';
import weather01d from '../../../../../public/weather/01d.svg';
import weather01n from '../../../../../public/weather/01n.svg';
import weather02d from '../../../../../public/weather/02d.svg';
import weather02n from '../../../../../public/weather/02n.svg';
import weather03d from '../../../../../public/weather/03d.svg';
import weather03n from '../../../../../public/weather/03n.svg';
import weather04d from '../../../../../public/weather/04d.svg';
import weather04n from '../../../../../public/weather/04n.svg';
import weather09d from '../../../../../public/weather/09d.svg';
import weather09n from '../../../../../public/weather/09n.svg';
import weather10d from '../../../../../public/weather/10d.svg';
import weather10n from '../../../../../public/weather/10n.svg';
import weather11d from '../../../../../public/weather/11d.svg';
import weather11n from '../../../../../public/weather/11n.svg';
import weather13d from '../../../../../public/weather/13d.svg';
import weather13n from '../../../../../public/weather/13n.svg';
import weather50d from '../../../../../public/weather/50d.svg';
import weather50n from '../../../../../public/weather/50n.svg';

const weatherAssets = { '01d': weather01d, '01n': weather01n, '02d': weather02d, '02n': weather02n, '03d': weather03d, '03n': weather03n, '04d': weather04d, '04n': weather04n, '09d': weather09d, '09n': weather09n, '10d': weather10d, '10n': weather10n, '11d': weather11d, '11n': weather11n, '13d': weather13d, '13n': weather13n, '50d': weather50d, '50n': weather50n };

export function weatherIconCode(icon?: string): string {
  return /^(01|02|03|04|09|10|11|13|50)[dn]$/.test(icon ?? '') ? icon! : '04d';
}

export function weatherAssetSource(icon?: string): string {
  return weatherAssets[weatherIconCode(icon) as keyof typeof weatherAssets].src;
}

export default function WeatherIcon({ icon, size = 44 }: { icon?: string; size?: number }) {
  return <Image src={weatherAssetSource(icon)} unoptimized alt="" width={size} height={size} />;
}
