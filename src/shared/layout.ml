external%private [@mel.module "./layout.module.css"] css :
  < root : string ; header : string ; playerControls : string ; queue : string >
  Js.t = "default"

let[@react.component] make () =
  let queueTriggerRef = React.useRef None and queueId = React.useId () in
  (div ~className:css##root
     ~children:
       [
         (QueueContext.Provider.make
            ~children:
              [
                (header ~className:css##header
                   ~children:[ (NowPlaying.make () [@JSX]) ]
                   () [@JSX]);
                (main ~children:[ (Router.Outlet.make () [@JSX]) ] () [@JSX]);
                (Footer.make () [@JSX]);
                (Container.make ~className:css##playerControls
                   ~children:
                     [
                       (PlaybackPosition.make () [@JSX]);
                       (PlayerToolbar.make ~queueId ~queueTriggerRef () [@JSX]);
                     ]
                   () [@JSX]);
                (QueueContext.Consumer.make
                   ~children:(fun
                       QueueContext.Context.{ isOpen; setIsOpen = _ } ->
                     (div ~className:css##queue ~hidden:(not isOpen)
                        ~children:
                          [
                            (Queue.make ~id:queueId ~triggerRef:queueTriggerRef
                               () [@JSX]);
                          ]
                        () [@JSX]))
                   () [@JSX]);
              ]
            () [@JSX]);
       ]
     () [@JSX])
