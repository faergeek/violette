open Fx
open Monad_syntax

include Throttle.Make (struct
  type input = Store.t
  type output = unit

  let ms = 5000

  let run store =
    let fx =
      let* Deps.{ store } = ask () in
      let state = store |. Zustand.getState in
      match state.player.currentSongId with
      | None -> Ok ()
      | Some _ ->
          UpdatePlayQueue.make (fun prevState ->
              {
                prevState with
                currentTime =
                  Js.Math.floor_float
                    ((PlayerContext.audio
                    |. DomExtra.HtmlAudioElement.currentTime)
                    *. 1000.0);
              })
    in
    fx
    |. runAsync ~deps:{ store }
    |> Js.Promise.then_ (fun result ->
           result |> Result.get_ok |> Js.Promise.resolve)
end)
