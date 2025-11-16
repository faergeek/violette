external%private [@mel.module "./radioGroup.module.css"] css :
  < root : string ; label : string ; input : string > Js.t = "default"

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
            ~className:(Clsx.make [| Item className; Item css##root |])
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
    (Label.make ~className:css##label
       ~children:
         [
           (input
              ?checked:
                (match (contextValue.value, value) with
                | None, _ | _, None -> None
                | Some v, Some value -> Some (value == v))
              ~className:(Clsx.make [| Item className; Item css##input |])
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
