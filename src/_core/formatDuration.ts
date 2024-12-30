export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.round(duration - minutes * 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
