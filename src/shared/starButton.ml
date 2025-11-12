let[@react.component] make ?albumId ?artistId ?className ?disabled ?id ?starred
    =
  let runAsyncStoreFx = StoreFx.RunAsync.use () in
  let starredOptimisic, setStarredOptimisic = React.useState (Fun.const None) in
  let starred = starredOptimisic |> Belt.Option.orElse starred in
  (form ~className:"inline-flex" ~role:"none"
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
            ?className ?disabled ~type_:"submit" ~variant:"icon"
            ~children:
              (LucideReact.Heart.make
                 ~className:
                   (match starred with
                   | Some _ -> "fill-primary stroke-primary"
                   | None -> "")
                 ~role:"none" () [@JSX])
            () [@JSX]);
         starred
         |> Option.map (fun starred ->
             (time ~ariaLabel:"Starred" ~className:"sr-only" ~dateTime:starred
                ~children:
                  (starred |> Js.Date.fromString |> Js.Date.toLocaleString
                 |> React.string)
                () [@JSX]))
         |> Option.value ~default:React.null;
       ]
     () [@JSX])
