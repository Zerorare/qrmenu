/**
 * Money is stored as an integer in the currency's smallest unit:
 * 45000 with decimals=0 is 45 000 so'm; 1250 with decimals=2 is $12.50.
 */
export function formatMoney(amount, restaurant) {
  const decimals = restaurant?.currency_decimals ?? 0;
  const symbol = restaurant?.currency_symbol ?? "so'm";
  const position = restaurant?.symbol_position ?? 'after';

  const value = decimals > 0 ? amount / 10 ** decimals : amount;
  const text = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).replace(/,/g, ' ');

  return position === 'before' ? `${symbol}${text}` : `${text} ${symbol}`;
}

/** Parse what an owner types into the admin price field back into minor units. */
export function parseMoney(input, restaurant) {
  const decimals = restaurant?.currency_decimals ?? 0;
  const cleaned = String(input).replace(/[^\d.,-]/g, '').replace(/\s/g, '').replace(',', '.');
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10 ** decimals);
}
