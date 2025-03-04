open Fx
open Monad_syntax
open MergeIntoMap
open Subsonic
open Zustand

type deps = { store : Store.t }

let useRun () =
  let store = Store.Context.useStore () in
  fun fx -> fx |. Fx.run ~deps:{ store }

let useRunAsync () =
  let store = Store.Context.useStore () in
  fun fx -> fx |. Fx.runAsync ~deps:{ store }

external [@mel.module "./goToPrevSong"] goToPrevSong :
  unit -> (unit, unit, deps) Fx.t = "goToPrevSong"

external [@mel.module "./goToNextSong"] goToNextSong :
  unit -> (unit, unit, deps) Fx.t = "goToNextSong"

external [@mel.module "./handleMediaSessionAction"] handleMediaSessionAction :
  MediaSession.actionDetails -> (unit, unit, deps) Fx.t
  = "handleMediaSessionAction"

external [@mel.module "./setCurrentTime"] setCurrentTime :
  (float -> float) -> (unit, unit, deps) Fx.t = "setCurrentTime"

external [@mel.module "./setReplayGainOptions"] setReplayGainOptions :
  (Store.State.ReplayGainOptions.t -> Store.State.ReplayGainOptions.t) ->
  (unit, unit, deps) Fx.t = "setReplayGainOptions"

external [@mel.module "./setVolume"] setVolume :
  (float -> float) -> (unit, unit, deps) Fx.t = "setVolume"

type starParams = {
  albumId : string option;
  artistId : string option;
  id : string option;
}

external [@mel.module "./star"] star : starParams -> (unit, unit, deps) Fx.t
  = "star"

external [@mel.module "./subscribeToAudioEvents"] subscribeToAudioEvents :
  unit -> (unit, unit, deps) Fx.t = "subscribeToAudioEvents"

external
  [@mel.module "./subscribeToStoreStateUpdates"] subscribeToStoreStateUpdates :
  unit -> (unit, unit, deps) Fx.t = "subscribeToStoreStateUpdates"

external [@mel.module "./unstar"] unstar : starParams -> (unit, unit, deps) Fx.t
  = "unstar"

type startPlayingOptions

external [@mel.obj] startPlayingOptions :
  current:string -> queued:string array option -> startPlayingOptions = ""

external [@mel.module "./startPlaying"] startPlaying :
  startPlayingOptions -> (unit, unit, deps) Fx.t = "startPlaying"

external [@mel.module "./toggleMuted"] toggleMuted :
  unit -> (unit, unit, deps) Fx.t = "toggleMuted"

external [@mel.module "./togglePaused"] togglePaused :
  unit -> (unit, unit, deps) Fx.t = "togglePaused"

type playQueueState = {
  current : string option;
  currentTime : float;
  queued : string array;
}

external [@mel.module "./updatePlayQueue"] updatePlayQueue :
  (playQueueState -> playQueueState) -> (unit, unit, deps) Fx.t
  = "updatePlayQueue"

let fetchArtists () =
  let* { store } = ask () in
  let* { index } =
    let state = getState store in
    fetchArtists () |. provide { credentials = state.auth.credentials }
  in
  let artists =
    index
    |. Js.Array.reduce ~init:[||] ~f:(fun acc entry ->
           acc |> Js.Array.pushMany ~values:Artists.(entry.artist) |> ignore;
           acc)
  in
  let state = getState store in
  let byId = mergeIntoMap state.artists.byId artists (fun x -> x.id) in
  let listIds =
    Some (artists |> Js.Array.map ~f:(fun artist -> BaseArtist.(artist.id)))
  in
  if byId != state.artists.byId || not (deepEqual listIds state.artists.listIds)
  then
    store
    |. setState (fun prevState ->
           { prevState with artists = { prevState.artists with byId; listIds } });
  ok ()

let fetchOneAlbum albumId =
  let* { store } = ask () in
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
    getAlbum albumId |. provide { credentials = state.auth.credentials }
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
  ok ()

let fetchAlbumInfo albumId =
  let* { store } = ask () in
  let* albumInfo =
    let state = getState store in
    getAlbumInfo albumId |. provide { credentials = state.auth.credentials }
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
  ok ()

let fetchOneArtist artistId =
  let* { store } = ask () in
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

let fetchArtistInfo artistId =
  let* { store } = ask () in
  let* { biography; lastFmUrl; musicBrainzId; similarArtist } =
    let state = getState store in
    getArtistInfo artistId ~includeNotPresent:true ()
    |. provide { credentials = state.auth.credentials }
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
               | SimilarArtist.BasicInfo _ -> None
               | SimilarArtist.Artist artist -> (
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
               {
                 prevState.artists with
                 artistInfoById;
                 byId;
                 similarArtistsById;
               };
           });
  ok ()

let fetchTopSongs artistName =
  let* { store } = ask () in
  let state = Zustand.getState store in
  let* songs =
    Subsonic.getTopSongs artistName ()
    |. provide { credentials = state.auth.credentials }
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
  ok ()
