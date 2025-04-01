open Fx
open MergeIntoMap
open Monad_syntax
open Zustand

let make artistId =
  let* Deps.{ store } = ask () in
  let* response =
    let state = getState store in
    Subsonic.GetArtist.make artistId
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  let artist =
    Subsonic.BaseArtist.
      {
        albumCount = response.albumCount;
        coverArt = response.coverArt;
        id = response.id;
        musicBrainzId = response.musicBrainzId;
        name = response.name;
        starred = response.starred;
        userRating = response.userRating;
      }
  and state = getState store in
  let albums = response.album |> Option.value ~default:[||] in
  let albumBaseById = mergeIntoMap state.albums.baseById albums (fun x -> x.id)
  and albumIdsByArtistId =
    mergeIntoMap state.artists.albumIdsByArtistId
      [| Js.Array.map albums ~f:Subsonic.BaseAlbum.(fun x -> x.id) |]
      (fun _ -> response.id)
  and byId = mergeIntoMap state.artists.byId [| artist |] (fun x -> x.id) in
  if
    albumBaseById != state.albums.baseById
    || albumIdsByArtistId != state.artists.albumIdsByArtistId
    || byId != state.artists.byId
  then
    store
    |. setState (fun prevState ->
           {
             prevState with
             albums = { prevState.albums with baseById = albumBaseById };
             artists = { prevState.artists with albumIdsByArtistId; byId };
           });
  Ok ()
