open React
open ReactDOM

[%%mel.raw "import './index.css'"]

let () =
  let open Webapi in
  let open Dom in
  let setStyle style name value =
    CssStyleDeclaration.setProperty name value "" style
  in
  let container =
    document |> Document.unsafeAsHtmlDocument
    |> HtmlDocument.createElement "div"
  in
  let setContainerStyle =
    container |> Element.unsafeAsHtmlElement |> HtmlElement.style |> setStyle
  in
  setContainerStyle "width" "100%";
  setContainerStyle "height" "100%";
  setContainerStyle "overflow" "scroll";
  setContainerStyle "position" "absolute";
  setContainerStyle "inset" "0";
  setContainerStyle "z-index" "-9999";
  setContainerStyle "visibility" "hidden";

  let document = document |> Document.unsafeAsHtmlDocument in
  document |> HtmlDocument.body |> Option.get |> Element.unsafeAsHtmlElement
  |> HtmlElement.appendChild (container |> Element.unsafeAsHtmlElement);
  let open ResizeObserver in
  make (fun entries ->
      let entry = entries |. Js.Array.unsafe_get 0
      and documentElement =
        document |> HtmlDocument.documentElement |> Element.unsafeAsHtmlElement
      in
      let borderBoxSize =
        entry |. DomExtra.ResizeObserverEntry.borderBoxSize
        |. Js.Array.unsafe_get 0
      and contentBoxSize =
        entry |. DomExtra.ResizeObserverEntry.contentBoxSize
        |. Js.Array.unsafe_get 0
      in
      let setHtmlStyle = documentElement |> HtmlElement.style |> setStyle in
      let open DomExtra.ResizeObserverSize in
      setHtmlStyle "--scrollbar-inline-size"
        (Js.Float.toString
           ((borderBoxSize |. inlineSize) -. (contentBoxSize |. inlineSize))
        ^ "px");
      setHtmlStyle "--scrollbar-block-size"
        (Js.Float.toString
           ((borderBoxSize |. blockSize) -. (contentBoxSize |. blockSize))
        ^ "px"))
  |. observe container

let () =
  let store = Store.make () in

  let router =
    let routeTree =
      let open Router.Route in
      let open Routes in
      Root.route
      |. addChildren
           [|
             Login.route;
             LayoutRoute.route
             |. addChildren [| Album.route; Artist.route; Artists.route |];
           |]
    in
    let open Router in
    options ~context:{ store } ~defaultPreload:`intent ~routeTree
      ~scrollRestoration:true
    |> make
  in

  store
  |. Zustand.subscribe (fun state prevState ->
         if state.auth.credentials != prevState.auth.credentials then
           router |. Router.invalidate
         else ());

  StoreFx.SubscribeToStoreStateUpdates.make ()
  |. Fx.runAsync ~deps:{ store }
  |> Js.Promise.then_ (fun result ->
         result |> Result.get_ok |> Js.Promise.resolve)
  |> ignore;

  querySelector "#app" |. Option.get |. Client.createRoot
  |. Client.render
       (StrictMode.make
          ~children:
            (Store.Context.Provider.make ~store
               ~children:[ (Router.Provider.make ~router () [@JSX]) ]
               () [@JSX])
          () [@JSX])
