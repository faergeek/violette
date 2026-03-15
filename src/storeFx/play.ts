import * as Fx from '../fx/fx';
import type { Store } from '../store/types';
import { audio, replayGainValue, value } from './playerContext';

export function make() {
  let fx;

  if (value.contents == null) {
    const audioContext = new AudioContext();
    const replayGainNode = audioContext.createGain();
    const volumeNode = audioContext.createGain();

    audioContext
      .createMediaElementSource(audio)
      .connect(replayGainNode)
      .connect(volumeNode)
      .connect(audioContext.destination);

    fx = Fx.bind(Fx.ask<{ store: Store }>(), ({ store }) => {
      const state = store.getState();

      volumeNode.gain.value = state.player.muted ? 0 : state.player.volume;

      if (replayGainValue.contents) {
        replayGainNode.gain.setValueAtTime(
          replayGainValue.contents,
          audioContext.currentTime,
        );
      }

      value.contents = { audioContext, replayGainNode, volumeNode };

      return Fx.Ok();
    });
  } else {
    fx = Fx.Ok();
  }

  return Fx.bind(fx, () =>
    Fx.Async(() =>
      audio.play().then(
        () => Fx.Ok(),
        () => Fx.Err(undefined),
      ),
    ),
  );
}
