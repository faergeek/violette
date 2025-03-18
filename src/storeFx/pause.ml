open DomExtra
open Fx

let make () = Ok (PlayerContext.audio |> HtmlAudioElement.pause)
