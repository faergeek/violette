external%private [@mel.module "./h1.module.css"] css : < root : string > Js.t
  = "default"

let[@react.component] make ?children ?className =
  h1
    ~className:(Clsx.make [| Item className; Item css##root |])
    ?children () [@JSX]
