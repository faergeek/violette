open Router
open StoreFx

let[@react.component] make =
  React.memo
    (fun
      ?elementId
      ~isAlbumView
      ~isCompilation
      ~isQueueView
      ?primaryArtist
      ~songId
      ?songIdsToPlay
    ->
      let runAsyncStoreFx = RunAsync.use () in
      let isSelected =
        let open Router.State in
        options ~select:(fun state -> Some state.location.hash == elementId)
        |> use
      in
      (div ~ariaLabel:"Song"
         ~className:
           (Clsx.make
              [|
                Item
                  "group/song-row col-span-full grid grid-cols-subgrid \
                   items-center border-y-2 even:bg-muted/50";
                Item
                  [%mel.obj
                    {
                      px1 = isAlbumView [@mel.as "px-1"];
                      py1 = not isAlbumView [@mel.as "py-1"];
                      borderTransparent =
                        not isSelected [@mel.as "border-transparent"];
                      borderPrimary = isSelected [@mel.as "border-primary"];
                    }];
              |])
         ?id:elementId
         ~children:
           [
             (div
                ~className:
                  "relative grid h-full grid-cols-subgrid items-center \
                   justify-items-end overflow-clip"
                ~children:
                  [
                    (let open Store.State in
                     (Store.Context.Consumer.make
                        ~selector:(fun state ->
                          songId
                          |. Option.bind (fun songId ->
                                 state.songs.byId |. Js.Map.get ~key:songId))
                        ~children:(fun song ->
                          (Store.Context.Consumer.make
                             ~selector:(fun state ->
                               state.player.currentSongId == songId)
                             ~children:(fun isCurrentInPlayer ->
                               if isAlbumView then
                                 span ~ariaHidden:true
                                   ~className:
                                     (Clsx.make
                                        [|
                                          Item
                                            "min-w-6 px-1 text-right \
                                             slashed-zero tabular-nums";
                                          Item
                                            [%mel.obj
                                              {
                                                isNt =
                                                  not isCurrentInPlayer
                                                  [@mel.as
                                                    "text-muted-foreground \
                                                     focus-visible:text-transparent \
                                                     group-hover/song-row:text-transparent \
                                                     group-has-[:focus-visible]/song-row:text-transparent"];
                                                is =
                                                  isCurrentInPlayer
                                                  [@mel.as "text-transparent"];
                                              }];
                                        |])
                                   ~children:
                                     (let open Subsonic.Song in
                                      song
                                      |. Option.bind (fun song -> song.track)
                                      |> Option.map React.int
                                      |> Option.value
                                           ~default:(React.string {js| |js}))
                                   () [@JSX]
                               else
                                 CoverArt.make
                                   ~className:
                                     (Clsx.make
                                        [|
                                          Item
                                            "size-12 focus-visible:opacity-25 \
                                             group-hover/song-row:opacity-25 \
                                             group-has-[:focus-visible]/song-row:opacity-25";
                                          Item
                                            [%mel.obj
                                              {
                                                opacity25 =
                                                  isCurrentInPlayer
                                                  [@mel.as "opacity-25"];
                                              }];
                                        |])
                                   ?coverArt:
                                     (let open Subsonic.Song in
                                      song
                                      |> Option.map (fun song -> song.coverArt))
                                   ~_lazy:true ~sizes:"3em" () [@JSX])
                             () [@JSX]))
                        () [@JSX]));
                    (Store.Context.Consumer.make
                       ~selector:
                         (let open Store.State in
                          fun state -> state.player.paused)
                       ~children:(fun paused ->
                         (div
                            ~className:
                              (Clsx.make
                                 [|
                                   Item "absolute";
                                   Item
                                     [%mel.obj
                                       {
                                         right0 =
                                           isAlbumView [@mel.as "right-0"];
                                         not =
                                           not isAlbumView
                                           [@mel.as
                                             "inset-0 m-auto flex items-center \
                                              justify-center"];
                                       }];
                                 |])
                            ~children:
                              [
                                songId
                                |> Option.map (fun songId ->
                                       (Store.Context.Consumer.make
                                          ~selector:
                                            (let open Store.State in
                                             fun state ->
                                               state.player.currentSongId
                                               == Some songId)
                                          ~children:(fun isCurrentInPlayer ->
                                            (button ~ariaLabel:"Play"
                                               ~ariaPressed:
                                                 (if
                                                    isCurrentInPlayer
                                                    && not paused
                                                  then "true"
                                                  else "false")
                                               ~className:
                                                 (Clsx.make
                                                    [|
                                                      Item
                                                        "flex rounded-full \
                                                         outline-offset-2";
                                                      Item
                                                        [%mel.obj
                                                          {
                                                            sdfasdfasf =
                                                              ((not
                                                                  isCurrentInPlayer)
                                                             || not paused)
                                                              [@mel.as
                                                                "opacity-0 \
                                                                 group-hover/song-row:inset-0 \
                                                                 group-hover/song-row:opacity-100 \
                                                                 group-has-[:focus-visible]/song-row:inset-0 \
                                                                 group-has-[:focus-visible]/song-row:opacity-100"];
                                                            inset0_opacity100 =
                                                              (isCurrentInPlayer
                                                             && paused)
                                                              [@mel.as
                                                                "inset-0 \
                                                                 opacity-100"];
                                                            right0_size6 =
                                                              (isAlbumView
                                                             && isCurrentInPlayer
                                                             && not paused)
                                                              [@mel.as
                                                                "right-0 size-6"];
                                                            size8 =
                                                              not isAlbumView
                                                              [@mel.as "size-8"];
                                                          }];
                                                    |])
                                               ~type_:"button"
                                               ~onClick:(fun _ ->
                                                 let fx =
                                                   if isCurrentInPlayer then
                                                     TogglePaused.make ()
                                                   else
                                                     StartPlaying.make
                                                       ~current:songId
                                                       ?queued:songIdsToPlay ()
                                                 in
                                                 runAsyncStoreFx fx
                                                 |> Js.Promise.then_
                                                      (fun result ->
                                                        result |> Result.get_ok
                                                        |> Js.Promise.resolve)
                                                 |> ignore)
                                               ~children:
                                                 (React.cloneElement
                                                    (if
                                                       isCurrentInPlayer
                                                       && not paused
                                                     then
                                                       LucideReact.CirclePause
                                                       .make ~role:"none" ()
                                                       [@JSX]
                                                     else
                                                       LucideReact.CirclePlay
                                                       .make ~role:"none" ()
                                                       [@JSX])
                                                    [%mel.obj
                                                      {
                                                        className =
                                                          "stroke-primary \
                                                           size-full max-w-8 \
                                                           max-h-8";
                                                      }])
                                               () [@JSX]))
                                          () [@JSX]))
                                |> Option.value ~default:React.null;
                                (Store.Context.Consumer.make
                                   ~selector:
                                     (let open Store.State in
                                      fun state ->
                                        state.player.currentSongId == songId)
                                   ~children:(fun isCurrentInPlayer ->
                                     if isCurrentInPlayer && not paused then
                                       div
                                         ~className:
                                           (Clsx.make
                                              [|
                                                Item
                                                  "absolute flex h-3 w-3 \
                                                   items-center justify-center \
                                                   group-hover/song-row:invisible \
                                                   group-has-[:focus-visible]/song-row:invisible";
                                                Item
                                                  [%mel.obj
                                                    {
                                                      is =
                                                        isAlbumView
                                                        [@mel.as
                                                          "inset-y-0 right-1 \
                                                           my-auto"];
                                                      not =
                                                        not isAlbumView
                                                        [@mel.as
                                                          "inset-0 m-auto"];
                                                    }];
                                              |])
                                         ~children:
                                           [
                                             (div
                                                ~className:
                                                  "relative inline-flex h-3 \
                                                   w-3 rounded-full bg-primary"
                                                () [@JSX]);
                                             (div
                                                ~className:
                                                  "absolute inline-flex h-3 \
                                                   w-3 animate-ping \
                                                   rounded-full bg-primary \
                                                   opacity-75"
                                                () [@JSX]);
                                           ]
                                         () [@JSX]
                                     else React.null)
                                   () [@JSX]);
                              ]
                            () [@JSX]))
                       () [@JSX]);
                  ]
                () [@JSX]);
             (div ~className:"min-w-0"
                ~children:
                  (Store.Context.Consumer.make
                     ~selector:(fun state ->
                       let open Store.State in
                       songId
                       |. Option.bind (fun songId ->
                              state.songs.byId |. Js.Map.get ~key:songId))
                     ~children:(fun song ->
                       (React.Fragment.make
                          ~children:
                            [
                              (match song with
                              | None ->
                                  Skeleton.make ~className:"max-w-40" () [@JSX]
                              | Some song ->
                                  React.Fragment.make
                                    ~children:
                                      [
                                        (let open Subsonic.Song in
                                         (Link.make ~ariaLabel:"Title"
                                            ?hash:elementId
                                            ~params:
                                              [%mel.obj
                                                { albumId = song.albumId }]
                                            ~resetScroll:false
                                            ~_to:"/album/$albumId"
                                            ~children:(React.string song.title)
                                            () [@JSX]));
                                        (let open Subsonic.Song in
                                         if
                                           isAlbumView
                                           && (isCompilation
                                              || primaryArtist
                                                 != Some song.artist)
                                         then
                                           span
                                             ~className:"text-muted-foreground"
                                             ~children:
                                               [
                                                 (span ~ariaHidden:true
                                                    ~children:
                                                      [
                                                        React.string {js| – |js};
                                                        React.cloneElement
                                                          (match
                                                             song.artistId
                                                           with
                                                          | None ->
                                                              span () [@JSX]
                                                          | Some artistId ->
                                                              Link.make
                                                                ~params:
                                                                  [%mel.obj
                                                                    { artistId }]
                                                                ~_to:
                                                                  "/artist/$artistId"
                                                                () [@JSX])
                                                          [%mel.obj
                                                            {
                                                              ariaLabel =
                                                                ("Artist"
                                                                [@mel.as
                                                                  "aria-label"]);
                                                              children =
                                                                React.string
                                                                  song.artist;
                                                            }];
                                                      ]
                                                    () [@JSX]);
                                               ]
                                             () [@JSX]
                                         else React.null);
                                      ]
                                    () [@JSX]);
                              (if isAlbumView then React.null
                               else
                                 match song with
                                 | None ->
                                     Skeleton.make ~className:"max-w-64" ()
                                     [@JSX]
                                 | Some song ->
                                     div ~className:"text-muted-foreground"
                                       ~children:
                                         [
                                           (if primaryArtist == Some song.artist
                                            then React.null
                                            else
                                              React.Fragment.make
                                                ~children:
                                                  [
                                                    React.cloneElement
                                                      (match song.artistId with
                                                      | None -> span () [@JSX]
                                                      | Some artistId ->
                                                          Link.make
                                                            ~params:
                                                              [%mel.obj
                                                                { artistId }]
                                                            ~_to:
                                                              "/artist/$artistId"
                                                            () [@JSX])
                                                      [%mel.obj
                                                        {
                                                          children =
                                                            React.string
                                                              song.artist;
                                                        }];
                                                    (span ~ariaHidden:true
                                                       ~children:
                                                         (React.string
                                                            {js| – |js})
                                                       () [@JSX]);
                                                  ]
                                                () [@JSX]);
                                           (Link.make ~ariaLabel:"Album"
                                              ~params:
                                                [%mel.obj
                                                  { albumId = song.albumId }]
                                              ~_to:"/album/$albumId"
                                              ~children:
                                                (React.string song.album) ()
                                            [@JSX]);
                                         ]
                                       () [@JSX]);
                            ]
                          () [@JSX]))
                     () [@JSX])
                () [@JSX]);
             (Store.Context.Consumer.make
                ~selector:(fun state ->
                  let open Store.State in
                  songId
                  |. Option.bind (fun songId ->
                         state.songs.byId |. Js.Map.get ~key:songId))
                ~children:(fun song ->
                  let open Subsonic.Song in
                  (StarButton.make
                     ~className:
                       (Clsx.make
                          [|
                            Item
                              [%mel.obj
                                {
                                  p2 = isAlbumView [@mel.as "p-2"];
                                  p3 = not isAlbumView [@mel.as "p-3"];
                                }];
                          |])
                     ~disabled:(song |> Option.is_none)
                     ?id:(song |> Option.map (fun song -> song.id))
                     ?starred:(song |. Option.bind (fun song -> song.starred))
                     () [@JSX]))
                () [@JSX]);
             (div
                ~className:
                  "group/song-row-menu relative grid h-full grid-cols-subgrid \
                   items-center justify-items-end"
                ~children:
                  [
                    (Store.Context.Consumer.make
                       ~selector:
                         (let open Store.State in
                          fun state ->
                            songId
                            |. Option.bind (fun songId ->
                                   state.songs.byId |. Js.Map.get ~key:songId))
                       ~children:(fun song ->
                         (span ~ariaLabel:"Duration"
                            ~className:
                              (Clsx.make
                                 [|
                                   Item
                                     "whitespace-nowrap slashed-zero \
                                      tabular-nums \
                                      group-hover/song-row:opacity-0 \
                                      group-has-[:focus-visible]/song-row:opacity-0";
                                   Item
                                     [%mel.obj
                                       {
                                         pe2 = isAlbumView [@mel.as "pe-2"];
                                         pe3 = not isAlbumView [@mel.as "pe-3"];
                                       }];
                                 |])
                            ~children:
                              (let open Subsonic.Song in
                               match song with
                               | None ->
                                   Skeleton.make
                                     ~className:"inline-block w-full" () [@JSX]
                               | Some song ->
                                   song.duration |> Duration.format
                                   |> React.string)
                            () [@JSX]))
                       () [@JSX]);
                    (div
                       ~className:
                         "absolute inset-y-0 right-0 m-auto flex justify-end \
                          opacity-0 group-hover/song-row:opacity-100 \
                          group-has-[:focus-visible]/song-row:opacity-100"
                       ~children:
                         (DropdownMenu.Root.make
                            ~children:
                              [
                                (DropdownMenu.Trigger.make
                                   ~children:
                                     (Button.make ~ariaLabel:"Song menu"
                                        ~className:
                                          (Clsx.make
                                             [|
                                               Item
                                                 [%mel.obj
                                                   {
                                                     p2 =
                                                       isAlbumView
                                                       [@mel.as "p-2"];
                                                     p3 =
                                                       not isAlbumView
                                                       [@mel.as "p-3"];
                                                   }];
                                             |])
                                        ~variant:"icon"
                                        ~children:
                                          (LucideReact.Ellipsis.make
                                             ~role:"none" () [@JSX])
                                        () [@JSX])
                                   () [@JSX]);
                                (DropdownMenu.Content.make ~placement:`bottomEnd
                                   ~children:
                                     [
                                       (DropdownMenu.Item.make
                                          ~onClick:(fun _ ->
                                            let open Fx in
                                            let songId = songId |> Option.get in
                                            ask ()
                                            |. bind (fun Deps.{ store } ->
                                                   let state =
                                                     store |. Zustand.getState
                                                   in
                                                   let newSongIds =
                                                     state.player.queuedSongIds
                                                     |> Js.Array.filter
                                                          ~f:(fun id ->
                                                            id != songId)
                                                   in
                                                   let index =
                                                     match
                                                       state.player
                                                         .currentSongId
                                                     with
                                                     | None -> 0
                                                     | Some current ->
                                                         newSongIds
                                                         |> Js.Array.indexOf
                                                              ~value:current
                                                   in
                                                   newSongIds
                                                   |> Js.Array.spliceInPlace
                                                        ~start:index ~remove:0
                                                        ~add:[| songId |]
                                                   |> ignore;
                                                   StartPlaying.make
                                                     ~current:songId
                                                     ~queued:newSongIds ())
                                            |> runAsyncStoreFx
                                            |> Js.Promise.then_ (fun result ->
                                                   result |> Result.get_ok
                                                   |> Js.Promise.resolve)
                                            |> ignore)
                                          ~children:
                                            [
                                              (LucideReact.Play.make
                                                 ~role:"none" () [@JSX]);
                                              "Play now" |> React.string;
                                            ]
                                          () [@JSX]);
                                       (DropdownMenu.Item.make
                                          ~onClick:(fun _ ->
                                            let open Fx in
                                            let songId = songId |> Option.get in
                                            ask ()
                                            |. bind (fun Deps.{ store } ->
                                                   let state =
                                                     store |. Zustand.getState
                                                   in
                                                   let current =
                                                     state.player.currentSongId
                                                   and queued =
                                                     state.player.queuedSongIds
                                                   in
                                                   let songIdIsSameAsCurrent =
                                                     match current with
                                                     | None -> false
                                                     | Some current ->
                                                         songId == current
                                                   in
                                                   if songIdIsSameAsCurrent then (
                                                     let currentIndex =
                                                       match current with
                                                       | None -> 0
                                                       | Some current ->
                                                           queued
                                                           |> Js.Array.indexOf
                                                                ~value:current
                                                     in
                                                     let newSongIds =
                                                       queued
                                                       |> Js.Array.filter
                                                            ~f:(fun id ->
                                                              id != songId)
                                                     in
                                                     newSongIds
                                                     |> Js.Array.spliceInPlace
                                                          ~start:
                                                            (currentIndex + 1)
                                                          ~remove:0
                                                          ~add:[| songId |]
                                                     |> ignore;
                                                     StartPlaying.make
                                                       ~current:
                                                         (newSongIds
                                                         |. Js.Array.unsafe_get
                                                              currentIndex)
                                                       ~queued:newSongIds ())
                                                   else
                                                     let newSongIds =
                                                       queued
                                                       |> Js.Array.filter
                                                            ~f:(fun id ->
                                                              id != songId)
                                                     in
                                                     newSongIds
                                                     |> Js.Array.spliceInPlace
                                                          ~start:
                                                            ((match current with
                                                             | None -> 0
                                                             | Some current ->
                                                                 newSongIds
                                                                 |> Js.Array
                                                                    .indexOf
                                                                      ~value:
                                                                        current)
                                                            + 1)
                                                          ~remove:0
                                                          ~add:[| songId |]
                                                     |> ignore;
                                                     StartPlaying.make
                                                       ~current:
                                                         (current
                                                         |> Option.value
                                                              ~default:songId)
                                                       ~queued:newSongIds ())
                                            |> runAsyncStoreFx
                                            |> Js.Promise.then_ (fun result ->
                                                   result |> Result.get_ok
                                                   |> Js.Promise.resolve)
                                            |> ignore)
                                          ~children:
                                            [
                                              (LucideReact.ListStart.make
                                                 ~role:"none" () [@JSX]);
                                              "Play next" |> React.string;
                                            ]
                                          () [@JSX]);
                                       (DropdownMenu.Item.make
                                          ~onClick:(fun _ ->
                                            let open Fx in
                                            let songId = songId |> Option.get in
                                            Js.log songId;
                                            ask ()
                                            |. bind (fun Deps.{ store } ->
                                                   let state =
                                                     store |. Zustand.getState
                                                   in
                                                   let songIdIsSameAsCurrent =
                                                     match
                                                       state.player
                                                         .currentSongId
                                                     with
                                                     | None -> false
                                                     | Some current ->
                                                         songId == current
                                                   in
                                                   let queued =
                                                     state.player.queuedSongIds
                                                     |> Js.Array.filter
                                                          ~f:(fun id ->
                                                            id != songId)
                                                     |> Js.Array.concat
                                                          ~other:[| songId |]
                                                   in
                                                   StartPlaying.make
                                                     ~current:
                                                       (if songIdIsSameAsCurrent
                                                        then
                                                          let index =
                                                            let len =
                                                              state.player
                                                                .queuedSongIds
                                                              |> Js.Array.length
                                                            in
                                                            ((state.player
                                                                .queuedSongIds
                                                             |> Js.Array.indexOf
                                                                  ~value:
                                                                    (state
                                                                       .player
                                                                       .currentSongId
                                                                   |> Option.get
                                                                    ))
                                                            + 1)
                                                            mod len
                                                          in
                                                          state.player
                                                            .queuedSongIds
                                                          |. Js.Array.unsafe_get
                                                               index
                                                        else
                                                          state.player
                                                            .currentSongId
                                                          |> Option.value
                                                               ~default:
                                                                 (state.player
                                                                    .queuedSongIds
                                                                |. Js.Array
                                                                   .unsafe_get 0
                                                                 ))
                                                     ~queued ())
                                            |> runAsyncStoreFx
                                            |> Js.Promise.then_ (fun result ->
                                                   result |> Result.get_ok
                                                   |> Js.Promise.resolve)
                                            |> ignore)
                                          ~children:
                                            [
                                              (LucideReact.ListEnd.make
                                                 ~role:"none" () [@JSX]);
                                              "Play last" |> React.string;
                                            ]
                                          () [@JSX]);
                                       (DropdownMenu.Item.make
                                          ~onClick:(fun _ ->
                                            let open Webapi.Dom in
                                            window |> Window.alert "TODO")
                                          ~children:
                                            [
                                              (LucideReact.ListPlus.make
                                                 ~role:"none" () [@JSX]);
                                              React.string
                                                {js|Add to Playlist…|js};
                                            ]
                                          () [@JSX]);
                                       (DropdownMenu.Item.make
                                          ~onClick:(fun _ ->
                                            let open Webapi.Dom in
                                            window |> Window.alert "TODO")
                                          ~children:
                                            [
                                              (LucideReact.Info.make
                                                 ~role:"none" () [@JSX]);
                                              React.string "Info";
                                            ]
                                          () [@JSX]);
                                       (DropdownMenu.Item.make
                                          ~onClick:(fun _ ->
                                            let open Webapi.Dom in
                                            window |> Window.alert "TODO")
                                          ~children:
                                            [
                                              (LucideReact.Download.make
                                                 ~role:"none" () [@JSX]);
                                              React.string "Download";
                                            ]
                                          () [@JSX]);
                                     ]
                                   () [@JSX]);
                              ]
                            () [@JSX])
                       () [@JSX]);
                  ]
                () [@JSX]);
             (if isQueueView then
                Button.make ~ariaLabel:"Remove from queue"
                  ~className:
                    (Clsx.make
                       [|
                         Item
                           [%mel.obj
                             {
                               p2 = isAlbumView [@mel.as "p-2"];
                               p3 = not isAlbumView [@mel.as "p-3"];
                             }];
                       |])
                  ~variant:"icon"
                  ~onClick:(fun _ ->
                    (let open Promise.Monad_syntax in
                     let* result =
                       UpdatePlayQueue.make (fun state ->
                           {
                             state with
                             queued =
                               state.queued
                               |> Js.Array.filter ~f:(fun id ->
                                      Some id != songId);
                           })
                       |> runAsyncStoreFx
                     in
                     result |> Result.get_ok |> Js.Promise.resolve)
                    |> ignore)
                  ~children:(LucideReact.Trash2.make ~role:"none" () [@JSX])
                  () [@JSX]
              else React.null);
           ]
         () [@JSX]))
