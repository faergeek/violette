external%private [@mel.module "./nowPlaying.module.css"] css :
  < root : string
  ; coverArt : string
  ; info : string
  ; skeletonLine1 : string
  ; skeletonLine2 : string
  ; name : string
  ; artistAndAlbum : string
  ; starButton : string
  ; dropdownMenuButton : string >
  Js.t = "default"

let[@react.component] make () =
  let navigate = Router.useNavigate ()
  and clearSubsonicCredentials =
    Store.Context.useAppStore (fun state -> state.auth.clearSubsonicCredentials)
  and currentSongId =
    Store.Context.useAppStore (fun state -> state.player.currentSongId)
  in
  let song =
    Store.Context.useAppStore (fun state ->
        currentSongId
        |. Option.bind (fun currentSongId ->
            state.songs.byId |. Js.Map.get ~key:currentSongId))
  in
  (Container.make ~className:css##root
     ~children:
       [
         (CoverArt.make ~className:css##coverArt
            ?coverArt:
              (song |> Option.map (fun song -> Subsonic.Song.(song.coverArt)))
            ~_lazy:true ~sizes:"3em" () [@JSX]);
         (div ~className:css##info
            ~children:
              [
                (match song with
                | None -> (
                    match currentSongId with
                    | None -> React.null
                    | Some _ ->
                        Skeleton.make ~className:css##skeletonLine1 () [@JSX])
                | Some song ->
                    span ~className:css##name
                      ~children:
                        (Router.Link.make ~ariaLabel:"Song"
                           ~hash:(Album.getSongElementId song.id)
                           ~hashScrollIntoView:
                             { behavior = `instant; block = `nearest }
                           ~params:[%mel.obj { albumId = song.albumId }]
                           ~_to:"/album/$albumId"
                           ~children:(React.string song.title) () [@JSX])
                      () [@JSX]);
                (match song with
                | None -> (
                    match currentSongId with
                    | None -> React.null
                    | Some _ ->
                        Skeleton.make ~className:css##skeletonLine2 () [@JSX])
                | Some song ->
                    span ~className:css##artistAndAlbum
                      ~children:
                        [
                          React.cloneElement
                            (match song.artistId with
                            | None -> span () [@JSX]
                            | Some artistId ->
                                Router.Link.make ~params:[%mel.obj { artistId }]
                                  ~_to:"/artist/$artistId" () [@JSX])
                            [%mel.obj
                              {
                                ariaLabel = ("Artist" [@mel.as "aria-label"]);
                                children =
                                  [|
                                    song.artist |> React.string;
                                    " " |> React.string;
                                    (span ~key:"span" ~ariaHidden:true
                                       ~children:({js| – |js} |> React.string)
                                       () [@JSX]);
                                  |]
                                  |> React.array;
                              }];
                          " " |> React.string;
                          (Router.Link.make ~ariaLabel:"Album"
                             ~params:[%mel.obj { albumId = song.albumId }]
                             ~_to:"/album/$albumId"
                             ~children:(song.album |> React.string)
                             () [@JSX]);
                        ]
                      () [@JSX]);
              ]
            () [@JSX]);
         (StarButton.make ~className:css##starButton
            ~disabled:(song |> Option.is_none)
            ?id:(song |> Option.map (fun song -> Subsonic.Song.(song.id)))
            ?starred:(song |. Option.bind (fun song -> song.starred))
            () [@JSX]);
         (DropdownMenu.Root.make
            ~children:
              [
                (DropdownMenu.Trigger.make
                   ~children:
                     (Button.make ~ariaLabel:"Menu"
                        ~className:css##dropdownMenuButton ~variant:`icon
                        ~children:(LucideReact.Menu.make () [@JSX])
                        () [@JSX])
                   () [@JSX]);
                (DropdownMenu.Content.make ~placement:`bottomEnd
                   ~strategy:`fixed
                   ~children:
                     [
                       (DropdownMenu.Item.make
                          ~onClick:(fun _ ->
                            Router.navigateOptions ~_to:"/" |> navigate)
                          ~children:
                            [
                              (LucideReact.Home.make ~role:"none" () [@JSX]);
                              "Home" |> React.string;
                            ]
                          () [@JSX]);
                       (form
                          ~onSubmit:(fun event ->
                            event |. React.Event.Form.preventDefault;
                            clearSubsonicCredentials ())
                          ~children:
                            (DropdownMenu.Item.make ~type_:"submit"
                               ~children:
                                 [
                                   (LucideReact.LogOut.make ~role:"none" ()
                                    [@JSX]);
                                   "Logout" |> React.string;
                                 ]
                               () [@JSX])
                          () [@JSX]);
                     ]
                   () [@JSX]);
              ]
            () [@JSX]);
       ]
     () [@JSX])
