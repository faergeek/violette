let createSrcSet ~credentials ~coverArt =
  let open Js in
  [| 50; 100; 200; 300; 400; 500; 750; 1000; 1250; 1500; 2000 |]
  |> Array.map ~f:(fun size ->
         Subsonic.CoverArt.makeUrl ~credentials ~coverArt ~size ()
         ^ " " ^ String.make size ^ "w")
  |> Array.join ~sep:","

let preload ~credentials ~coverArt ~sizes =
  let open Image in
  let img = make () in
  setSizes img sizes;
  createSrcSet ~credentials ~coverArt |> setSrcSet img

let[@react.component] make ?alt ?className ?coverArt ?_lazy ?sizes =
  let credentials =
    Store.Context.useAppStore (fun state -> state.auth.credentials)
  in
  let srcSet =
    React.useMemo2
      (fun () ->
        match (coverArt, credentials) with
        | Some coverArt, Some credentials ->
            Some (createSrcSet ~coverArt ~credentials)
        | _ -> None)
      (coverArt, credentials)
  and isLoaded, setIsLoaded = React.useState (fun () -> false)
  and lastLoadedSrc, setLastLoadedSrc = React.useState (fun () -> None)
  and imgRef = React.useRef Js.Nullable.null in
  React.useEffect1
    (fun () ->
      setIsLoaded (fun _ -> false);
      setLastLoadedSrc (fun _ -> None);
      None)
    [| srcSet |];
  React.useEffect0 (fun () ->
      let open Js.Nullable in
      let _ =
        let ( let* ) x f = bind x ~f:(fun [@u] v -> f v) in
        let* img = imgRef.current in
        setLastLoadedSrc (fun _ ->
            (let* src = img |> Image.currentSrc in
             if src == "" then undefined else return src)
            |> toOption);
        setIsLoaded (fun _ -> img |> Image.complete);
        null
      in
      None);
  div
    ~className:
      (Clsx.make
         [|
           Item "aspect-square bg-muted/75";
           Item (className |> Option.value ~default:"");
         |])
    ~children:
      [
        React.cloneElement
          (img
             ~ref:(ReactDOM.Ref.domRef imgRef)
             ?alt
             ~className:
               (Clsx.make
                  [|
                    Item "size-full overflow-clip object-contain";
                    Item
                      [%mel.obj
                        {
                          opacityNone =
                            ((not isLoaded) || Option.is_none srcSet)
                            [@mel.as "opacity-0"];
                          opacityFull =
                            (isLoaded && Option.is_some srcSet)
                            [@mel.as "opacity-100"];
                        }];
                  |])
             ?src:lastLoadedSrc ?sizes ?srcSet
             ~onError:
               React.Event.Media.(
                 fun event ->
                   setIsLoaded (fun _ -> false);

                   let img = currentTarget event in

                   Js.Global.setTimeout 3000 ~f:(fun () ->
                       Js.Obj.assign img [%mel.obj { src = img##currentSrc }]
                       |> ignore;
                       ())
                   |> ignore)
             ~onLoad:
               React.Event.Image.(
                 fun event ->
                   let currentSrc : string option =
                     (currentTarget event)##currentSrc
                   in
                   let complete : bool = (currentTarget event)##complete in
                   setLastLoadedSrc (fun _ -> currentSrc);
                   setIsLoaded (fun _ -> complete);
                   ())
             () [@JSX])
          [%mel.obj
            {
              decoding =
                _lazy |. Option.bind (fun b -> if b then Some "async" else None);
              loading =
                _lazy |. Option.bind (fun b -> if b then Some "lazy" else None);
            }];
      ]
    () [@JSX]
