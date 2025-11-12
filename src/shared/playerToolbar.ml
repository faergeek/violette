type repeatMode = RepeatAll | RepeatOne
type volumeState = [ `muted | `volume1 | `volume2 ]

let[@react.component] make ~queueId ~queueTriggerRef =
  let runStoreFx = StoreFx.Run.use () in
  React.useEffect1
    (fun () ->
      StoreFx.SubscribeToAudioEvents.make ()
      |> runStoreFx |> Result.get_ok |> Option.some)
    [| runStoreFx |];
  let runStoreFx = StoreFx.Run.use () in
  let runAsyncStoreFx = StoreFx.RunAsync.use () in
  React.useEffect2
    (fun () ->
      let open Fetch in
      let open Webapi in
      let abortController = AbortController.make () in
      Dom.window
      |. Window.addKeyDownEventListener
           (fun event ->
             let document =
               Dom.document |> Dom.Document.asHtmlDocument |> Option.get
             in
             let open Dom.HtmlDocument in
             let activeElement = document |. activeElement |> Option.get
             and body = document |. body |> Option.get
             and code = event |. Dom.KeyboardEvent.code in
             if activeElement == body then
               match code with
               | "KeyK" | "Space" ->
                   event |. Dom.KeyboardEvent.preventDefault;
                   StoreFx.TogglePaused.make ()
                   |> runAsyncStoreFx
                   |> Js.Promise.then_ (fun result ->
                       result |> Result.get_ok |> Js.Promise.resolve)
                   |> ignore
               | "KeyJ" | "ArrowLeft" ->
                   StoreFx.SetCurrentTime.make (Fun.flip ( -. ) 10.0)
                   |> runAsyncStoreFx
                   |> Js.Promise.then_ (fun result ->
                       result |> Result.get_ok |> Js.Promise.resolve)
                   |> ignore
               | "KeyL" | "ArrowRight" ->
                   StoreFx.SetCurrentTime.make (Fun.flip ( +. ) 10.0)
                   |> runAsyncStoreFx
                   |> Js.Promise.then_ (fun result ->
                       result |> Result.get_ok |> Js.Promise.resolve)
                   |> ignore
               | "ArrowUp" ->
                   event |. Dom.KeyboardEvent.preventDefault;
                   StoreFx.SetVolume.make (Fun.flip ( +. ) 0.05)
                   |> runStoreFx |. Result.get_ok |> ignore
               | "ArrowDown" ->
                   event |. Dom.KeyboardEvent.preventDefault;
                   StoreFx.SetVolume.make (Fun.flip ( -. ) 0.05)
                   |> runStoreFx |. Result.get_ok |> ignore
               | _ -> ()
             else if code == "Escape" then
               match activeElement |> Dom.Element.asHtmlElement with
               | None -> ()
               | Some activeElement -> activeElement |> Dom.HtmlElement.blur)
           (Window.listenerOptions ~capture:false ~passive:false
              ~signal:(abortController |> AbortController.signal)
              ());
      Some (fun () -> abortController |. AbortController.abort))
    (runAsyncStoreFx, runStoreFx);
  React.useEffect1
    (fun () ->
      let actions =
        [|
          `nexttrack;
          `pause;
          `play;
          `previoustrack;
          `seekbackward;
          `seekforward;
          `seekto;
          `stop;
        |]
      in
      actions
      |> Js.Array.forEach
           ~f:
             (MediaSession.setActionHandler
                ~handler:
                  (Some
                     (fun event ->
                       event |> StoreFx.HandleMediaSessionAction.make
                       |> runAsyncStoreFx
                       |> Js.Promise.then_ (fun result ->
                           result |> Result.get_ok |> Js.Promise.resolve)
                       |> ignore)));
      Some
        (fun () ->
          actions
          |> Js.Array.forEach ~f:(MediaSession.setActionHandler ~handler:None)))
    [| runAsyncStoreFx |];
  let repeatMode, setRepeatMode = React.useState (fun () -> None) in
  (div ~className:"flex bg-background"
     ~children:
       [
         (div ~className:"group/volume-settings grow"
            ~children:
              (Popover.Root.make
                 ~children:
                   [
                     (Popover.Reference.make
                        ~children:
                          (Button.make ~ariaLabel:"Volume"
                             ~className:
                               "w-full p-3 \
                                group-has-[#volume-settings:popover-open]/volume-settings:[&:not(:hover)]:text-primary"
                             ~popoverTarget:"volume-settings" ~variant:"icon"
                             ~children:
                               (LucideReact.SlidersVertical.make ~role:"none" ()
                                [@JSX])
                             () [@JSX])
                        () [@JSX]);
                     (Popover.Content.make ~padding:4.0 ~placement:`topEnd
                        ~strategy:`fixed
                        ~children:
                          (React.cloneElement
                             (div
                                ~className:
                                  "m-0 w-96 rounded-md border bg-background \
                                   p-3 shadow-md [&:popover-open]:animate-in \
                                   [&:popover-open]:fade-in-0 \
                                   [&:popover-open]:zoom-in-95 \
                                   [&:popover-open]:slide-in-from-bottom-2"
                                ~id:"volume-settings"
                                ~children:
                                  [
                                    (H2.make ~id:"volume-heading"
                                       ~children:(React.string "Volume") ()
                                     [@JSX]);
                                    (div ~className:"space-y-4"
                                       ~children:
                                         [
                                           (div
                                              ~className:
                                                "flex items-center gap-2"
                                              ~children:
                                                [
                                                  (Store.Context.Consumer.make
                                                     ~selector:(fun state ->
                                                       let open Store.State in
                                                       state.player.volume)
                                                     ~children:(fun volume ->
                                                       (Slider.make
                                                          ~ariaLabelledby:
                                                            "volume-heading"
                                                          ~max:1.0 ~step:0.05
                                                          ~value:volume
                                                          ~onValueChange:(fun
                                                              newVolume ->
                                                            StoreFx.SetVolume
                                                            .make
                                                              (Fun.const
                                                                 newVolume)
                                                            |> runStoreFx
                                                            |> Result.get_ok)
                                                          () [@JSX]))
                                                     () [@JSX]);
                                                  (Store.Context.Consumer.make
                                                     ~selector:(fun state ->
                                                       let open Store.State in
                                                       if
                                                         state.player.muted
                                                         || state.player.volume
                                                            == 0.0
                                                       then `muted
                                                       else if
                                                         state.player.volume
                                                         < 0.5
                                                       then `volume1
                                                       else `volume2)
                                                     ~children:(fun state ->
                                                       (Button.make
                                                          ~ariaLabel:"Mute"
                                                          ~ariaPressed:
                                                            (if state == `muted
                                                             then "true"
                                                             else "false")
                                                          ~variant:"icon"
                                                          ~onClick:(fun _ ->
                                                            StoreFx.ToggleMuted
                                                            .make ()
                                                            |> runStoreFx
                                                            |> Result.get_ok)
                                                          ~children:
                                                            (match state with
                                                            | `muted ->
                                                                LucideReact
                                                                .VolumeX
                                                                .make
                                                                  ~role:"none"
                                                                  () [@JSX]
                                                            | `volume1 ->
                                                                LucideReact
                                                                .Volume1
                                                                .make
                                                                  ~role:"none"
                                                                  () [@JSX]
                                                            | `volume2 ->
                                                                LucideReact
                                                                .Volume2
                                                                .make
                                                                  ~role:"none"
                                                                  () [@JSX])
                                                          () [@JSX]))
                                                     () [@JSX]);
                                                ]
                                              () [@JSX]);
                                           (Store.Context.Consumer.make
                                              ~selector:(fun state ->
                                                let open Store.State in
                                                state.player.replayGainOptions
                                                  .preferredGain)
                                              ~children:(fun preferredGain ->
                                                (RadioGroup.Root.make
                                                   ~className:
                                                     "[font-variant-caps:all-small-caps]"
                                                   ~name:"replay-gain"
                                                   ~value:
                                                     (preferredGain
                                                     |> Option.map
                                                          Store.State
                                                          .ReplayGainOptions
                                                          .stringOfPreferredGain
                                                     |> Option.value ~default:""
                                                     )
                                                   ~onValueChange:(fun
                                                       newValue ->
                                                     StoreFx
                                                     .SetReplayGainOptions
                                                     .make (fun prevOptions ->
                                                         {
                                                           prevOptions with
                                                           preferredGain =
                                                             newValue
                                                             |> Store.State
                                                                .ReplayGainOptions
                                                                .preferredGainOfString;
                                                         })
                                                     |> runStoreFx
                                                     |> Result.get_ok)
                                                   ~children:
                                                     [
                                                       (RadioGroup.Label.make
                                                          ~className:"me-2"
                                                          ~children:
                                                            (React.string
                                                               "Normalization")
                                                          () [@JSX]);
                                                       (RadioGroup.Item.make
                                                          ~label:"None"
                                                          ~value:"" () [@JSX]);
                                                       (RadioGroup.Item.make
                                                          ~label:"Album"
                                                          ~value:"album" ()
                                                        [@JSX]);
                                                       (RadioGroup.Item.make
                                                          ~label:"Track"
                                                          ~value:"track" ()
                                                        [@JSX]);
                                                     ]
                                                   () [@JSX]))
                                              () [@JSX]);
                                           (div
                                              ~className:
                                                "flex items-center gap-2"
                                              ~children:
                                                [
                                                  (Label.make
                                                     ~className:
                                                       "mt-2 shrink-0 pb-2 \
                                                        [font-variant-caps:all-small-caps]"
                                                     ~htmlFor:"pre-amp"
                                                     ~children:
                                                       (React.string "Pre-amp")
                                                     () [@JSX]);
                                                  (Store.Context.Consumer.make
                                                     ~selector:(fun state ->
                                                       let open Store.State in
                                                       state.player
                                                         .replayGainOptions
                                                         .preAmp)
                                                     ~children:(fun preAmp ->
                                                       (React.Fragment.make
                                                          ~children:
                                                            [
                                                              (Slider.make
                                                                 ~id:"pre-amp"
                                                                 ~markers:
                                                                   ([|
                                                                      -15.0;
                                                                      -10.0;
                                                                      -5.0;
                                                                      0.0;
                                                                      5.0;
                                                                      10.0;
                                                                      15.0;
                                                                    |]
                                                                   |> Js.Array
                                                                      .map
                                                                        ~f:(fun
                                                                            value
                                                                          ->
                                                                          let
                                                                          open
                                                                            Slider in
                                                                          {
                                                                            label =
                                                                              Gain
                                                                              .format
                                                                                value;
                                                                            value;
                                                                          }))
                                                                 ~max:15.0
                                                                 ~min:(-15.0)
                                                                 ~step:0.5
                                                                 ~value:preAmp
                                                                 ~onValueChange:(fun
                                                                     newPreAmp
                                                                   ->
                                                                   StoreFx
                                                                   .SetReplayGainOptions
                                                                   .make
                                                                     (fun
                                                                       prevOptions
                                                                     ->
                                                                       {
                                                                         prevOptions
                                                                         with
                                                                         preAmp =
                                                                           newPreAmp;
                                                                       })
                                                                   |> runStoreFx
                                                                   |> Result
                                                                      .get_ok)
                                                                 () [@JSX]);
                                                              (span
                                                                 ~className:
                                                                   "shrink-0 \
                                                                    font-mono \
                                                                    text-xs"
                                                                 ~children:
                                                                   [
                                                                     Gain.format
                                                                       preAmp
                                                                     |> React
                                                                        .string;
                                                                     React
                                                                     .string
                                                                       " dB";
                                                                   ]
                                                                 () [@JSX]);
                                                            ]
                                                          () [@JSX]))
                                                     () [@JSX]);
                                                ]
                                              () [@JSX]);
                                         ]
                                       () [@JSX]);
                                  ]
                                () [@JSX])
                             [%mel.obj { popover = "auto" }])
                        () [@JSX]);
                   ]
                 () [@JSX])
            () [@JSX]);
         (Store.Context.Consumer.make
            ~selector:
              (let open Store.State in
               fun state -> state.player.queuedSongIds |. Js.Array.length)
            ~children:(fun queuedSongCount ->
              (Button.make ~ariaLabel:"Previous song" ~className:"grow p-3"
                 ~disabled:(queuedSongCount == 0) ~variant:"icon"
                 ~onClick:(fun _ ->
                   StoreFx.GoToPrevSong.make ()
                   |> runAsyncStoreFx
                   |> Js.Promise.then_ (fun result ->
                       result |> Result.get_ok |> Js.Promise.resolve)
                   |> ignore)
                 ~children:(LucideReact.SkipBack.make ~role:"none" () [@JSX])
                 () [@JSX]))
            () [@JSX]);
         (Store.Context.Consumer.make
            ~selector:(fun state ->
              let open Store.State in
              state.player.currentSongId |> Option.is_some)
            ~children:(fun hasCurrentSong ->
              (Store.Context.Consumer.make
                 ~selector:(fun state ->
                   let open Store.State in
                   state.player.paused)
                 ~children:(fun paused ->
                   (Button.make
                      ~ariaLabel:(if paused then "Play" else "Pause")
                      ~className:"grow p-3" ~disabled:(not hasCurrentSong)
                      ~variant:"icon"
                      ~onClick:(fun _ ->
                        StoreFx.TogglePaused.make ()
                        |> runAsyncStoreFx
                        |> Js.Promise.then_ (fun result ->
                            result |> Result.get_ok |> Js.Promise.resolve)
                        |> ignore)
                      ~children:
                        (if paused then
                           LucideReact.Play.make ~role:"none" () [@JSX]
                         else LucideReact.Pause.make ~role:"none" () [@JSX])
                      () [@JSX]))
                 () [@JSX]))
            () [@JSX]);
         (Store.Context.Consumer.make
            ~selector:(fun state ->
              let open Store.State in
              state.player.queuedSongIds |. Js.Array.length)
            ~children:(fun queuedSongCount ->
              (Button.make ~ariaLabel:"Next song" ~className:"grow p-3"
                 ~disabled:(queuedSongCount == 0) ~variant:"icon"
                 ~onClick:(fun _ ->
                   StoreFx.GoToNextSong.make ()
                   |> runAsyncStoreFx
                   |> Js.Promise.then_ (fun result ->
                       result |> Result.get_ok |> Js.Promise.resolve)
                   |> ignore)
                 ~children:(LucideReact.SkipForward.make ~role:"none" () [@JSX])
                 () [@JSX]))
            () [@JSX]);
         (QueueContext.Consumer.make
            ~children:(fun QueueContext.Context.{ isOpen; setIsOpen } ->
              (Button.make ~ref:queueTriggerRef ~ariaControls:queueId
                 ~ariaExpanded:isOpen ~ariaLabel:"Now playing queue"
                 ~className:
                   (Clsx.make
                      [|
                        Item "grow p-3";
                        Item
                          [%mel.obj
                            { isOpen = isOpen [@mel.as "text-primary"] }];
                      |])
                 ~variant:"icon"
                 ~onClick:(fun _ -> setIsOpen (fun prevState -> not prevState))
                 ~children:(LucideReact.ListMusic.make ~role:"none" () [@JSX])
                 () [@JSX]))
            () [@JSX]);
         (Button.make
            ~ariaLabel:
              (match repeatMode with
              | Some RepeatOne -> "Repeat one"
              | Some RepeatAll | None -> "Repeat all")
            ~ariaPressed:
              (match repeatMode with
              | None -> "false"
              | Some (RepeatAll | RepeatOne) -> "true")
            ~className:
              (Clsx.make
                 [|
                   Item "grow p-3";
                   Item
                     [%mel.obj
                       {
                         is =
                           (repeatMode |> Option.is_some)
                           [@mel.as "text-primary enabled:hover:text-primary"];
                       }];
                 |])
            ~variant:"icon"
            ~onClick:(fun _ ->
              setRepeatMode (function
                | None -> Some RepeatAll
                | Some RepeatAll -> Some RepeatOne
                | Some RepeatOne -> None))
            ~children:
              (match repeatMode with
              | Some RepeatOne ->
                  LucideReact.Repeat1.make ~role:"none" () [@JSX]
              | Some RepeatAll | None ->
                  LucideReact.Repeat.make ~role:"none" () [@JSX])
            () [@JSX]);
       ]
     () [@JSX])
