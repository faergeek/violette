open DomExtra
open Fx

let make () = PlayerContext.audio |> HtmlAudioElement.pause |> ok
