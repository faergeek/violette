external%private [@mel.module "./emptyState.module.css"] css :
  < root : string ; icon : string ; text : string > Js.t = "default"

open LucideReact

let[@react.component] make ?(icon = (EarOff.make () [@JSX])) ~message =
  div ~className:css##root
    ~children:
      [
        React.cloneElement icon [%mel.obj { className = css##icon }];
        (H2.make ~className:css##text ~children:(React.string message) () [@JSX]);
      ]
    () [@JSX]
