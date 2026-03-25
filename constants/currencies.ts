// MyBudget - Supported Currencies
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const currencies: Currency[] = [
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar", flag: "🇲🇬" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
];

// Exchange rates relative to USD (1 USD = X currency)
export const exchangeRates: Record<string, number> = {
  USD: 1,
  MGA: 4550,   // 1 USD ≈ 4550 MGA
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.89,
  CNY: 7.24,
  INR: 83.1,
};

/**
 * Convert amount from one currency to another via USD as pivot.
 * FIX: previous version had inverted rate logic.
 */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string
): number {
  if (fromCode === toCode) return amount;
  const rateFrom = exchangeRates[fromCode] ?? 1;
  const rateTo = exchangeRates[toCode] ?? 1;
  // Convert to USD first, then to target
  const inUSD = amount / rateFrom;
  return inUSD * rateTo;
}

export function formatCurrency(
  amount: number,
  currencyCode: string
): string {
  const currency = currencies.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol ?? currencyCode;

  if (currencyCode === "MGA") {
    return `${symbol} ${Math.abs(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (currencyCode === "JPY") {
    return `${symbol}${Math.abs(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }

  return `${symbol}${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
