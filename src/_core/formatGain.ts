const gainFormat = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 2,
  minimumFractionDigits: 1,
  signDisplay: 'always',
});

export function formatGain(gain: number) {
  return gainFormat.format(gain);
}
