external%private [@mel.module "./songRow.module.css"] css :
  < root : string
  ; root_albumView : string
  ; root_isCurrentInPlayer : string
  ; root_paused : string
  ; root_selected : string
  ; coverArtAndTrackNumberCol : string
  ; trackNumber : string
  ; coverArt : string
  ; playButtonWrapper : string
  ; playButton : string
  ; playButtonIcon : string
  ; nowPlayingIndicator : string
  ; title : string
  ; subtitle : string
  ; starButton : string
  ; durationMenuCol : string
  ; duration : string
  ; durationSkeleton : string
  ; menu : string
  ; menuButton : string
  ; removeFromQueueButton : string >
  Js.t = "default"

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
      and isCurrentInPlayer =
        Store.Context.useAppStore (fun state ->
            state.player.currentSongId == songId)
      and paused =
        Store.Context.useAppStore (fun state -> state.player.paused)
      in
      (div ~ariaLabel:"Song"
         ~className:
           (Clsx.make
              [|
                Item css##root;
                Item (if isAlbumView then Some css##root_albumView else None);
                Item
                  (if isCurrentInPlayer then Some css##root_isCurrentInPlayer
                   else None);
                Item (if paused then Some css##root_paused else None);
                Item (if isSelected then Some css##root_selected else None);
              |])
         ?id:elementId
         ~children:
           [
             (div
                ~className:css##coverArtAndTrackNumberCol
                ~children:
                  [
                    (let open Store.State in
                     (Store.Context.Consumer.make
                        ~selector:(fun state ->
                          songId
                          |. Option.bind (fun songId ->
                              state.songs.byId |. Js.Map.get ~key:songId))
                        ~children:(fun song ->
                          if isAlbumView then
                            span ~ariaHidden:true ~className:css##trackNumber
                              ~children:
                                (let open Subsonic.Song in
                                 song
                                 |. Option.bind (fun song -> song.track)
                                 |> Option.map React.int
                                 |> Option.value
                                      ~default:(React.string {js| |js}))
                              () [@JSX]
                          else
                            CoverArt.make ~className:css##coverArt
                              ?coverArt:
                                (let open Subsonic.Song in
                                 song |> Option.map (fun song -> song.coverArt))
                              ~_lazy:true ~sizes:"3em" () [@JSX])
                        () [@JSX]));
                    (Store.Context.Consumer.make
                       ~selector:
                         (let open Store.State in
                          fun state -> state.player.paused)
                       ~children:(fun paused ->
                         (div ~className:css##playButtonWrapper
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
                                                 isCurrentInPlayer && not paused
                                               then "true"
                                               else "false")
                                            ~className:css##playButton
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
                                              |> Js.Promise.then_ (fun result ->
                                                  result |> Result.get_ok
                                                  |> Js.Promise.resolve)
                                              |> ignore)
                                            ~children:
                                              (if
                                                 isCurrentInPlayer && not paused
                                               then
                                                 LucideReact.CirclePause.make
                                                   ~className:
                                                     css##playButtonIcon
                                                   ~role:"none" () [@JSX]
                                               else
                                                 LucideReact.CirclePlay.make
                                                   ~className:
                                                     css##playButtonIcon
                                                   ~role:"none" () [@JSX])
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
                                       div ~className:css##nowPlayingIndicator
                                         () [@JSX]
                                     else React.null)
                                   () [@JSX]);
                              ]
                            () [@JSX]))
                       () [@JSX]);
                  ]
                () [@JSX]);
             (div ~className:css##title
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
                                  Skeleton.make
                                    ~style:
                                      (ReactDOM.Style.make ~maxWidth:"10rem" ())
                                    () [@JSX]
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
                                           span ~className:css##subtitle
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
                                     Skeleton.make
                                       ~style:
                                         (ReactDOM.Style.make ~maxWidth:"10rem"
                                            ())
                                       () [@JSX]
                                 | Some song ->
                                     div ~className:css##subtitle
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
                  (StarButton.make ~className:css##starButton
                     ~disabled:(song |> Option.is_none)
                     ?id:(song |> Option.map (fun song -> song.id))
                     ?starred:(song |. Option.bind (fun song -> song.starred))
                     () [@JSX]))
                () [@JSX]);
             (div ~className:css##durationMenuCol
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
                         (span ~ariaLabel:"Duration" ~className:css##duration
                            ~children:
                              (let open Subsonic.Song in
                               match song with
                               | None ->
                                   Skeleton.make
                                     ~className:css##durationSkeleton () [@JSX]
                               | Some song ->
                                   song.duration |> Duration.format
                                   |> React.string)
                            () [@JSX]))
                       () [@JSX]);
                    (div ~className:css##menu
                       ~children:
                         (DropdownMenu.Root.make
                            ~children:
                              [
                                (DropdownMenu.Trigger.make
                                   ~children:
                                     (Button.make ~ariaLabel:"Song menu"
                                        ~className:css##menuButton
                                        ~variant:`icon
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
                                                    state.player.currentSongId
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
                                                       ~start:(currentIndex + 1)
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
                                            ask ()
                                            |. bind (fun Deps.{ store } ->
                                                let state =
                                                  store |. Zustand.getState
                                                in
                                                let songIdIsSameAsCurrent =
                                                  match
                                                    state.player.currentSongId
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
                                                                 (state.player
                                                                    .currentSongId
                                                                |> Option.get))
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
                                                                .unsafe_get 0))
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
                  ~className:css##removeFromQueueButton ~variant:`icon
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
