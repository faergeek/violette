open Fx
open MergeIntoMap
open Monad_syntax
open Subsonic
open Zustand

let make artistId =
  let* Deps.{ store } = ask () in
  let* response =
    let state = getState store in
    getArtist artistId |. provide { credentials = state.auth.credentials }
  in
  let artist =
    BaseArtist.
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
  let albumBaseById =
    mergeIntoMap state.albums.baseById response.album (fun x -> x.id)
  and albumIdsByArtistId =
    mergeIntoMap state.artists.albumIdsByArtistId
      [| Js.Array.map response.album ~f:BaseAlbum.(fun x -> x.id) |]
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
  ok ()
