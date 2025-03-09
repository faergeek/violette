type marker = { label : string; value : float }

let[@react.component] make ?ariaLabelledby ?className ?id ?markers ?max ?min
    ?step ?value ?onValueChange =
  let markersId = React.useId () in
  (React.Fragment.make
     ~children:
       [
         (input ?ariaLabelledby
            ~className:
              (Clsx.make
                 [|
                   Item "w-full"; Item (className |> Option.value ~default:"");
                 |])
            ?id ~list:markersId
            ?max:(max |> Option.map Js.String.make)
            ?min:(min |> Option.map Js.String.make)
            ?step
            ?value:(value |> Option.map Js.String.make)
            ~type_:"range"
            ~onChange:
              React.Event.Form.(
                fun event ->
                  if not (event |. defaultPrevented) then
                    let value : float =
                      (event |. currentTarget)##valueAsNumber
                    in
                    onValueChange
                    |> Option.iter (fun onValueChange -> onValueChange value))
            () [@JSX]);
         markers
         |. Option.bind (fun markers ->
                if markers |. Js.Array.length == 0 then None else Some markers)
         |> Option.map (fun markers ->
                (datalist ~id:markersId
                   ~children:
                     (markers
                     |> Js.Array.map ~f:(fun marker ->
                            let v = Js.String.make marker.value in
                            (option ~key:v ~label:marker.label ~value:v ()
                             [@JSX]))
                     |> React.array)
                   () [@JSX]))
         |> Option.value ~default:React.null;
       ]
     () [@JSX])
