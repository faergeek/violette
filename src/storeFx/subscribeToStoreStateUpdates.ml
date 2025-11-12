open Fx
open Monad_syntax

let timePlayed = ref 0.0

let make () =
  let* Deps.{ store } = ask () in
  store
  |. Zustand.subscribe (fun state prevState ->
      (if
         state.player.currentTime != prevState.player.currentTime
         || state.player.duration != prevState.player.duration
       then
         match state.player.duration with
         | None -> ()
         | Some duration ->
             MediaSession.(
               positionState ~duration
                 ~position:(Js.Math.min_float state.player.currentTime duration)
               |> setPositionState));
      if
        state.player.currentSongId == prevState.player.currentSongId
        && state.player.currentTime != prevState.player.currentTime
      then
        if !PlayerContext.skipping then PlayerContext.skipping := false
        else if state.player.currentTime > prevState.player.currentTime then
          timePlayed :=
            !timePlayed +. state.player.currentTime
            -. prevState.player.currentTime;
      (if
         state.auth.credentials != prevState.auth.credentials
         || state.player.currentSongId != prevState.player.currentSongId
       then
         let src =
           match (state.auth.credentials, state.player.currentSongId) with
           | None, _ | _, None -> ""
           | Some credentials, Some currentSongId ->
               Subsonic.StreamUrl.make credentials currentSongId
         in
         if PlayerContext.audio |. DomExtra.HtmlAudioElement.src != src then
           PlayerContext.audio |. DomExtra.HtmlAudioElement.setSrc src);
      let song =
        state.player.currentSongId
        |. Option.bind (fun currentSongId ->
            state.songs.byId |. Js.Map.get ~key:currentSongId)
      in
      if state.player.currentSongId != prevState.player.currentSongId then (
        let Store.State.{ credentials; _ } = state.auth in
        let metadata = MediaSession.Metadata.make () in
        (match (credentials, song) with
        | None, _ | _, None -> ()
        | Some credentials, Some song ->
            metadata |. MediaSession.Metadata.setAlbum song.album;
            metadata |. MediaSession.Metadata.setArtist song.artist;
            metadata |. MediaSession.Metadata.setTitle song.title;
            metadata
            |. MediaSession.Metadata.setArtwork
                 ([| Some 96; Some 128; Some 192; Some 256; Some 384; None |]
                 |> Js.Array.map ~f:(fun size ->
                     let src =
                       Subsonic.CoverArt.makeUrl ~credentials
                         ~coverArt:song.coverArt ?size ()
                     and sizes =
                       match size with
                       | None -> ""
                       | Some size ->
                           let size = size |. Js.Int.toString in
                           size ^ "x" ^ size
                     in
                     MediaSession.Metadata.{ sizes; src })));
        Webapi.Dom.window |. Webapi.Dom.Window.navigator
        |. MediaSession.setMetadata metadata);
      if
        state.player.currentSongId != prevState.player.currentSongId
        || state.player.replayGainOptions != prevState.player.replayGainOptions
      then (
        let Subsonic.ReplayGain.{ albumGain; albumPeak; trackGain; trackPeak } =
          song
          |. Option.bind (fun x -> Subsonic.Song.(x.replayGain))
          |> Option.value
               ~default:
                 Subsonic.ReplayGain.
                   {
                     albumGain = None;
                     albumPeak = None;
                     trackGain = None;
                     trackPeak = None;
                   }
        in
        (* https://wiki.hydrogenaud.io/index.php?title=ReplayGain_2.0_specification#Player_requirements *)
        let gain =
          state.player.replayGainOptions.preferredGain
          |. Option.bind (function
            | `album -> albumGain |> Belt.Option.orElse trackGain
            | `track -> trackGain |> Belt.Option.orElse albumGain)
          |> Option.value ~default:0.0
        and peak =
          state.player.replayGainOptions.preferredGain
          |. Option.bind (function
            | `album -> albumPeak |> Belt.Option.orElse trackPeak
            | `track -> trackPeak |> Belt.Option.orElse albumPeak)
          |> Option.value ~default:1.0
        in
        let newReplayGainValue =
          Js.Math.min_float
            (10.0 ** ((gain +. state.player.replayGainOptions.preAmp) /. 20.0))
            (1.0 /. peak)
        in
        PlayerContext.replayGainValue := Some newReplayGainValue;
        !PlayerContext.value
        |> Option.iter (fun v ->
            let open WebAudio in
            let open PlayerContext in
            v.replayGainNode |. AudioNode.gain
            |. AudioParam.setValueAtTime newReplayGainValue
                 (v.audioContext |. AudioContext.currentTime)));
      (match (state.auth.credentials, state.player.currentSongId) with
      | None, _ | _, None -> ()
      | Some _, Some currentSongId ->
          if
            (not state.player.paused)
            && (state.player.currentSongId != prevState.player.currentSongId
               || state.player.paused != prevState.player.paused)
          then
            Subsonic.Scrobble.make currentSongId ~submission:false ()
            |> runAsync
                 ~deps:Subsonic.Deps.{ credentials = state.auth.credentials }
            |> ignore);
      (match (state.player.currentSongId, prevState.player.currentSongId) with
        | None, _ | _, None -> None
        | Some currentSongId, Some prevSongId -> Some (currentSongId, prevSongId))
      |> Option.iter (fun (currentSongId, prevSongId) ->
          if currentSongId != prevSongId then
            match (state.auth.credentials, prevState.player.duration) with
            | None, _ | _, None -> ()
            | Some credentials, Some duration ->
                if
                  duration >= 30.0
                  &&
                  (* https://www.last.fm/api/scrobbling#when-is-a-scrobble-a-scrobble *)
                  (!timePlayed /. duration >= 0.5 || !timePlayed >= 4.0 *. 60.0)
                then
                  Subsonic.Scrobble.make prevSongId ()
                  |. runAsync
                       ~deps:Subsonic.Deps.{ credentials = Some credentials }
                  |> ignore;
                timePlayed := 0.0));
  InitializePlayQueue.make ()
