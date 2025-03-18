open LucideReact

let[@react.component] make ?(icon = (EarOff.make () [@JSX])) ~message =
  div
    ~className:
      "flex flex-col items-center gap-4 p-8 text-center text-muted-foreground"
    ~children:
      [
        React.cloneElement icon [%mel.obj { className = "size-14" }];
        (H2.make ~className:"text-xl" ~children:(React.string message) () [@JSX]);
      ]
    () [@JSX]
