open Fx
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
      | None -> None |> Js.Promise.resolve
      | Some credentials ->
          let open Redirect in
          Subsonic.Ping.make ()
          |. map (fun () ->
                 options ~replace:true ~_to:next () |> make |> Option.some)
          |. catch (fun _ -> Ok None)
          |. runAsync ~deps:{ credentials = Some credentials }
          |> Js.Promise.then_ (fun result ->
                 result |> Result.get_ok |> Js.Promise.resolve))
    ()
  |> make
