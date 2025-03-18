module Context = struct
  include React.Context

  type value = {
    isOpenRef : bool React.ref;
    menuId : string;
    preventNextToggleRef : bool React.ref;
    triggerId : string;
  }

  let context : value option React.Context.t = React.createContext None
  let make = React.Context.provider context
  let use () = context |> React.useContext |> Option.get
end

let useDropdownMenuContext = Context.use

module Root = struct
  let[@react.component] make ~children =
    let isOpenRef = React.useRef false
    and menuId = React.useId ()
    and preventNextToggleRef = React.useRef false
    and triggerId = React.useId () in
    let value =
      React.useMemo2
        (fun () ->
          Some Context.{ isOpenRef; menuId; preventNextToggleRef; triggerId })
        (menuId, triggerId)
    in
    (Context.make ~value
       ~children:(Popover.Root.make ~children () [@JSX])
       () [@JSX])
end

module Trigger = struct
  let[@react.component] make ~children =
    let Context.{ isOpenRef; menuId; preventNextToggleRef; triggerId } =
      useDropdownMenuContext ()
    in
    (Popover.Reference.make
       ~children:
         (React.cloneElement children
            [%mel.obj
              {
                ariaControls = menuId [@mel.as "aria-controls"];
                ariaHaspopup = ("menu" [@mel.as "aria-haspopup"]);
                id = triggerId;
                popoverTarget = menuId;
                onPointerDown =
                  (fun _ ->
                    if isOpenRef.current then
                      preventNextToggleRef.current <- true);
              }])
       () [@JSX])
end

