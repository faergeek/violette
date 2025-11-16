external%private [@mel.module "./albumCard.module.css"] css :
  < root : string ; link : string ; name : string ; info : string > Js.t
  = "default"

open Router
open Store.Context
open Subsonic.BaseAlbum

let[@react.component] make ?coverArtSizes ?id ?loadCoverArtLazily =
  let album =
    useAppStore (fun state ->
        id
        |. Option.bind (fun id -> state.albums.baseById |. Js.Map.get ~key:id))
  in
  (div ~className:css##root
     ~children:
       [
         (Link.make ~className:css##link ~params:[%mel.obj { albumId = id }]
            ~_to:"/album/$albumId"
            ~children:
              (React.Fragment.make
                 ~children:
                   [
                     (CoverArt.make
                        ?coverArt:(album |> Option.map (fun x -> x.coverArt))
                        ?_lazy:loadCoverArtLazily ?sizes:coverArtSizes () [@JSX]);
                     (h2 ~className:css##name
                        ~children:
                          (album
                          |> Option.map (fun album -> React.string album.name)
                          |> Option.value
                               ~default:
                                 (Skeleton.make
                                    ~style:
                                      (ReactDOM.Style.make ~width:"6rem" ())
                                    () [@JSX]))
                        () [@JSX]);
                   ]
                 () [@JSX])
            () [@JSX]);
         (div ~className:css##info
            ~children:
              (album
              |> Option.map (fun album ->
                  (React.Fragment.make
                     ~children:
                       [
                         album.year
                         |> Option.map (fun year ->
                             (React.Fragment.make
                                ~children:
                                  [
                                    (time ~children:(React.int year) () [@JSX]);
                                    React.string {js| – |js};
                                  ]
                                () [@JSX]))
                         |> Option.value ~default:React.null;
                         (Link.make
                            ~params:[%mel.obj { artistId = album.artistId }]
                            ~_to:"/artist/$artistId"
                            ~children:(React.string album.artist)
                            () [@JSX]);
                       ]
                     () [@JSX]))
              |> Option.value
                   ~default:
                     (Skeleton.make
                        ~style:(ReactDOM.Style.make ~width:"4rem" ())
                        () [@JSX]))
            () [@JSX]);
       ]
     () [@JSX])

let make = React.memo make
