open Fx
open Monad_syntax
open MergeIntoMap
open Zustand

let make albumId =
  let* Deps.{ store } = ask () in
  let* albumInfo =
    let state = getState store in
    Subsonic.GetAlbumInfo2.make albumId
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  let infoById =
    let state = getState store in
    mergeIntoMap state.albums.infoById [| albumInfo |] (fun _ -> albumId)
  in
  if
    let state = getState store in
    infoById != state.albums.infoById
  then
    store
    |. Zustand.setState (fun prevState ->
        { prevState with albums = { prevState.albums with infoById } });
  Ok ()
