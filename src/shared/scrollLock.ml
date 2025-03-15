type lockScroll = bool -> unit

let use () =
  React.useCallback0 (fun lock ->
      let open Webapi.Dom in
      document |. Document.unsafeAsHtmlDocument |. HtmlDocument.body
      |> Option.map Element.unsafeAsHtmlElement
      |> Option.map HtmlElement.dataset
      |> Option.iter (fun dataset ->
             if lock then dataset |> DomStringMap.set "scrollLock" ""
             else dataset |> DomStringMap.unsafeDeleteKey "scrollLock"))
