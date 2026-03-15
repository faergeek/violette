export function format(gain: number) {
  return new Intl.NumberFormat('en-US', {
    minimumIntegerDigits: 2,
    minimumFractionDigits: 1,
    signDisplay: 'always',
  }).format(gain);
}
