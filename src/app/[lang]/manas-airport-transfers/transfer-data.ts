// Source fares and contacts are preserved from the supplied page; see SOURCES.md.
export type ProviderId = 'central' | 'compass' | 'manas' | 'advantour' | 'concept' | 'welcome' | 'cat';
export type Destination = 'bishkek' | 'karakol' | 'cholpon';
export type Vehicle = 'all' | 'sedan' | 'minivan' | 'suv';
export type Sort = 'featured' | 'price' | 'name';
export type TripDetails = Partial<Record<'name' | 'date' | 'time' | 'passengers' | 'bags' | 'flight' | 'address' | 'notes', string | number>>;
type Provider = {
  name: string; phone: string; whatsapp?: string; bookingUrl?: string;
  vehicles: Vehicle[] | null;
  prices: Partial<Record<Destination, Partial<Record<Vehicle, number>>>>;
  som?: Partial<Record<Destination, number>>;
};

export const providers: Record<ProviderId, Provider> = {
  central: { name: 'Central Asia', phone: '+996500490806', whatsapp: '996500490806', vehicles: ['sedan', 'minivan', 'suv'], prices: { bishkek: { all: 18, sedan: 18, minivan: 35, suv: 50 }, karakol: { all: 160 }, cholpon: { all: 120 } } },
  compass: { name: 'Compass Transfer', phone: '+996990312321', vehicles: null, prices: {} },
  manas: { name: 'Manas Taxi', phone: '+996999693000', whatsapp: '996999693000', vehicles: ['sedan', 'minivan'], prices: { bishkek: { all: 10 }, karakol: { all: 106 }, cholpon: { all: 71 } }, som: { bishkek: 800, karakol: 9000, cholpon: 6000 } },
  advantour: { name: 'Advantour', phone: '+996312909357', whatsapp: '996775584980', vehicles: ['sedan', 'minivan', 'suv'], prices: { bishkek: { all: 60, sedan: 60, minivan: 90, suv: 70 }, karakol: { all: 210, sedan: 210, minivan: 215 }, cholpon: { all: 140, sedan: 140, minivan: 220 } } },
  concept: { name: 'Kyrgyz Concept', phone: '+996312900883', bookingUrl: 'https://kyrgyzconcept.kg/en/trp/', vehicles: ['minivan', 'suv'], prices: {} },
  welcome: { name: 'WelcomeTaxi', phone: '+447893930990', bookingUrl: 'https://welcome.taxi/en/airports/bsz', vehicles: null, prices: {} },
  cat: { name: 'C.A.T. Company', phone: '+996312663664', vehicles: null, prices: {} },
};
export const destinations = { bishkek: 'Bishkek', karakol: 'Karakol', cholpon: 'Cholpon-Ata' };
export const vehicleNames = { all: 'Any suitable vehicle', sedan: 'Sedan', minivan: 'Minivan', suv: 'SUV' };
export const fareFor = (id: ProviderId, destination: Destination, vehicle: Vehicle) => providers[id].prices[destination]?.[vehicle] ?? null;
export const visibleIds = (vehicle: Vehicle) => (Object.keys(providers) as ProviderId[]).filter(id => vehicle === 'all' || !providers[id].vehicles || providers[id].vehicles?.includes(vehicle));
export function sortedIds(destination: Destination, vehicle: Vehicle, sort: Sort) {
  return visibleIds(vehicle).sort((a, b) => {
    if (sort === 'name') return providers[a].name.localeCompare(providers[b].name);
    if (sort === 'price') {
      const pa = fareFor(a, destination, vehicle) ?? Infinity;
      const pb = fareFor(b, destination, vehicle) ?? Infinity;
      return pa === pb ? 0 : pa - pb;
    }
    return 0;
  });
}
export function tripMessage(destination: Destination, vehicle: Vehicle, details: TripDetails = {}) {
  const clean = (value: unknown) => String(value ?? '').trim().slice(0, 300);
  const fields = [['Name', details.name], ['Arrival date', details.date], ['Arrival time (Kyrgyzstan local time)', details.time], ['Passengers', details.passengers], ['Suitcases', details.bags], ['Flight number', details.flight], ['Drop-off address', details.address], ['Extra requirements', details.notes]];
  return [`Hello, I’d like a transfer from Manas Airport to ${destinations[destination]}.`, `Vehicle: ${vehicleNames[vehicle]}`, ...fields.filter(([, value]) => clean(value) !== '').map(([label, value]) => `${label}: ${clean(value)}`), 'Please confirm availability, the total price, luggage space and meeting point.'].join('\n');
}
export function contactHref(id: ProviderId, message: string) {
  const provider = providers[id];
  return provider.whatsapp ? `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(message)}` : provider.bookingUrl || `tel:${provider.phone}`;
}
