type t

external [@mel.new] make : unit -> t = "DOMParser"

external [@mel.send] parseHtmlFromString :
  t -> string -> (_[@mel.as "text/html"]) -> Webapi.Dom.HtmlDocument.t
  = "parseFromString"
