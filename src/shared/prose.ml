external%private [@mel.module "./prose.module.css"] css :
  < skeletonLine1 : string
  ; skeletonLine2 : string
  ; skeletonLine3 : string
  ; skeletonLine4 : string
  ; link : string >
  Js.t = "default"

let[@react.component] make ?html =
  match html with
  | None ->
      div
        ~children:
          [
            (Skeleton.make ~className:css##skeletonLine1 () [@JSX]);
            (Skeleton.make ~className:css##skeletonLine2 () [@JSX]);
            (Skeleton.make ~className:css##skeletonLine3 () [@JSX]);
            (Skeleton.make ~className:css##skeletonLine4 () [@JSX]);
          ]
        () [@JSX]
  | Some html ->
      div
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
                       a ~key:(Int.to_string index) ~className:css##link
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
