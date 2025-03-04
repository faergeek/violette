external document : Dom.document = "document"
external [@mel.scope "document"] body : Dom.htmlBodyElement = "body"

external [@mel.get] dataset : 'a Dom.htmlElement_like -> string Js.Dict.t
  = "dataset"
