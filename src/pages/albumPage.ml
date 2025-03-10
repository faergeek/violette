open Router
open Shared

type disc = { number : int; songIds : string array; title : string option }

let[@react.component] make ~albumId ?deferredAlbumInfo =
  let base =
    Store.Context.useAppStore (fun state ->
        state.albums.baseById |. Js.Map.get ~key:albumId)
  and details =
    Store.Context.useAppStore (fun state ->
        state.albums.detailsById |. Js.Map.get ~key:albumId)
  and songIds =
    Store.Context.useAppStore (fun state ->
        state.albums.songIdsById |. Js.Map.get ~key:albumId)
  in
  let songs =
    let selector =
      Zustand.useShallow (fun state ->
          songIds
          |> Option.map (fun songIds ->
                 songIds |> Array.to_list
                 |> List.filter_map (fun id ->
                        let open Store.State in
                        state.songs.byId |. Js.Map.get ~key:id)
                 |> Array.of_list))
    in
    Store.Context.useAppStore selector
  in
  let discs =
    React.useMemo2
      (fun () ->
        match (details, songs) with
        | None, _ | _, None -> None
        | Some details, Some songs ->
            let result : disc array = [||] in
            songs
            |> Js.Array.forEach ~f:(fun song ->
                   let discNumber =
                     let open Subsonic.Song in
                     song.discNumber |> Option.value ~default:1
                   in
                   let open Subsonic.DiscTitle in
                   let discTitle =
                     details.discTitles
                     |. Option.bind (fun discTitles ->
                            discTitles
                            |> Js.Array.find ~f:(fun x -> x.disc == discNumber))
                   in
                   result
                   |. Belt.Array.get (discNumber - 1)
                   |> Option.value
                        ~default:
                          {
                            number = discNumber;
                            songIds = [||];
                            title =
                              discTitle
                              |. Option.bind (fun x ->
                                     if x.title |. Js.String.length == 0 then
                                       None
                                     else Some x.title);
                          }
                   |> Belt.Array.setUnsafe result (discNumber - 1);
                   let disc = result |. Belt.Array.getUnsafe (discNumber - 1) in
                   disc.songIds |. Js.Array.push ~value:song.id |> ignore);
            Some result)
      (details, songs)
  in
  let renderAlbumInfo ~fallback children =
    (Store.Context.Consumer.make
       ~selector:(fun state ->
         let open Store.State in
         state.albums.infoById |. Js.Map.get ~key:albumId)
       ~children:(fun albumInfo ->
         match albumInfo with
         | Some albumInfo -> children albumInfo
         | None -> (
             match deferredAlbumInfo with
             | Some deferredAlbumInfo ->
                 Await.make ~fallback ~promise:deferredAlbumInfo
                   ~children:(fun info -> children info)
                   () [@JSX]
             | None -> fallback))
       () [@JSX])
  in
  (div ~className:"container mx-auto sm:px-4 sm:pt-4"
     ~children:
       [
         (MediaHeader.make
            ~coverArt:
              (base |> Option.map (fun x -> Subsonic.BaseAlbum.(x.coverArt)))
            ~links:
              (renderAlbumInfo
                 ~fallback:(MediaLinks.make ~skeleton:true () [@JSX])
                 (fun albumInfo ->
                   (MediaLinks.make ?lastFmUrl:albumInfo.lastFmUrl
                      ?musicBrainzUrl:
                        (albumInfo.musicBrainzId
                        |> Option.map (fun id ->
                               "https://musicbrainz.org/release/" ^ id))
                      () [@JSX])))
            ~children:
              (div ~className:"space-y-2"
                 ~children:
                   [
                     (div
                        ~children:
                          [
                            (div
                               ~className:
                                 "text-sm font-bold tracking-widest \
                                  text-muted-foreground \
                                  [font-variant-caps:all-small-caps]"
                               ~children:(React.string "Album") () [@JSX]);
                            (H1.make
                               ~children:
                                 (match base with
                                 | None ->
                                     Skeleton.make ~className:"w-64" () [@JSX]
                                 | Some base ->
                                     React.Fragment.make
                                       ~children:
                                         [
                                           (Link.make
                                              ~params:
                                                [%mel.obj { albumId = base.id }]
                                              ~_to:"/album/$albumId"
                                              ~children:(React.string base.name)
                                              () [@JSX]);
                                           (StarButton.make ~className:"ms-2"
                                              ~albumId:base.id
                                              ?starred:base.starred () [@JSX]);
                                         ]
                                       () [@JSX])
                               () [@JSX]);
                            (div ~className:"text-muted-foreground"
                               ~children:
                                 (match base with
                                 | Some base ->
                                     React.Fragment.make
                                       ~children:
                                         [
                                           base.year
                                           |> Option.map (fun year ->
                                                  (React.Fragment.make
                                                     ~children:
                                                       [
                                                         React.int year;
                                                         React.string
                                                           {js| – |js};
                                                       ]
                                                     () [@JSX]))
                                           |> Option.value ~default:React.null;
                                           (Link.make
                                              ~params:
                                                [%mel.obj
                                                  { artistId = base.artistId }]
                                              ~_to:"/artist/$artistId"
                                              ~children:
                                                (React.string base.artist) ()
                                            [@JSX]);
                                           React.string {js| – |js};
                                           (match base.duration with
                                           | None -> React.null
                                           | Some duration ->
                                               Duration.format duration
                                               |> React.string);
                                         ]
                                       () [@JSX]
                                 | None ->
                                     Skeleton.make ~className:"w-40" () [@JSX])
                               () [@JSX]);
                          ]
                        () [@JSX]);
                     renderAlbumInfo ~fallback:(Prose.make () [@JSX])
                       (fun albumInfo ->
                         albumInfo.notes
                         |> Option.map (fun html ->
                                (Prose.make ~html () [@JSX]))
                         |> Option.value ~default:React.null);
                   ]
                 () [@JSX])
            () [@JSX]);
         (match (base, details, discs) with
         | None, _, _ | _, None, _ | _, _, None -> SongList.make () [@JSX]
         | Some base, Some details, Some discs ->
             if discs |. Js.Array.length > 1 then
               div ~className:"space-y-4"
                 ~children:
                   (discs
                   |> Js.Array.map ~f:(fun disc ->
                          (div
                             ~key:(Int.to_string disc.number)
                             ~children:
                               [
                                 (H2.make
                                    ~className:
                                      "text-md mb-1 px-2 font-semibold \
                                       text-muted-foreground sm:px-0"
                                    ~children:
                                      [
                                        React.string "Disc ";
                                        React.int disc.number;
                                        (match disc.title with
                                        | None -> React.null
                                        | Some title ->
                                            React.Fragment.make
                                              ~children:
                                                [
                                                  React.string {js| – |js};
                                                  React.string title;
                                                ]
                                              () [@JSX]);
                                      ]
                                    () [@JSX]);
                                 (SongList.make
                                    ~getSongElementId:Album.getSongElementId
                                    ~isAlbumView:true
                                    ?isCompilation:details.isCompilation
                                    ~primaryArtist:base.artist
                                    ~songIds:disc.songIds ~songIdsToPlay:songIds
                                    () [@JSX]);
                               ]
                             () [@JSX]))
                   |> React.array)
                 () [@JSX]
             else
               SongList.make ~getSongElementId:Album.getSongElementId
                 ~isAlbumView:true ?isCompilation:details.isCompilation
                 ~primaryArtist:base.artist ?songIds () [@JSX]);
       ]
     () [@JSX])
