type defaultVariants = { variant : string }
type variantValues = { primary : string; icon : string; link : string }
type variants = { variant : variantValues }

let variants =
  let defaultVariants : defaultVariants = { variant = "primary" } in
  Cva.make
    "inline-flex cursor-not-allowed items-center justify-center gap-2 \
     whitespace-nowrap opacity-50 [&_svg]:shrink-0 \
     [:where(:enabled,:any-link)&]:cursor-pointer \
     [:where(:enabled,:any-link)&]:opacity-100"
    {
      defaultVariants;
      variants =
        {
          variant =
            {
              primary =
                "rounded-lg bg-primary px-3 py-2 text-sm \
                 text-primary-foreground [&_svg]:size-5 \
                 [:where(:enabled,:any-link)&]:hover:bg-primary/90";
              icon =
                "rounded-sm text-muted-foreground \
                 [:where(:enabled,:any-link)&]:hover:text-secondary-foreground";
              link =
                "rounded-lg px-3 py-2 text-base text-foreground [&_svg]:size-5 \
                 [:where(:enabled,:any-link)&]:hover:text-primary";
            };
        };
    }

let[@react.component] make =
  React.forwardRef
    (fun
      ?ariaControls
      ?ariaExpanded
      ?ariaLabel
      ?ariaPressed
      ?children
      ?className
      ?disabled
      ?loading
      ?(popoverTarget : string option)
      ?variant
      ?type_
      ?onClick
      ref
    ->
      React.cloneElement
        (button ?ariaControls ?ariaExpanded ?ariaLabel ?ariaPressed
           ~className:
             (Clsx.make
                [| Item (Cva.inputs ?className ?variant () |> variants) |])
           ?disabled
           ?ref:(ref |> Js.Nullable.toOption |> Option.map ReactDOM.Ref.domRef)
           ~type_:(type_ |> Option.value ~default:"button")
           ?onClick
           ~children:
             [
               loading
               |. Option.bind (fun loading -> if loading then Some () else None)
               |> Option.map (fun () ->
                   (LucideReact.Loader2.make
                      ~className:
                        "absolute animate-spin self-center \
                         text-primary-foreground"
                      () [@JSX]))
               |> Option.value ~default:React.null;
               (span
                  ~className:
                    (Clsx.make
                       [|
                         Item "contents";
                         Item [%mel.obj { invisible = loading }];
                       |])
                  ?children () [@JSX]);
             ]
           () [@JSX])
        [%mel.obj { popoverTarget }])
