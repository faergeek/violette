import { Fx } from '../_core/fx';
import type { AppStore } from '../store/create';
import {
  audio,
  playerContext,
  replayGainValue,
  setPlayerContext,
} from './playerContext';

export const play = Fx.async(async function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  if (!playerContext) {
    const audioContext = new AudioContext();
    const replayGainNode = audioContext.createGain();
    const volumeNode = audioContext.createGain();
    audioContext
      .createMediaElementSource(audio)
      .connect(replayGainNode)
      .connect(volumeNode)
      .connect(audioContext.destination);

    volumeNode.gain.value = store.getState().player.volume;

    if (replayGainValue != null) {
      replayGainNode.gain.setValueAtTime(
        replayGainValue,
        audioContext.currentTime,
      );
    }

    setPlayerContext({ audioContext, replayGainNode, volumeNode });
  }

  try {
    await audio.play();
    return Fx.Ok();
  } catch (err) {
    return Fx.Err(err);
  }
});
