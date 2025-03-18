open State

let replay_gain_local_storage_key = "replayGain"

let make () =
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
