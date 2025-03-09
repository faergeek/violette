type t
type ('params, 'search, 'deps, 'loaderData) options
type context = { store : Store.t }

type ('deps, 'params) loaderArg = {
  context : context;
  deps : 'deps;
  location : State.location;
  params : 'params;
}

type 'search loaderDepsInput = { search : 'search }

external [@mel.obj] options :
  ?beforeLoad:(('deps, 'params) loaderArg -> Redirect.t option Js.Promise.t) ->
  ?component:< > Js.t React.component ->
  ?getParentRoute:(unit -> t) ->
  ?id:string ->
  ?loader:(('deps, 'params) loaderArg -> 'loaderData Js.Promise.t) ->
  ?loaderDeps:('search loaderDepsInput -> 'deps) ->
  ?path:string ->
  ?pendingComponent:< > Js.t React.component ->
  ?validateSearch:(Js.Json.t -> 'a) ->
  unit ->
  ('params, 'search, 'deps, 'loaderData) options = ""

external [@mel.module "@tanstack/react-router"] makeRoot :
  ('params, 'search, 'deps, 'loaderData) options -> t = "createRootRoute"

external [@mel.module "@tanstack/react-router"] make :
  ('params, 'search, 'deps, 'loaderData) options -> t = "createRoute"

external [@mel.send] addChildren : t -> t Js.Array.t -> t = "addChildren"
