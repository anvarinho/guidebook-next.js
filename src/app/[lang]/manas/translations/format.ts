export function formatMessage(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    values[key] === undefined ? placeholder : String(values[key]));
}
