module Context = struct
  include React.Context

  type value = { value : string }

  let context : value option React.Context.t = React.createContext None
  let make = React.Context.provider context
  let use () = React.useContext context |> Option.get
end

module Root = struct
  let[@react.component] make ~children ~value =
    let contextValue =
      React.useMemo1 (fun () -> Some Context.{ value }) [| value |]
    in
    (Context.make ~value:contextValue ~children () [@JSX])
end

module List = struct
  let[@react.component] make ~children ?className =
    div
      ~className:
        (Clsx.make
           [|
             Item
               "flex max-w-full items-center space-x-2 overflow-auto text-sm \
                font-bold text-muted-foreground";
             Item (className |> Option.value ~default:"");
           |])
      ~role:"tablist"
      ~onKeyDown:(fun event ->
        Js.log event;
        (* const selectedTab = *)
        (*   event.target instanceof HTMLElement || *)
        (*   event.target instanceof SVGElement *)
        (*     ? event.target.role === 'tab' *)
        (*       ? event.target *)
        (*       : event.target.closest('[role=tab]') *)
        (*     : null; *)
        (* if (!selectedTab || !(selectedTab instanceof HTMLElement)) { *)
        (*   return; *)
        (* } *)
        (* const tablist = event.currentTarget; *)
        (* switch (event.code) { *)
        (*   case 'Home': { *)
        (*     event.preventDefault(); *)
        (*     const newTab = tablist.querySelector('[role=tab]:first-child'); *)
        (*     invariant(newTab instanceof HTMLElement); *)
        (*     newTab.focus(); *)
        (*     break; *)
        (*   } *)
        (*   case 'ArrowLeft': { *)
        (*     event.preventDefault(); *)
        (*     const tabs = Array.from(tablist.querySelectorAll('[role=tab]')); *)
        (*     const currentIndex = tabs.indexOf(selectedTab); *)
        (*     const newTab = tabs[(currentIndex + tabs.length - 1) % tabs.length]; *)
        (*     invariant(newTab instanceof HTMLElement); *)
        (*     newTab.focus(); *)
        (*     break; *)
        (*   } *)
        (*   case 'ArrowRight': { *)
        (*     event.preventDefault(); *)
        (*     const tabs = Array.from(tablist.querySelectorAll('[role=tab]')); *)
        (*     const currentIndex = tabs.indexOf(selectedTab); *)
        (*     const newTab = tabs[(currentIndex + 1) % tabs.length]; *)
        (*     invariant(newTab instanceof HTMLElement); *)
        (*     newTab.focus(); *)
        (*     break; *)
        (*   } *)
        (*   case 'End': { *)
        (*     event.preventDefault(); *)
        (*     const newTab = tablist.querySelector('[role=tab]:last-child'); *)
        (*     invariant(newTab instanceof HTMLElement); *)
        (*     newTab.focus(); *)
        (*     break; *)
        (*   } *)
        (*   case 'Space': *)
        (*     event.preventDefault(); *)
        (*     selectedTab.click(); *)
        (*     break; *)
        (* } *)
        ())
      ~children () [@JSX]
end

module Trigger = struct
  let[@react.component] make ~children ~value =
    let contextValue = Context.use () in
    let isSelected = value == contextValue.value in
    let childrenProps = children |> ReactExtra.getProps in
    React.cloneElement children
      [%mel.obj
        {
          isSelected = isSelected [@mel.as "aria-selected"];
          className =
            Clsx.make
              [|
                Item
                  "whitespace-nowrap border-b-2 border-transparent px-2 \
                   tracking-widest [font-variant-caps:all-small-caps] \
                   aria-selected:border-primary aria-selected:text-foreground";
                Item (childrenProps##className |> Option.value ~default:"");
              |];
          role = "tab";
          tabIndex = (if isSelected then 0 else -1);
        }]
end

module Content = struct
  let[@react.component] make ?children ?className ?id ?value =
    let contextValue = Context.use () in
    (div ?children
       ~className:
         (Clsx.make
            [| Item "mt-2"; Item (className |> Option.value ~default:"") |])
       ~hidden:
         (match value with
         | None -> true
         | Some value -> value != contextValue.value)
       ?id ~role:"tabpanel" () [@JSX])
end
