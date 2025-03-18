module Context = struct
  include React.Context

  type value = {
    defaultValue : string option;
    id : string;
    name : string option;
    value : string option;
  }

  let context : value option React.Context.t = React.createContext None
  let make = React.Context.provider context
  let use () = context |> React.useContext |> Option.get
end

module Root = struct
  let[@react.component] make ~children ?className ?defaultValue ?name ?value
      ?onValueChange =
    let id = React.useId () in
    let contextValue =
      React.useMemo4
        (fun () -> Some Context.{ defaultValue; id; name; value })
        (defaultValue, id, name, value)
    in
    (Context.make ~value:contextValue
       ~children:
         (div ~ariaLabelledby:id
            ~className:
              (Clsx.make
                 [|
                   Item "flex flex-wrap items-center gap-2";
                   Item (className |> Option.value ~default:"");
                 |])
            ?defaultValue ?name ~role:"radiogroup" ?value
            ~onChange:(fun event ->
              let open ReactExtra.Event.Form in
              let open Webapi.Dom in
              match
                (event |. target |> HtmlInputElement.ofElement, onValueChange)
              with
              | None, _ | _, None -> ()
              | Some item, Some onValueChange ->
                  let newValue =
                    let open HtmlInputElement in
                    if item |. checked then item |. value else ""
                  in
                  onValueChange newValue)
            ~children () [@JSX])
       () [@JSX])
end

module Label = struct
  let[@react.component] make ~children ?className =
    let contextValue = Context.use () in
    (Label.make ~children ?className ~id:contextValue.id () [@JSX])
end

module Item = struct
  let[@react.component] make ?className ~label ?value =
    let contextValue = Context.use () in
    (Label.make ~className:"flex cursor-pointer items-center gap-2"
       ~children:
         [
           (input
              ?checked:
                (match (contextValue.value, value) with
                | None, _ | _, None -> None
                | Some v, Some value -> Some (value == v))
              ~className:
                (Clsx.make
                   [|
                     Item
                       "focus-visible:ring-ring flex aspect-square h-4 w-4 \
                        cursor-[inherit] appearance-none items-center \
                        justify-center rounded-full border border-primary \
                        text-primary ring-offset-background before:h-2 \
                        before:w-2 before:scale-0 before:rounded-full \
                        before:bg-primary before:transition-transform \
                        checked:before:scale-100 focus:outline-none \
                        focus-visible:ring-2 focus-visible:ring-offset-2 \
                        disabled:cursor-not-allowed disabled:opacity-50";
                     Item (className |> Option.value ~default:"");
                   |])
              ?defaultChecked:
                (match (contextValue.defaultValue, value) with
                | None, _ | _, None -> None
                | Some v, Some value -> Some (value == v))
              ?name:contextValue.name ~type_:"radio" ?value
              ~onChange:(fun _ -> ())
              () [@JSX]);
           label |> React.string;
         ]
       () [@JSX])
end
