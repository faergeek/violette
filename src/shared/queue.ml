let[@react.component] make ~id ~(triggerRef : 'a React.ref) =
  let rootRef = React.useRef Js.Nullable.null
  and currentSongId =
    Store.Context.useAppStore (fun state -> state.player.currentSongId)
  and queuedSongIds =
    Store.Context.useAppStore (fun state -> state.player.queuedSongIds)
  and lockScroll = ScrollLock.use ()
  and QueueContext.Context.{ isOpen; setIsOpen } =
    QueueContext.Context.use ()
  in
  let currentSongIdRef = React.useRef currentSongId in
  React.useEffect1
    (fun () ->
      currentSongIdRef.current <- currentSongId;
      None)
    [| currentSongId |];
  React.useEffect3
    (fun () ->
      (if isOpen then (
         lockScroll true;
         currentSongIdRef.current
         |> Option.iter (fun currentSongId ->
             let open Webapi.Dom in
             let currentSongElement =
               document
               |> Document.getElementById ("now-playing-queue-" ^ currentSongId)
             in
             currentSongElement
             |. Option.bind (Element.querySelector "button")
             |. Option.bind Element.asHtmlElement
             |> Option.iter HtmlElement.focus;
             currentSongElement
             |. Option.bind Element.asHtmlElement
             |> Option.iter
                  (HtmlElement.scrollIntoViewWithOptions
                     [%mel.obj { behavior = "instant"; block = "end" }])))
       else
         let activeElement =
           let open Webapi.Dom in
           document |> Document.asHtmlDocument
           |. Option.bind HtmlDocument.activeElement
         in
         match
           ( activeElement,
             rootRef.current |> Js.Nullable.toOption,
             triggerRef.current )
         with
         | None, _, _ | _, None, _ | _, _, None -> ()
         | Some activeElement, Some rootEl, Some triggerEl ->
             let open Webapi.Dom in
             if rootEl |> Element.contains activeElement then
               triggerEl |> HtmlElement.focus);
      Some (fun () -> lockScroll false))
    (isOpen, lockScroll, triggerRef);
  div
    ~ref:(ReactDOM.Ref.domRef rootRef)
    ~className:
      (Clsx.make
         [|
           Item "flex h-full flex-col overflow-hidden";
           Item
             [%mel.obj
               {
                 isOpen =
                   isOpen
                   [@mel.as "animate-in fade-in-0 slide-in-from-bottom-20"];
               }];
         |])
    ~id
    ~onKeyDown:(fun event ->
      match event |> ReactExtra.Event.Keyboard.code with
      | "Escape" ->
          let open React.Event.Keyboard in
          event |. preventDefault;
          event |. stopPropagation;
          Fun.const false |> setIsOpen
      | _ -> ())
    ~children:
      [
        (div ~className:"me-[var(--scrollbar-inline-size)]"
           ~children:
             (div ~className:"container mx-auto flex items-center ps-4 sm:pe-4"
                ~children:
                  [
                    (H2.make ~children:(React.string "Now playing") () [@JSX]);
                    (Button.make ~ariaLabel:"Close" ~className:"ms-auto p-3"
                       ~variant:"icon"
                       ~onClick:(fun _ -> setIsOpen (Fun.const false))
                       ~children:(LucideReact.X.make ~role:"none" () [@JSX])
                       () [@JSX]);
                  ]
                () [@JSX])
           () [@JSX]);
        (div ~className:"overflow-auto border-t"
           ~children:
             (div ~className:"container mx-auto sm:px-4"
                ~children:
                  (SongList.make
                     ~getSongElementId:(( ^ ) "now-playing-queue-")
                     ~isQueueView:true ~songIds:queuedSongIds () [@JSX])
                () [@JSX])
           () [@JSX]);
      ]
    () [@JSX]
