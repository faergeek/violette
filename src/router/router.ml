external [@mel.module "@tanstack/react-router"] deepEqual : 'a -> 'a -> bool
  = "deepEqual"

type t = Types.router
type options

external [@mel.obj] options :
  context:Route.context ->
  defaultPreload:[ `intent ] ->
  routeTree:Route.t ->
  scrollRestoration:bool ->
  options = ""

external [@mel.module "@tanstack/react-router"] make : options -> t
  = "createRouter"

external [@mel.send] invalidate : t -> unit = "invalidate"

type navigateOptions

external [@mel.obj] navigateOptions : _to:string -> navigateOptions = ""

type navigate = navigateOptions -> unit

external [@mel.module "@tanstack/react-router"] useNavigate : unit -> navigate
  = "useNavigate"

module Await = Await
module Link = Link
module Match = Match
module Outlet = Outlet
module Provider = Provider
module Redirect = Redirect
module Route = Route
module RouteApi = RouteApi
module State = State
