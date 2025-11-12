open Pages
open Router
open Route
open RouteApi
open Shared

type params = { albumId : string }

type loaderData = {
  deferredAlbumInfo : Subsonic.AlbumInfo.albumInfo Js.Promise.t;
}

let loader { context = { store }; params = { albumId }; _ } =
  let open Fx in
  let open Js.Promise in
  let open Promise.Monad_syntax in
  let open StoreFx in
  let credentials =
    let state = Zustand.getState store in
    state.auth.credentials |> Option.get
  and albumPromise =
    FetchOneAlbum.make albumId
    |. runAsync ~deps:{ store }
    |> then_ (fun result -> result |> Result.get_ok |> resolve)
  in
  let basePromise =
    albumPromise
    |> then_ (fun () ->
        let state = Zustand.getState store in
        state.albums.baseById |. Js.Map.get ~key:albumId |> Option.get
        |> resolve)
  in
  let* base =
    let state = Zustand.getState store in
    let base = state.albums.baseById |. Js.Map.get ~key:albumId in
    match base with None -> basePromise | Some base -> resolve base
  in
  CoverArt.preload ~credentials ~coverArt:base.coverArt
    ~sizes:MediaHeader.media_header_cover_art_sizes;
  let deferredAlbumInfo =
    FetchAlbumInfo.make albumId
    |. runAsync ~deps:{ store }
    |> then_ (fun result -> result |. Result.get_ok |> resolve)
    |> then_ (fun () ->
        let state = Zustand.getState store in
        state.albums.infoById |. Js.Map.get ~key:albumId |> Option.get
        |> resolve)
  in
  resolve { deferredAlbumInfo }

let[@react.component] pendingComponent () =
  let routeApi = getRouteApi "/_layout/album/$albumId" in
  let { albumId } = routeApi |. useParams in
  (AlbumPage.make ~albumId () [@JSX])

let[@react.component] component () =
  let routeApi = getRouteApi "/_layout/album/$albumId" in
  let { albumId } = routeApi |. useParams in
  let { deferredAlbumInfo } = routeApi |. useLoaderData in
  (AlbumPage.make ~albumId ~deferredAlbumInfo () [@JSX])

let route =
  options ~path:"/album/$albumId"
    ~getParentRoute:(Fun.const LayoutRoute.route)
    ~beforeLoad:RouterUtils.requireSubsonicCredentials ~loader ~pendingComponent
    ~component ()
  |> make
