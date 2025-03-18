open Fx
open MergeIntoMap
open Monad_syntax

let make artistName =
  let* Deps.{ store } = ask () in
  let state = Zustand.getState store in
  let* songs =
    Subsonic.GetTopSongs.make artistName ()
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  let songs = songs |> Option.value ~default:[||] in
  let topSongIdsByArtistName =
    let state = Zustand.getState store in
    mergeIntoMap state.artists.topSongIdsByArtistName
      [| songs |> Js.Array.map ~f:(fun song -> Subsonic.Song.(song.id)) |]
      (fun _ -> artistName)
  in
  let songsById =
    let state = Zustand.getState store in
    mergeIntoMap state.songs.byId songs (fun song -> song.id)
  in
  if
    let state = Zustand.getState store in
    topSongIdsByArtistName != state.artists.topSongIdsByArtistName
    || songsById != state.songs.byId
  then
    store
    |. Zustand.setState (fun prevState ->
           {
             prevState with
             artists = { prevState.artists with topSongIdsByArtistName };
             songs = { byId = songsById };
           });
  Ok ()
