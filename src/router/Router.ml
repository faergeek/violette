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

module Await = Await
module Link = Link
module Match = Match
module Outlet = Outlet
module Provider = Provider
module Redirect = Redirect
module Route = Route
module RouteApi = RouteApi
module State = State
