open Pages
open Router
open Route

module Search = struct
  open Ppx_deriving_json_runtime.Primitives

  type[@deriving json] t = { next : string [@json.default "/"] }
end

let route =
  options ~path:"/login" ~getParentRoute:(Fun.const Root.route)
    ~component:LoginPage.make ~pendingComponent:LoginPage.make
    ~validateSearch:Search.of_json
    ~loaderDeps:(fun { search = Search.{ next } } -> Search.{ next })
    ~loader:(fun { context = { store }; deps = Search.{ next }; _ } ->
      let state = Zustand.getState store in
      match state.auth.credentials with
      | None -> Js.Promise.resolve ()
      | Some credentials ->
          let open Fx in
          Subsonic.ping ()
          |. map (fun () ->
                 let open Redirect in
                 options ~_to:next ~replace:true () |> make)
          |. catch (fun _ -> ok ())
          |. runAsync ~deps:{ credentials = Some credentials }
          |> Js.Promise.(
               then_ (fun result -> result |> Monads.Result.assertOk |> resolve)))
    ()
  |> make
