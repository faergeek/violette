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
  (div ~className:"container mx-auto flex items-center sm:px-4"
     ~children:
       [
         (CoverArt.make ~className:"size-12 shrink-0"
            ?coverArt:
              (song |> Option.map (fun song -> Subsonic.Song.(song.coverArt)))
            ~_lazy:true ~sizes:"3em" () [@JSX]);
         (div
            ~className:"grid grow grid-rows-2 overflow-hidden px-2 py-1 text-sm"
            ~children:
              [
                (match song with
                | None -> (
                    match currentSongId with
                    | None -> React.null
                    | Some _ -> Skeleton.make ~className:"mt-0 w-20" () [@JSX])
                | Some song ->
                    span ~className:"col-span-full truncate"
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
                    | Some _ -> Skeleton.make ~className:"mb-0 w-32" () [@JSX])
                | Some song ->
                    span ~className:"truncate text-muted-foreground"
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
         (StarButton.make ~className:"p-3" ~disabled:(song |> Option.is_none)
            ?id:(song |> Option.map (fun song -> Subsonic.Song.(song.id)))
            ?starred:(song |. Option.bind (fun song -> song.starred))
            () [@JSX]);
         (DropdownMenu.Root.make
            ~children:
              [
                (DropdownMenu.Trigger.make
                   ~children:
                     (Button.make ~ariaLabel:"Menu" ~className:"p-3"
                        ~variant:"icon"
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
                       (form ~className:"ms-auto"
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
