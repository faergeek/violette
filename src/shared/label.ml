external%private [@mel.module "./label.module.css"] css : < root : string > Js.t
  = "default"

let[@react.component] make ?children ?className ?htmlFor ?id =
  label ?children
    ~className:(Clsx.make [| Item className; Item css##root |])
    ?htmlFor ?id () [@JSX]
