let media_header_cover_art_sizes =
  "(max-width: 639px) 100vw, (max-width: 767px) 192px, (max-width: 1023px) \
   234.667px, (max-width: 1279px) 236px, (max-width: 1535px) 236.8px, \
   237.3333px"

let[@react.component] make ~children ~coverArt ~links =
  div
    ~className:
      "mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 \
       xl:grid-cols-5 2xl:grid-cols-6"
    ~children:
      [
        (div ~className:"space-y-4"
           ~children:
             [
               (CoverArt.make ~className:"w-full" ?coverArt
                  ~sizes:media_header_cover_art_sizes () [@JSX]);
               (div ~className:"px-2 sm:px-0" ~children:links () [@JSX]);
             ]
           () [@JSX]);
        (div
           ~className:
             "px-2 sm:col-span-2 sm:px-0 lg:col-span-3 xl:col-span-4 \
              2xl:col-span-5"
           ~children () [@JSX]);
      ]
    () [@JSX]
