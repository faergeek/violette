external%private [@mel.module "./artistsPage.module.css"] css :
  < root : string > Js.t = "default"

open Shared

let[@react.component] make ~listIds =
  Container.make ~className:css##root
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
