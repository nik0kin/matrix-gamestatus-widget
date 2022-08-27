export function formatNumber(num: number, decimalPlaces = 2) {
  const a = Math.pow(10, decimalPlaces);
  num = Math.round(num * a) / a;
  return num.toLocaleString(); // adds commas for numbers > 1000
}
