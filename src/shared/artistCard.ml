external%private [@mel.module "./artistCard.module.css"] css :
  < root : string ; name : string > Js.t = "default"

let[@react.component] make ?coverArtSizes ?id ?loadCoverArtLazily =
  let className = css##root in
  let artist =
    Store.Context.useAppStore (fun state ->
        id |. Option.bind (fun id -> state.artists.byId |. Js.Map.get ~key:id))
  in
  let children =
    (React.Fragment.make
       ~children:
         [
           (CoverArt.make
              ?coverArt:
                (artist
                |> Option.map (fun x -> Subsonic.BaseArtist.(x.coverArt)))
              ?_lazy:loadCoverArtLazily ?sizes:coverArtSizes () [@JSX]);
           (h2 ~className:css##name
              ~children:
                [
                  (match artist with
                  | None ->
                      Skeleton.make
                        ~style:(ReactDOM.Style.make ~width:"6rem" ())
                        () [@JSX]
                  | Some artist -> React.string artist.name);
                ]
              () [@JSX]);
         ]
       () [@JSX])
  in
  match artist with
  | None -> span ~className ~children () [@JSX]
  | Some artist ->
      Router.Link.make ~className ~params:[%mel.obj { artistId = artist.id }]
        ~_to:"/artist/$artistId" ~children () [@JSX]
