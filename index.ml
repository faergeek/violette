open React
open ReactDOM

[%%mel.raw "import './index.css'"]

let () =
  let open Webapi in
  let open Dom in
  let scrollbarContainer =
    document |> Document.unsafeAsHtmlDocument
    |> HtmlDocument.createElement "div"
  in
  let setStyle name value =
    scrollbarContainer |> Element.unsafeAsHtmlElement |> HtmlElement.style
    |> CssStyleDeclaration.setProperty name value ""
  in
  setStyle "width" "100%";
  setStyle "height" "100%";
  setStyle "overflow" "scroll";
  setStyle "position" "absolute";
  setStyle "inset" "0";
  setStyle "z-index" "-9999";
  setStyle "visibility" "hidden";

  document |> Document.unsafeAsHtmlDocument |> HtmlDocument.body |> Option.get
  |> Element.unsafeAsHtmlElement
  |> HtmlElement.appendChild (scrollbarContainer |> Element.unsafeAsHtmlElement);
  let open ResizeObserver in
  scrollbarContainer
  |> observe
       (make
          [%mel.raw
            {js|
              entries => {
                const [
                  {
                    borderBoxSize: [borderBoxSize],
                    contentBoxSize: [contentBoxSize],
                  },
                ] = entries;

                document.documentElement.style.setProperty(
                  '--scrollbar-inline-size',
                  `${borderBoxSize.inlineSize - contentBoxSize.inlineSize}px`,
                );

                document.documentElement.style.setProperty(
                  '--scrollbar-block-size',
                  `${borderBoxSize.blockSize - contentBoxSize.blockSize}px`,
                );
              }
            |js}])

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
