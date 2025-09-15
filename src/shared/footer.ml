open Router

let[@react.component] make () =
  footer ~className:"container mx-auto mt-auto"
    ~children:
      [
        (hr ~className:"mx-4 mt-10 border-t" () [@JSX]);
        (div
           ~className:
             "flex flex-wrap items-center justify-between gap-2 \
              whitespace-nowrap px-4 py-6 text-center text-muted-foreground"
           ~children:
             [
               (Link.make ~className:"flex items-center gap-2" ~_to:"/"
                  ~children:
                    [
                      (Logo.make ~className:"size-5" () [@JSX]);
                      React.string "Violette";
                    ]
                  () [@JSX]);
               (span
                  ~children:
                    [
                      (a
                         ~href:
                           "https://github.com/faergeek/violette/blob/main/LICENSE"
                         ~rel:"noopener" ~target:"_blank"
                         ~children:(React.string {js|Copyright © 2025|js})
                         () [@JSX]);
                      (span ~ariaHidden:true ~className:"text-primary"
                         ~children:(React.string {js| • |js})
                         () [@JSX]);
                      (address ~className:"inline not-italic"
                         ~children:
                           (a ~href:"https://github.com/faergeek"
                              ~rel:"noopener" ~target:"_blank"
                              ~children:(React.string "Sergei Slipchenko")
                              () [@JSX])
                         () [@JSX]);
                    ]
                  () [@JSX]);
               (a ~className:"flex items-center gap-2"
                  ~href:"https://github.com/faergeek/violette" ~rel:"noopener"
                  ~target:"_blank"
                  ~children:
                    [
                      React.string "GitHub ";
                      (SimpleIcons.Github.make ~className:"size-5" () [@JSX]);
                    ]
                  () [@JSX]);
             ]
           () [@JSX]);
      ]
    () [@JSX]
