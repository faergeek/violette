external%private [@mel.module "./skeleton.module.css"] css :
  < root : string > Js.t = "default"

let[@react.component] make ?className ?style =
  span
    ~className:(Clsx.make [| Item className; Item css##root |])
    ?style () [@JSX]
