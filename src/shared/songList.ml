external%private [@mel.module "./songList.module.css"] css :
  < root : string ; root_albumView : string > Js.t = "default"

let[@react.component] make =
  React.memo
    (fun
      ?getSongElementId
      ?(isAlbumView = false)
      ?(isCompilation = false)
      ?(isQueueView = false)
      ?primaryArtist
      ?songIds
      ?(songIdsToPlay = songIds)
    ->
      (div
         ~className:
           (Clsx.make
              [|
                Item css##root;
                Item (if isAlbumView then Some css##root_albumView else None);
              |])
         ~children:
           (songIds
           |> Option.map (Js.Array.map ~f:Option.some)
           |> Option.value ~default:(Belt.Array.make 5 None)
           |> Js.Array.mapi ~f:(fun songId index ->
               (SongRow.make
                  ~key:(songId |> Option.value ~default:(Int.to_string index))
                  ?elementId:
                    (match (songId, getSongElementId) with
                    | Some songId, Some getSongElementId ->
                        getSongElementId songId |> Option.some
                    | None, _ | _, None -> None)
                  ~isAlbumView ~isCompilation ~isQueueView ?primaryArtist
                  ~songId ?songIdsToPlay () [@JSX]))
           |> React.array)
         () [@JSX]))
