open Router
open Store.Context
open Subsonic.BaseAlbum

let[@react.component] make ?coverArtSizes ?id ?loadCoverArtLazily =
  let album =
    useAppStore (fun state ->
        id
        |. Option.bind (fun id -> state.albums.baseById |. Js.Map.get ~key:id))
  in
  (div ~className:"group/album-card"
     ~children:
       [
         (Link.make ~className:"space-y-1" ~params:[%mel.obj { albumId = id }]
            ~_to:"/album/$albumId"
            ~children:
              (React.Fragment.make
                 ~children:
                   [
                     (CoverArt.make ~className:"w-full"
                        ?coverArt:(album |> Option.map (fun x -> x.coverArt))
                        ?_lazy:loadCoverArtLazily ?sizes:coverArtSizes () [@JSX]);
                     (h2
                        ~className:
                          "font-bold leading-tight group-odd/album-card:ps-2 \
                           group-even/album-card:pe-2 \
                           sm:group-odd/album-card:ps-0 \
                           sm:group-even/album-card:pe-0"
                        ~children:
                          (album
                          |> Option.map (fun album -> React.string album.name)
                          |> Option.value
                               ~default:
                                 (Skeleton.make ~className:"w-24" () [@JSX]))
                        () [@JSX]);
                   ]
                 () [@JSX])
            () [@JSX]);
         (div
            ~className:
              "text-sm text-muted-foreground group-odd/album-card:ps-2 \
               group-even/album-card:pe-2 sm:group-odd/album-card:ps-0 \
               sm:group-even/album-card:pe-0"
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
                                          (time ~children:(React.int year) ()
                                           [@JSX]);
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
                   ~default:(Skeleton.make ~className:"w-16" () [@JSX]))
            () [@JSX]);
       ]
     () [@JSX])

let make = React.memo make
