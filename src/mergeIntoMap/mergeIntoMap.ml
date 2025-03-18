let mergeIntoMap original items getKey =
  let open Js in
  let open Array in
  let open Map in
  let changedItems =
    filter items ~f:(fun item ->
        match get original ~key:(getKey item) with
        | None -> true
        | Some originalItem -> not (Router.deepEqual item originalItem))
  in
  if length changedItems == 0 then original
  else
    let init = original |> entries |> Iterator.toArray |> fromArray in
    reduce changedItems ~init ~f:(fun map newItem ->
        map |> set ~key:(getKey newItem) ~value:newItem)
