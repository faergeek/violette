external [@mel.module "@tanstack/react-router"] [@react.component] make :
  fallback:React.element ->
  promise:'a Js.Promise.t ->
  children:('a -> React.element) ->
  React.element = "Await"
