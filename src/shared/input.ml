external%private [@mel.module "./input.module.css"] css : < root : string > Js.t
  = "default"

let[@react.component] make ?autoComplete ?autoFocus ?defaultValue ?disabled ?id
    ?name ?required ?type_ =
  input ?autoComplete ?autoFocus ~className:css##root ?defaultValue ?disabled
    ?id ?name ?required ?type_ () [@JSX]
