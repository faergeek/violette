let[@react.component] make () =
  let queueTriggerRef = React.useRef None and queueId = React.useId () in
  (div ~className:"relative flex min-h-lvh flex-col"
     ~children:
       [
         (QueueContext.Provider.make
            ~children:
              [
                (header ~className:"sticky top-0 z-30 bg-background"
                   ~children:[ (NowPlaying.make () [@JSX]) ]
                   () [@JSX]);
                (main ~children:[ (Router.Outlet.make () [@JSX]) ] () [@JSX]);
                (Footer.make () [@JSX]);
                (div ~className:"container sticky bottom-0 z-50 mx-auto sm:px-4"
                   ~children:
                     [
                       (PlaybackPosition.make () [@JSX]);
                       (PlayerToolbar.make ~queueId ~queueTriggerRef () [@JSX]);
                     ]
                   () [@JSX]);
                (QueueContext.Consumer.make
                   ~children:(fun
                       QueueContext.Context.{ isOpen; setIsOpen = _ } ->
                     (div
                        ~className:
                          "fixed inset-0 bottom-[var(--player-toolbar-height)] \
                           isolate z-40 bg-background"
                        ~hidden:(not isOpen)
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
