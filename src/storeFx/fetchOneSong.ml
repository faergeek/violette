open Fx
open MergeIntoMap
open Monad_syntax

let make id =
  let* Deps.{ store } = ask () in
  let* song =
    let state = store |. Zustand.getState in
    Subsonic.GetSong.make id
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  let state = store |. Zustand.getState in
  let byId = mergeIntoMap state.songs.byId [| song |] (fun x -> x.id) in
  if byId != state.songs.byId then
    store
    |. Zustand.setState (fun prevState -> { prevState with songs = { byId } });
  Ok ()
