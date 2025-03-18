open Pages
open Router
open Route
open RouteApi

type loaderData = { initialListIds : string array }

let loader { context = { store }; _ } =
  let open Fx in
  let open Js.Promise in
  let open Promise.Monad_syntax in
  let open StoreFx in
  let* () =
    FetchArtists.make ()
    |. runAsync ~deps:{ store }
    |> then_ (fun result -> result |> Result.get_ok |> resolve)
  in
  let state = Zustand.getState store in
  { initialListIds = state.artists.listIds |> Option.get } |> resolve

let[@react.component] pendingComponent () =
  ArtistsPage.make ~listIds:(Array.init 30 (fun _ -> None)) () [@JSX]

let[@react.component] component () =
  let { initialListIds } = getRouteApi "/_layout/" |. useLoaderData in
  let listIds =
    Store.Context.useAppStore (fun state -> state.artists.listIds)
  in
  let listIds =
    listIds
    |> Option.value ~default:initialListIds
    |> Js.Array.map ~f:(fun id -> Some id)
  in
  (ArtistsPage.make ~listIds () [@JSX])

let route =
  options ~path:"/"
    ~getParentRoute:(Fun.const LayoutRoute.route)
    ~beforeLoad:Shared.RouterUtils.requireSubsonicCredentials ~loader
    ~pendingComponent ~component ()
  |> make
