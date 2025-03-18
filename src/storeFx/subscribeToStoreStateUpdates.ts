import { Fx } from '../_core/fx';
import { subsonicGetCoverArtUrl } from '../api/subsonic/methods/getCoverArtUrl';
import { subsonicGetStreamUrl } from '../api/subsonic/methods/getStreamUrl';
import { subsonicScrobble } from '../api/subsonic/methods/scrobble';
import { PreferredGain } from '../slices/player';
import type { AppStore } from '../store/create';
import { initializePlayQueue } from './initializePlayQueue';
import {
  audio,
  playerContext,
  setReplayGainValue,
  setSkipping,
  skipping,
} from './playerContext';

let timePlayed = 0;

export const subscribeToStoreStateUpdates = Fx.async(async function* f() {
  const { store } = yield* Fx.ask<{ store: AppStore }>();

  store.subscribe((state, prevState) => {
    const { auth, player, songs } = state;

    if (
      (player.currentTime !== prevState.player.currentTime ||
        player.duration !== prevState.player.duration) &&
      player.duration != null
    ) {
      navigator.mediaSession.setPositionState({
        duration: player.duration,
        position: Math.min(player.currentTime, player.duration),
      });
    }

    if (
      player.currentSongId === prevState.player.currentSongId &&
      player.currentTime !== prevState.player.currentTime
    ) {
      if (skipping) {
        setSkipping(false);
      } else if (player.currentTime > prevState.player.currentTime) {
        timePlayed += player.currentTime - prevState.player.currentTime;
      }
    }

    if (
      auth.credentials !== prevState.auth.credentials ||
      player.currentSongId !== prevState.player.currentSongId
    ) {
      const src =
        auth.credentials == null || player.currentSongId == null
          ? ''
          : subsonicGetStreamUrl(auth.credentials, player.currentSongId);

      if (audio.src !== src) audio.src = src;
    }

    const song = player.currentSongId
      ? songs.byId.get(player.currentSongId)
      : undefined;

    if (player.currentSongId !== prevState.player.currentSongId) {
      const { credentials } = auth;
      const metadata = new MediaMetadata();

      if (credentials && song) {
        metadata.album = song.album;
        metadata.artist = song.artist;
        metadata.title = song.title;

        metadata.artwork = [96, 128, 192, 256, 384, undefined].map(
          (size): MediaImage => ({
            src: subsonicGetCoverArtUrl(credentials, song.coverArt, { size }),
            sizes: size == null ? '' : `${size}x${size}`,
          }),
        );
      }

      navigator.mediaSession.metadata = metadata;
    }

    if (
      player.currentSongId !== prevState.player.currentSongId ||
      player.replayGainOptions !== prevState.player.replayGainOptions
    ) {
      const replayGain = song?.replayGain ?? {};
      const { albumGain, albumPeak, trackGain, trackPeak } = replayGain;

      // https://wiki.hydrogenaud.io/index.php?title=ReplayGain_2.0_specification#Player_requirements
      const gain =
        player.replayGainOptions.preferredGain == null
          ? 0
          : ({
              [PreferredGain.Album]: albumGain ?? trackGain,
              [PreferredGain.Track]: trackGain ?? albumGain,
            }[player.replayGainOptions.preferredGain] ?? 0);

      const peak =
        player.replayGainOptions.preferredGain == null
          ? 1
          : ({
              [PreferredGain.Album]: albumPeak ?? trackPeak,
              [PreferredGain.Track]: trackPeak ?? albumPeak,
            }[player.replayGainOptions.preferredGain] ?? 1);

      const newReplayGainValue = Math.min(
        10 ** ((gain + player.replayGainOptions.preAmp) / 20),
        1 / peak,
      );

      setReplayGainValue(newReplayGainValue);

      if (playerContext) {
        playerContext.replayGainNode.gain.setValueAtTime(
          newReplayGainValue,
          playerContext.audioContext.currentTime,
        );
      }
    }

    if (
      auth.credentials != null &&
      player.currentSongId != null &&
      !player.paused &&
      (player.currentSongId !== prevState.player.currentSongId ||
        player.paused !== prevState.player.paused)
    ) {
      subsonicScrobble(player.currentSongId, { submission: false }).runAsync({
        credentials: auth.credentials,
      });
    }

    if (
      player.currentSongId !== prevState.player.currentSongId &&
      prevState.player.currentSongId != null
    ) {
      if (
        auth.credentials != null &&
        prevState.player.duration != null &&
        prevState.player.duration >= 30 &&
        // https://www.last.fm/api/scrobbling#when-is-a-scrobble-a-scrobble
        (timePlayed / prevState.player.duration >= 0.5 || timePlayed >= 4 * 60)
      ) {
        subsonicScrobble(prevState.player.currentSongId).runAsync({
          credentials: auth.credentials,
        });
      }

      timePlayed = 0;
    }
  });

  return initializePlayQueue();
});
