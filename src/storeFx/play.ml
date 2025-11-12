open DomExtra
open Fx
open Monad_syntax

let make () =
  let* () =
    match !PlayerContext.value with
    | Some _ -> Ok ()
    | None ->
        let open WebAudio in
        let audioContext = AudioContext.make () in
        let replayGainNode = audioContext |. AudioContext.createGain in
        let volumeNode = audioContext |. AudioContext.createGain in
        audioContext
        |. AudioContext.createMediaElementSource PlayerContext.audio
        |. AudioNode.connect replayGainNode
        |. AudioNode.connect volumeNode
        |. AudioNode.connect (audioContext |. AudioContext.destination)
        |> ignore;
        let* Deps.{ store } = ask () in
        let state = store |. Zustand.getState in
        volumeNode |. AudioNode.gain |. AudioParam.setValue state.player.volume;
        !PlayerContext.replayGainValue
        |> Option.iter (fun replayGainValue ->
            replayGainNode |. AudioNode.gain
            |. AudioParam.setValueAtTime replayGainValue
                 (audioContext |. AudioContext.currentTime));
        PlayerContext.value := Some { audioContext; replayGainNode; volumeNode };
        Ok ()
  in
  Async
    (fun _ ->
      PlayerContext.audio |. HtmlAudioElement.play
      |> Js.Promise.then_ (fun () -> Ok () |> Js.Promise.resolve)
      |> Js.Promise.catch (fun _ -> Error () |> Js.Promise.resolve))
