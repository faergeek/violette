type hashScrollIntoViewParams = {
  behavior : [ `instant ];
  block : [ `start | `nearest ];
}

external [@mel.module "@tanstack/react-router"] [@react.component] make :
  ?ariaLabel:string ->
  ?children:React.element ->
  ?className:string ->
  ?hash:string ->
  ?hashScrollIntoView:hashScrollIntoViewParams ->
  ?params:'a Js.t ->
  ?resetScroll:bool ->
  _to:string ->
  React.element = "Link"
