open State

let make () =
  {
    baseById = Js.Map.make ();
    detailsById = Js.Map.make ();
    infoById = Js.Map.make ();
    songIdsById = Js.Map.make ();
  }
