/**
 * Parses raw text from a price input into a comma-grouped display string and
 * its numeric value, keeping at most one decimal point (e.g. "1500.5" -> "1,500.5").
 */
export function formatBidInputValue(raw: string): { display: string; numeric: number } {
  let cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  }

  const [intPart, decPart] = cleaned.split(".");
  const formattedInt = intPart === "" ? "" : Number(intPart).toLocaleString("en-US");
  const display = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  const numeric = cleaned === "" || cleaned === "." ? 0 : Number(cleaned);

  return { display, numeric };
}
