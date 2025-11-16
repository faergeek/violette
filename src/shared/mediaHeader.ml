external%private [@mel.module "./mediaHeader.module.css"] css :
  < root : string ; leftCol : string ; links : string ; rightCol : string > Js.t
  = "default"

let media_header_cover_art_sizes =
  "(max-width: 639px) 100vw, (max-width: 767px) 192px, (max-width: 1023px) \
   234.667px, (max-width: 1279px) 236px, (max-width: 1535px) 236.8px, \
   237.3333px"

let[@react.component] make ~children ~coverArt ~links =
  div ~className:css##root
    ~children:
      [
        (div ~className:css##leftCol
           ~children:
             [
               (CoverArt.make ?coverArt ~sizes:media_header_cover_art_sizes ()
                [@JSX]);
               (div ~className:css##links ~children:links () [@JSX]);
             ]
           () [@JSX]);
        (div ~className:css##rightCol ~children () [@JSX]);
      ]
    () [@JSX]
