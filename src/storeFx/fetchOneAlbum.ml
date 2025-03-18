open Fx
open Monad_syntax
open MergeIntoMap
open Zustand

let make albumId =
  let* Deps.{ store } = ask () in
  let* {
         artist;
         artistId;
         coverArt;
         discTitles;
         duration;
         genre;
         genres;
         id;
         isCompilation;
         musicBrainzId;
         name;
         originalReleaseDate;
         releaseDate;
         song;
         songCount;
         starred;
         userRating;
         year;
       } =
    let state = getState store in
    Subsonic.GetAlbum.make albumId
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  let baseById =
    let state = getState store in
    mergeIntoMap state.albums.baseById
      [|
        {
          artist;
          artistId;
          coverArt;
          duration;
          genre;
          genres;
          id;
          musicBrainzId;
          name;
          songCount;
          starred;
          userRating;
          year;
        };
      |]
      (fun _ -> albumId)
  and detailsById =
    let state = getState store in
    mergeIntoMap state.albums.detailsById
      [|
        Subsonic.AlbumDetails.
          { discTitles; isCompilation; originalReleaseDate; releaseDate };
      |]
      (fun _ -> albumId)
  and songIdsById =
    let state = getState store in
    mergeIntoMap state.albums.songIdsById
      [| song |> Js.Array.map ~f:Subsonic.Song.(fun x -> x.id) |]
      (fun _ -> albumId)
  and songsById =
    let state = getState store in
    mergeIntoMap state.songs.byId song (fun x -> x.id)
  in
  if
    let state = getState store in
    baseById != state.albums.baseById
    || detailsById != state.albums.detailsById
    || songIdsById != state.albums.songIdsById
    || songsById != state.songs.byId
  then
    store
    |. Zustand.setState (fun prevState ->
           {
             prevState with
             albums =
               { prevState.albums with baseById; detailsById; songIdsById };
             songs = { byId = songsById };
           });
  Ok ()
