open Fx
open MergeIntoMap
open Monad_syntax
open Zustand

let make artistId =
  let* Deps.{ store } = ask () in
  let* { biography; lastFmUrl; musicBrainzId; similarArtist } =
    let state = getState store in
    Subsonic.GetArtistInfo2.make artistId ~includeNotPresent:true ()
    |. provide ~deps:{ credentials = state.auth.credentials }
  in
  let artistInfo =
    Subsonic.ArtistInfo.{ biography; lastFmUrl; musicBrainzId }
  in
  let artistInfoById =
    let state = getState store in
    mergeIntoMap state.artists.artistInfoById [| artistInfo |] (fun _ ->
        artistId)
  in
  let byId =
    let state = getState store in
    match similarArtist with
    | None -> state.artists.byId
    | Some similarArtist ->
        mergeIntoMap state.artists.byId
          (Belt.Array.keepMap similarArtist (fun artist ->
               match artist with
               | Subsonic.SimilarArtist.BasicInfo _ -> None
               | Artist artist -> (
                   match state.artists.byId |. Js.Map.get ~key:artist.id with
                   | None -> Some artist
                   | Some original ->
                       Some
                         {
                           original with
                           albumCount = artist.albumCount;
                           coverArt = artist.coverArt;
                           musicBrainzId = artist.musicBrainzId;
                           name = artist.name;
                           starred = artist.starred;
                           userRating = artist.userRating;
                         })))
          (fun x -> x.id)
  in
  let similarArtistsById =
    let state = getState store in
    mergeIntoMap state.artists.similarArtistsById
      [| similarArtist |> Option.value ~default:[||] |]
      (fun _ -> artistId)
  in
  if
    let state = getState store in
    artistInfoById != state.artists.artistInfoById
    || byId != state.artists.byId
    || similarArtistsById != state.artists.similarArtistsById
  then
    store
    |. Zustand.setState (fun prevState ->
        {
          prevState with
          artists =
            { prevState.artists with artistInfoById; byId; similarArtistsById };
        });
  Ok ()
