import { useTransferText } from "./TransferI18n";
import { providers, destinations, vehicleNames, fareFor, contactHref, type ProviderId, type Destination, type Vehicle } from "./transfer-data";

type TripProps = { destination: Destination; vehicle: Vehicle };
export function ProviderPrice({ id, destination, vehicle }: TripProps & { id: ProviderId }) {
  const t = useTransferText();
  const price = fareFor(id, destination, vehicle);
  const som = providers[id].som?.[destination];
  const note = !providers[id].vehicles ? t("Confirm route & vehicle availability")
    : price === null ? t("Confirm with the provider")
    : som !== undefined ? t("Provider also lists {amount} KGS", { amount: som.toLocaleString("en-US") })
    : vehicle === "all" ? t("Published route starting fare") : t("Published {vehicle} fare", { vehicle: t(vehicleNames[vehicle]) });
  return <div className={`provider-price${price === null ? " quote-price" : ""}`}>
    <span className="price-label">{price === null ? t("For your journey") : t("Starting from")}</span>
    <strong className="price-value">{price === null ? t("Get a quote") : `$${price}`}</strong>
    <span className="price-note">{note}</span>
  </div>;
}

export function ComparisonTable({ ids, destination, vehicle, message }: TripProps & { ids: ProviderId[]; message: string }) {
  const t = useTransferText();
  return <table className="price-table" id="comparison-table">
    <caption>{t("Manas Airport")} → {t(destinations[destination])} · {t(vehicleNames[vehicle])}</caption>
    <thead><tr><th scope="col">{t("Compare")}</th>{ids.map(id => <th scope="col" key={id}>{providers[id].name}</th>)}</tr></thead>
    <tbody>
      <tr><th scope="row">{t("Starting fare")}</th>{ids.map(id => {
        const price = fareFor(id, destination, vehicle);
        return <td key={id}>{price === null ? t("Quote required") : `$${price} USD`}</td>;
      })}</tr>
      <tr><th scope="row">{t("Vehicle")}</th>{ids.map(id => <td key={id}>{!providers[id].vehicles ? t("Confirm vehicle availability") : vehicle === "all" ? providers[id].vehicles?.map(value => t(vehicleNames[value])).join(", ") : t("{vehicle} listed; confirm for this route", { vehicle: t(vehicleNames[vehicle]) })}</td>)}</tr>
      <tr><th scope="row">{t("Phone")}</th>{ids.map(id => <td key={id}><a href={`tel:${providers[id].phone}`}>{providers[id].phone}</a></td>)}</tr>
      <tr><th scope="row">{t("Booking")}</th>{ids.map(id => {
        const provider = providers[id];
        const href = contactHref(id, message);
        return <td key={id}><a className="text-link" href={href} target={href.startsWith("tel:") ? undefined : "_blank"} rel={href.startsWith("tel:") ? undefined : "noopener noreferrer"}>{provider.whatsapp ? t("Enquire on WhatsApp") : provider.bookingUrl ? t("Request an online quote") : t("Call for a quote")}</a></td>;
      })}</tr>
    </tbody>
  </table>;
}
