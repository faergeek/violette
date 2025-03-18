type clientXToTimeParams = { duration : float; x : float; width : float }
type hoverInfo = { x : float; time : float }

let[@react.component] make () =
  let buffered = Store.Context.useAppStore (fun state -> state.player.buffered)
  and currentTime =
    Store.Context.useAppStore (fun state -> state.player.currentTime)
  and duration = Store.Context.useAppStore (fun state -> state.player.duration)
  and runAsyncStoreFx = StoreFx.RunAsync.use ()
  and hoverInfo, setHoverInfo = React.useState (Fun.const None)
  and clientXToTime params =
    Js.Math.max_float 0.0
      (Js.Math.min_float
         (params.duration *. params.x /. params.width)
         params.duration)
  in
  let now =
    hoverInfo
    |> Option.map (fun x -> x.time)
    |> Option.value ~default:currentTime
  in
  (div ~ariaLabel:"Playback position"
     ~ariaValuemax:(duration |> Option.value ~default:0.0)
     ~ariaValuenow:now ~ariaValuetext:(now |> Duration.format)
     ~className:
       "group/playback-position relative -mt-4 h-4 select-none text-xs \
        slashed-zero tabular-nums text-white transition-colors \
        [@media(hover:hover){&:not(:hover)}]:text-transparent"
     ~role:"slider" ~tabIndex:0
     ~onMouseMove:(fun event ->
       let open React.Event.Mouse in
       let open ReactExtra.Event.Mouse in
       let open Webapi.Dom in
       duration
       |> Option.iter (fun duration ->
              let bcr =
                event |. currentTarget |. Element.getBoundingClientRect
              in
              let x =
                (event |. clientX |> Float.of_int) -. (bcr |. DomRect.left)
              in
              Webapi.requestAnimationFrame (fun _ ->
                  let width = bcr |. DomRect.width in
                  let time = clientXToTime { duration; width; x } in
                  setHoverInfo (Fun.const (Some { time; x })))))
     ~onMouseOut:(fun _ ->
       Webapi.requestAnimationFrame (fun _ -> setHoverInfo (Fun.const None)))
     ~onMouseUp:(fun event ->
       let open React.Event.Mouse in
       let open ReactExtra.Event.Mouse in
       let open Webapi.Dom in
       duration
       |. Option.bind (fun duration ->
              if event |. button == 0 then Some duration else None)
       |> Option.iter (fun duration ->
              Webapi.requestAnimationFrame (fun _ ->
                  setHoverInfo (fun _ -> None));
              let bcr =
                event |. currentTarget |. Element.getBoundingClientRect
              in
              let width = bcr |. DomRect.width
              and x =
                (event |. clientX |. Float.of_int) -. (bcr |. DomRect.left)
              in
              StoreFx.SetCurrentTime.make (fun _ ->
                  clientXToTime { duration; width; x })
              |> runAsyncStoreFx
              |> Js.Promise.then_ (fun result ->
                     result |. Result.get_ok |> Js.Promise.resolve)
              |> ignore))
     ~children:
       (div
          ~className:
            "absolute inset-0 top-auto h-4 origin-bottom overflow-hidden \
             bg-secondary transition-transform \
             group-hover/playback-position:scale-y-100 \
             [@media(hover:hover){&}]:scale-y-[0.2]"
          ~children:
            [
              (match duration with
              | None -> React.null
              | Some duration ->
                  React.Fragment.make
                    ~children:
                      [
                        buffered
                        |> Js.Array.mapi
                             ~f:(fun Store.State.{ end_; start } index ->
                               (div ~key:(Js.String.make index)
                                  ~className:
                                    "pointer-events-none absolute inset-0 \
                                     h-full w-full origin-left transform \
                                     bg-muted-foreground/20"
                                  ~style:
                                    (ReactDOM.Style.make ()
                                    |. ReactDOM.Style.unsafeAddStyle
                                         [%mel.obj
                                           {
                                             scaleX =
                                               Js.String.make
                                                 ((end_ -. start) /. duration)
                                               [@mel.as "--tw-scale-x"];
                                             translateX =
                                               (Js.String.make
                                                  (100.0 *. start /. duration)
                                               ^ "%")
                                               [@mel.as "--tw-translate-x"];
                                           }])
                                  () [@JSX]))
                        |> React.array;
                        (div
                           ~className:
                             "pointer-events-none absolute inset-0 h-full \
                              w-full origin-left transform bg-primary \
                              will-change-transform"
                           ~style:
                             (ReactDOM.Style.make ()
                             |. ReactDOM.Style.unsafeAddStyle
                                  [%mel.obj
                                    {
                                      scale =
                                        (currentTime /. duration)
                                        [@mel.as "--tw-scale-x"];
                                    }])
                           () [@JSX]);
                      ]
                    () [@JSX]);
              (span
                 ~className:
                   (Clsx.make
                      [|
                        Item
                          "pointer-events-none absolute left-0 ps-2 \
                           mix-blend-difference";
                        Item
                          [%mel.obj
                            {
                              is_none =
                                (hoverInfo |> Option.is_none)
                                [@mel.as "border-transparent"];
                              is_some =
                                (hoverInfo |> Option.is_some)
                                [@mel.as
                                  "absolute transform will-change-contents"];
                            }];
                      |])
                 ~children:(currentTime |> Duration.format |> React.string)
                 () [@JSX]);
              (match hoverInfo with
              | None -> React.null
              | Some hoverInfo ->
                  span
                    ~className:
                      "pointer-events-none absolute left-0 transform border-s \
                       ps-1 mix-blend-difference will-change-contents"
                    ~style:
                      (ReactDOM.Style.make ()
                      |. ReactDOM.Style.unsafeAddStyle
                           [%mel.obj
                             {
                               translateX =
                                 (Js.String.make hoverInfo.x ^ "px")
                                 [@mel.as "--tw-translate-x"];
                             }])
                    ~children:(hoverInfo.time |> Duration.format |> React.string)
                    () [@JSX]);
              (match duration with
              | None -> React.null
              | Some duration ->
                  span
                    ~className:
                      "pointer-events-none absolute right-0 ms-auto pe-2 \
                       mix-blend-difference"
                    ~children:(duration |> Duration.format |> React.string)
                    () [@JSX]);
            ]
          () [@JSX])
     () [@JSX])
