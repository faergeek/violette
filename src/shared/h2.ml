external%private [@mel.module "./h2.module.css"] css : < root : string > Js.t
  = "default"

let[@react.component] make ?children ?className ?id =
  h2
    ~className:(Clsx.make [| Item className; Item css##root |])
    ?children ?id () [@JSX]
