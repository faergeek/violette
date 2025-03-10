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
                Item
                  "grid text-sm \
                   [grid-template-columns:auto_1fr_auto_minmax(32px,auto)_auto]";
                Item
                  [%mel.obj
                    {
                      gapX1 = isAlbumView [@mel.as "gap-x-1"];
                      gapX2 = not isAlbumView [@mel.as "gap-x-2"];
                    }];
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
