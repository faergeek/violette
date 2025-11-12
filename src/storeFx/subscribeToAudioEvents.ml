open Fx
open Monad_syntax

let make () =
  let* Deps.{ store } = ask () in
  let abortController = Fetch.AbortController.make () in
  let signal = abortController |. Fetch.AbortController.signal in
  let listenerOptions = DomExtra.listenerOptions ~signal () in
  let addEventListener listener =
    PlayerContext.audio |. DomExtra.addEventListener listener listenerOptions
  in
  addEventListener
    (`ended
       (fun _ ->
         GoToNextSong.make ()
         |. runAsync ~deps:{ store }
         |> Js.Promise.then_ (fun result ->
             result |> Result.get_ok |> Js.Promise.resolve)
         |> ignore));
  addEventListener
    (`emptied
       (fun _ ->
         store
         |. Zustand.setState (fun prevState ->
             {
               prevState with
               player =
                 {
                   prevState.player with
                   buffered = [||];
                   currentTime = 0.0;
                   duration = None;
                   muted = prevState.player.muted;
                   paused = true;
                   volume = prevState.player.volume;
                 };
             })));
  addEventListener
    (`durationchange
       (fun _ ->
         store
         |. Zustand.setState (fun prevState ->
             {
               prevState with
               player =
                 {
                   prevState.player with
                   duration =
                     (if
                        PlayerContext.audio
                        |. DomExtra.HtmlAudioElement.duration
                        |> Js.Float.isFinite
                      then
                        PlayerContext.audio
                        |. DomExtra.HtmlAudioElement.duration |> Option.some
                      else None);
                 };
             })));
  addEventListener
    (`pause
       (fun _ ->
         store
         |. Zustand.setState (fun prevState ->
             { prevState with player = { prevState.player with paused = true } })));
  addEventListener
    (`play
       (fun _ ->
         store
         |. Zustand.setState (fun prevState ->
             {
               prevState with
               player = { prevState.player with paused = false };
             })));
  let updateCurrentTimeRaf = ref None in
  addEventListener
    (`timeupdate
       (fun _ ->
         !updateCurrentTimeRaf |> Option.iter Webapi.cancelAnimationFrame;
         updateCurrentTimeRaf :=
           Some
             (Webapi.requestCancellableAnimationFrame (fun _ ->
                  updateCurrentTimeRaf := None;
                  store
                  |. Zustand.setState (fun prevState ->
                      {
                        prevState with
                        player =
                          {
                            prevState.player with
                            currentTime =
                              PlayerContext.audio
                              |. DomExtra.HtmlAudioElement.currentTime;
                          };
                      })));
         store |> SaveCurrentTime.make |> ignore));
  store
  |. Zustand.setState (fun prevState ->
      {
        prevState with
        player =
          {
            prevState.player with
            currentTime =
              PlayerContext.audio |. DomExtra.HtmlAudioElement.currentTime;
            paused = PlayerContext.audio |. DomExtra.HtmlAudioElement.paused;
            duration =
              (if
                 Js.Float.isFinite
                   (PlayerContext.audio |. DomExtra.HtmlAudioElement.duration)
               then
                 Some (PlayerContext.audio |. DomExtra.HtmlAudioElement.duration)
               else None);
            muted = PlayerContext.audio |. DomExtra.HtmlAudioElement.muted;
            volume = PlayerContext.audio |. DomExtra.HtmlAudioElement.volume;
          };
      });
  let interval =
    Js.Global.setInterval 500 ~f:(fun () ->
        let src = PlayerContext.audio |. DomExtra.HtmlAudioElement.src in
        if src != "" then
          let buffered =
            PlayerContext.audio |. DomExtra.HtmlAudioElement.buffered
          in
          let buffered =
            buffered |> DomExtra.TimeRanges.length
            |. Belt.Array.init (fun i ->
                Store.State.
                  {
                    end_ = buffered |. DomExtra.TimeRanges.end_ i;
                    start = buffered |. DomExtra.TimeRanges.start i;
                  })
          in
          let Store.State.{ player; _ } = store |. Zustand.getState in
          if not (Router.deepEqual buffered player.buffered) then
            store
            |. Zustand.setState (fun prevState ->
                { prevState with player = { prevState.player with buffered } }))
  in
  Ok
    (fun () ->
      Js.Global.clearInterval interval;
      abortController |> Fetch.AbortController.abort)
