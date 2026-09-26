import { fareFor, providers } from "./transfer-data";
import type { Translate } from "./translations";

export const destinationGuides = [
  { city: "bishkek", slug: "bishkek-city", labelKey: "s245" },
  { city: "karakol", slug: "karakol-city", labelKey: "s104" },
  { city: "cholpon", slug: "cholpon-ata-town", labelKey: "s105" },
] as const;

// Render the same answers in the page and structured data. Prices come from
// the directory data so a fare update cannot leave a contradictory FAQ behind.
export function getTransferFaq(t: Translate) {
  const questions = [
    ["s259", "s260"], ["s261", "s262"], ["s193", "s194"],
    ["s195", "s196"], ["s197", "s198"], ["s199", "s200"], ["s201", "s202"],
    ["nightArrivalQuestion", "nightArrivalAnswer"],
  ] as const;
  const price = (value: number | null) => value === null ? t("Request quote") : `$${value}`;
  const values = {
    taxi: price(fareFor("manas", "bishkek", "all")),
    central: price(fareFor("central", "bishkek", "sedan")),
    som: providers.manas.som?.bishkek ?? t("Request quote"),
  };
  return questions.map(([question, answer]) => ({
    id: question === "s193" ? "what-to-consider" : `faq-${question}`,
    question: t(question), answer: t(answer, values),
  }));
}
