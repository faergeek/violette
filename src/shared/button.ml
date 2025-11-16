external%private [@mel.module "./button.module.css"] css :
  < root : string
  ; root_variant_primary : string
  ; root_variant_icon : string
  ; root_state_loading : string
  ; spinner : string
  ; contents : string >
  Js.t = "default"

let[@react.component] make =
  React.forwardRef
    (fun
      ?ariaControls
      ?ariaExpanded
      ?ariaLabel
      ?ariaPressed
      ?children
      ?(className : string option)
      ?disabled
      ?loading
      ?(popovertarget : string option)
      ?(variant : [ `icon | `primary ] option)
      ?type_
      ?onClick
      ref
    ->
      React.cloneElement
        (button ?ariaControls ?ariaExpanded ?ariaLabel ?ariaPressed
           ~className:
             (Clsx.make
                [|
                  Item className;
                  Item css##root;
                  Item
                    (match variant with
                    | None | Some `primary -> css##root_variant_primary
                    | Some `icon -> css##root_variant_icon);
                  Item
                    (loading
                    |. Option.bind (fun loading ->
                        if loading then Some css##root_state_loading else None)
                    );
                |])
           ?disabled
           ?ref:(ref |> Js.Nullable.toOption |> Option.map ReactDOM.Ref.domRef)
           ~type_:(type_ |> Option.value ~default:"button")
           ?onClick
           ~children:
             [
               loading
               |. Option.bind (fun loading ->
                   if loading then
                     Some
                       (LucideReact.Loader2.make ~className:css##spinner ()
                        [@JSX])
                   else None)
               |> Option.value ~default:React.null;
               (span ~className:css##contents ?children () [@JSX]);
             ]
           () [@JSX])
        [%mel.obj { popovertarget }])
