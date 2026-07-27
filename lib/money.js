/**
 * Money is stored as an integer in the currency's smallest unit:
 * 17000 with decimals=0 is ₩17,000; 1250 with decimals=2 is $12.50.
 *
 * Currencies without sub-units (won, yen) use decimals=0, so the stored
 * integer is the price as written.
 */
export function formatMoney(amount, restaurant) {
  const decimals = restaurant?.currency_decimals ?? 0;
  const symbol = restaurant?.currency_symbol ?? '₩';
  const position = restaurant?.symbol_position ?? 'before';

  const value = decimals > 0 ? amount / 10 ** decimals : amount;
  const text = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return position === 'before' ? `${symbol}${text}` : `${text} ${symbol}`;
}

/** Parse what an owner types into the admin price field back into minor units. */
export function parseMoney(input, restaurant) {
  const decimals = restaurant?.currency_decimals ?? 0;
  const cleaned = String(input).replace(/[^\d.,-]/g, '').replace(/\s/g, '');

  // With no sub-units, separators are only thousands grouping ("17,000").
  // With sub-units, the last separator is the decimal point.
  const normalised =
    decimals === 0
      ? cleaned.replace(/[.,]/g, '')
      : cleaned.replace(/,/g, '.').replace(/\.(?=.*\.)/g, '');

  const value = Number.parseFloat(normalised);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10 ** decimals);
}
