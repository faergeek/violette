type preferredGainRecord = {
  album : string; [@mel.as "Album"]
  track : string; [@mel.as "Track"]
}

let[@mel.as "PreferredGain"] pref = { album = "album"; track = "track" }

open State

let replay_gain_local_storage_key = "replayGain"

let make () : player =
  let open Dom.Storage in
  let replayGainOptions =
    localStorage
    |> getItem replay_gain_local_storage_key
    |> Option.map (Fun.compose ReplayGainOptions.of_json Json.parseOrRaise)
    |> Option.value
         ~default:ReplayGainOptions.{ preAmp = 0.0; preferredGain = None }
  in
  {
    buffered = [||];
    currentSongId = None;
    currentTime = 0.0;
    duration = None;
    muted = false;
    paused = true;
    queuedSongIds = [||];
    replayGainOptions;
    volume = 1.0;
  }
