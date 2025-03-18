let[@react.component] make ?coverArtSizes ?id ?loadCoverArtLazily =
  let artist =
    Store.Context.useAppStore (fun state ->
        id |. Option.bind (fun id -> state.artists.byId |. Js.Map.get ~key:id))
  in
  React.cloneElement
    (match artist with
    | None -> span () [@JSX]
    | Some artist ->
        let params = [%mel.obj { artistId = artist.id }] in
        (Router.Link.make ~params ~_to:"/artist/$artistId" () [@JSX]))
    [%mel.obj
      {
        className = "block space-y-1 group/artist-card";
        children =
          React.Fragment.make
            ~children:
              [
                (CoverArt.make ~className:"w-full"
                   ?coverArt:
                     (artist
                     |> Option.map (fun x -> Subsonic.BaseArtist.(x.coverArt)))
                   ?_lazy:loadCoverArtLazily ?sizes:coverArtSizes () [@JSX]);
                (h2
                   ~className:
                     "font-bold leading-tight group-odd/artist-card:ps-2 \
                      group-even/artist-card:pe-2 \
                      sm:group-odd/artist-card:ps-0 \
                      sm:group-even/artist-card:pe-0"
                   ~children:
                     [
                       (match artist with
                       | None -> Skeleton.make ~className:"w-24" () [@JSX]
                       | Some artist -> React.string artist.name);
                     ]
                   () [@JSX]);
              ]
            () [@JSX];
      }]
