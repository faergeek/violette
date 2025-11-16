external%private [@mel.module "./footer.module.css"] css :
  < root : string
  ; hr : string
  ; content : string
  ; logoWrapper : string
  ; logo : string
  ; dot : string
  ; address : string >
  Js.t = "default"

open Router

let[@react.component] make () =
  Container.make ~className:css##root
    ~children:
      [
        (hr ~className:css##hr () [@JSX]);
        (div ~className:css##content
           ~children:
             [
               (Link.make ~className:css##logoWrapper ~_to:"/"
                  ~children:
                    [
                      (Logo.make ~className:css##logo () [@JSX]);
                      React.string "Violette";
                    ]
                  () [@JSX]);
               (address ~className:css##address
                  ~children:
                    [
                      (a
                         ~href:
                           "https://github.com/faergeek/violette/blob/main/LICENSE"
                         ~rel:"noopener" ~target:"_blank"
                         ~children:(React.string {js|Copyright © 2025|js})
                         () [@JSX]);
                      (span ~ariaHidden:true ~className:css##dot
                         ~children:(React.string {js| • |js})
                         () [@JSX]);
                      (span
                         ~children:
                           (a ~href:"https://github.com/faergeek"
                              ~rel:"noopener" ~target:"_blank"
                              ~children:(React.string "Sergei Slipchenko")
                              () [@JSX])
                         () [@JSX]);
                    ]
                  () [@JSX]);
               (a ~className:css##logoWrapper
                  ~href:"https://github.com/faergeek/violette" ~rel:"noopener"
                  ~target:"_blank"
                  ~children:
                    [
                      React.string "GitHub ";
                      (SimpleIcons.Github.make ~className:css##logo () [@JSX]);
                    ]
                  () [@JSX]);
             ]
           () [@JSX]);
      ]
    () [@JSX]
