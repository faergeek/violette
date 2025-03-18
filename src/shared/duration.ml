let format duration =
  let minutes = Js.Math.floor_float (duration /. 60.0) in
  let seconds = Js.Math.floor_float (duration -. (minutes *. 60.0)) in
  (minutes |> Js.String.make)
  ^ ":"
  ^ (seconds |> Js.String.make |. String.padStart 2 "0")
