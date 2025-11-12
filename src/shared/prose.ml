let[@react.component] make ?html =
  match html with
  | None ->
      p
        ~children:
          [
            (Skeleton.make ~className:"w-56 sm:w-96" () [@JSX]);
            (Skeleton.make ~className:"w-36 sm:w-64" () [@JSX]);
            (Skeleton.make ~className:"w-48 sm:w-80" () [@JSX]);
            (Skeleton.make ~className:"w-28 sm:w-56" () [@JSX]);
          ]
        () [@JSX]
  | Some html ->
      p
        ~children:
          (let open Webapi.Dom in
           let open DomParser in
           parseHtmlFromString (make ()) html
           |> HtmlDocument.body |> Option.get |> HtmlElement.ofElement
           |> Option.get |> HtmlElement.childNodes |> NodeList.toArray
           |> Js.Array.mapi ~f:(fun node index ->
               match Node.nodeType node with
               | Text -> node |> Node.textContent |> React.string
               | Element -> (
                   match Node.nodeName node with
                   | "A" ->
                       a ~key:(Int.to_string index)
                         ~className:
                           "text-muted-foreground underline underline-offset-2"
                         ?href:
                           (node |> HtmlElement.ofNode
                           |. Option.bind (HtmlElement.getAttribute "href"))
                         ~rel:"noopener" ~target:"_blank"
                         ~children:(node |. Node.textContent |> React.string)
                         () [@JSX]
                   | _ ->
                       node |> HtmlElement.ofNode |> Option.get
                       |. HtmlElement.outerHTML |> React.string)
               | _ -> node |> Js.String.make |> React.string)
           |> React.array)
        () [@JSX]
