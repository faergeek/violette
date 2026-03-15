export const audio = new Audio();
audio.crossOrigin = 'anonymous';

export const replayGainValue: { contents?: number } = {};
export const skipping = { contents: false };

export const value: {
  contents?: {
    audioContext: AudioContext;
    replayGainNode: GainNode;
    volumeNode: GainNode;
  };
} = {};
