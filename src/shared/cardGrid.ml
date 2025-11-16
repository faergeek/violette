external%private [@mel.module "./cardGrid.module.css"] css :
  < root : string > Js.t = "default"

let card_grid_cover_art_sizes =
  "(max-width: 639px) calc((100vw - 12px) / 2), (max-width: 767px) 143px, \
   (max-width: 1023px) 137.6px, (max-width: 1279px) 155.333px, (max-width: \
   1535px) 168px, 177.5px"

let[@react.component] make ~children =
  div ~className:css##root ~children () [@JSX]
