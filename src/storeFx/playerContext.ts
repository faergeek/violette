export const audio = new Audio();
audio.crossOrigin = 'anonymous';

export interface PlayerContext {
  audioContext: AudioContext;
  replayGainNode: GainNode;
  volumeNode: GainNode;
}

export interface TimeRange {
  start: number;
  end: number;
}

export let playerContext: PlayerContext | undefined;

export function setPlayerContext(newCtx: PlayerContext) {
  playerContext = newCtx;
}

export let replayGainValue: number | undefined;

export function setReplayGainValue(newValue: number) {
  replayGainValue = newValue;
}

export let skipping = false;

export function setSkipping(newSkipping: boolean) {
  skipping = newSkipping;
}
