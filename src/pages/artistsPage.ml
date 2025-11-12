open Shared

let[@react.component] make ~listIds =
  div ~className:"container mx-auto sm:px-4"
    ~children:
      [
        (CardGrid.make
           ~children:
             (listIds
             |> Js.Array.mapi ~f:(fun id i ->
                 (ArtistCard.make ~key:(Js.String.make i)
                    ~coverArtSizes:CardGrid.card_grid_cover_art_sizes ?id
                    ~loadCoverArtLazily:true () [@JSX]))
             |> React.array)
           () [@JSX]);
      ]
    () [@JSX]