module Content = struct
  let[@react.component] make ~children ?className ?placement ?strategy =
    let menuRef = React.useRef Js.Nullable.null in
    let Context.{ isOpenRef; menuId; preventNextToggleRef; triggerId } =
      useDropdownMenuContext ()
    in
    React.useEffect0 (fun () ->
        match menuRef.current |> Js.Nullable.toOption with
        | None -> None
        | Some menuEl ->
            let abortController = Fetch.AbortController.make () in
            (menuEl
            |. DomExtra.(
                 addEventListener
                   (`beforetoggle
                      BeforeToggle.(
                        fun event ->
                          if
                            event |. newState == "open"
                            && preventNextToggleRef.current
                          then (
                            preventNextToggleRef.current <- false;
                            event |. preventDefault)))
                   (listenerOptions
                      ~signal:(abortController |> Fetch.AbortController.signal)
                      ())));
            Some (fun () -> abortController |> Fetch.AbortController.abort));
    Popover.Content.make ?placement ?strategy
      ~children:
        (React.cloneElement
           (div ~ariaLabelledby:triggerId ~children
              ~className:
                (Clsx.make
                   [|
                     Item
                       "m-0 origin-top-right rounded-md border bg-background \
                        p-1 shadow-md [&:popover-open]:animate-in \
                        [&:popover-open]:fade-in-0 [&:popover-open]:zoom-in-95 \
                        [&:popover-open]:slide-in-from-top-2";
                     Item (className |> Option.value ~default:"");
                   |])
              ~id:menuId
              ~ref:(ReactDOM.Ref.domRef menuRef)
              ~role:"menu"
              ~onBlur:
                React.Event.Focus.(
                  fun event ->
                    event |> relatedTarget
                    |> Option.iter (fun relatedTarget ->
                           let currentTarget = event |. currentTarget in
                           if not (currentTarget##contains relatedTarget) then
                             currentTarget##hidePopover ()))
              ~onKeyDown:(fun event ->
                let open React.Event.Keyboard in
                let open ReactExtra.Event.Keyboard in
                let open Webapi.Dom in
                event |> target |> Element.asHtmlElement
                |. Option.bind (fun target ->
                       let role = target |> DomExtra.role in
                       if role == "menuitem" then Some target
                       else
                         target
                         |> HtmlElement.closest "[role=menuitem]"
                         |. Option.bind Element.asHtmlElement)
                |> Option.iter (fun selectedMenuItem ->
                       let menu = event |. currentTarget in
                       match event |. code with
                       | "Home" ->
                           event |. preventDefault;
                           event |. stopPropagation;

                           menu
                           |> Element.querySelector
                                "[role=menuitem]:first-child"
                           |. Option.bind Element.asHtmlElement
                           |> Option.get |. HtmlElement.focus
                       | "ArrowLeft" | "ArrowUp" ->
                           event |. preventDefault;
                           event |. stopPropagation;

                           let menuItems =
                             menu
                             |> Element.querySelectorAll "[role=menuitem]"
                             |> NodeList.toArray
                           in
                           let currentIndex =
                             menuItems
                             |> Js.Array.indexOf
                                  ~value:(selectedMenuItem |> HtmlElement.asNode)
                           and len = menuItems |. Js.Array.length in
                           menuItems
                           |. Belt.Array.get ((currentIndex + len - 1) mod len)
                           |. Option.bind Element.ofNode
                           |. Option.bind Element.asHtmlElement
                           |> Option.get |. HtmlElement.focus
                       | "ArrowRight" | "ArrowDown" ->
                           event |. preventDefault;
                           event |. stopPropagation;

                           let menuItems =
                             menu
                             |> Element.querySelectorAll "[role=menuitem]"
                             |> NodeList.toArray
                           in
                           let currentIndex =
                             menuItems
                             |> Js.Array.indexOf
                                  ~value:(selectedMenuItem |> HtmlElement.asNode)
                           and len = menuItems |. Js.Array.length in
                           menuItems
                           |. Belt.Array.get ((currentIndex + 1) mod len)
                           |. Option.bind Element.ofNode
                           |. Option.bind Element.asHtmlElement
                           |> Option.get |. HtmlElement.focus
                       | "End" ->
                           event |. preventDefault;
                           event |. stopPropagation;

                           menu
                           |> Element.querySelector "[role=menuitem]:last-child"
                           |. Option.bind Element.asHtmlElement
                           |> Option.get |. HtmlElement.focus
                       | "Escape" ->
                           event |. preventDefault;
                           event |. stopPropagation;

                           document
                           |> Document.getElementById triggerId
                           |. Option.bind Element.asHtmlElement
                           |> Option.get |. HtmlElement.focus
                       | _
                         when event |> key |> Js.String.unsafeToArrayLike
                              |> Js.Array.from |> Js.Array.length == 1 ->
                           event |. preventDefault;
                           event |. stopPropagation;

                           let menuItems =
                             menu
                             |> Element.querySelectorAll "[role=menuitem]"
                             |> NodeList.toArray
                           in
                           let currentIndex =
                             menuItems
                             |> Js.Array.indexOf
                                  ~value:(selectedMenuItem |> HtmlElement.asNode)
                           and pressedCharacter =
                             event |> key |> Js.String.toLowerCase
                           in
                           let open Js.Array in
                           menuItems
                           |> slice ~start:(currentIndex + 1)
                           |> concat ~other:(slice menuItems ~end_:currentIndex)
                           |> find ~f:(fun node ->
                                  let open Js.String in
                                  node |> Node.textContent |> toLowerCase
                                  |> startsWith ~prefix:pressedCharacter)
                           |. Option.bind HtmlElement.ofNode
                           |> Option.iter HtmlElement.focus
                       | _ -> ()))
              () [@JSX])
           [%mel.obj
             {
               popover = "auto";
               onToggle =
                 (fun event ->
                   let newState = event##newState in
                   isOpenRef.current <- newState == "open";

                   if newState == "open" then
                     let firstMenuItem =
                       event##currentTarget
                       |> Webapi.Dom.Element.querySelector
                            "[role=menuitem]:first-child"
                       |. Option.bind Webapi.Dom.HtmlElement.ofElement
                       |> Option.get
                     in
                     Js.Global.setTimeout 0 ~f:(fun () ->
                         firstMenuItem |. Webapi.Dom.HtmlElement.focus)
                     |> ignore);
             }])
      () [@JSX]
end

module Item = struct
  let[@react.component] make ~children ?onClick ?(type_ = "button") =
    let Context.{ menuId; _ } = useDropdownMenuContext () in
    React.cloneElement
      (button ~children
         ~className:
           "flex w-full cursor-pointer select-none items-center gap-2 \
            rounded-sm px-2 py-1.5 text-sm hover:bg-accent \
            hover:text-accent-foreground focus-visible:bg-accent \
            focus-visible:text-accent-foreground [&_svg]:size-4 \
            [&_svg]:shrink-0"
         ~role:"menuitem" ~type_ ?onClick () [@JSX])
      [%mel.obj { popovertarget = menuId; popovertargetaction = "hide" }]
end
