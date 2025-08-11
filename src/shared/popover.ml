module Context = struct
  include React.Context

  type reference = Dom.element option

  type value = {
    reference : reference;
    setReference : (reference -> reference) -> unit;
  }

  let context : value option React.Context.t = React.createContext None
  let make = React.Context.provider context
  let use () = React.useContext context |> Option.get
end

module Root = struct
  let[@react.component] make ~children =
    let reference, setReference = React.useState (Fun.const None) in
    let value =
      React.useMemo1
        (fun () -> Some Context.{ reference; setReference })
        [| reference |]
    in
    (Context.make ~value ~children () [@JSX])
end

module Reference = struct
  let[@react.component] make ~children =
    let context = Context.use () in
    React.cloneElement children [%mel.obj { ref = context.setReference }]
end

type 'a style =
  < left : float option
  ; top : float option
  ; position : 'a option
  ; visibility : string option >
  Js.t

module Content = struct
  let[@react.component] make ~children ?mainAxisOffset ?padding ?placement
      ?(strategy = `absolute) =
    let floating, setFloating = React.useState (Fun.const None) in
    let Context.{ reference; _ } = Context.use () in
    let isOpen, setIsOpen = React.useState (Fun.const false) in
    let style, setStyle = React.useState (Fun.const None) in
    let updateStyle =
      React.useCallback7
        (fun () ->
          match (isOpen, floating, reference) with
          | false, _, _ | _, None, _ | _, _, None -> setStyle (Fun.const None)
          | true, Some floating, Some reference ->
              (let open FloatingUI in
               let middleware =
                 [|
                   Offset.(options ?mainAxis:mainAxisOffset () |> make);
                   Flip.(options ?padding () |> make);
                   Shift.(options ?padding () |> make);
                   Size.(
                     options
                       ~apply:(fun
                           { availableWidth; availableHeight; elements } ->
                         let open Webapi.Dom in
                         match
                           elements.floating |. Element.asHtmlElement
                           |> Option.map HtmlElement.style
                         with
                         | None -> ()
                         | Some style ->
                             let open CssStyleDeclaration in
                             let setProp name value =
                               style |> setProperty name value ""
                             in
                             setProp "max-width"
                               (Float.to_string
                                  (Js.Math.max_float 0.0 availableWidth)
                               ^ "px");
                             setProp "max-height"
                               (Float.to_string
                                  (Js.Math.max_float 0.0 availableHeight)
                               ^ "px"))
                       ()
                     |> make);
                 |]
               in
               let options =
                 ComputePosition.options ~middleware ?placement ~strategy ()
               in
               let open Promise.Monad_syntax in
               let* ComputePosition.{ x; y } =
                 ComputePosition.make ~reference ~floating ~options
               in
               setStyle
                 (Fun.const
                    (Some
                       [%mel.obj
                         {
                           position = Some strategy;
                           left = Some x;
                           top = Some y;
                           visibility = None;
                         }]));
               Js.Promise.resolve ())
              |> ignore)
        ( floating,
          isOpen,
          mainAxisOffset,
          padding,
          placement,
          reference,
          strategy )
    in
    React.useEffect4
      (fun () ->
        updateStyle ();

        match (isOpen, floating, reference) with
        | false, _, _ | _, None, _ | _, _, None -> None
        | true, Some floating, Some reference ->
            let open FloatingUI.AutoUpdate in
            Some (make ~reference ~floating ~update:updateStyle))
      (floating, isOpen, reference, updateStyle);
    let childrenProps = children |> ReactExtra.getProps in
    React.useEffect1
      (fun () ->
        floating
        |> Option.iter (fun x ->
               x
               |. DomExtra.(
                    addEventListener
                      Toggle.(
                        `toggle
                          (fun event ->
                            let isOpen = event |. newState == "open" in
                            setIsOpen (Fun.const isOpen);
                            childrenProps##onToggle
                            |> Option.iter (fun onToggle -> onToggle event)))
                      (listenerOptions ())));
        None)
      [| floating |];
    React.cloneElement children
      [%mel.obj
        {
          ref =
            (fun node ->
              setFloating (fun _ -> node);
              childrenProps##ref
              |> Option.iter (fun (ref : Dom.element option React.ref) ->
                     ref.current <- node));
          style =
            Js.Obj.assign
              (Js.Obj.assign [%mel.obj { visibility = None }]
                 childrenProps##style)
              (style
              |> Option.value
                   ~default:
                     [%mel.obj
                       {
                         top = None;
                         left = None;
                         position = None;
                         visibility = Some "hidden";
                       }]);
        }]
end
