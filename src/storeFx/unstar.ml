open Fx
open Monad_syntax

let make params =
  let* Deps.{ store } = ask () in
  let state = store |. Zustand.getState in
  let* () =
    Subsonic.Unstar.make params
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  match params with
  | { albumId = None; artistId = None; id = None } -> Ok ()
  | { albumId = Some albumId; _ } -> FetchOneAlbum.make albumId
  | { artistId = Some artistId; _ } -> FetchOneArtist.make artistId
  | { id = Some id; _ } -> FetchOneSong.make id
