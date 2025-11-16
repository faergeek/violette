external%private [@mel.module "../shared/container.module.css"] css :
  < root : string > Js.t = "default"

let[@react.component] make ?children ?className =
  div
    ~className:(Clsx.make [| Item className; Item css##root |])
    ?children () [@JSX]
