external%private [@mel.module "./tabs.module.css"] css :
  < list : string ; content : string ; trigger : string > Js.t = "default"

module Context = struct
  include React.Context

  type value = { value : string }

  let context : value option React.Context.t = React.createContext None
  let make = React.Context.provider context
  let use () = React.useContext context |> Option.get
end

module Root = struct
  let[@react.component] make ~children ~value =
    let contextValue =
      React.useMemo1 (fun () -> Some Context.{ value }) [| value |]
    in
    (Context.make ~value:contextValue ~children () [@JSX])
end

module List = struct
  let[@react.component] make ~children ?className =
    div
      ~className:(Clsx.make [| Item className; Item css##list |])
      ~role:"tablist"
      ~onKeyDown:(fun event ->
        let open React.Event.Keyboard in
        let open ReactExtra.Event.Keyboard in
        let open Webapi.Dom in
        event |. target |> Element.asHtmlElement
        |. Option.bind (fun target ->
            let role = target |. DomExtra.role in
            if role == "tab" then Some target
            else
              target
              |> HtmlElement.closest "[role=tab]"
              |. Option.bind Element.asHtmlElement)
        |> Option.iter (fun selectedTab ->
            let tablist = event |. currentTarget in
            match event |. code with
            | "Home" ->
                event |. preventDefault;
                tablist
                |> Element.querySelector "[role=tab]:first-child"
                |. Option.bind Element.asHtmlElement
                |> Option.iter HtmlElement.focus
            | "ArrowLeft" ->
                event |. preventDefault;
                let tabs =
                  tablist
                  |> Element.querySelectorAll "[role=tab]"
                  |> NodeList.toArray
                in
                let currentIndex =
                  tabs
                  |. Js.Array.indexOf ~value:(selectedTab |> HtmlElement.asNode)
                and len = tabs |. Js.Array.length in
                tabs
                |. Belt.Array.get ((currentIndex + len - 1) mod len)
                |. Option.bind HtmlElement.ofNode
                |> Option.get |. HtmlElement.focus
            | "ArrowRight" ->
                event |. preventDefault;
                let tabs =
                  tablist
                  |> Element.querySelectorAll "[role=tab]"
                  |> NodeList.toArray
                in
                let currentIndex =
                  tabs
                  |. Js.Array.indexOf ~value:(selectedTab |> HtmlElement.asNode)
                and len = tabs |. Js.Array.length in
                tabs
                |. Belt.Array.get ((currentIndex + 1) mod len)
                |. Option.bind HtmlElement.ofNode
                |> Option.get |. HtmlElement.focus
            | "End" ->
                event |. preventDefault;
                tablist
                |> Element.querySelector "[role=tab]:last-child"
                |. Option.bind Element.asHtmlElement
                |> Option.get |> HtmlElement.focus
            | "Space" ->
                event |. preventDefault;
                selectedTab |. HtmlElement.click
            | _ -> ()))
      ~children () [@JSX]
end

module Trigger = struct
  let[@react.component] make ~children ~value =
    let contextValue = Context.use () in
    let isSelected = value == contextValue.value in
    let childrenProps = children |> ReactExtra.getProps in
    React.cloneElement children
      [%mel.obj
        {
          isSelected = isSelected [@mel.as "aria-selected"];
          className =
            Clsx.make [| Item childrenProps##className; Item css##trigger |];
          role = "tab";
          tabIndex = (if isSelected then 0 else -1);
        }]
end

module Content = struct
  let[@react.component] make ?children ?className ?value =
    let contextValue = Context.use () in
    (div ?children
       ~className:(Clsx.make [| Item className; Item css##content |])
       ?style:
         (value
         |. Option.bind (fun value ->
             if value == contextValue.value then None
             else Some (ReactDOM.Style.make ~display:"none" ())))
       ~role:"tabpanel" () [@JSX])
end
