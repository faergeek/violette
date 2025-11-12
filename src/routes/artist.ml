open Pages
open Router
open Route
open RouteApi
open Shared

type params = { artistId : string }

type loaderData = {
  deferredArtistInfo : Subsonic.ArtistInfo.withoutSimilarArtist Js.Promise.t;
  deferredSimilarArtists : Subsonic.SimilarArtist.t array Js.Promise.t;
  deferredTopSongIds : string array Js.Promise.t;
  initialAlbumIds : string array;
  initialArtist : Subsonic.BaseArtist.t;
}

let loader { context = { store }; params = { artistId }; _ } =
  let open Fx in
  let open Js.Promise in
  let open Promise.Monad_syntax in
  let open StoreFx in
  let fetchOnePromise =
    FetchOneArtist.make artistId
    |> runAsync ~deps:StoreFx.Deps.{ store }
    |> then_ (fun result ->
        let () = result |> Result.get_ok in
        let state = Zustand.getState store in
        Js.Map.get state.artists.byId ~key:artistId |> Option.get |> resolve)
  and artistInfoPromise =
    FetchArtistInfo.make artistId
    |> runAsync ~deps:StoreFx.Deps.{ store }
    |> then_ (fun result -> result |> Result.get_ok |> resolve)
  in
  let deferredArtistInfo =
    artistInfoPromise
    |> then_ (fun () ->
        let state = Zustand.getState store in
        state.artists.artistInfoById |. Js.Map.get ~key:artistId |> Option.get
        |> resolve)
  and deferredSimilarArtists =
    artistInfoPromise
    |> then_ (fun () ->
        let state = Zustand.getState store in
        state.artists.similarArtistsById |. Js.Map.get ~key:artistId
        |> Option.get |> resolve)
  in
  let* initialArtist =
    let state = Zustand.getState store in
    state.artists.byId |. Js.Map.get ~key:artistId
    |> Option.fold ~none:fetchOnePromise ~some:resolve
  in
  let credentials =
    let state = Zustand.getState store in
    state.auth.credentials |> Option.get
  in
  CoverArt.preload ~credentials ~coverArt:initialArtist.coverArt
    ~sizes:MediaHeader.media_header_cover_art_sizes;
  let* _ = fetchOnePromise in
  let initialAlbumIds =
    let state = Zustand.getState store in
    state.artists.albumIdsByArtistId |. Js.Map.get ~key:artistId |> Option.get
  and deferredTopSongIds =
    FetchTopSongs.make initialArtist.name
    |. runAsync ~deps:{ store }
    |> then_ (fun result ->
        let () = result |> Result.get_ok in
        let state = Zustand.getState store in
        state.artists.topSongIdsByArtistName
        |. Js.Map.get ~key:initialArtist.name
        |> Option.get |> resolve)
  in
  resolve
    {
      deferredArtistInfo;
      deferredSimilarArtists;
      deferredTopSongIds;
      initialAlbumIds;
      initialArtist;
    }

let[@react.component] pendingComponent () =
  let params = getRouteApi "/_layout/artist/$artistId" |. useParams in
  (ArtistPage.make ~params () [@JSX])

let[@react.component] component () =
  let routeApi = getRouteApi "/_layout/artist/$artistId" in
  let params = routeApi |. useParams
  and {
    deferredArtistInfo;
    deferredSimilarArtists;
    deferredTopSongIds;
    initialAlbumIds;
    initialArtist;
  } =
    routeApi |. useLoaderData
  in
  (ArtistPage.make ~deferredArtistInfo ~deferredSimilarArtists
     ~deferredTopSongIds ~initialAlbumIds ~initialArtist ~params () [@JSX])

let route =
  options ~path:"/artist/$artistId"
    ~getParentRoute:(Fun.const LayoutRoute.route)
    ~beforeLoad:RouterUtils.requireSubsonicCredentials ~loader ~pendingComponent
    ~component ()
  |> make
