external%private [@mel.module "./starButton.module.css"] css :
  < root : string ; icon : string > Js.t = "default"

let[@react.component] make ?albumId ?artistId ?className ?disabled ?id ?starred
    =
  let runAsyncStoreFx = StoreFx.RunAsync.use () in
  let starredOptimisic, setStarredOptimisic = React.useState (Fun.const None) in
  let starred = starredOptimisic |> Belt.Option.orElse starred in
  (form ~className:css##root ~role:"none"
     ~onSubmit:(fun event ->
       let open React.Event.Form in
       let open ReactExtra.Event.Form in
       let open Webapi in
       event |. preventDefault;
       match (albumId, artistId, id) with
       | None, None, None -> ()
       | albumId, artistId, id ->
           let newStarred =
             event |. currentTarget |> FormData.makeWithHtmlFormElement
             |> FormData.get "starred"
             |> Option.map FormData.EntryValue.classify
             |. Option.bind (function
               | `String value when value != "" -> Some ()
               | `String _ | `File _ -> None)
             |> Option.map (fun () -> Js.Date.make () |> Js.Date.toISOString)
           in
           setStarredOptimisic (Fun.const newStarred);
           let fx =
             match newStarred with
             | None -> StoreFx.Unstar.make { albumId; artistId; id }
             | Some _ -> StoreFx.Star.make { albumId; artistId; id }
           in
           fx |> runAsyncStoreFx
           |> Js.Promise.then_ (fun result ->
               result |. Result.get_ok;
               setStarredOptimisic (Fun.const None);
               Js.Promise.resolve ())
           |> ignore)
     ~children:
       [
         (input ~name:"starred" ~type_:"hidden"
            ~value:(match starred with None -> "1" | Some _ -> "")
            () [@JSX]);
         (Button.make ~ariaLabel:"Favorite"
            ~ariaPressed:
              (match starred with Some _ -> "true" | None -> "false")
            ?className ?disabled ~type_:"submit" ~variant:`icon
            ~children:
              (LucideReact.Heart.make
                 ?className:(starred |> Option.map (fun _ -> css##icon))
                 ~role:"none" () [@JSX])
            () [@JSX]);
       ]
     () [@JSX])
