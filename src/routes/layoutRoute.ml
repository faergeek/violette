open Router
open Route
open Shared

let route =
  options ~id:"/_layout" ~getParentRoute:(Fun.const Root.route)
    ~beforeLoad:RouterUtils.requireSubsonicCredentials ~component:Layout.make
    ~pendingComponent:Layout.make ()
  |> make
